import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect, useState, useRef } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncInProgress = useRef(false);

  // Main source of truth for the application is the Backend User (PostgreSQL)
  // We fetch this whenever the Firebase User changes.
  const { data: user, isLoading: isUserLoading, refetch } = useQuery<User | null>({
    queryKey: ["/api/user"],
    retry: false,          // Never retry — if backend is down user is treated as guest
    staleTime: 0,
    refetchOnWindowFocus: false,
    // On network failure, return null (guest) immediately rather than throwing
    gcTime: 0,
  });

  // Sync Firebase State with Backend Session
  // Helper: sync Firebase user with backend, with exponential backoff for
  // Render free-tier cold starts (server takes up to 30s to wake up).
  const syncFirebaseUser = useRef(async (currentUser: FirebaseUser) => {
    const DELAYS = [0, 2000, 5000]; // 3 attempts: immediate, 2s, 5s
    let lastError: any;

    for (let attempt = 0; attempt < DELAYS.length; attempt++) {
      if (DELAYS[attempt] > 0) {
        await new Promise(resolve => setTimeout(resolve, DELAYS[attempt]));
      }

      try {
        // Force-refresh on retries so we always have a fresh token
        const idToken = await currentUser.getIdToken(attempt > 0);

        await apiRequest("POST", "/api/auth/firebase", {
          idToken,
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });

        return true; // success
      } catch (err: any) {
        lastError = err;

        // 401: token is genuinely invalid — retry with force-refresh token
        if (err.status === 401 && attempt === 0) {
          continue; // next iteration will force-refresh
        }

        // 401 after force-refresh: account revoked / blocked — bail out
        if (err.status === 401) {
          console.warn("Firebase token rejected after force-refresh — signing out");
          await signOut(auth);
          return false;
        }

        // Network/server error (likely cold start) — retry after delay
        console.warn(`Sync attempt ${attempt + 1} failed (${err.status ?? "network"}), retrying…`);
      }
    }

    // All retries exhausted — log but don't alarm the user
    console.error("Firebase sync failed after all retries", lastError);
    return false;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);

      if (currentUser) {
        if (syncInProgress.current) return;

        try {
          syncInProgress.current = true;
          setIsSyncing(true);

          const ok = await syncFirebaseUser.current(currentUser);
          if (ok) await refetch();
        } finally {
          syncInProgress.current = false;
          setIsSyncing(false);
        }
      } else {
        // User is logged out of Firebase.
        // Clear the query cache if not already cleared
        const currentBackendUser = queryClient.getQueryData(["/api/user"]);
        if (currentBackendUser) {
          queryClient.setQueryData(["/api/user"], null);
        }

      }
    });

    return () => unsubscribe();
  }, [refetch, toast]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      // Fallback to mock login for development/preview
      const mockUser = {
        uid: "mock-user-123",
        email: "guest@nocturne.social",
        displayName: "Nocturne Guest",
        photoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40"
      };

      try {
        // Try Firebase with a timeout
        const firebasePromise = signInWithPopup(auth, googleProvider);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firebase timeout')), 5000) // Increased timeout
        );

        const result = await Promise.race([firebasePromise, timeoutPromise]) as any;
        return result.user;
      } catch (firebaseError: any) {
        // Detailed error logging
        console.error("Firebase auth error details:", {
          code: firebaseError.code,
          message: firebaseError.message,
          name: firebaseError.name
        });

        if (firebaseError.message === 'Firebase timeout') {
          console.warn("Auth timed out - user might have closed popup or network is slow.");
          // Optional: You could choose to throw here to show "Login Timed Out" instead of guest fallback
          // throw new Error("Login timed out. Please try again.");
        }

        console.warn("Firebase auth failed, attempting mock fallback...", firebaseError);

        // Manually trigger the sync endpoint
        try {
          await apiRequest("POST", "/api/auth/firebase", mockUser);
          return mockUser;
        } catch (syncError) {
          console.error("Mock sync failed:", syncError);
          throw syncError;
        }
      }
    },
    onSuccess: async () => {
      // Wait for sync to complete
      let attempts = 0;
      const maxAttempts = 20; // 10 seconds max

      while (isSyncing && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }

      // Invalidate and refetch the user query to update UI
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      await refetch();

      toast({
        title: "Signed In",
        description: "Welcome to Nocturne!",
      });

      // Navigate to home after successful login
      setLocation("/");
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
      toast({
        title: "Login Failed",
        description: "Could not sign in. Please try again.",
        variant: "destructive"
      });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        // Clear backend session first
        await apiRequest("POST", "/api/logout");
      } catch (error) {
        console.error("Backend logout error:", error);
        // Continue with Firebase logout even if backend fails
      }

      // Sign out from Firebase
      await signOut(auth);

      // Invalidate and remove specific queries
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.removeQueries({ queryKey: ["/api/user"] });
    },
    onSuccess: async () => {
      toast({
        title: "Logged Out",
        description: "See you next time in the night circle.",
      });

      // Add a small delay to ensure state updates propagate before redirect
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to auth page for clean logout
      setLocation("/auth");
    },
    onError: (error: any) => {
      console.error("Logout failed:", error);
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  });

  const loginLocalMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: `Signed in as ${user.displayName || user.username}`,
      });
      setLocation("/");
    },
    onError: (error: any) => {
      const isTimeout = error?.status === 408;
      toast({
        title: isTimeout ? "Server is starting up" : "Login failed",
        description: isTimeout
          ? "The server is waking up. Please wait a moment and try again."
          : (error?.message || "Invalid username or password."),
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome to Nocturne",
        description: "Your journey begins now.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      const isTimeout = error?.status === 408;
      toast({
        title: isTimeout ? "Server is starting up" : "Registration failed",
        description: isTimeout
          ? "The server is waking up. Please wait a moment and try again."
          : (error?.message || "Could not create account. Please try again."),
        variant: "destructive",
      });
    },
  });

  // Combine loading states — intentionally EXCLUDE isSyncing:
  // Firebase sync runs silently in the background after the initial
  // auth check resolves. Including it would freeze the UI for 7+ seconds.
  const isLoading = isUserLoading || loginMutation.isPending || loginLocalMutation.isPending || registerMutation.isPending;

  return {
    user: user || null,
    isLoading,
    error: null,
    loginMutation,
    loginLocalMutation,
    logoutMutation,
    registerMutation,
    isAuthenticated: !!user && !isSyncing
  };
}