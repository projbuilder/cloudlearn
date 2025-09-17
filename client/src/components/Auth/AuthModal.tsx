import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Briefcase, Settings } from 'lucide-react';

export default function AuthModal() {
  const handleLogin = (role: string) => {
    window.location.href = '/api/login';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CL</span>
            </div>
            <CardTitle className="text-2xl font-bold">CloudLearn</CardTitle>
          </div>
          <p className="text-gray-600">AI-Powered Federated Learning Platform</p>
          
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Your Role</h3>
          
          <Button
            onClick={() => handleLogin('student')}
            variant="outline"
            className="w-full p-6 h-auto hover:border-primary hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center space-x-4 w-full">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-900">Student</h4>
                <p className="text-sm text-gray-600">Access courses, take quizzes, track progress</p>
                <p className="text-xs text-gray-500 mt-1">Demo: alex.student@cloudlearn.ai</p>
              </div>
            </div>
          </Button>
          
          <Button
            onClick={() => handleLogin('instructor')}
            variant="outline"
            className="w-full p-6 h-auto hover:border-secondary hover:bg-teal-50 transition-all group"
          >
            <div className="flex items-center space-x-4 w-full">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-900">Instructor</h4>
                <p className="text-sm text-gray-600">Create content, manage courses, analyze performance</p>
                <p className="text-xs text-gray-500 mt-1">Demo: sarah.instructor@cloudlearn.ai</p>
              </div>
            </div>
          </Button>
          
          <Button
            onClick={() => handleLogin('admin')}
            variant="outline"
            className="w-full p-6 h-auto hover:border-accent hover:bg-orange-50 transition-all group"
          >
            <div className="flex items-center space-x-4 w-full">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-900">Cloud Administrator</h4>
                <p className="text-sm text-gray-600">Manage FL nodes, monitor systems, configure regions</p>
                <p className="text-xs text-gray-500 mt-1">Demo: admin@cloudlearn.ai</p>
              </div>
            </div>
          </Button>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>GPU Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>16 FL Nodes Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
