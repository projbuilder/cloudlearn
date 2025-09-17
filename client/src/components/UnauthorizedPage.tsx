import React from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Home, ArrowLeft } from 'lucide-react';

interface UnauthorizedPageProps {
  requiredRole?: string;
  message?: string;
}

export default function UnauthorizedPage({ 
  requiredRole,
  message 
}: UnauthorizedPageProps) {
  const { user } = useAuth();
  
  const defaultMessage = requiredRole 
    ? `This page requires ${requiredRole} access. You are currently logged in as a ${user?.role || 'user'}.`
    : "You don't have permission to view this page.";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        
        <p className="text-gray-600 mb-8">
          {message || defaultMessage}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="inline-flex items-center justify-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link href="/" className="inline-flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </Link>
        </div>
      </div>
    </div>
  );
}