import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, HelpCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Question {
  id: string;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  difficulty: number;
}

interface AdaptiveQuizProps {
  quiz: {
    id: string;
    title: string;
    questions: Question[];
    adaptiveData?: any;
  };
  currentQuestion: number;
  timeRemaining: number;
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  onShowHint: () => void;
  showExplanation: boolean;
  isSubmitting: boolean;
}

export default function AdaptiveQuiz({
  quiz,
  currentQuestion,
  timeRemaining,
  selectedAnswer,
  onAnswerSelect,
  onSubmitAnswer,
  onNextQuestion,
  onPreviousQuestion,
  onShowHint,
  showExplanation,
  isSubmitting
}: AdaptiveQuizProps) {
  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!question) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">No questions available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Adaptive Quiz</h2>
          <p className="text-gray-600 mb-6">AI-powered questions tailored to your current mastery level</p>
          
          <div className="inline-flex items-center space-x-4 bg-blue-50 px-6 py-3 rounded-lg">
            <div className="text-sm text-blue-700">
              <span className="font-semibold">Topic:</span> {quiz.title}
            </div>
            <div className="text-sm text-blue-700">
              <span className="font-semibold">Difficulty:</span> Adaptive
            </div>
            <div className="text-sm text-blue-700">
              <span className="font-semibold">Questions:</span> {quiz.questions.length}
            </div>
          </div>
        </div>

        {/* Question Progress */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Question <span className="font-semibold text-gray-900">{currentQuestion + 1}</span> of{' '}
            <span className="font-semibold text-gray-900">{quiz.questions.length}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeRemaining)} remaining</span>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="mb-8" />

        {/* Question Content */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{question.stem}</h3>
          
          {/* Multiple Choice Options */}
          <RadioGroup value={selectedAnswer} onValueChange={onAnswerSelect}>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`option-${index}`}
                    className="text-primary"
                  />
                  <Label 
                    htmlFor={`option-${index}`}
                    className="flex-1 p-4 border-2 border-gray-200 rounded-lg hover:border-primary cursor-pointer transition-colors"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Explanation */}
        {showExplanation && question.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Explanation</h4>
            <p className="text-blue-800">{question.explanation}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onPreviousQuestion}
            disabled={currentQuestion === 0}
          >
            Previous Question
          </Button>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onShowHint}
              className="flex items-center space-x-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Need a Hint?</span>
            </Button>
            
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button
                onClick={onSubmitAnswer}
                disabled={!selectedAnswer || isSubmitting}
                className="px-8"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            ) : (
              <Button
                onClick={onNextQuestion}
                disabled={!selectedAnswer}
                className="px-8"
              >
                Next Question
              </Button>
            )}
          </div>
        </div>

        {/* Adaptive Information */}
        {quiz.adaptiveData && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                <strong>Adaptive Engine:</strong> {quiz.adaptiveData.adaptationStrategy}
              </p>
              <p>
                <strong>Initial Difficulty:</strong> {quiz.adaptiveData.initialDifficulty}
              </p>
              <p>
                <strong>Estimated Ability:</strong> {quiz.adaptiveData.estimatedAbility?.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
