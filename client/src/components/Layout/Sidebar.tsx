import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import {
  BookOpen,
  Brain,
  MessageCircle,
  Zap,
  BarChart3,
  Cloud,
  Activity,
  Settings,
  LogOut,
  Users
} from 'lucide-react';

// Helper function to ensure tailwind classes are applied correctly
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const navigation = {
  student: [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Learning Modules', href: '/courses', icon: BookOpen },
    { name: 'Adaptive Quizzes', href: '/quizzes', icon: Brain },
    { name: 'AI Tutor', href: '/tutor', icon: MessageCircle },
    { name: 'Recommendations', href: '/recommendations', icon: Zap },
  ],
  instructor: [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Content Library', href: '/content', icon: BookOpen },
    { name: 'Quiz Builder', href: '/quiz-builder', icon: Brain },
    { name: 'Analytics', href: '/analytics', icon: Activity },
    { name: 'Students', href: '/students', icon: Users },
  ],
  admin: [
    { name: 'Federated Learning', href: '/admin/fl', icon: Activity },
    { name: 'Cloud Operations', href: '/admin/cloud', icon: Cloud },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'System Health', href: '/admin/health', icon: Settings },
  ]
};

interface SidebarProps {
  privacyLevel: number;
  onPrivacyChange: (level: number) => void;
  flStatus: string;
  cloudStatus: string;
}

export default function Sidebar({
  privacyLevel,
  onPrivacyChange,
  flStatus,
  cloudStatus
}: SidebarProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading || !user) {
    return (
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 animate-pulse">
        <div className="p-6">
          <div className="w-8 h-8 bg-gray-300 rounded-lg mb-4"></div>
          <div className="w-24 h-4 bg-gray-300 rounded mb-2"></div>
          <div className="w-16 h-3 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  const userNavigation = navigation[user.role as keyof typeof navigation] || navigation.student;
  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.email ? user.email.substring(0, 2).toUpperCase() : 'U';

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email || 'User';

  const handleSignOut = () => {
    // Clear any local auth state and redirect to logout endpoint
    window.location.href = '/api/logout';
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full">
      {/* Logo and User Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CL</span>
          </div>
          <span className="text-xl font-bold text-gray-900">CloudLearn</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{displayName}</p>
            <p className="text-sm text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {userNavigation.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
              isActive ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-gray-100'
            )}>
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Privacy & System Status */}
      <div className="p-4 border-t border-gray-200">
        {user.role === 'student' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Privacy Level</span>
              <span className="text-sm text-gray-500">ε = {privacyLevel.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={privacyLevel}
              onChange={(e) => onPrivacyChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Private</span>
              <span>Balanced</span>
              <span>Utility</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">FL Status</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                flStatus === 'active' ? 'bg-success animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className={`font-medium ${
                flStatus === 'active' ? 'text-success' : 'text-gray-500'
              }`}>
                {flStatus === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Cloud Sync</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                cloudStatus === 'connected' ? 'bg-primary' : 'bg-error'
              }`}></div>
              <span className={`font-medium ${
                cloudStatus === 'connected' ? 'text-primary' : 'text-error'
              }`}>
                {cloudStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button onClick={handleSignOut} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}