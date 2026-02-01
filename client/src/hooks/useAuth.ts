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
  const lastSyncedUid = useRef<string | null>(null);

  // Main source of truth for the application is the Backend User (PostgreSQL)
  // We fetch this whenever the Firebase User changes.
  const { data: user, isLoading: isUserLoading, refetch } = useQuery<User | null>({
    queryKey: ["/api/user"],
    retry: false,
    staleTime: 0, // Allow refetching when invalidated
    refetchOnWindowFocus: false,
  });

  // Sync Firebase State with Backend Session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);

      if (currentUser) {
        // Prevent duplicate sync calls
        if (syncInProgress.current || lastSyncedUid.current === currentUser.uid) {
          return;
        }

        // Check if we are already synced
        const currentBackendUser = queryClient.getQueryData<User>(["/api/user"]);
        if (currentBackendUser && currentBackendUser.googleId === currentUser.uid) {
          lastSyncedUid.current = currentUser.uid;
          return;
        }

        try {
          syncInProgress.current = true;
          setIsSyncing(true);

          // Sync with backend
          await apiRequest("POST", "/api/auth/firebase", {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
          });

          lastSyncedUid.current = currentUser.uid;

          // Update local user state from backend
          await refetch();
        } catch (error) {
          console.error("Failed to sync firebase user with backend", error);
          toast({
            title: "Sync Error",
            description: "Failed to sync authentication. Please refresh the page.",
            variant: "destructive"
          });
        } finally {
          syncInProgress.current = false;
          setIsSyncing(false);
        }
      } else {
        // User is logged out of Firebase.
        // Clear the query cache if not already cleared
        const currentBackendUser = queryClient.getQueryData(["api/user"]);
        if (currentBackendUser) {
          queryClient.setQueryData(["/api/user"], null);
        }
        lastSyncedUid.current = null;
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
        console.warn("Firebase auth failed or timed out, using mock fallback...", firebaseError);

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

  // Combine loading states
  const isLoading = isUserLoading || isSyncing || loginMutation.isPending;

  return {
    user: user || null,
    isLoading,
    error: null,
    loginMutation,
    logoutMutation,
    // No register mutation needed for Google Auth
    registerMutation: loginMutation,
    isAuthenticated: !!user && !isSyncing
  };
}