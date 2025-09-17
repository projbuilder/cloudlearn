import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import UnauthorizedPage from './UnauthorizedPage';

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  requiredRole?: string;
}

export default function RouteGuard({ children, allowedRoles, requiredRole }: RouteGuardProps) {
  const { user, isLoading } = useAuth();

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

  if (!user) {
    return <UnauthorizedPage requiredRole={requiredRole} />;
  }

  const userRole = user.role || 'student';
  
  if (!allowedRoles.includes(userRole)) {
    return <UnauthorizedPage requiredRole={requiredRole} />;
  }

  return <>{children}</>;
}