import { storage } from "../storage";
import type { Attempt, MasteryState } from "@shared/schema";

interface AdaptiveQuizConfig {
  targetDifficulty: number;
  maxQuestions: number;
  convergenceThreshold: number;
  masteryThreshold: number;
}

class QuizService {
  private defaultConfig: AdaptiveQuizConfig = {
    targetDifficulty: 2.0,
    maxQuestions: 10,
    convergenceThreshold: 0.1,
    masteryThreshold: 0.7,
  };

  async generateAdaptiveQuiz(
    quizId: string,
    userId: string,
    initialDifficulty?: number
  ): Promise<any> {
    const questions = await storage.getQuestionsByQuiz(quizId);
    const masteryStates = await storage.getMasteryStatesByUser(userId);
    
    // Calculate user's estimated ability
    const ability = this.estimateUserAbility(masteryStates);
    const difficulty = initialDifficulty || this.adaptDifficulty(ability);

    // Select questions using Item Response Theory principles
    const selectedQuestions = this.selectQuestionsIRT(questions, difficulty);
    
    return {
      quizId,
      questions: selectedQuestions,
      adaptiveData: {
        initialDifficulty: difficulty,
        estimatedAbility: ability,
        adaptationStrategy: 'IRT-based',
      },
    };
  }

  private estimateUserAbility(masteryStates: MasteryState[]): number {
    if (masteryStates.length === 0) return 0.0;
    
    const averageMastery = masteryStates.reduce((sum, state) => sum + (state.mastery || 0), 0) / masteryStates.length;
    
    // Convert mastery to ability scale (-3 to +3)
    return (averageMastery - 0.5) * 6;
  }

  private adaptDifficulty(ability: number): number {
    // Map ability (-3 to +3) to difficulty (1 to 5)
    return Math.max(1, Math.min(5, Math.round(ability + 3)));
  }

  private selectQuestionsIRT(questions: any[], targetDifficulty: number): any[] {
    // Sort questions by how well they discriminate at the target difficulty
    const scoredQuestions = questions.map(q => ({
      ...q,
      informationValue: this.calculateInformation(q, targetDifficulty),
    }));

    return scoredQuestions
      .sort((a, b) => b.informationValue - a.informationValue)
      .slice(0, this.defaultConfig.maxQuestions);
  }

  private calculateInformation(question: any, ability: number): number {
    // Simplified Fisher Information calculation for 2PL model
    const difficulty = question.difficulty || 1.0;
    const discrimination = question.discrimination || 1.0;
    
    const theta = ability - difficulty;
    const probability = 1 / (1 + Math.exp(-discrimination * theta));
    
    return discrimination * discrimination * probability * (1 - probability);
  }

  async updateMasteryFromAttempt(attempt: Attempt): Promise<void> {
    const questions = await storage.getQuestionsByQuiz(attempt.quizId);
    const itemStats = attempt.itemStatsJson as any;

    for (const question of questions) {
      if (!question.tags || !itemStats) continue;

      for (const tag of question.tags) {
        const isCorrect = itemStats[question.id]?.correct || false;
        await this.updateBayesianKT(attempt.userId, tag, isCorrect);
      }
    }
  }

  private async updateBayesianKT(
    userId: string,
    knowledgeComponent: string,
    isCorrect: boolean
  ): Promise<void> {
    const existing = await storage.getMasteryStatesByUser(userId);
    const currentState = existing.find(m => m.knowledgeComponent === knowledgeComponent);

    // BKT parameters
    const pInit = 0.1;  // Initial mastery probability
    const pLearn = 0.3; // Learning probability
    const pSlip = 0.1;  // Slip probability
    const pGuess = 0.25; // Guess probability

    let priorMastery = currentState?.mastery || pInit;
    let attempts = (currentState?.attempts || 0) + 1;

    // Bayesian update based on response
    let posteriorMastery: number;
    
    if (isCorrect) {
      const pCorrectGivenMastered = 1 - pSlip;
      const pCorrectGivenNotMastered = pGuess;
      const pCorrect = priorMastery * pCorrectGivenMastered + (1 - priorMastery) * pCorrectGivenNotMastered;
      
      posteriorMastery = (priorMastery * pCorrectGivenMastered) / pCorrect;
    } else {
      const pIncorrectGivenMastered = pSlip;
      const pIncorrectGivenNotMastered = 1 - pGuess;
      const pIncorrect = priorMastery * pIncorrectGivenMastered + (1 - priorMastery) * pIncorrectGivenNotMastered;
      
      posteriorMastery = (priorMastery * pIncorrectGivenMastered) / pIncorrect;
    }

    // Update with learning opportunity
    const finalMastery = posteriorMastery + (1 - posteriorMastery) * pLearn;

    await storage.upsertMasteryState({
      userId,
      knowledgeComponent,
      mastery: Math.min(0.99, Math.max(0.01, finalMastery)),
      attempts,
      lastCorrect: isCorrect,
    });
  }

  async getQuestionExplanation(questionId: string, userAnswer: any): Promise<string> {
    // Generate contextual explanation based on the user's answer
    const explanationTemplates = {
      incorrect: "Let's work through this step by step. The correct approach is...",
      partial: "You're on the right track! However, consider...",
      conceptual: "This question tests your understanding of...",
    };

    // In production, this would use AI to generate personalized explanations
    return explanationTemplates.incorrect;
  }

  async generateSimilarQuestions(questionId: string, difficulty: number): Promise<any[]> {
    // Generate variations of a question for retry scenarios
    const baseQuestion = await storage.getQuestionsByQuiz(''); // Would need proper lookup
    
    // Simulate question generation with slight variations
    return [{
      stem: "Modified version of the original question...",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 1,
      difficulty: difficulty,
      tags: ["similar_practice"]
    }];
  }
}

export const quizService = new QuizService();
