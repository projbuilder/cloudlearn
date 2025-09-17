import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import RouteGuard from "@/components/RouteGuard";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import StudentDashboard from "@/pages/StudentDashboard";
import AdaptiveQuizzes from "@/pages/AdaptiveQuizzes";
import AITutorPage from "@/pages/AITutorPage";
import AdminFL from "@/pages/AdminFL";
import AdminCloud from "@/pages/AdminCloud";
// Student pages
import LearningModules from "@/pages/LearningModules";
import Recommendations from "@/pages/Recommendations";
// Instructor pages
import ContentLibrary from "@/pages/ContentLibrary";
import QuizBuilder from "@/pages/QuizBuilder";
import InstructorAnalytics from "@/pages/InstructorAnalytics";
import StudentManagement from "@/pages/StudentManagement";
// Admin pages
import AdminAnalytics from "@/pages/AdminAnalytics";
import SystemHealth from "@/pages/SystemHealth";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CloudLearn...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          {/* Common authenticated routes */}
          <Route path="/" component={Home} />
          <Route path="/dashboard">
            <RouteGuard allowedRoles={['student']} requiredRole="student">
              <StudentDashboard />
            </RouteGuard>
          </Route>
          
          {/* Student routes */}
          <Route path="/courses">
            <RouteGuard allowedRoles={['student']} requiredRole="student">
              <LearningModules />
            </RouteGuard>
          </Route>
          <Route path="/quizzes">
            <RouteGuard allowedRoles={['student']} requiredRole="student">
              <AdaptiveQuizzes />
            </RouteGuard>
          </Route>
          <Route path="/tutor">
            <RouteGuard allowedRoles={['student']} requiredRole="student">
              <AITutorPage />
            </RouteGuard>
          </Route>
          <Route path="/recommendations">
            <RouteGuard allowedRoles={['student']} requiredRole="student">
              <Recommendations />
            </RouteGuard>
          </Route>
          
          {/* Instructor routes */}
          <Route path="/content">
            <RouteGuard allowedRoles={['instructor']} requiredRole="instructor">
              <ContentLibrary />
            </RouteGuard>
          </Route>
          <Route path="/quiz-builder">
            <RouteGuard allowedRoles={['instructor']} requiredRole="instructor">
              <QuizBuilder />
            </RouteGuard>
          </Route>
          <Route path="/analytics">
            <RouteGuard allowedRoles={['instructor']} requiredRole="instructor">
              <InstructorAnalytics />
            </RouteGuard>
          </Route>
          <Route path="/students">
            <RouteGuard allowedRoles={['instructor']} requiredRole="instructor">
              <StudentManagement />
            </RouteGuard>
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin/fl">
            <RouteGuard allowedRoles={['admin']} requiredRole="admin">
              <AdminFL />
            </RouteGuard>
          </Route>
          <Route path="/admin/cloud">
            <RouteGuard allowedRoles={['admin']} requiredRole="admin">
              <AdminCloud />
            </RouteGuard>
          </Route>
          <Route path="/admin/analytics">
            <RouteGuard allowedRoles={['admin']} requiredRole="admin">
              <AdminAnalytics />
            </RouteGuard>
          </Route>
          <Route path="/admin/health">
            <RouteGuard allowedRoles={['admin']} requiredRole="admin">
              <SystemHealth />
            </RouteGuard>
          </Route>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
