import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useQuizStore } from '@/store/quizStore';
import { apiRequest } from '@/lib/queryClient';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import AdaptiveQuiz from '@/components/Quiz/AdaptiveQuiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Brain, Target } from 'lucide-react';

export default function AdaptiveQuizzes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    privacyLevel,
    engagementLevel,
    flStatus,
    cloudStatus,
    setPrivacyLevel,
    setEngagementLevel
  } = useAuthStore();

  const {
    currentQuiz,
    currentQuestion,
    answers,
    timeRemaining,
    isSubmitting,
    showExplanation,
    setCurrentQuiz,
    setCurrentQuestion,
    setAnswer,
    setTimeRemaining,
    setSubmitting,
    setShowExplanation,
    resetQuiz
  } = useQuizStore();

  // Fetch available quizzes
  const { data: courses } = useQuery({
    queryKey: ['/api/courses'],
    enabled: !!user,
  });

  const { data: modules } = useQuery({
    queryKey: ['/api/courses', courses?.[0]?.id, 'modules'],
    enabled: !!courses?.[0]?.id,
  });

  const { data: quizzes } = useQuery({
    queryKey: ['/api/modules', modules?.[0]?.id, 'quizzes'],
    enabled: !!modules?.[0]?.id,
  });

  // Generate adaptive quiz mutation
  const generateQuizMutation = useMutation({
    mutationFn: async ({ quizId, difficulty }: { quizId: string; difficulty?: number }) => {
      const response = await apiRequest('POST', `/api/quizzes/${quizId}/generate`, { difficulty });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentQuiz(data);
      setCurrentQuestion(0);
      setTimeRemaining(data.timeLimit || 1200); // 20 minutes default
      toast({
        title: "Quiz Generated",
        description: "Adaptive quiz tailored to your learning level is ready!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate adaptive quiz. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Submit attempt mutation
  const submitAttemptMutation = useMutation({
    mutationFn: async (attemptData: any) => {
      const response = await apiRequest('POST', `/api/quizzes/${currentQuiz.id}/attempts`, attemptData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quiz Submitted",
        description: `Score: ${Math.round(data.score * 100)}% • Mastery levels updated!`,
      });
      resetQuiz();
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/dashboard'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Timer effect
  React.useEffect(() => {
    if (currentQuiz && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && currentQuiz) {
      handleSubmitQuiz();
    }
  }, [timeRemaining, currentQuiz]);

  const handleStartQuiz = (quizId: string, difficulty?: number) => {
    generateQuizMutation.mutate({ quizId, difficulty });
  };

  const handleAnswerSelect = (answer: string) => {
    if (currentQuiz) {
      const question = currentQuiz.questions[currentQuestion];
      setAnswer(question.id, { selectedIndex: parseInt(answer), correct: parseInt(answer) === question.correctIndex });
    }
  };

  const handleSubmitAnswer = () => {
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = () => {
    if (!currentQuiz) return;

    setSubmitting(true);
    
    const correctAnswers = Object.values(answers).filter((answer: any) => answer.correct).length;
    const score = correctAnswers / currentQuiz.questions.length;

    submitAttemptMutation.mutate({
      score,
      totalQuestions: currentQuiz.questions.length,
      correctAnswers,
      itemStatsJson: answers,
      adaptiveData: currentQuiz.adaptiveData
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleShowHint = () => {
    toast({
      title: "Hint",
      description: "Remember to carefully read each option and eliminate obviously incorrect answers first.",
    });
  };

  const handlePrivacyChange = (level: number) => {
    setPrivacyLevel(level);
  };

  const handleEngagementChange = (level: string) => {
    setEngagementLevel(level);
  };

  const handleCloudSync = () => {
    toast({
      title: "Cloud Sync Complete",
      description: "Quiz progress synchronized successfully!",
    });
  };

  if (currentQuiz) {
    const question = currentQuiz.questions[currentQuestion];
    const selectedAnswer = answers[question?.id]?.selectedIndex?.toString() || '';

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
            title="Adaptive Quiz"
            subtitle="AI-powered assessment tailored to your learning level"
            engagementLevel={engagementLevel}
            onEngagementChange={handleEngagementChange}
            onCloudSync={handleCloudSync}
          />

          <main className="flex-1 overflow-auto p-6">
            <AdaptiveQuiz
              quiz={currentQuiz}
              currentQuestion={currentQuestion}
              timeRemaining={timeRemaining}
              selectedAnswer={selectedAnswer}
              onAnswerSelect={handleAnswerSelect}
              onSubmitAnswer={handleSubmitAnswer}
              onNextQuestion={handleNextQuestion}
              onPreviousQuestion={handlePreviousQuestion}
              onShowHint={handleShowHint}
              showExplanation={showExplanation}
              isSubmitting={isSubmitting}
            />
          </main>
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
          title="Adaptive Quizzes"
          subtitle="AI-powered assessments that adapt to your learning level"
          engagementLevel={engagementLevel}
          onEngagementChange={handleEngagementChange}
          onCloudSync={handleCloudSync}
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Challenge</h2>
              <p className="text-gray-600">
                Our AI analyzes your performance and creates personalized quizzes to maximize your learning
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mathematics Quiz */}
              <Card className="card-hover cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Algebra & Trigonometry</CardTitle>
                      <p className="text-sm text-gray-600">Adaptive difficulty</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Questions automatically adjust based on your current mastery level in linear equations, 
                    quadratic functions, and trigonometric concepts.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Estimated Time:</span>
                      <span className="font-medium">15-20 minutes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Questions:</span>
                      <span className="font-medium">8-12 (adaptive)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Difficulty:</span>
                      <span className="font-medium">Personalized</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleStartQuiz(quizzes?.[0]?.id)}
                    disabled={!quizzes?.[0]?.id || generateQuizMutation.isPending}
                    className="w-full"
                  >
                    {generateQuizMutation.isPending ? 'Generating...' : 'Start Adaptive Quiz'}
                  </Button>
                </CardContent>
              </Card>

              {/* Computer Science Quiz */}
              <Card className="card-hover cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Computer Science</CardTitle>
                      <p className="text-sm text-gray-600">Programming concepts</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Test your knowledge of Python programming, data structures, algorithms, 
                    and fundamental CS concepts with intelligent question selection.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Estimated Time:</span>
                      <span className="font-medium">12-18 minutes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Questions:</span>
                      <span className="font-medium">6-10 (adaptive)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Difficulty:</span>
                      <span className="font-medium">Personalized</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleStartQuiz(quizzes?.[1]?.id)}
                    disabled={!quizzes?.[1]?.id || generateQuizMutation.isPending}
                    className="w-full"
                  >
                    {generateQuizMutation.isPending ? 'Generating...' : 'Start Adaptive Quiz'}
                  </Button>
                </CardContent>
              </Card>

              {/* Practice Mode */}
              <Card className="card-hover cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Practice Mode</CardTitle>
                      <p className="text-sm text-gray-600">Focused review</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Focus on specific topics where you need improvement. Questions target 
                    your knowledge gaps identified by our mastery tracking system.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Estimated Time:</span>
                      <span className="font-medium">10-15 minutes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Questions:</span>
                      <span className="font-medium">5-8 (targeted)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Focus:</span>
                      <span className="font-medium">Weak areas</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    className="w-full"
                    disabled
                  >
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Features Section */}
            <div className="mt-12 bg-blue-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                How Adaptive Quizzes Work
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">AI Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Our AI analyzes your past performance and current mastery levels to select optimal questions
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Dynamic Difficulty</h4>
                  <p className="text-sm text-gray-600">
                    Question difficulty adjusts in real-time based on your responses using Item Response Theory
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Personalized Learning</h4>
                  <p className="text-sm text-gray-600">
                    Every quiz helps refine your learning path and improve recommendation accuracy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
