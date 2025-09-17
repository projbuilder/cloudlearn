import { contentService } from "./content-service";
import { storage } from "../storage";

interface TutorResponse {
  message: string;
  sources: Array<{ name: string; url: string }>;
  relatedTopics: string[];
  followUpQuestions: string[];
  confidence: number;
}

class AITutorService {
  private conversationHistory = new Map<string, any[]>();

  async generateResponse(
    userMessage: string,
    context: any,
    userId: string
  ): Promise<TutorResponse> {
    try {
      // Get user's learning history for personalization
      const masteryStates = await storage.getMasteryStatesByUser(userId);
      const recentAttempts = await storage.getAttemptsByUser(userId);
      
      // Analyze the question to determine topic and intent
      const analysis = this.analyzeQuery(userMessage);
      
      // Retrieve relevant content from multiple sources
      const contentContext = await contentService.getTutorContext(analysis.topic);
      
      // Generate personalized response
      const response = await this.generatePersonalizedResponse(
        userMessage,
        analysis,
        contentContext,
        masteryStates
      );

      // Update conversation history
      this.updateConversationHistory(userId, userMessage, response);

      return response;

    } catch (error) {
      console.error('AI Tutor error:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  private analyzeQuery(message: string): any {
    // Simple keyword-based analysis - in production would use NLP
    const mathKeywords = ['equation', 'quadratic', 'linear', 'solve', 'graph', 'function'];
    const csKeywords = ['python', 'programming', 'code', 'algorithm', 'variable', 'loop'];
    const helpKeywords = ['help', 'explain', 'understand', 'confused', 'don\'t get'];
    
    const isMath = mathKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    const isCS = csKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    const needsHelp = helpKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    let topic = 'general';
    if (isMath) topic = 'mathematics';
    if (isCS) topic = 'computer_science';

    return {
      topic,
      intent: needsHelp ? 'explanation' : 'question',
      difficulty: this.estimateQuestionDifficulty(message),
      keywords: this.extractKeywords(message)
    };
  }

  private estimateQuestionDifficulty(message: string): number {
    // Simple heuristic - in production would use ML model
    const advancedTerms = ['derivative', 'integral', 'matrix', 'recursion', 'complexity'];
    const intermediateTerms = ['quadratic', 'function', 'loop', 'array'];
    const basicTerms = ['add', 'subtract', 'variable', 'print'];
    
    const msg = message.toLowerCase();
    
    if (advancedTerms.some(term => msg.includes(term))) return 4;
    if (intermediateTerms.some(term => msg.includes(term))) return 3;
    if (basicTerms.some(term => msg.includes(term))) return 1;
    
    return 2; // default
  }

  private extractKeywords(message: string): string[] {
    // Extract key mathematical/CS terms
    const keywords = message
      .toLowerCase()
      .match(/\b(equation|quadratic|linear|python|function|variable|loop|array|graph|solve|algorithm|derivative|integral|matrix|recursion|complexity|optimization|calculus|algebra|trigonometry|programming|code|debug|error|syntax|logic)\b/g);
    
    return keywords || [];
  }

  private async generatePersonalizedResponse(
    userMessage: string,
    analysis: any,
    contentContext: any,
    masteryStates: any[]
  ): Promise<TutorResponse> {
    
    // Check user's mastery in related areas
    const relevantMastery = masteryStates.filter(state => 
      analysis.keywords.some((keyword: string) => 
        state.knowledgeComponent.includes(keyword)
      )
    );

    const averageMastery = relevantMastery.length > 0 
      ? relevantMastery.reduce((sum, state) => sum + (state.mastery || 0), 0) / relevantMastery.length
      : 0.5;

    // Generate response based on mastery level
    let response: TutorResponse;
    
    if (averageMastery < 0.3) {
      response = this.generateBeginnerResponse(userMessage, analysis, contentContext);
    } else if (averageMastery < 0.7) {
      response = this.generateIntermediateResponse(userMessage, analysis, contentContext);
    } else {
      response = this.generateAdvancedResponse(userMessage, analysis, contentContext);
    }

    return response;
  }

  private generateBeginnerResponse(message: string, analysis: any, context: any): TutorResponse {
    const responses = {
      quadratic: {
        message: "Great question about quadratic functions! Let's start with the basics. A quadratic function has the form f(x) = ax² + bx + c. The 'a' coefficient determines if the parabola opens up (a > 0) or down (a < 0). Would you like me to show you a specific example?",
        followUpQuestions: [
          "What does the 'a' coefficient tell us about the parabola?",
          "How do we find the vertex of a quadratic function?",
          "Can you show me how to graph a simple quadratic?"
        ]
      },
      python: {
        message: "Python is a great language to start with! It uses clear, readable syntax. For example, to store a value, you use variables like: name = 'Alex'. To display something, you use: print('Hello!'). What specific aspect of Python would you like to explore?",
        followUpQuestions: [
          "How do I create and use variables?",
          "What are the basic data types in Python?",
          "How do I write my first Python program?"
        ]
      },
      default: {
        message: "I'd be happy to help you understand this concept! Let's break it down into smaller, manageable parts. Can you tell me which specific part you're finding challenging?",
        followUpQuestions: [
          "Can you share what you've tried so far?",
          "Which step are you stuck on?",
          "Would you like me to provide a simpler example?"
        ]
      }
    };

    const topic = analysis.keywords[0] || 'default';
    const responseTemplate = responses[topic as keyof typeof responses] || responses.default;

    return {
      ...responseTemplate,
      sources: context.sources || [],
      relatedTopics: context.relatedTopics || [],
      confidence: 0.8
    };
  }

  private generateIntermediateResponse(message: string, analysis: any, context: any): TutorResponse {
    const responses = {
      quadratic: {
        message: `You're asking about quadratic functions - great! Since you understand the basics, let's explore how the discriminant (b² - 4ac) tells us about the nature of the roots. If it's positive, we have two real solutions; if zero, one repeated root; if negative, two complex solutions. Would you like to work through an example?`,
        followUpQuestions: [
          "Can you calculate the discriminant for x² - 5x + 6 = 0?",
          "How does completing the square relate to the quadratic formula?",
          "What happens when we change the 'a' coefficient?"
        ]
      },
      python: {
        message: `Good question about Python! Since you know the fundamentals, let's talk about more efficient ways to write code. For instance, list comprehensions can replace many loops: [x**2 for x in range(10)] creates a list of squares. What specific Python concept are you working with?`,
        followUpQuestions: [
          "Would you like to explore list comprehensions further?",
          "Are you interested in functions and scope?",
          "Should we discuss object-oriented programming?"
        ]
      },
      function: {
        message: `Functions are powerful tools! Since you're comfortable with basics, let's discuss more advanced concepts. Functions can return other functions, take functions as arguments, and even modify themselves. This opens up patterns like decorators and higher-order functions. What aspect interests you most?`,
        followUpQuestions: [
          "Would you like to see how functions can return functions?",
          "Are you curious about lambda functions?",
          "Should we explore function decorators?"
        ]
      },
      default: {
        message: `You're building good understanding! Let me provide a more detailed explanation based on your question: "${message}". I can see you're ready for intermediate-level concepts, so let's explore the underlying principles and practical applications.`,
        followUpQuestions: [
          "Would you like to see a step-by-step example?",
          "How does this connect to what you've learned before?",
          "Are you ready to tackle a practice problem?"
        ]
      }
    };

    // Find the most relevant response based on keywords
    const topic = analysis.keywords.find((k: string) => responses[k as keyof typeof responses]) || 'default';
    const responseTemplate = responses[topic as keyof typeof responses] || responses.default;

    return {
      ...responseTemplate,
      sources: context.sources || [],
      relatedTopics: context.relatedTopics || [topic],
      confidence: 0.85
    };
  }

  private generateAdvancedResponse(message: string, analysis: any, context: any): TutorResponse {
    const responses = {
      quadratic: {
        message: `Fascinating question about quadratics! At your level, you might appreciate the deeper mathematical beauty. The vertex form f(x) = a(x-h)² + k reveals geometric transformations, while the factored form shows roots directly. Consider how quadratics appear in physics (projectile motion), economics (profit optimization), and computer graphics (Bézier curves). What application interests you most?`,
        followUpQuestions: [
          "How do conic sections relate to quadratic functions?",
          "What's the connection between quadratics and calculus?",
          "Would you like to explore quadratics in higher dimensions?"
        ]
      },
      python: {
        message: `Excellent Python question! You're ready for advanced concepts. Consider how Python's design philosophy ("There should be one obvious way to do it") influences features like context managers, metaclasses, and the descriptor protocol. Python's introspection capabilities allow for powerful metaprogramming. Which advanced Python feature would you like to explore?`,
        followUpQuestions: [
          "Are you interested in metaclasses and how they work?",
          "Would you like to explore Python's memory management?",
          "Should we discuss async/await and concurrent programming?"
        ]
      },
      algorithm: {
        message: `Great algorithmic thinking! At your level, you can appreciate the elegant interplay between time complexity, space complexity, and real-world constraints. Consider how different data structures affect algorithm performance, and how theoretical optimal solutions sometimes differ from practical implementations. What algorithmic challenge are you tackling?`,
        followUpQuestions: [
          "How do you balance theoretical optimality with practical constraints?",
          "What's the role of amortized analysis in algorithm design?",
          "Are you interested in probabilistic algorithms?"
        ]
      },
      default: {
        message: `Outstanding question! Your inquiry "${message}" demonstrates advanced analytical thinking. Let's explore the theoretical foundations and examine how this concept connects to broader principles. At your level, you can appreciate both the mathematical elegance and practical implications.`,
        followUpQuestions: [
          "What are the theoretical limits or boundaries of this concept?",
          "How does this principle apply in research or industry?",
          "What open problems or current research relate to this?"
        ]
      }
    };

    const topic = analysis.keywords.find((k: string) => responses[k as keyof typeof responses]) || 'default';
    const responseTemplate = responses[topic as keyof typeof responses] || responses.default;

    return {
      ...responseTemplate,
      sources: context.sources || [],
      relatedTopics: context.relatedTopics || [topic, 'advanced_concepts'],
      confidence: 0.9
    };
  }

  private updateConversationHistory(userId: string, question: string, response: TutorResponse): void {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    
    const history = this.conversationHistory.get(userId)!;
    history.push({
      timestamp: new Date(),
      question,
      response: response.message,
      topic: response.relatedTopics[0] || 'general'
    });

    // Keep only last 10 interactions
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
  }

  private getFallbackResponse(message: string): TutorResponse {
    return {
      message: "I'm sorry, I'm having trouble processing your question right now. Could you try rephrasing it, or asking about a specific topic like quadratic functions, linear equations, or Python programming?",
      sources: [],
      relatedTopics: ['quadratic functions', 'linear equations', 'python basics'],
      followUpQuestions: [
        "What specific topic would you like help with?",
        "Are you working on homework or trying to understand a concept?",
        "Would you like me to suggest some practice problems?"
      ],
      confidence: 0.3
    };
  }

  async getConversationHistory(userId: string): Promise<any[]> {
    return this.conversationHistory.get(userId) || [];
  }

  async suggestStudyPlan(userId: string): Promise<any> {
    const masteryStates = await storage.getMasteryStatesByUser(userId);
    const recentAttempts = await storage.getAttemptsByUser(userId);

    // Analyze weak areas
    const weakAreas = masteryStates
      .filter(state => (state.mastery || 0) < 0.5)
      .sort((a, b) => (a.mastery || 0) - (b.mastery || 0))
      .slice(0, 3);

    return {
      recommendedFocus: weakAreas.map(area => area.knowledgeComponent),
      studyTimeEstimate: weakAreas.length * 30, // minutes
      nextSteps: [
        "Practice problems in identified weak areas",
        "Review foundational concepts",
        "Take adaptive quizzes to track progress"
      ]
    };
  }
}

export const aiTutorService = new AITutorService();
