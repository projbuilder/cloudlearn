import { create } from 'zustand';

interface QuizState {
  currentQuiz: any | null;
  currentQuestion: number;
  answers: Record<string, any>;
  timeRemaining: number;
  isSubmitting: boolean;
  showExplanation: boolean;
  adaptiveData: any | null;
  setCurrentQuiz: (quiz: any) => void;
  setCurrentQuestion: (question: number) => void;
  setAnswer: (questionId: string, answer: any) => void;
  setTimeRemaining: (time: number) => void;
  setSubmitting: (submitting: boolean) => void;
  setShowExplanation: (show: boolean) => void;
  setAdaptiveData: (data: any) => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  currentQuiz: null,
  currentQuestion: 0,
  answers: {},
  timeRemaining: 0,
  isSubmitting: false,
  showExplanation: false,
  adaptiveData: null,
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setAnswer: (questionId, answer) => set((state) => ({
    answers: { ...state.answers, [questionId]: answer }
  })),
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setSubmitting: (submitting) => set({ isSubmitting: submitting }),
  setShowExplanation: (show) => set({ showExplanation: show }),
  setAdaptiveData: (data) => set({ adaptiveData: data }),
  resetQuiz: () => set({
    currentQuiz: null,
    currentQuestion: 0,
    answers: {},
    timeRemaining: 0,
    isSubmitting: false,
    showExplanation: false,
    adaptiveData: null,
  }),
}));
