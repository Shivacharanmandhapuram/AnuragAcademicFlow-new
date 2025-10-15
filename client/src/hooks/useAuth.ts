import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: isSignedIn,
  });

  return {
    user,
    clerkUser,
    isLoading: !isLoaded || userLoading,
    isAuthenticated: isSignedIn && !!user,
  };
}
