import {
  users,
  courses,
  modules,
  lessons,
  quizzes,
  questions,
  attempts,
  events,
  recommendations,
  masteryStates,
  flRounds,
  flClients,
  serverlessJobs,
  cloudRegions,
  streaks,
  institutions,
  learningPaths,
  modelWeights,
  studentAnalytics,
  privacyLogs,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Module,
  type InsertModule,
  type Quiz,
  type InsertQuiz,
  type Question,
  type InsertQuestion,
  type Attempt,
  type InsertAttempt,
  type Event,
  type InsertEvent,
  type Recommendation,
  type InsertRecommendation,
  type MasteryState,
  type InsertMasteryState,
  type FLRound,
  type FLClient,
  type ServerlessJob,
  type CloudRegion,
  type Streak,
  type Institution,
  type InsertInstitution,
  type LearningPath,
  type InsertLearningPath,
  type ModelWeights,
  type InsertModelWeights,
  type StudentAnalytics,
  type InsertStudentAnalytics,
  type PrivacyLog,
  type InsertPrivacyLog,
} from "@shared/schema";
import { db, dbConnected } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  // Institution operations
  getInstitutions(): Promise<Institution[]>;
  getInstitution(id: string): Promise<Institution | undefined>;
  createInstitution(institution: InsertInstitution): Promise<Institution>;
  updateInstitution(id: string, updates: Partial<InsertInstitution>): Promise<Institution>;

  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsersByInstitution(institutionId: string): Promise<User[]>;

  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;

  // Module operations
  getModules(): Promise<Module[]>;
  getModulesByCourse(courseId: string): Promise<Module[]>;
  getModule(id: string): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;

  // Quiz operations
  getQuizzesByModule(moduleId: string): Promise<Quiz[]>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;

  // Question operations
  getQuestionsByQuiz(quizId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;

  // Attempt operations
  createAttempt(attempt: InsertAttempt): Promise<Attempt>;
  getAttemptsByUser(userId: string): Promise<Attempt[]>;
  getAttemptsByQuiz(quizId: string): Promise<Attempt[]>;

  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEventsByUser(userId: string, limit?: number): Promise<Event[]>;

  // Recommendation operations
  getRecommendationsByUser(userId: string): Promise<Recommendation[]>;
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;

  // Mastery operations
  getMasteryStatesByUser(userId: string): Promise<MasteryState[]>;
  upsertMasteryState(masteryState: InsertMasteryState): Promise<MasteryState>;

  // FL operations
  createFLRound(round: Partial<FLRound>): Promise<FLRound>;
  getFLRounds(limit?: number): Promise<FLRound[]>;
  updateFLRound(id: string, updates: Partial<FLRound>): Promise<FLRound>;
  getFLClients(): Promise<FLClient[]>;

  // Cloud operations
  getCloudRegions(): Promise<CloudRegion[]>;
  updateCloudRegion(id: string, updates: Partial<CloudRegion>): Promise<CloudRegion>;
  getServerlessJobs(): Promise<ServerlessJob[]>;
  updateServerlessJob(id: string, updates: Partial<ServerlessJob>): Promise<ServerlessJob>;

  // Streak operations
  getStreakByUser(userId: string): Promise<Streak | undefined>;
  upsertStreak(userId: string, updates: Partial<Streak>): Promise<Streak>;

  // Learning path operations
  getLearningPathsByUser(userId: string): Promise<LearningPath[]>;
  createLearningPath(learningPath: InsertLearningPath): Promise<LearningPath>;
  updateLearningPath(id: string, updates: Partial<InsertLearningPath>): Promise<LearningPath>;
  deleteLearningPath(id: string): Promise<void>;

  // Federated learning operations
  getModelWeightsByRound(roundId: string): Promise<ModelWeights[]>;
  getModelWeightsByInstitution(institutionId: string): Promise<ModelWeights[]>;
  uploadModelWeights(weights: InsertModelWeights): Promise<ModelWeights>;
  aggregateModelWeights(roundId: string): Promise<any>;

  // Student analytics operations
  getStudentAnalytics(userId: string, moduleId?: string): Promise<StudentAnalytics[]>;
  getStudentAnalyticsByInstitution(institutionId: string): Promise<StudentAnalytics[]>;
  createStudentAnalytics(analytics: InsertStudentAnalytics): Promise<StudentAnalytics>;
  getPerformanceMetrics(institutionId: string, timeRange?: { start: Date; end: Date }): Promise<any>;

  // Privacy operations
  getPrivacyLogs(userId: string): Promise<PrivacyLog[]>;
  createPrivacyLog(log: InsertPrivacyLog): Promise<PrivacyLog>;
  checkPrivacyBudget(userId: string): Promise<{ remaining: number; used: number }>;
}

// In-memory storage implementation as fallback
class MemoryStorage implements IStorage {
  private users: User[] = [];
  private courses: Course[] = [];
  private modules: Module[] = [];
  private quizzes: Quiz[] = [];
  private questions: Question[] = [];
  private attempts: Attempt[] = [];
  private events: Event[] = [];
  private recommendations: Recommendation[] = [];
  private masteryStates: MasteryState[] = [];
  private institutions: Institution[] = [];
  private streaks: Streak[] = [];
  private learningPaths: LearningPath[] = [];

  private nextId = 1;
  private generateId() {
    return (this.nextId++).toString();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.find(u => u.id === userData.id);
    if (existingUser) {
      Object.assign(existingUser, userData);
      return existingUser;
    }
    const newUser: User = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async getUsersByInstitution(institutionId: string): Promise<User[]> {
    return this.users.filter(u => u.institutionId === institutionId);
  }

  async getInstitutions(): Promise<Institution[]> {
    return this.institutions;
  }

  async getInstitution(id: string): Promise<Institution | undefined> {
    return this.institutions.find(i => i.id === id);
  }

  async createInstitution(institution: InsertInstitution): Promise<Institution> {
    const newInstitution: Institution = {
      id: this.generateId(),
      ...institution,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.institutions.push(newInstitution);
    return newInstitution;
  }

  async updateInstitution(id: string, updates: Partial<InsertInstitution>): Promise<Institution> {
    const institution = this.institutions.find(i => i.id === id);
    if (!institution) throw new Error(`Institution ${id} not found`);
    Object.assign(institution, updates, { updatedAt: new Date() });
    return institution;
  }

  async getCourses(): Promise<Course[]> {
    return [...this.courses];
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.find(c => c.id === id);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const newCourse: Course = {
      id: this.generateId(),
      ...course,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.courses.push(newCourse);
    return newCourse;
  }

  async getModules(): Promise<Module[]> {
    return [...this.modules];
  }

  async getModulesByCourse(courseId: string): Promise<Module[]> {
    return this.modules.filter(m => m.courseId === courseId);
  }

  async getModule(id: string): Promise<Module | undefined> {
    return this.modules.find(m => m.id === id);
  }

  async createModule(module: InsertModule): Promise<Module> {
    const newModule: Module = {
      id: this.generateId(),
      ...module,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.modules.push(newModule);
    return newModule;
  }

  // Quiz operations - simplified for demo
  async getQuizzesByModule(moduleId: string): Promise<Quiz[]> {
    return this.quizzes.filter(q => q.moduleId === moduleId);
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    return this.quizzes.find(q => q.id === id);
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const newQuiz: Quiz = {
      id: this.generateId(),
      ...quiz,
      createdAt: new Date(),
    };
    this.quizzes.push(newQuiz);
    return newQuiz;
  }

  // Stub implementations for other methods...
  async getQuestionsByQuiz(quizId: string): Promise<Question[]> { return []; }
  async getAttemptsByUser(userId: string): Promise<Attempt[]> { return []; }
  async getRecommendationsByUser(userId: string): Promise<Recommendation[]> { return []; }
  async getMasteryStatesByUser(userId: string): Promise<MasteryState[]> { return []; }
  async getStreakByUser(userId: string): Promise<Streak | undefined> { return undefined; }
  async getLearningPaths(): Promise<LearningPath[]> { return []; }
  
  // Add all other required methods as stubs
  async getEvents(): Promise<Event[]> { return []; }
  async createEvent(event: InsertEvent): Promise<Event> { 
    const newEvent: Event = { id: this.generateId(), ...event, createdAt: new Date() };
    this.events.push(newEvent);
    return newEvent;
  }
  async createAttempt(attempt: InsertAttempt): Promise<Attempt> {
    const newAttempt: Attempt = { id: this.generateId(), ...attempt, createdAt: new Date() };
    this.attempts.push(newAttempt);
    return newAttempt;
  }
  async createRecommendation(rec: InsertRecommendation): Promise<Recommendation> {
    const newRec: Recommendation = { id: this.generateId(), ...rec, createdAt: new Date() };
    this.recommendations.push(newRec);
    return newRec;
  }
  async upsertMasteryState(state: InsertMasteryState): Promise<MasteryState> {
    const existing = this.masteryStates.find(s => s.userId === state.userId && s.knowledgeComponent === state.knowledgeComponent);
    if (existing) {
      Object.assign(existing, state);
      return existing;
    }
    const newState: MasteryState = { id: this.generateId(), ...state, createdAt: new Date() };
    this.masteryStates.push(newState);
    return newState;
  }
  async upsertStreak(streak: { userId: string; currentStreak: number; longestStreak: number; lastActivityDate: Date }): Promise<Streak> {
    const existing = this.streaks.find(s => s.userId === streak.userId);
    if (existing) {
      Object.assign(existing, streak);
      return existing;
    }
    const newStreak: Streak = { id: this.generateId(), ...streak };
    this.streaks.push(newStreak);
    return newStreak;
  }
  async createLearningPath(path: InsertLearningPath): Promise<LearningPath> {
    const newPath: LearningPath = { id: this.generateId(), ...path, createdAt: new Date() };
    this.learningPaths.push(newPath);
    return newPath;
  }

  // Add remaining stub methods to satisfy IStorage interface
  async getFLRounds(): Promise<FLRound[]> { return []; }
  async getFLClients(): Promise<FLClient[]> { return []; }
  async getServerlessJobs(): Promise<ServerlessJob[]> { return []; }
  async getCloudRegions(): Promise<CloudRegion[]> { return []; }
  async getStudentAnalytics(): Promise<StudentAnalytics[]> { return []; }
  async getModelWeights(): Promise<ModelWeights[]> { return []; }
  async getPrivacyLogs(): Promise<PrivacyLog[]> { return []; }
  
  async createFLRound(round: any): Promise<FLRound> { return { id: this.generateId(), ...round } as FLRound; }
  async createFLClient(client: any): Promise<FLClient> { return { id: this.generateId(), ...client } as FLClient; }
  async createServerlessJob(job: any): Promise<ServerlessJob> { return { id: this.generateId(), ...job } as ServerlessJob; }
  async createCloudRegion(region: any): Promise<CloudRegion> { return { id: this.generateId(), ...region } as CloudRegion; }
  async createStudentAnalytics(analytics: InsertStudentAnalytics): Promise<StudentAnalytics> { return { id: this.generateId(), ...analytics } as StudentAnalytics; }
  async createModelWeights(weights: InsertModelWeights): Promise<ModelWeights> { return { id: this.generateId(), ...weights } as ModelWeights; }
  async createPrivacyLog(log: InsertPrivacyLog): Promise<PrivacyLog> { return { id: this.generateId(), ...log } as PrivacyLog; }
  
  async checkPrivacyBudget(userId: string): Promise<{ remaining: number; used: number }> {
    return { remaining: 1.0, used: 0.0 };
  }
}

export class DatabaseStorage implements IStorage {
  // Helper method to handle database operations gracefully
  private async safeDbOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    try {
      if (!db) {
        console.warn("Database not available, returning fallback value");
        return fallback;
      }
      return await operation();
    } catch (error: any) {
      console.warn("Database operation failed, returning fallback:", error?.message);
      return fallback;
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.safeDbOperation(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    }, undefined);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return this.safeDbOperation(async () => {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    }, {
      id: userData.id,
      name: userData.name || '',
      email: userData.email || '',
      profilePicture: userData.profilePicture || '',
      role: userData.role || 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return this.safeDbOperation(async () => {
      return await db.select().from(courses).orderBy(courses.title);
    }, []);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.safeDbOperation(async () => {
      const [course] = await db.select().from(courses).where(eq(courses.id, id));
      return course;
    }, undefined);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    return this.safeDbOperation(async () => {
      const [newCourse] = await db.insert(courses).values(course).returning();
      return newCourse;
    }, {
      id: course.id || '',
      title: course.title || '',
      description: course.description || '',
      category: course.category || '',
      difficulty: course.difficulty || 'beginner',
      instructorId: course.instructorId || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Module operations
  async getModules(): Promise<Module[]> {
    return await db.select().from(modules).orderBy(modules.order);
  }

  async getModulesByCourse(courseId: string): Promise<Module[]> {
    return await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(modules.order);
  }

  async getModule(id: string): Promise<Module | undefined> {
    const [module] = await db.select().from(modules).where(eq(modules.id, id));
    return module;
  }

  async createModule(module: InsertModule): Promise<Module> {
    const [newModule] = await db.insert(modules).values(module).returning();
    return newModule;
  }

  // Quiz operations
  async getQuizzesByModule(moduleId: string): Promise<Quiz[]> {
    return await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.moduleId, moduleId))
      .orderBy(quizzes.createdAt);
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }

  // Question operations
  async getQuestionsByQuiz(quizId: string): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId));
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db
      .insert(questions)
      .values(question as typeof questions.$inferInsert)
      .returning();
    return newQuestion;
  }

  // Attempt operations
  async createAttempt(attempt: InsertAttempt): Promise<Attempt> {
    const [newAttempt] = await db.insert(attempts).values(attempt).returning();
    return newAttempt;
  }

  async getAttemptsByUser(userId: string): Promise<Attempt[]> {
    return await db
      .select()
      .from(attempts)
      .where(eq(attempts.userId, userId))
      .orderBy(desc(attempts.startedAt));
  }

  async getAttemptsByQuiz(quizId: string): Promise<Attempt[]> {
    return await db
      .select()
      .from(attempts)
      .where(eq(attempts.quizId, quizId))
      .orderBy(desc(attempts.completedAt));
  }

  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getEventsByUser(userId: string, limit = 50): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(desc(events.timestamp))
      .limit(limit);
  }

  // Recommendation operations
  async getRecommendationsByUser(userId: string): Promise<Recommendation[]> {
    return await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.userId, userId))
      .orderBy(desc(recommendations.confidence))
      .limit(10);
  }

  async createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation> {
    const [newRecommendation] = await db
      .insert(recommendations)
      .values(recommendation)
      .returning();
    return newRecommendation;
  }

  // Mastery operations
  async getMasteryStatesByUser(userId: string): Promise<MasteryState[]> {
    return await db
      .select()
      .from(masteryStates)
      .where(eq(masteryStates.userId, userId));
  }

  async upsertMasteryState(masteryState: InsertMasteryState): Promise<MasteryState> {
    const [state] = await db
      .insert(masteryStates)
      .values(masteryState)
      .onConflictDoUpdate({
        target: [masteryStates.userId, masteryStates.knowledgeComponent],
        set: {
          ...masteryState,
          updatedAt: new Date(),
        },
      })
      .returning();
    return state;
  }

  // FL operations
  async createFLRound(round: Partial<FLRound>): Promise<FLRound> {
    const [newRound] = await db.insert(flRounds).values(round as any).returning();
    return newRound;
  }

  async getFLRounds(limit = 10): Promise<FLRound[]> {
    return await db
      .select()
      .from(flRounds)
      .orderBy(desc(flRounds.startedAt))
      .limit(limit);
  }

  async updateFLRound(id: string, updates: Partial<FLRound>): Promise<FLRound> {
    const [updatedRound] = await db
      .update(flRounds)
      .set(updates)
      .where(eq(flRounds.id, id))
      .returning();
    return updatedRound;
  }

  async getFLClients(): Promise<FLClient[]> {
    return await db.select().from(flClients).orderBy(flClients.nodeId);
  }

  // Cloud operations
  async getCloudRegions(): Promise<CloudRegion[]> {
    return await db.select().from(cloudRegions).orderBy(cloudRegions.name);
  }

  async updateCloudRegion(id: string, updates: Partial<CloudRegion>): Promise<CloudRegion> {
    const [updatedRegion] = await db
      .update(cloudRegions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cloudRegions.id, id))
      .returning();
    return updatedRegion;
  }

  async getServerlessJobs(): Promise<ServerlessJob[]> {
    return await db.select().from(serverlessJobs).orderBy(serverlessJobs.functionName);
  }

  async updateServerlessJob(id: string, updates: Partial<ServerlessJob>): Promise<ServerlessJob> {
    const [updatedJob] = await db
      .update(serverlessJobs)
      .set(updates)
      .where(eq(serverlessJobs.id, id))
      .returning();
    return updatedJob;
  }

  // Streak operations
  async getStreakByUser(userId: string): Promise<Streak | undefined> {
    const [streak] = await db.select().from(streaks).where(eq(streaks.userId, userId));
    return streak;
  }

  async upsertStreak(userId: string, updates: Partial<Streak>): Promise<Streak> {
    const [streak] = await db
      .insert(streaks)
      .values({ userId, ...updates } as any)
      .onConflictDoUpdate({
        target: streaks.userId,
        set: updates,
      })
      .returning();
    return streak;
  }

  // Institution operations
  async getInstitutions(): Promise<Institution[]> {
    return await db.select().from(institutions).orderBy(institutions.name);
  }

  async getInstitution(id: string): Promise<Institution | undefined> {
    const [institution] = await db.select().from(institutions).where(eq(institutions.id, id));
    return institution;
  }

  async createInstitution(institution: InsertInstitution): Promise<Institution> {
    const [newInstitution] = await db.insert(institutions).values(institution).returning();
    return newInstitution;
  }

  async updateInstitution(id: string, updates: Partial<InsertInstitution>): Promise<Institution> {
    const [updatedInstitution] = await db
      .update(institutions)
      .set(updates)
      .where(eq(institutions.id, id))
      .returning();
    return updatedInstitution;
  }

  async getUsersByInstitution(institutionId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.institutionId, institutionId));
  }

  // Learning path operations
  async getLearningPathsByUser(userId: string): Promise<LearningPath[]> {
    return await db.select().from(learningPaths).where(eq(learningPaths.userId, userId));
  }

  async createLearningPath(learningPath: InsertLearningPath): Promise<LearningPath> {
    const [newPath] = await db.insert(learningPaths).values(learningPath).returning();
    return newPath;
  }

  async updateLearningPath(id: string, updates: Partial<InsertLearningPath>): Promise<LearningPath> {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    const [updatedPath] = await db
      .update(learningPaths)
      .set(updateData)
      .where(eq(learningPaths.id, id))
      .returning();
    return updatedPath;
  }

  async deleteLearningPath(id: string): Promise<void> {
    await db.delete(learningPaths).where(eq(learningPaths.id, id));
  }

  // Federated learning operations
  async getModelWeightsByRound(roundId: string): Promise<ModelWeights[]> {
    return await db.select().from(modelWeights).where(eq(modelWeights.roundId, roundId));
  }

  async getModelWeightsByInstitution(institutionId: string): Promise<ModelWeights[]> {
    return await db.select().from(modelWeights).where(eq(modelWeights.institutionId, institutionId));
  }

  async uploadModelWeights(weights: InsertModelWeights): Promise<ModelWeights> {
    const [newWeights] = await db.insert(modelWeights).values(weights).returning();
    return newWeights;
  }

  async aggregateModelWeights(roundId: string): Promise<any> {
    const weights = await this.getModelWeightsByRound(roundId);
    
    // Federated averaging simulation
    const aggregatedWeights = {
      modelVersion: `global_v${Date.now()}`,
      participatingInstitutions: weights.length,
      totalContributions: weights.reduce((sum, w) => sum + (w.contributionScore || 0), 0),
      averagePerformance: weights.length > 0 
        ? weights.reduce((sum, w) => sum + ((w.performance as any)?.accuracy || 0), 0) / weights.length 
        : 0,
      privacyBudgetUsed: weights.reduce((sum, w) => sum + (w.privacyBudget || 0), 0),
      aggregatedAt: new Date()
    };
    
    return aggregatedWeights;
  }

  // Student analytics operations
  async getStudentAnalytics(userId: string, moduleId?: string): Promise<StudentAnalytics[]> {
    if (moduleId) {
      return await db.select().from(studentAnalytics).where(
        and(eq(studentAnalytics.userId, userId), eq(studentAnalytics.moduleId, moduleId))
      );
    }
    
    return await db.select().from(studentAnalytics).where(eq(studentAnalytics.userId, userId));
  }

  async getStudentAnalyticsByInstitution(institutionId: string): Promise<StudentAnalytics[]> {
    return await db.select().from(studentAnalytics).where(eq(studentAnalytics.institutionId, institutionId));
  }

  async createStudentAnalytics(analytics: InsertStudentAnalytics): Promise<StudentAnalytics> {
    const [newAnalytics] = await db.insert(studentAnalytics).values(analytics).returning();
    return newAnalytics;
  }

  async getPerformanceMetrics(institutionId: string, timeRange?: { start: Date; end: Date }): Promise<any> {
    let analytics: StudentAnalytics[];
    
    if (timeRange) {
      analytics = await db.select().from(studentAnalytics).where(
        and(
          eq(studentAnalytics.institutionId, institutionId),
          gte(studentAnalytics.date, timeRange.start)
        )
      );
    } else {
      analytics = await db.select().from(studentAnalytics).where(eq(studentAnalytics.institutionId, institutionId));
    }
    
    return {
      totalStudents: new Set(analytics.map(a => a.userId)).size,
      averageEngagement: analytics.length > 0 
        ? analytics.reduce((sum, a) => sum + (a.engagementScore || 0), 0) / analytics.length 
        : 0,
      averageLearningVelocity: analytics.length > 0 
        ? analytics.reduce((sum, a) => sum + (a.learningVelocity || 0), 0) / analytics.length 
        : 0,
      totalTimeSpent: analytics.reduce((sum, a) => sum + (a.timeSpent || 0), 0),
      modulePerformance: analytics.reduce((acc, a) => {
        if (!acc[a.moduleId!]) acc[a.moduleId!] = [];
        acc[a.moduleId!].push(a);
        return acc;
      }, {} as Record<string, StudentAnalytics[]>)
    };
  }

  // Privacy operations
  async getPrivacyLogs(userId: string): Promise<PrivacyLog[]> {
    return await db.select().from(privacyLogs).where(eq(privacyLogs.userId, userId));
  }

  async createPrivacyLog(log: InsertPrivacyLog): Promise<PrivacyLog> {
    const [newLog] = await db.insert(privacyLogs).values(log).returning();
    return newLog;
  }

  async checkPrivacyBudget(userId: string): Promise<{ remaining: number; used: number }> {
    const logs = await this.getPrivacyLogs(userId);
    const used = logs.reduce((sum, log) => sum + (log.epsilonUsed || 0), 0);
    const user = await this.getUser(userId);
    const total = user?.privacyLevel || 3.0;
    
    return {
      used,
      remaining: Math.max(0, total - used)
    };
  }
}

// Export DatabaseStorage with graceful error handling
export const storage = new DatabaseStorage();
