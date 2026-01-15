import { useQuery } from "@tanstack/react-query";
import { auth, provider, signInWithGoogle, signOutUser } from "@/lib/firebase";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const login = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw to allow component-level handling
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error; // Re-throw to allow component-level handling
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}