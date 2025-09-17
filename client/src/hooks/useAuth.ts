import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        
        if (response.status === 401) {
          return null;
        }
        
        if (!response.ok) {
          return null;
        }
        
        return response.json();
      } catch (error) {
        console.error('Auth fetch error:', error);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
  };
}