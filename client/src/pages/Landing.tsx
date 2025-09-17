import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthModal from '@/components/Auth/AuthModal';
import { 
  Brain, 
  BookOpen, 
  Users, 
  Zap, 
  Shield, 
  Sparkles,
  ArrowRight,
  GraduationCap,
  Cpu,
  Globe,
  BarChart3,
  Target
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Auth Modal */}
      <AuthModal />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <Badge className="mb-8 bg-blue-100 text-blue-700 border-blue-200" data-testid="badge-cloud-native">
              🚀 Cloud-Native E-Learning Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6" data-testid="text-hero-title">
              CloudLearn
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Advanced cloud-native e-learning platform with federated learning, AI personalization, and adaptive assessments
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Experience the future of education with our privacy-preserving AI tutor, real-time analytics, and comprehensive role-based dashboards.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
                data-testid="button-get-started"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-3 text-lg"
                data-testid="button-explore-features"
              >
                Explore Features
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="text-features-title">
            Production-Ready Features
          </h2>
          <p className="text-xl text-gray-600">
            Built with modern cloud technologies and AI-powered personalization
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-blue-200 transition-colors" data-testid="card-ai-tutor">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Flan-T5 AI Tutor</CardTitle>
              <CardDescription>
                Advanced natural language processing with Hugging Face's Flan-T5 model for personalized learning assistance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-200 transition-colors" data-testid="card-federated-learning">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Federated Learning</CardTitle>
              <CardDescription>
                Privacy-preserving machine learning with FedAvg algorithm and differential privacy protection
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-200 transition-colors" data-testid="card-adaptive-quizzes">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Adaptive Assessments</CardTitle>
              <CardDescription>
                Bayesian Knowledge Tracing for personalized difficulty adjustment and intelligent question sequencing
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-200 transition-colors" data-testid="card-cloud-infrastructure">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Cloud Infrastructure</CardTitle>
              <CardDescription>
                Multi-region architecture simulation with auto-scaling, serverless computing, and comprehensive monitoring
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-200 transition-colors" data-testid="card-role-based-access">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Complete authentication system with Student, Instructor, and Cloud Manager roles via OIDC integration
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-200 transition-colors" data-testid="card-real-time-analytics">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Real-Time Analytics</CardTitle>
              <CardDescription>
                Comprehensive dashboards with learning progress tracking, performance metrics, and system health monitoring
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="text-tech-stack-title">
              Modern Technology Stack
            </h2>
            <p className="text-xl text-gray-600">
              Built with production-ready technologies for scale and reliability
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: 'React 18', color: 'blue' },
              { name: 'TypeScript', color: 'indigo' },
              { name: 'Express.js', color: 'green' },
              { name: 'PostgreSQL', color: 'blue' },
              { name: 'Drizzle ORM', color: 'purple' },
              { name: 'TanStack Query', color: 'red' },
              { name: 'Tailwind CSS', color: 'cyan' },
              { name: 'shadcn/ui', color: 'gray' },
              { name: 'Vite', color: 'yellow' },
              { name: 'Zustand', color: 'orange' },
              { name: 'Recharts', color: 'teal' },
              { name: 'Flan-T5', color: 'pink' }
            ].map((tech, index) => (
              <div key={index} className="text-center" data-testid={`tech-${tech.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                <div className={`w-16 h-16 bg-${tech.color}-100 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <Cpu className={`h-8 w-8 text-${tech.color}-600`} />
                </div>
                <p className="text-sm font-medium text-gray-700">{tech.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deployment Ready */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Sparkles className="h-16 w-16 text-white mx-auto mb-8" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" data-testid="text-deployment-title">
            Ready for Production Deployment
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Fully configured for Netlify hosting with optimized builds, proper redirects, and serverless function integration. 
            Complete with database fallback handling, comprehensive error management, and production-ready performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold"
              data-testid="button-start-learning"
            >
              Start Learning Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center items-center mb-6">
            <GraduationCap className="h-8 w-8 text-blue-400 mr-3" />
            <span className="text-2xl font-bold text-white">CloudLearn</span>
          </div>
          <p className="text-gray-400 mb-4">
            Advanced cloud-native e-learning platform with AI personalization
          </p>
          <p className="text-gray-500 text-sm">
            Built with modern technologies • Ready for production deployment • Privacy-preserving federated learning
          </p>
        </div>
      </footer>
    </div>
  );
}
