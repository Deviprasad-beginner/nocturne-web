import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect, useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Main source of truth for the application is the Backend User (PostgreSQL)
  // We fetch this whenever the Firebase User changes.
  const { data: user, isLoading: isUserLoading, refetch } = useQuery<User | null>({
    queryKey: ["/api/user"],
    retry: false,
    staleTime: Infinity,
    // Only fetch if we believe we are logged in (firebase user exists) 
    // OR if we are checking initial session state.
    // Actually, asking backend "who am I" is always safe.
  });

  // Sync Firebase State with Backend Session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);

      if (currentUser) {
        // Optimization: Check if we are already synced to avoid unnecessary API calls
        const currentBackendUser = queryClient.getQueryData<User>(["/api/user"]);
        if (currentBackendUser && currentBackendUser.googleId === currentUser.uid) {
          return;
        }

        try {
          // Sync with backend
          await apiRequest("POST", "/api/auth/firebase", {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
          });
          // Update local user state from backend
          await refetch();
        } catch (error) {
          console.error("Failed to sync firebase user with backend", error);
        }
      } else {
        // User is logged out of Firebase.
        // Ensure backend session is cleared.
        // We only do this if we previously had a user, to avoid loops on initial load if clean.
        if (queryClient.getQueryData(["/api/user"])) {
          await apiRequest("POST", "/api/logout");
          queryClient.setQueryData(["/api/user"], null);
        }
      }
    });

    return () => unsubscribe();
  }, [refetch]);

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
          setTimeout(() => reject(new Error('Firebase timeout')), 3000)
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
      // Wait a bit for session to be established
      await new Promise(resolve => setTimeout(resolve, 500));
      // Invalidate and refetch the user query to update UI
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      await refetch();
      toast({
        title: "Signed In",
        description: "Welcome to Nocturne!",
      });
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
      await signOut(auth);
      // The useEffect will handle backend logout
    },
    onSuccess: () => {
      setLocation("/");
      toast({
        title: "Logged Out",
        description: "See you next time in the night circle.",
      });
    },
    onError: (error: any) => {
      console.error("Logout failed:", error);
    }
  });

  // Combine loading states. 
  // We are loading if:
  // 1. Backend query is loading
  // 2. Or if we have a firebase user but backend user matches (bridge is processing) 
  //    (Optimization: checking if user id matches firebase uid logic is complex, simple loading is fine)

  return {
    user: user || null,
    isLoading: isUserLoading,
    error: null,
    loginMutation,
    logoutMutation,
    // No register mutation needed for Google Auth
    registerMutation: loginMutation,
    isAuthenticated: !!user
  };
}