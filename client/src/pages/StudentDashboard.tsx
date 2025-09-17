import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import ProgressRing from '@/components/Dashboard/ProgressRing';
import StreakCalendar from '@/components/Dashboard/StreakCalendar';
import NextBestModule from '@/components/Dashboard/NextBestModule';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, BookOpen, MessageCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { useLocation } from 'wouter';

export default function StudentDashboard() {
  const { user } = useAuth();

  const userId = user?.id;
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { 
    privacyLevel, 
    engagementLevel, 
    flStatus, 
    cloudStatus,
    setPrivacyLevel,
    setEngagementLevel 
  } = useAuthStore();

  const { isConnected, lastMessage } = useWebSocket(userId);

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['/api/analytics/dashboard', userId],
    enabled: !!userId,
  });

  const { data: streak } = useQuery({
    queryKey: ['/api/users', userId, 'streak'],
    enabled: !!userId,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['/api/users', userId, 'recommendations'],
    enabled: !!userId,
  });

  const { data: masteryStates } = useQuery({
    queryKey: ['/api/users', userId, 'mastery'],
    enabled: !!userId,
  });

  const handlePrivacyChange = (level: number) => {
    setPrivacyLevel(level);
    toast({
      title: "Privacy Level Updated",
      description: `Differential privacy set to ε = ${level.toFixed(1)}`,
    });
  };

  const handleEngagementChange = (level: string) => {
    setEngagementLevel(level);
    toast({
      title: "Engagement Level Updated",
      description: `Engagement simulation set to ${level}`,
    });
  };

  const handleCloudSync = () => {
    toast({
      title: "Cloud Sync Complete",
      description: "Your learning data has been synchronized successfully!",
    });
  };

  const handleStartModule = () => {
    toast({
      title: "Loading Module",
      description: "Preparing adaptive content based on your learning profile...",
    });
    setTimeout(() => {
      setLocation('/courses');
    }, 1000);
  };

  const handleTakeQuiz = () => {
    toast({
      title: "Loading Quiz",
      description: "Preparing adaptive questions for your skill level...",
    });
    setTimeout(() => {
      setLocation('/quizzes');
    }, 1000);
  };

  const handleAskTutor = () => {
    toast({
      title: "Opening AI Tutor",
      description: "Starting your personalized tutoring session...",
    });
    setTimeout(() => {
      setLocation('/tutor');
    }, 1000);
  };

  const handleReviewMistakes = () => {
    toast({
      title: "Loading Review",
      description: "Analyzing your previous mistakes for targeted practice...",
    });
    setTimeout(() => {
      setLocation('/recommendations');
    }, 1000);
  };

  // Handle unauthorized errors
  React.useEffect(() => {
    if (analyticsError && isUnauthorizedError(analyticsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [analyticsError, toast]);

  // Handle WebSocket messages
  React.useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'event' && lastMessage.data?.type === 'quiz_complete') {
        toast({
          title: "Progress Updated",
          description: "Your mastery levels have been updated based on your quiz performance.",
        });
      }
    }
  }, [lastMessage, toast]);

  if (analyticsLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 bg-white shadow-lg border-r border-gray-200 animate-pulse">
          <div className="p-6 space-y-4">
            <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
            <div className="w-24 h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-6">
              <div className="h-64 bg-gray-300 rounded-xl"></div>
              <div className="h-64 bg-gray-300 rounded-xl"></div>
              <div className="h-64 bg-gray-300 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressData = (analytics as any)?.progressOverview || {
    mathematics: { progress: 70, modulesCompleted: 12, totalModules: 17, weeklyGrowth: 15 },
    computerScience: { progress: 60, modulesCompleted: 9, totalModules: 15, weeklyGrowth: 8 }
  };

  const streakData = (streak as any) || {
    currentStreak: 14,
    longestStreak: 21,
    calendarDays: Array.from({ length: 14 }, (_, i) => ({
      date: i + 1,
      active: i < 14,
      day: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i % 7]
    })),
    badges: ['Week Warrior', 'Quiz Master']
  };

  const nextBestModule = (analytics as any)?.nextBestModule || {
    title: "Quadratic Functions - Advanced",
    description: "Build on your linear equations knowledge with quadratic relationships and graphing techniques.",
    difficulty: 3,
    estimatedTime: 45,
    masteryGain: 23,
    reason: "Based on your progress in linear equations"
  };

  const recentActivity = (analytics as any)?.recentActivity || [
    {
      type: 'quiz_complete',
      title: 'Quiz completed: Linear Equations - Advanced',
      description: 'Score: 85% • Mastery increased by 12%',
      timestamp: new Date(),
      icon: 'check_circle',
      color: 'success'
    },
    {
      type: 'learning',
      title: 'AI Tutor session: Quadratic formula explanation',
      description: 'Duration: 15 minutes • 3 follow-up questions',
      timestamp: new Date(),
      icon: 'message',
      color: 'purple'
    }
  ];

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
          title="Student Dashboard"
          subtitle="Welcome back! Ready to continue your learning journey?"
          engagementLevel={engagementLevel}
          onEngagementChange={handleEngagementChange}
          onCloudSync={handleCloudSync}
        />

        <main className="flex-1 overflow-auto p-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Math Progress */}
                    <div className="text-center">
                      <ProgressRing 
                        progress={progressData.mathematics.progress}
                        color="hsl(203.8863, 88.2845%, 53.1373%)"
                      />
                      <h4 className="font-semibold text-gray-900 mt-4">Algebra & Trigonometry</h4>
                      <p className="text-sm text-gray-600">
                        {progressData.mathematics.modulesCompleted}/{progressData.mathematics.totalModules} modules completed
                      </p>
                      <div className="mt-3 flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">
                          +{progressData.mathematics.weeklyGrowth}% this week
                        </span>
                      </div>
                    </div>

                    {/* CS Progress */}
                    <div className="text-center">
                      <ProgressRing 
                        progress={progressData.computerScience.progress}
                        color="hsl(180, 75%, 39.2157%)"
                      />
                      <h4 className="font-semibold text-gray-900 mt-4">Computer Science</h4>
                      <p className="text-sm text-gray-600">
                        {progressData.computerScience.modulesCompleted}/{progressData.computerScience.totalModules} modules completed
                      </p>
                      <div className="mt-3 flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-yellow-600">
                          +{progressData.computerScience.weeklyGrowth}% this week
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Streak */}
            <StreakCalendar {...streakData} />
          </div>

          {/* Next Best Module & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <NextBestModule
              module={nextBestModule}
              onStartModule={handleStartModule}
            />

            {/* Quick Actions */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  onClick={handleTakeQuiz}
                  className="w-full p-4 h-auto bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900">Take Adaptive Quiz</h4>
                        <p className="text-sm text-gray-600">AI-powered questions at your level</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleAskTutor}
                  className="w-full p-4 h-auto bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200 group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900">Ask AI Tutor</h4>
                        <p className="text-sm text-gray-600">Get help with difficult concepts</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleReviewMistakes}
                  className="w-full p-4 h-auto bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-orange-200 group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900">Review Mistakes</h4>
                        <p className="text-sm text-gray-600">Learn from previous errors</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-orange-600">3 items</span>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Feed */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.color === 'success' ? 'bg-green-500' :
                      activity.color === 'purple' ? 'bg-purple-500' : 'bg-blue-500'
                    }`}>
                      {activity.icon === 'check_circle' ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : activity.icon === 'message' ? (
                        <MessageCircle className="w-5 h-5 text-white" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <strong>{activity.title}</strong>
                      </p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}