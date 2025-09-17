import { create } from 'zustand';

interface AuthState {
  privacyLevel: number;
  engagementLevel: string;
  flStatus: string;
  cloudStatus: string;
  setPrivacyLevel: (level: number) => void;
  setEngagementLevel: (level: string) => void;
  setFLStatus: (status: string) => void;
  setCloudStatus: (status: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  privacyLevel: 3.0,
  engagementLevel: 'medium',
  flStatus: 'active',
  cloudStatus: 'connected',
  setPrivacyLevel: (level) => set({ privacyLevel: level }),
  setEngagementLevel: (level) => set({ engagementLevel: level }),
  setFLStatus: (status) => set({ flStatus: status }),
  setCloudStatus: (status) => set({ cloudStatus: status }),
}));
