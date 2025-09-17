import { storage } from "../storage";

interface LearningPathRecommendation {
  moduleId: string;
  title: string;
  difficulty: number;
  estimatedTime: number;
  masteryGain: number;
  reason: string;
  prerequisites: string[];
}

class LearningPathService {
  // Generate personalized learning path based on student patterns
  async generatePersonalizedPath(userId: string): Promise<any> {
    const user = await storage.getUser(userId);
    const masteryStates = await storage.getMasteryStatesByUser(userId);
    const recentAttempts = await storage.getAttemptsByUser(userId);
    const existingPaths = await storage.getLearningPathsByUser(userId);

    // Analyze learning patterns
    const learningProfile = await this.analyzeLearningPatterns(userId, recentAttempts);
    
    // Get available modules
    const allModules = await storage.getModules();
    
    // Generate adaptive sequence based on mastery and preferences
    const optimizedSequence = await this.optimizeModuleSequence(
      allModules,
      masteryStates,
      learningProfile
    );

    // Create or update learning path
    const pathData = {
      userId,
      title: `Personalized Path - ${new Date().toLocaleDateString()}`,
      description: `AI-generated learning path based on your performance and preferences`,
      moduleSequence: optimizedSequence.map(m => m.id),
      estimatedDuration: optimizedSequence.reduce((sum, m) => sum + (m.estimatedTime || 30), 0),
      adaptiveWeights: this.calculateAdaptiveWeights(masteryStates, learningProfile),
      learningStyle: learningProfile.preferredStyle,
      difficultyProgression: learningProfile.difficultyPreference,
      completionRate: 0.0
    };

    // Delete existing auto-generated paths to avoid clutter
    for (const existingPath of existingPaths) {
      if (existingPath.title.includes('Personalized Path')) {
        await storage.deleteLearningPath(existingPath.id);
      }
    }

    const newPath = await storage.createLearningPath(pathData);

    // Track analytics for this path generation
    await storage.createStudentAnalytics({
      userId,
      institutionId: user?.institutionId!,
      moduleId: optimizedSequence[0]?.id || '',
      timeSpent: 0,
      interactionCount: 1,
      errorPatterns: {},
      learningVelocity: learningProfile.averageVelocity,
      engagementScore: learningProfile.engagementScore,
      difficultyRating: learningProfile.preferredDifficulty
    });

    return {
      path: newPath,
      recommendations: optimizedSequence.slice(0, 3), // Next 3 modules
      insights: {
        strongAreas: learningProfile.strongTopics,
        improvementAreas: learningProfile.weakTopics,
        recommendedStudyTime: Math.ceil(pathData.estimatedDuration / 7), // Minutes per day
        adaptationReason: learningProfile.adaptationReason
      }
    };
  }

  // Update learning path progress
  async updatePathProgress(userId: string, moduleId: string, completionStatus: 'started' | 'completed'): Promise<void> {
    const paths = await storage.getLearningPathsByUser(userId);
    
    for (const path of paths) {
      const moduleSequence = path.moduleSequence as string[] || [];
      const moduleIndex = moduleSequence.indexOf(moduleId);
      
      if (moduleIndex !== -1) {
        const newIndex = completionStatus === 'completed' ? moduleIndex + 1 : moduleIndex;
        const completionRate = newIndex / moduleSequence.length;
        
        await storage.updateLearningPath(path.id, {
          currentModuleIndex: newIndex,
          completionRate,
          updatedAt: new Date()
        });

        // Generate next recommendations if module completed
        if (completionStatus === 'completed') {
          await this.generateNextRecommendations(userId, path.id);
        }
      }
    }
  }

  // Get current learning path recommendations
  async getCurrentRecommendations(userId: string): Promise<LearningPathRecommendation[]> {
    const paths = await storage.getLearningPathsByUser(userId);
    const masteryStates = await storage.getMasteryStatesByUser(userId);
    
    if (paths.length === 0) {
      // Generate first path if none exists
      await this.generatePersonalizedPath(userId);
      return this.getCurrentRecommendations(userId);
    }

    const currentPath = paths[0]; // Most recent path
    const moduleSequence = currentPath.moduleSequence as string[] || [];
    const currentIndex = currentPath.currentModuleIndex || 0;
    
    // Get next 3 modules in the path
    const nextModules = moduleSequence.slice(currentIndex, currentIndex + 3);
    const recommendations: LearningPathRecommendation[] = [];
    
    for (const moduleId of nextModules) {
      const module = await storage.getModule(moduleId);
      if (module) {
        const mastery = masteryStates.find(m => 
          m.knowledgeComponent.toLowerCase().includes(module.title.toLowerCase())
        );
        
        recommendations.push({
          moduleId: module.id,
          title: module.title,
          difficulty: module.difficulty || 1,
          estimatedTime: module.estimatedTime || 30,
          masteryGain: this.calculateMasteryGain(mastery?.mastery || 0, module.difficulty || 1),
          reason: this.generateRecommendationReason(module, mastery),
          prerequisites: [] // Could analyze module dependencies
        });
      }
    }

    return recommendations;
  }

  // Analyze student learning patterns
  private async analyzeLearningPatterns(userId: string, attempts: any[]): Promise<any> {
    if (attempts.length === 0) {
      return {
        preferredStyle: 'mixed',
        difficultyPreference: 'adaptive',
        averageVelocity: 0.5,
        engagementScore: 0.5,
        strongTopics: [],
        weakTopics: [],
        preferredDifficulty: 3,
        adaptationReason: 'No previous attempts found'
      };
    }

    // Analyze performance patterns
    const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
    const timePatterns = attempts.map(a => a.completedAt - a.startedAt).filter(t => t > 0);
    const avgTime = timePatterns.length > 0 ? 
      timePatterns.reduce((sum, t) => sum + t, 0) / timePatterns.length : 0;

    // Infer learning velocity (concepts learned per minute)
    const learningVelocity = avgScore / (avgTime / 60000 || 1); // Convert to minutes

    // Analyze topic performance
    const topicPerformance = new Map<string, number[]>();
    for (const attempt of attempts) {
      const adaptiveData = attempt.adaptiveData as any || {};
      const topics = adaptiveData.topics || ['general'];
      
      for (const topic of topics) {
        if (!topicPerformance.has(topic)) {
          topicPerformance.set(topic, []);
        }
        topicPerformance.get(topic)!.push(attempt.score);
      }
    }

    const strongTopics = Array.from(topicPerformance.entries())
      .filter(([_, scores]) => scores.reduce((sum, s) => sum + s, 0) / scores.length > 0.8)
      .map(([topic, _]) => topic);

    const weakTopics = Array.from(topicPerformance.entries())
      .filter(([_, scores]) => scores.reduce((sum, s) => sum + s, 0) / scores.length < 0.6)
      .map(([topic, _]) => topic);

    return {
      preferredStyle: this.inferLearningStyle(attempts),
      difficultyPreference: avgScore > 0.8 ? 'accelerated' : avgScore > 0.6 ? 'adaptive' : 'guided',
      averageVelocity: Math.max(0.1, Math.min(2.0, learningVelocity)),
      engagementScore: Math.max(0.1, Math.min(1.0, avgScore * 1.2)),
      strongTopics,
      weakTopics,
      preferredDifficulty: avgScore > 0.8 ? 4 : avgScore > 0.6 ? 3 : 2,
      adaptationReason: `Based on ${attempts.length} quiz attempts with ${(avgScore * 100).toFixed(1)}% average score`
    };
  }

  // Optimize module sequence using learning analytics
  private async optimizeModuleSequence(modules: any[], masteryStates: any[], learningProfile: any): Promise<any[]> {
    // Filter modules based on current mastery
    const availableModules = modules.filter(module => {
      const mastery = masteryStates.find(m => 
        m.knowledgeComponent.toLowerCase().includes(module.title.toLowerCase())
      );
      return !mastery || mastery.mastery < 0.8; // Focus on unmastered content
    });

    // Sort by optimal learning sequence
    return availableModules.sort((a, b) => {
      const scoreA = this.calculateModuleScore(a, masteryStates, learningProfile);
      const scoreB = this.calculateModuleScore(b, masteryStates, learningProfile);
      return scoreB - scoreA; // Descending order
    });
  }

  private calculateModuleScore(module: any, masteryStates: any[], learningProfile: any): number {
    const mastery = masteryStates.find(m => 
      m.knowledgeComponent.toLowerCase().includes(module.title.toLowerCase())
    );
    const currentMastery = mastery?.mastery || 0;
    
    // Score based on potential for improvement and learning preferences
    let score = 0;
    
    // Prioritize modules with room for improvement
    score += (1 - currentMastery) * 40;
    
    // Prefer modules matching difficulty preference
    const difficultyMatch = Math.abs((module.difficulty || 3) - learningProfile.preferredDifficulty);
    score += (5 - difficultyMatch) * 10;
    
    // Factor in estimated time vs. available time
    const timeScore = Math.max(0, 10 - (module.estimatedTime || 30) / 6); // Prefer shorter modules
    score += timeScore;
    
    // Boost weak areas
    const isWeakArea = learningProfile.weakTopics.some((topic: string) => 
      module.title.toLowerCase().includes(topic.toLowerCase())
    );
    if (isWeakArea) score += 20;
    
    return score;
  }

  private calculateAdaptiveWeights(masteryStates: any[], learningProfile: any): any {
    return {
      masteryFocus: 0.4,
      difficultyProgression: 0.3,
      timeOptimization: 0.2,
      interestAlignment: 0.1,
      profile: learningProfile
    };
  }

  private inferLearningStyle(attempts: any[]): string {
    // Simple heuristic based on attempt patterns
    const avgAttempts = attempts.length;
    const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
    
    if (avgScore > 0.8 && avgAttempts < 5) return 'accelerated';
    if (avgAttempts > 10) return 'thorough';
    return 'adaptive';
  }

  private calculateMasteryGain(currentMastery: number, difficulty: number): number {
    // Higher difficulty with lower mastery = higher potential gain
    return Math.max(0.1, (1 - currentMastery) * (difficulty / 5) * 0.3);
  }

  private generateRecommendationReason(module: any, mastery: any): string {
    const currentMastery = mastery?.mastery || 0;
    
    if (currentMastery < 0.3) {
      return `Essential foundation topic - build core understanding`;
    } else if (currentMastery < 0.6) {
      return `Strengthen your knowledge in this important area`;
    } else if (currentMastery < 0.8) {
      return `Polish your skills to achieve mastery`;
    } else {
      return `Ready for advanced concepts in ${module.title}`;
    }
  }

  private async generateNextRecommendations(userId: string, pathId: string): Promise<void> {
    // Could trigger re-optimization of remaining path based on new performance data
    const masteryStates = await storage.getMasteryStatesByUser(userId);
    // This could update the remaining modules in the path based on new mastery data
  }
}

export const learningPathService = new LearningPathService();