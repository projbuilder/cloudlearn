import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import FederatedLearning from '@/components/Admin/FederatedLearning';
import { useToast } from '@/hooks/use-toast';

export default function AdminFL() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    privacyLevel,
    engagementLevel,
    flStatus,
    cloudStatus,
    setPrivacyLevel,
    setEngagementLevel
  } = useAuthStore();

  // Redirect non-admin users
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Admin privileges required to access this page.",
        variant: "destructive",
      });
      window.location.href = '/dashboard';
    }
  }, [user, toast]);

  const handlePrivacyChange = (level: number) => {
    setPrivacyLevel(level);
  };

  const handleEngagementChange = (level: string) => {
    setEngagementLevel(level);
  };

  const handleCloudSync = () => {
    toast({
      title: "Cloud Sync Complete",
      description: "FL system data synchronized successfully!",
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        privacyLevel={privacyLevel}
        onPrivacyChange={handlePrivacyChange}
        flStatus={flStatus}
        cloudStatus={cloudStatus}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Federated Learning Operations"
          subtitle="Manage FL training rounds and monitor global model performance"
          engagementLevel={engagementLevel}
          onEngagementChange={handleEngagementChange}
          onCloudSync={handleCloudSync}
        />

        <main className="flex-1 overflow-auto p-6">
          <FederatedLearning />
        </main>
      </div>
    </div>
  );
}
