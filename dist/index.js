var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  attempts: () => attempts,
  attemptsRelations: () => attemptsRelations,
  cloudRegions: () => cloudRegions,
  courses: () => courses,
  coursesRelations: () => coursesRelations,
  events: () => events,
  eventsRelations: () => eventsRelations,
  flClients: () => flClients,
  flRounds: () => flRounds,
  insertAttemptSchema: () => insertAttemptSchema,
  insertCourseSchema: () => insertCourseSchema,
  insertEventSchema: () => insertEventSchema,
  insertInstitutionSchema: () => insertInstitutionSchema,
  insertLearningPathSchema: () => insertLearningPathSchema,
  insertMasteryStateSchema: () => insertMasteryStateSchema,
  insertModelWeightsSchema: () => insertModelWeightsSchema,
  insertModuleSchema: () => insertModuleSchema,
  insertPrivacyLogSchema: () => insertPrivacyLogSchema,
  insertQuestionSchema: () => insertQuestionSchema,
  insertQuizSchema: () => insertQuizSchema,
  insertRecommendationSchema: () => insertRecommendationSchema,
  insertStudentAnalyticsSchema: () => insertStudentAnalyticsSchema,
  insertUserSchema: () => insertUserSchema,
  institutions: () => institutions,
  institutionsRelations: () => institutionsRelations,
  learningPaths: () => learningPaths,
  learningPathsRelations: () => learningPathsRelations,
  lessons: () => lessons,
  lessonsRelations: () => lessonsRelations,
  masteryStates: () => masteryStates,
  masteryStatesRelations: () => masteryStatesRelations,
  modelWeights: () => modelWeights,
  modelWeightsRelations: () => modelWeightsRelations,
  modules: () => modules,
  modulesRelations: () => modulesRelations,
  privacyLogs: () => privacyLogs,
  privacyLogsRelations: () => privacyLogsRelations,
  questions: () => questions,
  questionsRelations: () => questionsRelations,
  quizzes: () => quizzes,
  quizzesRelations: () => quizzesRelations,
  recommendations: () => recommendations,
  recommendationsRelations: () => recommendationsRelations,
  serverlessJobs: () => serverlessJobs,
  sessions: () => sessions,
  streaks: () => streaks,
  streaksRelations: () => streaksRelations,
  studentAnalytics: () => studentAnalytics,
  studentAnalyticsRelations: () => studentAnalyticsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  real
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var institutions = pgTable("institutions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").default("university"),
  // university, college, school
  region: varchar("region").default("us-east-1"),
  privacyPolicy: text("privacy_policy"),
  federatedEnabled: boolean("federated_enabled").default(true),
  maxStudents: integer("max_students").default(1e4),
  activeStudents: integer("active_students").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("student"),
  // student, instructor, cloud_manager
  institutionId: varchar("institution_id").references(() => institutions.id),
  privacyLevel: real("privacy_level").default(3),
  // DP epsilon
  engagementLevel: varchar("engagement_level").default("medium"),
  edgeDeviceId: varchar("edge_device_id"),
  // for federated learning
  localModelVersion: varchar("local_model_version"),
  dataRetentionDays: integer("data_retention_days").default(365),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  subject: varchar("subject").notNull(),
  description: text("description"),
  region: varchar("region").default("us-east-1"),
  createdAt: timestamp("created_at").defaultNow()
});
var modules = pgTable("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id),
  title: varchar("title").notNull(),
  order: integer("order").notNull(),
  summary: text("summary"),
  content: text("content"),
  // markdown content
  difficulty: integer("difficulty").default(1),
  // 1-5
  estimatedTime: integer("estimated_time"),
  // minutes
  assetUri: varchar("asset_uri"),
  // MinIO URI
  createdAt: timestamp("created_at").defaultNow()
});
var lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").references(() => modules.id),
  title: varchar("title").notNull(),
  content: text("content"),
  // markdown content
  bodyMarkdownUri: varchar("body_markdown_uri"),
  // MinIO URI
  videoUri: varchar("video_uri"),
  // MinIO URI
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").references(() => modules.id),
  title: varchar("title").notNull(),
  difficulty: integer("difficulty").default(1),
  generatedFrom: varchar("generated_from"),
  // source content
  version: integer("version").default(1),
  maxQuestions: integer("max_questions").default(10),
  timeLimit: integer("time_limit"),
  // minutes
  createdAt: timestamp("created_at").defaultNow()
});
var questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").references(() => quizzes.id),
  stem: text("stem").notNull(),
  options: jsonb("options").notNull(),
  // array of options
  correctIndex: integer("correct_index").notNull(),
  explanation: text("explanation"),
  tags: jsonb("tags").$type(),
  // KC tags
  difficulty: real("difficulty").default(1),
  discrimination: real("discrimination").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var attempts = pgTable("attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").references(() => quizzes.id),
  userId: varchar("user_id").references(() => users.id),
  score: real("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  itemStatsJson: jsonb("item_stats_json"),
  // per-question analytics
  adaptiveData: jsonb("adaptive_data")
  // difficulty adjustments
});
var events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(),
  // 'quiz_start', 'quiz_complete', 'module_view', etc.
  payload: jsonb("payload").notNull(),
  sessionId: varchar("session_id"),
  timestamp: timestamp("timestamp").defaultNow()
});
var recommendations = pgTable("recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  moduleId: varchar("module_id").references(() => modules.id),
  reason: text("reason").notNull(),
  confidence: real("confidence").default(0.5),
  modelVersion: varchar("model_version"),
  masteryGain: real("mastery_gain"),
  // predicted mastery increase
  difficulty: integer("difficulty"),
  estimatedTime: integer("estimated_time"),
  createdAt: timestamp("created_at").defaultNow()
});
var masteryStates = pgTable("mastery_states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  knowledgeComponent: varchar("knowledge_component").notNull(),
  // KC tag
  mastery: real("mastery").default(0),
  // 0.0 to 1.0
  attempts: integer("attempts").default(0),
  lastCorrect: boolean("last_correct"),
  updatedAt: timestamp("updated_at").defaultNow()
});
var flRounds = pgTable("fl_rounds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roundNum: integer("round_num").notNull(),
  clientCount: integer("client_count").notNull(),
  participatingClients: integer("participating_clients"),
  dpEpsilon: real("dp_epsilon"),
  globalMetrics: jsonb("global_metrics"),
  status: varchar("status").default("pending"),
  // pending, running, completed, failed
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at")
});
var flClients = pgTable("fl_clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nodeId: varchar("node_id").notNull().unique(),
  region: varchar("region").notNull(),
  status: varchar("status").default("active"),
  // active, inactive, slow, dropout
  lastSeen: timestamp("last_seen").defaultNow(),
  totalRounds: integer("total_rounds").default(0),
  avgLatency: real("avg_latency"),
  createdAt: timestamp("created_at").defaultNow()
});
var serverlessJobs = pgTable("serverless_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  functionName: varchar("function_name").notNull(),
  description: text("description"),
  schedule: varchar("schedule"),
  // cron expression
  lastInvocation: timestamp("last_invocation"),
  status: varchar("status").default("idle"),
  // idle, running, completed, failed
  concurrency: integer("concurrency").default(1),
  coldStart: boolean("cold_start").default(true),
  avgDuration: real("avg_duration"),
  // seconds
  createdAt: timestamp("created_at").defaultNow()
});
var cloudRegions = pgTable("cloud_regions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  status: varchar("status").default("healthy"),
  // healthy, degraded, down
  latency: integer("latency").default(50),
  // ms
  load: integer("load").default(30),
  // percentage
  activeUsers: integer("active_users").default(0),
  workerNodes: integer("worker_nodes").default(3),
  updatedAt: timestamp("updated_at").defaultNow()
});
var streaks = pgTable("streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivity: timestamp("last_activity").defaultNow(),
  badges: jsonb("badges").$type()
  // earned badges
});
var learningPaths = pgTable("learning_paths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  moduleSequence: jsonb("module_sequence").$type(),
  // ordered module IDs
  currentModuleIndex: integer("current_module_index").default(0),
  estimatedDuration: integer("estimated_duration"),
  // total minutes
  adaptiveWeights: jsonb("adaptive_weights"),
  // AI-determined importance weights
  learningStyle: varchar("learning_style"),
  // visual, auditory, kinesthetic
  difficultyProgression: varchar("difficulty_progression").default("adaptive"),
  // linear, adaptive, accelerated
  completionRate: real("completion_rate").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var modelWeights = pgTable("model_weights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roundId: varchar("round_id").references(() => flRounds.id),
  institutionId: varchar("institution_id").references(() => institutions.id),
  edgeDeviceId: varchar("edge_device_id"),
  weightsHash: varchar("weights_hash").notNull(),
  weightsSize: integer("weights_size"),
  // bytes
  layerWeights: jsonb("layer_weights"),
  // serialized model weights
  performance: jsonb("performance"),
  // local validation metrics
  privacyBudget: real("privacy_budget"),
  // remaining DP budget
  contributionScore: real("contribution_score"),
  // quality of contribution
  uploadedAt: timestamp("uploaded_at").defaultNow()
});
var studentAnalytics = pgTable("student_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  institutionId: varchar("institution_id").references(() => institutions.id),
  moduleId: varchar("module_id").references(() => modules.id),
  timeSpent: integer("time_spent"),
  // seconds
  interactionCount: integer("interaction_count").default(0),
  errorPatterns: jsonb("error_patterns"),
  // common mistakes
  learningVelocity: real("learning_velocity"),
  // concepts/hour
  engagementScore: real("engagement_score"),
  // 0-1
  difficultyRating: integer("difficulty_rating"),
  // student's perceived difficulty
  date: timestamp("date").defaultNow()
});
var privacyLogs = pgTable("privacy_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  institutionId: varchar("institution_id").references(() => institutions.id),
  operation: varchar("operation").notNull(),
  // 'model_update', 'data_aggregation', 'analytics_compute'
  epsilonUsed: real("epsilon_used"),
  // differential privacy budget consumed
  noiseLevel: real("noise_level"),
  // amount of noise added
  dataSubjects: integer("data_subjects"),
  // number of students affected
  purpose: text("purpose"),
  // reason for computation
  approvalStatus: varchar("approval_status").default("pending"),
  // pending, approved, rejected
  timestamp: timestamp("timestamp").defaultNow()
});
var institutionsRelations = relations(institutions, ({ many }) => ({
  users: many(users),
  modelWeights: many(modelWeights),
  studentAnalytics: many(studentAnalytics),
  privacyLogs: many(privacyLogs)
}));
var usersRelations = relations(users, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [users.institutionId],
    references: [institutions.id]
  }),
  attempts: many(attempts),
  events: many(events),
  recommendations: many(recommendations),
  masteryStates: many(masteryStates),
  streaks: many(streaks),
  learningPaths: many(learningPaths),
  studentAnalytics: many(studentAnalytics),
  privacyLogs: many(privacyLogs)
}));
var coursesRelations = relations(courses, ({ many }) => ({
  modules: many(modules)
}));
var modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id]
  }),
  lessons: many(lessons),
  quizzes: many(quizzes),
  recommendations: many(recommendations)
}));
var lessonsRelations = relations(lessons, ({ one }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id]
  })
}));
var quizzesRelations = relations(quizzes, ({ one, many }) => ({
  module: one(modules, {
    fields: [quizzes.moduleId],
    references: [modules.id]
  }),
  questions: many(questions),
  attempts: many(attempts)
}));
var questionsRelations = relations(questions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id]
  })
}));
var attemptsRelations = relations(attempts, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [attempts.quizId],
    references: [quizzes.id]
  }),
  user: one(users, {
    fields: [attempts.userId],
    references: [users.id]
  })
}));
var eventsRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id]
  })
}));
var recommendationsRelations = relations(recommendations, ({ one }) => ({
  user: one(users, {
    fields: [recommendations.userId],
    references: [users.id]
  }),
  module: one(modules, {
    fields: [recommendations.moduleId],
    references: [modules.id]
  })
}));
var masteryStatesRelations = relations(masteryStates, ({ one }) => ({
  user: one(users, {
    fields: [masteryStates.userId],
    references: [users.id]
  })
}));
var streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, {
    fields: [streaks.userId],
    references: [users.id]
  })
}));
var learningPathsRelations = relations(learningPaths, ({ one }) => ({
  user: one(users, {
    fields: [learningPaths.userId],
    references: [users.id]
  })
}));
var modelWeightsRelations = relations(modelWeights, ({ one }) => ({
  round: one(flRounds, {
    fields: [modelWeights.roundId],
    references: [flRounds.id]
  }),
  institution: one(institutions, {
    fields: [modelWeights.institutionId],
    references: [institutions.id]
  })
}));
var studentAnalyticsRelations = relations(studentAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [studentAnalytics.userId],
    references: [users.id]
  }),
  institution: one(institutions, {
    fields: [studentAnalytics.institutionId],
    references: [institutions.id]
  }),
  module: one(modules, {
    fields: [studentAnalytics.moduleId],
    references: [modules.id]
  })
}));
var privacyLogsRelations = relations(privacyLogs, ({ one }) => ({
  user: one(users, {
    fields: [privacyLogs.userId],
    references: [users.id]
  }),
  institution: one(institutions, {
    fields: [privacyLogs.institutionId],
    references: [institutions.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true
});
var insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
  createdAt: true
});
var insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true
});
var insertQuestionSchema = createInsertSchema(questions, {
  tags: z.array(z.string()).optional(),
  options: z.unknown()
  // required and matches unknown
}).omit({
  id: true,
  createdAt: true
});
var insertAttemptSchema = createInsertSchema(attempts).omit({
  id: true,
  startedAt: true
});
var insertEventSchema = createInsertSchema(events).omit({
  id: true,
  timestamp: true
});
var insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true
});
var insertMasteryStateSchema = createInsertSchema(masteryStates).omit({
  id: true,
  updatedAt: true
});
var insertInstitutionSchema = createInsertSchema(institutions).omit({
  id: true,
  createdAt: true
});
var insertLearningPathSchema = createInsertSchema(learningPaths, {
  moduleSequence: z.array(z.string()).optional(),
  adaptiveWeights: z.any()
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertModelWeightsSchema = createInsertSchema(modelWeights).omit({
  id: true,
  uploadedAt: true
});
var insertStudentAnalyticsSchema = createInsertSchema(studentAnalytics).omit({
  id: true,
  date: true
});
var insertPrivacyLogSchema = createInsertSchema(privacyLogs).omit({
  id: true,
  timestamp: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
var db = null;
var pool = null;
var dbConnected = false;
async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set. Running with in-memory storage fallback.");
    return;
  }
  try {
    console.log("Attempting to connect to database...");
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5e3
      // 5 second timeout
    });
    const client2 = await pool.connect();
    await client2.query("SELECT 1");
    client2.release();
    db = drizzle({ client: pool, schema: schema_exports });
    dbConnected = true;
    console.log("Database connection successful");
  } catch (error) {
    console.warn("Database connection failed, using in-memory storage fallback:", error?.message || error);
    dbConnected = false;
    db = null;
    if (pool) {
      pool.end();
      pool = null;
    }
  }
}
initializeDatabase().catch(console.error);

// server/storage.ts
import { eq, desc, and, gte } from "drizzle-orm";
var DatabaseStorage = class {
  // Helper method to handle database operations gracefully
  async safeDbOperation(operation, fallback) {
    try {
      if (!db) {
        console.warn("Database not available, returning fallback value");
        return fallback;
      }
      return await operation();
    } catch (error) {
      console.warn("Database operation failed, returning fallback:", error?.message);
      return fallback;
    }
  }
  // User operations
  async getUser(id) {
    return this.safeDbOperation(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    }, void 0);
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Course operations
  async getCourses() {
    return await db.select().from(courses).orderBy(courses.title);
  }
  async getCourse(id) {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }
  async createCourse(course) {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }
  // Module operations
  async getModules() {
    return await db.select().from(modules).orderBy(modules.order);
  }
  async getModulesByCourse(courseId) {
    return await db.select().from(modules).where(eq(modules.courseId, courseId)).orderBy(modules.order);
  }
  async getModule(id) {
    const [module] = await db.select().from(modules).where(eq(modules.id, id));
    return module;
  }
  async createModule(module) {
    const [newModule] = await db.insert(modules).values(module).returning();
    return newModule;
  }
  // Quiz operations
  async getQuizzesByModule(moduleId) {
    return await db.select().from(quizzes).where(eq(quizzes.moduleId, moduleId)).orderBy(quizzes.createdAt);
  }
  async getQuiz(id) {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }
  async createQuiz(quiz) {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }
  // Question operations
  async getQuestionsByQuiz(quizId) {
    return await db.select().from(questions).where(eq(questions.quizId, quizId));
  }
  async createQuestion(question) {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }
  // Attempt operations
  async createAttempt(attempt) {
    const [newAttempt] = await db.insert(attempts).values(attempt).returning();
    return newAttempt;
  }
  async getAttemptsByUser(userId) {
    return await db.select().from(attempts).where(eq(attempts.userId, userId)).orderBy(desc(attempts.startedAt));
  }
  async getAttemptsByQuiz(quizId) {
    return await db.select().from(attempts).where(eq(attempts.quizId, quizId)).orderBy(desc(attempts.completedAt));
  }
  // Event operations
  async createEvent(event) {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }
  async getEventsByUser(userId, limit = 50) {
    return await db.select().from(events).where(eq(events.userId, userId)).orderBy(desc(events.timestamp)).limit(limit);
  }
  // Recommendation operations
  async getRecommendationsByUser(userId) {
    return await db.select().from(recommendations).where(eq(recommendations.userId, userId)).orderBy(desc(recommendations.confidence)).limit(10);
  }
  async createRecommendation(recommendation) {
    const [newRecommendation] = await db.insert(recommendations).values(recommendation).returning();
    return newRecommendation;
  }
  // Mastery operations
  async getMasteryStatesByUser(userId) {
    return await db.select().from(masteryStates).where(eq(masteryStates.userId, userId));
  }
  async upsertMasteryState(masteryState) {
    const [state] = await db.insert(masteryStates).values(masteryState).onConflictDoUpdate({
      target: [masteryStates.userId, masteryStates.knowledgeComponent],
      set: {
        ...masteryState,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return state;
  }
  // FL operations
  async createFLRound(round) {
    const [newRound] = await db.insert(flRounds).values(round).returning();
    return newRound;
  }
  async getFLRounds(limit = 10) {
    return await db.select().from(flRounds).orderBy(desc(flRounds.startedAt)).limit(limit);
  }
  async updateFLRound(id, updates) {
    const [updatedRound] = await db.update(flRounds).set(updates).where(eq(flRounds.id, id)).returning();
    return updatedRound;
  }
  async getFLClients() {
    return await db.select().from(flClients).orderBy(flClients.nodeId);
  }
  // Cloud operations
  async getCloudRegions() {
    return await db.select().from(cloudRegions).orderBy(cloudRegions.name);
  }
  async updateCloudRegion(id, updates) {
    const [updatedRegion] = await db.update(cloudRegions).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(cloudRegions.id, id)).returning();
    return updatedRegion;
  }
  async getServerlessJobs() {
    return await db.select().from(serverlessJobs).orderBy(serverlessJobs.functionName);
  }
  async updateServerlessJob(id, updates) {
    const [updatedJob] = await db.update(serverlessJobs).set(updates).where(eq(serverlessJobs.id, id)).returning();
    return updatedJob;
  }
  // Streak operations
  async getStreakByUser(userId) {
    const [streak] = await db.select().from(streaks).where(eq(streaks.userId, userId));
    return streak;
  }
  async upsertStreak(userId, updates) {
    const [streak] = await db.insert(streaks).values({ userId, ...updates }).onConflictDoUpdate({
      target: streaks.userId,
      set: updates
    }).returning();
    return streak;
  }
  // Institution operations
  async getInstitutions() {
    return await db.select().from(institutions).orderBy(institutions.name);
  }
  async getInstitution(id) {
    const [institution] = await db.select().from(institutions).where(eq(institutions.id, id));
    return institution;
  }
  async createInstitution(institution) {
    const [newInstitution] = await db.insert(institutions).values(institution).returning();
    return newInstitution;
  }
  async updateInstitution(id, updates) {
    const [updatedInstitution] = await db.update(institutions).set(updates).where(eq(institutions.id, id)).returning();
    return updatedInstitution;
  }
  async getUsersByInstitution(institutionId) {
    return await db.select().from(users).where(eq(users.institutionId, institutionId));
  }
  // Learning path operations
  async getLearningPathsByUser(userId) {
    return await db.select().from(learningPaths).where(eq(learningPaths.userId, userId));
  }
  async createLearningPath(learningPath) {
    const [newPath] = await db.insert(learningPaths).values(learningPath).returning();
    return newPath;
  }
  async updateLearningPath(id, updates) {
    const updateData = {
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    };
    const [updatedPath] = await db.update(learningPaths).set(updateData).where(eq(learningPaths.id, id)).returning();
    return updatedPath;
  }
  async deleteLearningPath(id) {
    await db.delete(learningPaths).where(eq(learningPaths.id, id));
  }
  // Federated learning operations
  async getModelWeightsByRound(roundId) {
    return await db.select().from(modelWeights).where(eq(modelWeights.roundId, roundId));
  }
  async getModelWeightsByInstitution(institutionId) {
    return await db.select().from(modelWeights).where(eq(modelWeights.institutionId, institutionId));
  }
  async uploadModelWeights(weights) {
    const [newWeights] = await db.insert(modelWeights).values(weights).returning();
    return newWeights;
  }
  async aggregateModelWeights(roundId) {
    const weights = await this.getModelWeightsByRound(roundId);
    const aggregatedWeights = {
      modelVersion: `global_v${Date.now()}`,
      participatingInstitutions: weights.length,
      totalContributions: weights.reduce((sum, w) => sum + (w.contributionScore || 0), 0),
      averagePerformance: weights.length > 0 ? weights.reduce((sum, w) => sum + (w.performance?.accuracy || 0), 0) / weights.length : 0,
      privacyBudgetUsed: weights.reduce((sum, w) => sum + (w.privacyBudget || 0), 0),
      aggregatedAt: /* @__PURE__ */ new Date()
    };
    return aggregatedWeights;
  }
  // Student analytics operations
  async getStudentAnalytics(userId, moduleId) {
    if (moduleId) {
      return await db.select().from(studentAnalytics).where(
        and(eq(studentAnalytics.userId, userId), eq(studentAnalytics.moduleId, moduleId))
      );
    }
    return await db.select().from(studentAnalytics).where(eq(studentAnalytics.userId, userId));
  }
  async getStudentAnalyticsByInstitution(institutionId) {
    return await db.select().from(studentAnalytics).where(eq(studentAnalytics.institutionId, institutionId));
  }
  async createStudentAnalytics(analytics) {
    const [newAnalytics] = await db.insert(studentAnalytics).values(analytics).returning();
    return newAnalytics;
  }
  async getPerformanceMetrics(institutionId, timeRange) {
    let analytics;
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
      totalStudents: new Set(analytics.map((a) => a.userId)).size,
      averageEngagement: analytics.length > 0 ? analytics.reduce((sum, a) => sum + (a.engagementScore || 0), 0) / analytics.length : 0,
      averageLearningVelocity: analytics.length > 0 ? analytics.reduce((sum, a) => sum + (a.learningVelocity || 0), 0) / analytics.length : 0,
      totalTimeSpent: analytics.reduce((sum, a) => sum + (a.timeSpent || 0), 0),
      modulePerformance: analytics.reduce((acc, a) => {
        if (!acc[a.moduleId]) acc[a.moduleId] = [];
        acc[a.moduleId].push(a);
        return acc;
      }, {})
    };
  }
  // Privacy operations
  async getPrivacyLogs(userId) {
    return await db.select().from(privacyLogs).where(eq(privacyLogs.userId, userId));
  }
  async createPrivacyLog(log2) {
    const [newLog] = await db.insert(privacyLogs).values(log2).returning();
    return newLog;
  }
  async checkPrivacyBudget(userId) {
    const logs = await this.getPrivacyLogs(userId);
    const used = logs.reduce((sum, log2) => sum + (log2.epsilonUsed || 0), 0);
    const user = await this.getUser(userId);
    const total = user?.privacyLevel || 3;
    return {
      used,
      remaining: Math.max(0, total - used)
    };
  }
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
        }
        res.clearCookie("connect.sid");
        res.redirect("/");
      });
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    console.error("Token refresh failed:", error);
    console.error("User ID:", user.claims?.sub, "Error type:", error instanceof Error ? error.constructor.name : typeof error);
    res.status(401).json({ message: "Token refresh failed" });
    return;
  }
};

// server/services/federated-learning.ts
var FederatedLearningService = class {
  activeRounds = /* @__PURE__ */ new Map();
  async startTrainingRound(clientCount, dpEpsilon, participationRate = 0.8) {
    const participatingClients = Math.floor(clientCount * participationRate);
    const round = await storage.createFLRound({
      roundNum: await this.getNextRoundNumber(),
      clientCount,
      participatingClients,
      dpEpsilon,
      status: "pending"
    });
    this.simulateTrainingRound(round);
    return round;
  }
  async simulateTrainingRound(round) {
    try {
      await storage.updateFLRound(round.id, { status: "running" });
      await this.simulateClientTraining(round);
      await this.simulateFedAvgAggregation(round);
      const globalMetrics = {
        accuracy: 0.873 + (Math.random() - 0.5) * 0.02,
        loss: 0.245 + (Math.random() - 0.5) * 0.05,
        convergence: Math.random() > 0.1,
        privacyBudgetUsed: round.dpEpsilon ? Math.random() * 0.1 + 0.35 : 0,
        clientsCompleted: round.participatingClients || round.clientCount,
        avgLatency: 120 + Math.random() * 50,
        bytesTransferred: Math.floor(Math.random() * 1e6 + 5e5)
      };
      await storage.updateFLRound(round.id, {
        status: "completed",
        completedAt: /* @__PURE__ */ new Date(),
        globalMetrics
      });
    } catch (error) {
      console.error("FL round simulation error:", error);
      await storage.updateFLRound(round.id, { status: "failed" });
    }
  }
  async simulateClientTraining(round) {
    const clientBehaviors = [
      { region: "us-east-1", status: "active", latency: 20 },
      { region: "eu-west-1", status: "active", latency: 45 },
      { region: "asia-pacific", status: "slow", latency: 150 },
      { region: "us-west-2", status: "active", latency: 35 },
      { region: "eu-central-1", status: "dropout", latency: 0 }
    ];
    await new Promise((resolve) => setTimeout(resolve, 3e3));
    return clientBehaviors;
  }
  async simulateFedAvgAggregation(round) {
    const aggregationMetrics = {
      algorithm: "FedAvg",
      weightAveraging: true,
      dpNoiseAdded: round.dpEpsilon ? true : false,
      convergenceDetected: Math.random() > 0.2
    };
    await new Promise((resolve) => setTimeout(resolve, 2e3));
    return aggregationMetrics;
  }
  async getNextRoundNumber() {
    const rounds = await storage.getFLRounds(1);
    return rounds.length > 0 ? (rounds[0].roundNum || 0) + 1 : 1;
  }
  async getFLMetrics(limit = 10) {
    const rounds = await storage.getFLRounds(limit);
    return rounds.map((round) => ({
      roundNum: round.roundNum,
      accuracy: round.globalMetrics?.accuracy || 0,
      privacyBudgetUsed: round.globalMetrics?.privacyBudgetUsed || 0,
      clientsParticipated: round.participatingClients || 0,
      status: round.status,
      timestamp: round.completedAt || round.startedAt
    }));
  }
  async simulateClientDropout(nodeId) {
    console.log(`Simulating dropout for client ${nodeId}`);
  }
  async simulateNetworkLatency(nodeId, latency) {
    console.log(`Injecting ${latency}ms latency for client ${nodeId}`);
  }
};
var federatedLearningService = new FederatedLearningService();

// server/services/quiz-service.ts
var QuizService = class {
  defaultConfig = {
    targetDifficulty: 2,
    maxQuestions: 10,
    convergenceThreshold: 0.1,
    masteryThreshold: 0.7
  };
  async generateAdaptiveQuiz(quizId, userId, initialDifficulty) {
    const questions2 = await storage.getQuestionsByQuiz(quizId);
    const masteryStates2 = await storage.getMasteryStatesByUser(userId);
    const ability = this.estimateUserAbility(masteryStates2);
    const difficulty = initialDifficulty || this.adaptDifficulty(ability);
    const selectedQuestions = this.selectQuestionsIRT(questions2, difficulty);
    return {
      quizId,
      questions: selectedQuestions,
      adaptiveData: {
        initialDifficulty: difficulty,
        estimatedAbility: ability,
        adaptationStrategy: "IRT-based"
      }
    };
  }
  estimateUserAbility(masteryStates2) {
    if (masteryStates2.length === 0) return 0;
    const averageMastery = masteryStates2.reduce((sum, state) => sum + (state.mastery || 0), 0) / masteryStates2.length;
    return (averageMastery - 0.5) * 6;
  }
  adaptDifficulty(ability) {
    return Math.max(1, Math.min(5, Math.round(ability + 3)));
  }
  selectQuestionsIRT(questions2, targetDifficulty) {
    const scoredQuestions = questions2.map((q) => ({
      ...q,
      informationValue: this.calculateInformation(q, targetDifficulty)
    }));
    return scoredQuestions.sort((a, b) => b.informationValue - a.informationValue).slice(0, this.defaultConfig.maxQuestions);
  }
  calculateInformation(question, ability) {
    const difficulty = question.difficulty || 1;
    const discrimination = question.discrimination || 1;
    const theta = ability - difficulty;
    const probability = 1 / (1 + Math.exp(-discrimination * theta));
    return discrimination * discrimination * probability * (1 - probability);
  }
  async updateMasteryFromAttempt(attempt) {
    const questions2 = await storage.getQuestionsByQuiz(attempt.quizId);
    const itemStats = attempt.itemStatsJson;
    for (const question of questions2) {
      if (!question.tags || !itemStats) continue;
      for (const tag of question.tags) {
        const isCorrect = itemStats[question.id]?.correct || false;
        await this.updateBayesianKT(attempt.userId, tag, isCorrect);
      }
    }
  }
  async updateBayesianKT(userId, knowledgeComponent, isCorrect) {
    const existing = await storage.getMasteryStatesByUser(userId);
    const currentState = existing.find((m) => m.knowledgeComponent === knowledgeComponent);
    const pInit = 0.1;
    const pLearn = 0.3;
    const pSlip = 0.1;
    const pGuess = 0.25;
    let priorMastery = currentState?.mastery || pInit;
    let attempts2 = (currentState?.attempts || 0) + 1;
    let posteriorMastery;
    if (isCorrect) {
      const pCorrectGivenMastered = 1 - pSlip;
      const pCorrectGivenNotMastered = pGuess;
      const pCorrect = priorMastery * pCorrectGivenMastered + (1 - priorMastery) * pCorrectGivenNotMastered;
      posteriorMastery = priorMastery * pCorrectGivenMastered / pCorrect;
    } else {
      const pIncorrectGivenMastered = pSlip;
      const pIncorrectGivenNotMastered = 1 - pGuess;
      const pIncorrect = priorMastery * pIncorrectGivenMastered + (1 - priorMastery) * pIncorrectGivenNotMastered;
      posteriorMastery = priorMastery * pIncorrectGivenMastered / pIncorrect;
    }
    const finalMastery = posteriorMastery + (1 - posteriorMastery) * pLearn;
    await storage.upsertMasteryState({
      userId,
      knowledgeComponent,
      mastery: Math.min(0.99, Math.max(0.01, finalMastery)),
      attempts: attempts2,
      lastCorrect: isCorrect
    });
  }
  async getQuestionExplanation(questionId, userAnswer) {
    const explanationTemplates = {
      incorrect: "Let's work through this step by step. The correct approach is...",
      partial: "You're on the right track! However, consider...",
      conceptual: "This question tests your understanding of..."
    };
    return explanationTemplates.incorrect;
  }
  async generateSimilarQuestions(questionId, difficulty) {
    const baseQuestion = await storage.getQuestionsByQuiz("");
    return [{
      stem: "Modified version of the original question...",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 1,
      difficulty,
      tags: ["similar_practice"]
    }];
  }
};
var quizService = new QuizService();

// server/services/content-service.ts
var ContentService = class {
  sources = [
    { name: "OpenStax", baseUrl: "https://openstax.org/api/v2" },
    { name: "Wikipedia", baseUrl: "https://en.wikipedia.org/api/rest_v1" },
    { name: "MIT OCW", baseUrl: "https://ocw.mit.edu/api" },
    { name: "Khan Academy", baseUrl: "https://www.khanacademy.org/api/v1" },
    { name: "arXiv", baseUrl: "https://export.arxiv.org/api" }
  ];
  async searchContent(query, subject) {
    const results = [];
    try {
      const openstaxResults = await this.searchOpenStax(query, subject);
      results.push(...openstaxResults);
      const wikipediaResults = await this.searchWikipedia(query);
      results.push(...wikipediaResults);
      if (subject === "mathematics" || subject === "computer_science") {
        const arxivResults = await this.searchArxiv(query, subject);
        results.push(...arxivResults);
      }
    } catch (error) {
      console.error("Content search error:", error);
      return this.getFallbackContent(query, subject);
    }
    return results;
  }
  async searchOpenStax(query, subject) {
    const sampleContent = {
      mathematics: [
        {
          title: "Linear Equations and Their Solutions",
          source: "OpenStax Algebra & Trigonometry",
          excerpt: "A linear equation in one variable can be written in the form ax + b = 0, where a and b are real numbers and a \u2260 0.",
          url: "https://openstax.org/books/algebra-and-trigonometry/pages/1-1-real-numbers-algebra-essentials",
          type: "textbook_section"
        },
        {
          title: "Quadratic Functions and Their Graphs",
          source: "OpenStax Algebra & Trigonometry",
          excerpt: "A quadratic function is a function of the form f(x) = ax\xB2 + bx + c, where a, b, and c are real numbers and a \u2260 0.",
          url: "https://openstax.org/books/algebra-and-trigonometry/pages/5-1-quadratic-functions",
          type: "textbook_section"
        }
      ],
      computer_science: [
        {
          title: "Python Programming Basics",
          source: "OpenStax Introduction to Programming",
          excerpt: "Python is a high-level programming language that emphasizes code readability and simplicity.",
          url: "https://openstax.org/books/introduction-to-programming/pages/1-1-what-is-programming",
          type: "textbook_section"
        }
      ]
    };
    return sampleContent[subject] || [];
  }
  async searchWikipedia(query) {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        return [{
          title: data.title,
          source: "Wikipedia",
          excerpt: data.extract,
          url: data.content_urls?.desktop?.page,
          type: "encyclopedia_article"
        }];
      }
    } catch (error) {
      console.error("Wikipedia search error:", error);
    }
    return [];
  }
  async searchArxiv(query, subject) {
    const sampleArxiv = [
      {
        title: "Advances in Federated Learning for Educational Applications",
        source: "arXiv",
        excerpt: "This paper presents novel approaches to federated learning in educational contexts, focusing on privacy-preserving personalization.",
        url: "https://arxiv.org/abs/2301.00000",
        type: "research_paper"
      }
    ];
    return query.includes("federated") || query.includes("machine learning") ? sampleArxiv : [];
  }
  getFallbackContent(query, subject) {
    return [{
      title: `Offline Content: ${query}`,
      source: "Local Cache",
      excerpt: "This content is available in offline mode. Connect to the internet for more comprehensive results.",
      url: "#",
      type: "fallback"
    }];
  }
  async generateQuizContent(topic, difficulty) {
    const content = await this.searchContent(topic, "mathematics");
    return {
      topic,
      difficulty,
      questions: await this.extractQuestions(content, difficulty),
      sources: content.map((c) => c.source)
    };
  }
  async extractQuestions(content, difficulty) {
    const sampleQuestions = [
      {
        stem: "What is the standard form of a quadratic function?",
        options: [
          "f(x) = ax + b",
          "f(x) = ax\xB2 + bx + c",
          "f(x) = a/x + b",
          "f(x) = \u221A(ax + b)"
        ],
        correctIndex: 1,
        explanation: "A quadratic function is always in the form f(x) = ax\xB2 + bx + c where a \u2260 0.",
        difficulty,
        tags: ["quadratic_functions", "standard_form"]
      }
    ];
    return sampleQuestions;
  }
  async getTutorContext(topic) {
    const content = await this.searchContent(topic, "mathematics");
    return {
      topic,
      context: content,
      sources: content.map((c) => ({ name: c.source, url: c.url })),
      relatedTopics: this.getRelatedTopics(topic)
    };
  }
  getRelatedTopics(topic) {
    const relatedMap = {
      "quadratic": ["linear equations", "parabolas", "factoring", "completing the square"],
      "linear": ["slope", "systems of equations", "graphing", "inequalities"],
      "python": ["variables", "functions", "loops", "data structures"]
    };
    for (const [key, topics] of Object.entries(relatedMap)) {
      if (topic.toLowerCase().includes(key)) {
        return topics;
      }
    }
    return [];
  }
};
var contentService = new ContentService();

// server/services/ai-tutor.ts
var AITutorService = class {
  conversationHistory = /* @__PURE__ */ new Map();
  async generateResponse(userMessage, context, userId) {
    try {
      const masteryStates2 = await storage.getMasteryStatesByUser(userId);
      const recentAttempts = await storage.getAttemptsByUser(userId);
      const analysis = this.analyzeQuery(userMessage);
      const contentContext = await contentService.getTutorContext(analysis.topic);
      const response = await this.generatePersonalizedResponse(
        userMessage,
        analysis,
        contentContext,
        masteryStates2
      );
      this.updateConversationHistory(userId, userMessage, response);
      return response;
    } catch (error) {
      console.error("AI Tutor error:", error);
      return this.getFallbackResponse(userMessage);
    }
  }
  analyzeQuery(message) {
    const mathKeywords = ["equation", "quadratic", "linear", "solve", "graph", "function"];
    const csKeywords = ["python", "programming", "code", "algorithm", "variable", "loop"];
    const helpKeywords = ["help", "explain", "understand", "confused", "don't get"];
    const isMath = mathKeywords.some(
      (keyword) => message.toLowerCase().includes(keyword)
    );
    const isCS = csKeywords.some(
      (keyword) => message.toLowerCase().includes(keyword)
    );
    const needsHelp = helpKeywords.some(
      (keyword) => message.toLowerCase().includes(keyword)
    );
    let topic = "general";
    if (isMath) topic = "mathematics";
    if (isCS) topic = "computer_science";
    return {
      topic,
      intent: needsHelp ? "explanation" : "question",
      difficulty: this.estimateQuestionDifficulty(message),
      keywords: this.extractKeywords(message)
    };
  }
  estimateQuestionDifficulty(message) {
    const advancedTerms = ["derivative", "integral", "matrix", "recursion", "complexity"];
    const intermediateTerms = ["quadratic", "function", "loop", "array"];
    const basicTerms = ["add", "subtract", "variable", "print"];
    const msg = message.toLowerCase();
    if (advancedTerms.some((term) => msg.includes(term))) return 4;
    if (intermediateTerms.some((term) => msg.includes(term))) return 3;
    if (basicTerms.some((term) => msg.includes(term))) return 1;
    return 2;
  }
  extractKeywords(message) {
    const keywords = message.toLowerCase().match(/\b(equation|quadratic|linear|python|function|variable|loop|array|graph|solve|algorithm|derivative|integral|matrix|recursion|complexity|optimization|calculus|algebra|trigonometry|programming|code|debug|error|syntax|logic)\b/g);
    return keywords || [];
  }
  async generatePersonalizedResponse(userMessage, analysis, contentContext, masteryStates2) {
    const relevantMastery = masteryStates2.filter(
      (state) => analysis.keywords.some(
        (keyword) => state.knowledgeComponent.includes(keyword)
      )
    );
    const averageMastery = relevantMastery.length > 0 ? relevantMastery.reduce((sum, state) => sum + (state.mastery || 0), 0) / relevantMastery.length : 0.5;
    let response;
    if (averageMastery < 0.3) {
      response = this.generateBeginnerResponse(userMessage, analysis, contentContext);
    } else if (averageMastery < 0.7) {
      response = this.generateIntermediateResponse(userMessage, analysis, contentContext);
    } else {
      response = this.generateAdvancedResponse(userMessage, analysis, contentContext);
    }
    return response;
  }
  generateBeginnerResponse(message, analysis, context) {
    const responses = {
      quadratic: {
        message: "Great question about quadratic functions! Let's start with the basics. A quadratic function has the form f(x) = ax\xB2 + bx + c. The 'a' coefficient determines if the parabola opens up (a > 0) or down (a < 0). Would you like me to show you a specific example?",
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
    const topic = analysis.keywords[0] || "default";
    const responseTemplate = responses[topic] || responses.default;
    return {
      ...responseTemplate,
      sources: context.sources || [],
      relatedTopics: context.relatedTopics || [],
      confidence: 0.8
    };
  }
  generateIntermediateResponse(message, analysis, context) {
    const responses = {
      quadratic: {
        message: `You're asking about quadratic functions - great! Since you understand the basics, let's explore how the discriminant (b\xB2 - 4ac) tells us about the nature of the roots. If it's positive, we have two real solutions; if zero, one repeated root; if negative, two complex solutions. Would you like to work through an example?`,
        followUpQuestions: [
          "Can you calculate the discriminant for x\xB2 - 5x + 6 = 0?",
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
    const topic = analysis.keywords.find((k) => responses[k]) || "default";
    const responseTemplate = responses[topic] || responses.default;
    return {
      ...responseTemplate,
      sources: context.sources || [],
      relatedTopics: context.relatedTopics || [topic],
      confidence: 0.85
    };
  }
  generateAdvancedResponse(message, analysis, context) {
    const responses = {
      quadratic: {
        message: `Fascinating question about quadratics! At your level, you might appreciate the deeper mathematical beauty. The vertex form f(x) = a(x-h)\xB2 + k reveals geometric transformations, while the factored form shows roots directly. Consider how quadratics appear in physics (projectile motion), economics (profit optimization), and computer graphics (B\xE9zier curves). What application interests you most?`,
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
    const topic = analysis.keywords.find((k) => responses[k]) || "default";
    const responseTemplate = responses[topic] || responses.default;
    return {
      ...responseTemplate,
      sources: context.sources || [],
      relatedTopics: context.relatedTopics || [topic, "advanced_concepts"],
      confidence: 0.9
    };
  }
  updateConversationHistory(userId, question, response) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    const history = this.conversationHistory.get(userId);
    history.push({
      timestamp: /* @__PURE__ */ new Date(),
      question,
      response: response.message,
      topic: response.relatedTopics[0] || "general"
    });
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
  }
  getFallbackResponse(message) {
    return {
      message: "I'm sorry, I'm having trouble processing your question right now. Could you try rephrasing it, or asking about a specific topic like quadratic functions, linear equations, or Python programming?",
      sources: [],
      relatedTopics: ["quadratic functions", "linear equations", "python basics"],
      followUpQuestions: [
        "What specific topic would you like help with?",
        "Are you working on homework or trying to understand a concept?",
        "Would you like me to suggest some practice problems?"
      ],
      confidence: 0.3
    };
  }
  async getConversationHistory(userId) {
    return this.conversationHistory.get(userId) || [];
  }
  async suggestStudyPlan(userId) {
    const masteryStates2 = await storage.getMasteryStatesByUser(userId);
    const recentAttempts = await storage.getAttemptsByUser(userId);
    const weakAreas = masteryStates2.filter((state) => (state.mastery || 0) < 0.5).sort((a, b) => (a.mastery || 0) - (b.mastery || 0)).slice(0, 3);
    return {
      recommendedFocus: weakAreas.map((area) => area.knowledgeComponent),
      studyTimeEstimate: weakAreas.length * 30,
      // minutes
      nextSteps: [
        "Practice problems in identified weak areas",
        "Review foundational concepts",
        "Take adaptive quizzes to track progress"
      ]
    };
  }
};
var aiTutorService = new AITutorService();

// server/services/analytics.ts
var AnalyticsService = class {
  async getDashboardAnalytics(userId) {
    const [
      attempts2,
      masteryStates2,
      events2,
      recommendations2,
      streak
    ] = await Promise.all([
      storage.getAttemptsByUser(userId),
      storage.getMasteryStatesByUser(userId),
      storage.getEventsByUser(userId, 20),
      storage.getRecommendationsByUser(userId),
      storage.getStreakByUser(userId)
    ]);
    return {
      progressOverview: this.calculateProgressOverview(attempts2, masteryStates2),
      streakData: this.calculateStreakData(streak, events2),
      recentActivity: this.formatRecentActivity(events2, attempts2),
      masteryBreakdown: this.calculateMasteryBreakdown(masteryStates2),
      nextBestModule: await this.getNextBestModule(userId, masteryStates2),
      riskFactors: this.calculateRiskFactors(attempts2, events2, masteryStates2)
    };
  }
  calculateProgressOverview(attempts2, masteryStates2) {
    const mathMastery = masteryStates2.filter((state) => state.knowledgeComponent.includes("algebra") || state.knowledgeComponent.includes("quadratic")).reduce((sum, state) => sum + (state.mastery || 0), 0);
    const csMastery = masteryStates2.filter((state) => state.knowledgeComponent.includes("python") || state.knowledgeComponent.includes("programming")).reduce((sum, state) => sum + (state.mastery || 0), 0);
    const mathCount = masteryStates2.filter(
      (s) => s.knowledgeComponent.includes("algebra") || s.knowledgeComponent.includes("quadratic")
    ).length || 1;
    const csCount = masteryStates2.filter(
      (s) => s.knowledgeComponent.includes("python") || s.knowledgeComponent.includes("programming")
    ).length || 1;
    return {
      mathematics: {
        progress: Math.round(mathMastery / mathCount * 100),
        modulesCompleted: mathCount,
        totalModules: 17,
        weeklyGrowth: this.calculateWeeklyGrowth(attempts2, "mathematics")
      },
      computerScience: {
        progress: Math.round(csMastery / csCount * 100),
        modulesCompleted: csCount,
        totalModules: 15,
        weeklyGrowth: this.calculateWeeklyGrowth(attempts2, "computer_science")
      }
    };
  }
  calculateWeeklyGrowth(attempts2, subject) {
    const oneWeekAgo = /* @__PURE__ */ new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentAttempts = attempts2.filter(
      (attempt) => attempt.completedAt && new Date(attempt.completedAt) > oneWeekAgo
    );
    const avgScore = recentAttempts.length > 0 ? recentAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / recentAttempts.length : 0;
    return Math.round(avgScore * 100) - 60;
  }
  calculateStreakData(streak, events2) {
    const currentStreak = streak?.currentStreak || 14;
    const longestStreak = streak?.longestStreak || 21;
    const calendarDays = [];
    for (let i = 13; i >= 0; i--) {
      const date = /* @__PURE__ */ new Date();
      date.setDate(date.getDate() - i);
      const hasActivity = i < currentStreak;
      calendarDays.push({
        date: date.getDate(),
        active: hasActivity,
        day: date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0)
      });
    }
    return {
      currentStreak,
      longestStreak,
      calendarDays,
      badges: streak?.badges || ["Week Warrior", "Quiz Master"],
      isOnTrack: currentStreak >= 7
    };
  }
  formatRecentActivity(events2, attempts2) {
    const activities = [];
    attempts2.slice(0, 3).forEach((attempt) => {
      activities.push({
        type: "quiz_complete",
        title: "Quiz completed: Linear Equations - Advanced",
        description: `Score: ${Math.round(attempt.score * 100)}% \u2022 Mastery increased by ${Math.floor(Math.random() * 15 + 5)}%`,
        timestamp: attempt.completedAt || attempt.startedAt,
        icon: "check_circle",
        color: "success"
      });
    });
    events2.slice(0, 2).forEach((event) => {
      if (event.type === "module_view") {
        activities.push({
          type: "learning",
          title: "Module studied: Quadratic Functions",
          description: "Duration: 25 minutes \u2022 Progress updated",
          timestamp: event.timestamp,
          icon: "book",
          color: "primary"
        });
      }
    });
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
  }
  calculateMasteryBreakdown(masteryStates2) {
    const breakdown = {
      strong: [],
      developing: [],
      needsWork: []
    };
    masteryStates2.forEach((state) => {
      const mastery = state.mastery || 0;
      const kc = state.knowledgeComponent;
      if (mastery >= 0.8) {
        breakdown.strong.push(kc);
      } else if (mastery >= 0.5) {
        breakdown.developing.push(kc);
      } else {
        breakdown.needsWork.push(kc);
      }
    });
    return breakdown;
  }
  async getNextBestModule(userId, masteryStates2) {
    const recommendations2 = await this.generateRecommendations(userId, 3);
    if (recommendations2.length > 0) {
      const bestRec = recommendations2[0];
      return {
        moduleId: bestRec.moduleId,
        title: "Quadratic Functions - Advanced",
        description: "Build on your linear equations knowledge with quadratic relationships and graphing techniques.",
        difficulty: bestRec.difficulty || 3,
        estimatedTime: bestRec.estimatedTime || 45,
        masteryGain: Math.round((bestRec.masteryGain || 0.23) * 100),
        reason: bestRec.reason
      };
    }
    return {
      title: "Quadratic Functions - Advanced",
      description: "Build on your linear equations knowledge with quadratic relationships and graphing techniques.",
      difficulty: 3,
      estimatedTime: 45,
      masteryGain: 23,
      reason: "Based on your progress in linear equations"
    };
  }
  async generateRecommendations(userId, privacyLevel) {
    const masteryStates2 = await storage.getMasteryStatesByUser(userId);
    const recentAttempts = await storage.getAttemptsByUser(userId);
    const recommendations2 = await this.runContextualBandit(
      userId,
      masteryStates2,
      recentAttempts,
      privacyLevel
    );
    for (const rec of recommendations2) {
      await storage.createRecommendation({
        userId,
        moduleId: rec.moduleId,
        reason: rec.reason,
        confidence: rec.confidence,
        masteryGain: rec.masteryGain,
        difficulty: rec.difficulty,
        estimatedTime: rec.estimatedTime,
        modelVersion: "contextual_bandit_v1.0"
      });
    }
    return recommendations2;
  }
  async runContextualBandit(userId, masteryStates2, attempts2, privacyLevel) {
    const dbModules = await storage.getModules();
    if (!dbModules || dbModules.length === 0) {
      return [];
    }
    const availableModules = dbModules.map((module) => ({
      id: module.id,
      title: module.title,
      prerequisites: [],
      // Could be expanded based on module relationships
      difficulty: module.difficulty || 3,
      estimatedTime: module.estimatedTime || 45
    }));
    const userContext = {
      averageMastery: masteryStates2.length > 0 ? masteryStates2.reduce((sum, s) => sum + (s.mastery || 0), 0) / masteryStates2.length : 0.5,
      recentPerformance: attempts2.slice(0, 5).reduce((sum, a) => sum + a.score, 0) / Math.min(5, attempts2.length || 1),
      privacyBudget: privacyLevel,
      learningVelocity: this.calculateLearningVelocity(attempts2)
    };
    if (privacyLevel < 5) {
      userContext.averageMastery += this.addDPNoise(privacyLevel);
      userContext.recentPerformance += this.addDPNoise(privacyLevel);
    }
    return availableModules.map((module) => ({
      moduleId: module.id,
      title: module.title,
      difficulty: module.difficulty,
      estimatedTime: module.estimatedTime,
      masteryGain: this.predictMasteryGain(userContext, module),
      confidence: this.calculateConfidence(userContext, module),
      reason: this.generateReason(userContext, module)
    })).sort((a, b) => b.confidence - a.confidence);
  }
  calculateLearningVelocity(attempts2) {
    if (attempts2.length < 2) return 0.5;
    const recentAttempts = attempts2.slice(0, 10);
    const scores = recentAttempts.map((a) => a.score);
    let trend = 0;
    for (let i = 1; i < scores.length; i++) {
      trend += scores[i] - scores[i - 1];
    }
    return Math.max(0, Math.min(1, 0.5 + trend / scores.length));
  }
  addDPNoise(epsilon) {
    const sensitivity = 0.1;
    const scale = sensitivity / epsilon;
    const u1 = Math.random();
    const u2 = Math.random();
    return scale * Math.sign(u1 - 0.5) * Math.log(1 - 2 * Math.min(u1, 1 - u1));
  }
  predictMasteryGain(context, module) {
    const baseGain = 0.15;
    const difficultyFactor = (module.difficulty - 2.5) / 2.5 * 0.1;
    const masteryFactor = (1 - context.averageMastery) * 0.2;
    return Math.max(0, Math.min(0.5, baseGain + difficultyFactor + masteryFactor));
  }
  calculateConfidence(context, module) {
    const difficultyMatch = 1 - Math.abs(module.difficulty - context.averageMastery * 5) / 5;
    const performanceWeight = context.recentPerformance;
    const velocityWeight = context.learningVelocity;
    return difficultyMatch * 0.4 + performanceWeight * 0.3 + velocityWeight * 0.3;
  }
  generateReason(context, module) {
    if (context.averageMastery < 0.4) {
      return "Builds foundational skills you need to strengthen";
    } else if (context.averageMastery > 0.8) {
      return "Challenges you with advanced concepts";
    } else {
      return "Perfect difficulty level for your current progress";
    }
  }
  calculateRiskFactors(attempts2, events2, masteryStates2) {
    const oneWeekAgo = /* @__PURE__ */ new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentActivity = events2.filter((e) => new Date(e.timestamp) > oneWeekAgo).length;
    const recentPerformance = attempts2.slice(0, 5).reduce((sum, a) => sum + a.score, 0) / Math.min(5, attempts2.length || 1);
    const strugglingAreas = masteryStates2.filter((s) => (s.mastery || 0) < 0.3).length;
    let riskLevel = "low";
    const riskFactors = [];
    if (recentActivity < 3) {
      riskLevel = "medium";
      riskFactors.push("Low recent activity");
    }
    if (recentPerformance < 0.6) {
      riskLevel = "high";
      riskFactors.push("Declining quiz performance");
    }
    if (strugglingAreas > 3) {
      riskLevel = "high";
      riskFactors.push("Multiple areas need attention");
    }
    return {
      level: riskLevel,
      factors: riskFactors,
      recommendations: this.getInterventionRecommendations(riskLevel)
    };
  }
  getInterventionRecommendations(riskLevel) {
    const recommendations2 = {
      low: ["Keep up the great work!", "Consider tackling more challenging topics"],
      medium: ["Schedule regular study sessions", "Review problem areas more frequently"],
      high: ["Consider working with a tutor", "Take more frequent breaks between study sessions", "Focus on foundational concepts"]
    };
    return recommendations2[riskLevel] || [];
  }
};
var analyticsService = new AnalyticsService();

// server/routes.ts
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/logout", async (req, res) => {
    res.clearCookie("connect.sid", { path: "/" });
    res.redirect("/");
  });
  app2.get("/api/courses", isAuthenticated, async (req, res) => {
    try {
      const courses2 = await storage.getCourses();
      res.json(courses2);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });
  app2.get("/api/courses/:id", isAuthenticated, async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });
  app2.post("/api/courses", isAuthenticated, async (req, res) => {
    try {
      if (!["admin", "instructor"].includes(req.user.claims.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(400).json({ message: "Invalid course data" });
    }
  });
  app2.get("/api/courses/:courseId/modules", isAuthenticated, async (req, res) => {
    try {
      const modules2 = await storage.getModulesByCourse(req.params.courseId);
      res.json(modules2);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });
  app2.get("/api/modules/:id", isAuthenticated, async (req, res) => {
    try {
      const module = await storage.getModule(req.params.id);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      console.error("Error fetching module:", error);
      res.status(500).json({ message: "Failed to fetch module" });
    }
  });
  app2.get("/api/modules/:moduleId/quizzes", isAuthenticated, async (req, res) => {
    try {
      const quizzes2 = await storage.getQuizzesByModule(req.params.moduleId);
      res.json(quizzes2);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });
  app2.get("/api/quizzes/:id", isAuthenticated, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      const questions2 = await storage.getQuestionsByQuiz(quiz.id);
      res.json({ ...quiz, questions: questions2 });
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });
  app2.post("/api/quizzes/:id/generate", isAuthenticated, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      const userId = req.user.claims.sub;
      const { difficulty } = req.body;
      const adaptiveQuiz = await quizService.generateAdaptiveQuiz(quiz.id, userId, difficulty);
      res.json(adaptiveQuiz);
    } catch (error) {
      console.error("Error generating adaptive quiz:", error);
      res.status(500).json({ message: "Failed to generate adaptive quiz" });
    }
  });
  app2.post("/api/quizzes/:id/attempts", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const attemptData = {
        ...insertAttemptSchema.parse(req.body),
        userId,
        quizId: req.params.id,
        completedAt: /* @__PURE__ */ new Date()
      };
      const attempt = await storage.createAttempt(attemptData);
      await quizService.updateMasteryFromAttempt(attempt);
      await storage.createEvent({
        userId,
        type: "quiz_complete",
        payload: {
          quizId: req.params.id,
          score: attempt.score,
          correctAnswers: attempt.correctAnswers,
          totalQuestions: attempt.totalQuestions
        }
      });
      res.status(201).json(attempt);
    } catch (error) {
      console.error("Error creating attempt:", error);
      res.status(400).json({ message: "Invalid attempt data" });
    }
  });
  app2.get("/api/users/:userId/attempts", isAuthenticated, async (req, res) => {
    try {
      const attempts2 = await storage.getAttemptsByUser(req.params.userId);
      res.json(attempts2);
    } catch (error) {
      console.error("Error fetching attempts:", error);
      res.status(500).json({ message: "Failed to fetch attempts" });
    }
  });
  app2.get("/api/users/:userId/recommendations", isAuthenticated, async (req, res) => {
    try {
      const recommendations2 = await storage.getRecommendationsByUser(req.params.userId);
      res.json(recommendations2);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });
  app2.post("/api/users/:userId/recommendations/generate", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.userId;
      const { privacyLevel } = req.body;
      const recommendations2 = await analyticsService.generateRecommendations(userId, privacyLevel);
      res.json(recommendations2);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });
  app2.get("/api/users/:userId/mastery", isAuthenticated, async (req, res) => {
    try {
      const masteryStates2 = await storage.getMasteryStatesByUser(req.params.userId);
      res.json(masteryStates2);
    } catch (error) {
      console.error("Error fetching mastery states:", error);
      res.status(500).json({ message: "Failed to fetch mastery states" });
    }
  });
  app2.post("/api/tutor/chat", isAuthenticated, async (req, res) => {
    try {
      const { message, context } = req.body;
      const userId = req.user.claims.sub;
      const response = await aiTutorService.generateResponse(message, context, userId);
      res.json(response);
    } catch (error) {
      console.error("Error generating tutor response:", error);
      res.status(500).json({ message: "Failed to generate response" });
    }
  });
  app2.get("/api/fl/rounds", isAuthenticated, async (req, res) => {
    try {
      if (req.user.claims.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const rounds = await storage.getFLRounds();
      res.json(rounds);
    } catch (error) {
      console.error("Error fetching FL rounds:", error);
      res.status(500).json({ message: "Failed to fetch FL rounds" });
    }
  });
  app2.post("/api/fl/rounds", isAuthenticated, async (req, res) => {
    try {
      if (req.user.claims.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { clientCount, dpEpsilon, participationRate } = req.body;
      const round = await federatedLearningService.startTrainingRound(
        clientCount,
        dpEpsilon,
        participationRate
      );
      res.status(201).json(round);
    } catch (error) {
      console.error("Error starting FL round:", error);
      res.status(500).json({ message: "Failed to start FL round" });
    }
  });
  app2.get("/api/fl/clients", isAuthenticated, async (req, res) => {
    try {
      if (req.user.claims.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const clients = await storage.getFLClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching FL clients:", error);
      res.status(500).json({ message: "Failed to fetch FL clients" });
    }
  });
  app2.get("/api/cloud/regions", isAuthenticated, async (req, res) => {
    try {
      if (req.user.claims.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const regions = await storage.getCloudRegions();
      res.json(regions);
    } catch (error) {
      console.error("Error fetching cloud regions:", error);
      res.status(500).json({ message: "Failed to fetch cloud regions" });
    }
  });
  app2.patch("/api/cloud/regions/:id", isAuthenticated, async (req, res) => {
    try {
      if (req.user.claims.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { status, latency, load } = req.body;
      const region = await storage.updateCloudRegion(req.params.id, {
        status,
        latency,
        load
      });
      res.json(region);
    } catch (error) {
      console.error("Error updating cloud region:", error);
      res.status(500).json({ message: "Failed to update cloud region" });
    }
  });
  app2.get("/api/cloud/jobs", isAuthenticated, async (req, res) => {
    try {
      if (req.user.claims.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const jobs = await storage.getServerlessJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching serverless jobs:", error);
      res.status(500).json({ message: "Failed to fetch serverless jobs" });
    }
  });
  app2.post("/api/cloud/jobs/:id/invoke", isAuthenticated, async (req, res) => {
    try {
      if (req.user.claims.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const job = await storage.updateServerlessJob(req.params.id, {
        status: "running",
        lastInvocation: /* @__PURE__ */ new Date()
      });
      setTimeout(async () => {
        await storage.updateServerlessJob(req.params.id, {
          status: "completed"
        });
      }, 5e3);
      res.json(job);
    } catch (error) {
      console.error("Error invoking serverless job:", error);
      res.status(500).json({ message: "Failed to invoke serverless job" });
    }
  });
  app2.get("/api/analytics/dashboard/:userId", isAuthenticated, async (req, res) => {
    try {
      const analytics = await analyticsService.getDashboardAnalytics(req.params.userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/users/:userId/streak", isAuthenticated, async (req, res) => {
    try {
      const streak = await storage.getStreakByUser(req.params.userId);
      res.json(streak);
    } catch (error) {
      console.error("Error fetching streak:", error);
      res.status(500).json({ message: "Failed to fetch streak" });
    }
  });
  app2.post("/api/events", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = {
        ...insertEventSchema.parse(req.body),
        userId
      };
      const event = await storage.createEvent(eventData);
      if (event.type === "quiz_complete" || event.type === "module_complete") {
        broadcastToUser(userId, "event", event);
      }
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(400).json({ message: "Invalid event data" });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const userConnections = /* @__PURE__ */ new Map();
  wss.on("connection", (ws2, req) => {
    let userId = null;
    ws2.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "auth") {
          userId = message.userId;
          if (userId) {
            if (!userConnections.has(userId)) {
              userConnections.set(userId, /* @__PURE__ */ new Set());
            }
            userConnections.get(userId).add(ws2);
            ws2.send(JSON.stringify({ type: "auth_success", userId }));
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws2.on("close", () => {
      if (userId && userConnections.has(userId)) {
        userConnections.get(userId).delete(ws2);
        if (userConnections.get(userId).size === 0) {
          userConnections.delete(userId);
        }
      }
    });
  });
  function broadcastToUser(userId, type, data) {
    const connections = userConnections.get(userId);
    if (connections) {
      const message = JSON.stringify({ type, data });
      connections.forEach((ws2) => {
        if (ws2.readyState === WebSocket.OPEN) {
          ws2.send(message);
        }
      });
    }
  }
  await seedInitialData();
  return httpServer;
}
async function seedInitialData() {
  try {
    const courses2 = await storage.getCourses();
    if (courses2.length === 0) {
      console.log("Seeding initial courses...");
      const mathCourse = await storage.createCourse({
        title: "Algebra & Trigonometry",
        subject: "Mathematics",
        description: "Comprehensive algebra and trigonometry course from OpenStax"
      });
      const csCourse = await storage.createCourse({
        title: "Computer Science Fundamentals",
        subject: "Computer Science",
        description: "Introduction to programming and computer science concepts"
      });
      await storage.createModule({
        courseId: mathCourse.id,
        title: "Linear Equations",
        order: 1,
        summary: "Solving linear equations and systems",
        content: "# Linear Equations\n\nLearn to solve linear equations step by step...",
        difficulty: 2,
        estimatedTime: 45
      });
      await storage.createModule({
        courseId: mathCourse.id,
        title: "Quadratic Functions",
        order: 2,
        summary: "Understanding quadratic functions and their graphs",
        content: "# Quadratic Functions\n\nExplore quadratic relationships...",
        difficulty: 3,
        estimatedTime: 60
      });
      await storage.createModule({
        courseId: csCourse.id,
        title: "Python Basics",
        order: 1,
        summary: "Introduction to Python programming",
        content: "# Python Basics\n\nLearn Python fundamentals...",
        difficulty: 1,
        estimatedTime: 30
      });
      console.log("Initial courses and modules seeded successfully");
    }
    const regions = await storage.getCloudRegions();
    if (regions.length === 0) {
      console.log("Seeding cloud regions...");
      await storage.updateCloudRegion("1", {
        name: "us-east-1",
        displayName: "US-East-1",
        status: "healthy",
        latency: 23,
        load: 67,
        activeUsers: 1247,
        workerNodes: 5
      });
      console.log("Cloud regions seeded successfully");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Database seeding failed - this is expected in development without database access:", errorMessage);
    console.log("The application will continue to run without seeded data");
  }
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Please wait a moment and try again.`);
      process.exit(1);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
})();
