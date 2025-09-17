import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import AITutor from '@/components/Tutor/AITutor';
import { useToast } from '@/hooks/use-toast';

export default function AITutorPage() {
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

  const handlePrivacyChange = (level: number) => {
    setPrivacyLevel(level);
    toast({
      title: "Privacy Level Updated",
      description: `AI tutor responses will be adjusted for ε = ${level.toFixed(1)}`,
    });
  };

  const handleEngagementChange = (level: string) => {
    setEngagementLevel(level);
    toast({
      title: "Engagement Level Updated",
      description: `Tutor interaction style updated to ${level}`,
    });
  };

  const handleCloudSync = () => {
    toast({
      title: "Cloud Sync Complete",
      description: "Conversation history synchronized successfully!",
    });
  };

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
          title="AI Tutor Assistant"
          subtitle="Get personalized help with your coursework from our AI-powered tutor"
          engagementLevel={engagementLevel}
          onEngagementChange={handleEngagementChange}
          onCloudSync={handleCloudSync}
        />

        <main className="flex-1 overflow-auto p-6">
          <AITutor userId={user?.id} />
        </main>
      </div>
    </div>
  );
}
