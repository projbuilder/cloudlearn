import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

export default function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [redirected, setRedirected] = React.useState(false);

  React.useEffect(() => {
    if (user && !redirected && !isLoading) {
      setRedirected(true);
      
      try {
        // Redirect based on user role
        switch (user.role) {
          case 'admin':
            setLocation('/admin/fl');
            break;
          case 'instructor':
            setLocation('/content');
            break;
          case 'student':
          default:
            setLocation('/dashboard');
            break;
        }
      } catch (error) {
        console.error('Error during redirect:', error);
        // Fallback to student dashboard
        setLocation('/dashboard');
      }
    }
  }, [user, setLocation, redirected, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
