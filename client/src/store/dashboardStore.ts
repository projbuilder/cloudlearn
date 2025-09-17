import { create } from 'zustand';

interface DashboardState {
  analytics: any | null;
  streak: any | null;
  recommendations: any[];
  masteryStates: any[];
  recentActivity: any[];
  isLoading: boolean;
  setAnalytics: (analytics: any) => void;
  setStreak: (streak: any) => void;
  setRecommendations: (recommendations: any[]) => void;
  setMasteryStates: (states: any[]) => void;
  setRecentActivity: (activity: any[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  analytics: null,
  streak: null,
  recommendations: [],
  masteryStates: [],
  recentActivity: [],
  isLoading: false,
  setAnalytics: (analytics) => set({ analytics }),
  setStreak: (streak) => set({ streak }),
  setRecommendations: (recommendations) => set({ recommendations }),
  setMasteryStates: (states) => set({ masteryStates: states }),
  setRecentActivity: (activity) => set({ recentActivity: activity }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
