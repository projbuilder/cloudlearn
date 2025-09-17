import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  primaryKey,
  real
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Institutions for multi-tenancy
export const institutions = pgTable("institutions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").default('university'), // university, college, school
  region: varchar("region").default('us-east-1'),
  privacyPolicy: text("privacy_policy"),
  federatedEnabled: boolean("federated_enabled").default(true),
  maxStudents: integer("max_students").default(10000),
  activeStudents: integer("active_students").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default('student'), // student, instructor, cloud_manager
  institutionId: varchar("institution_id").references(() => institutions.id),
  privacyLevel: real("privacy_level").default(3.0), // DP epsilon
  engagementLevel: varchar("engagement_level").default('medium'),
  edgeDeviceId: varchar("edge_device_id"), // for federated learning
  localModelVersion: varchar("local_model_version"),
  dataRetentionDays: integer("data_retention_days").default(365),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  subject: varchar("subject").notNull(),
  description: text("description"),
  region: varchar("region").default('us-east-1'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const modules = pgTable("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id),
  title: varchar("title").notNull(),
  order: integer("order").notNull(),
  summary: text("summary"),
  content: text("content"), // markdown content
  difficulty: integer("difficulty").default(1), // 1-5
  estimatedTime: integer("estimated_time"), // minutes
  assetUri: varchar("asset_uri"), // MinIO URI
  createdAt: timestamp("created_at").defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").references(() => modules.id),
  title: varchar("title").notNull(),
  content: text("content"), // markdown content
  bodyMarkdownUri: varchar("body_markdown_uri"), // MinIO URI
  videoUri: varchar("video_uri"), // MinIO URI
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").references(() => modules.id),
  title: varchar("title").notNull(),
  difficulty: integer("difficulty").default(1),
  generatedFrom: varchar("generated_from"), // source content
  version: integer("version").default(1),
  maxQuestions: integer("max_questions").default(10),
  timeLimit: integer("time_limit"), // minutes
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").references(() => quizzes.id),
  stem: text("stem").notNull(),
  options: jsonb("options").notNull(), // array of options
  correctIndex: integer("correct_index").notNull(),
  explanation: text("explanation"),
  tags: jsonb("tags").$type<string[]>(), // KC tags
  difficulty: real("difficulty").default(1.0),
  discrimination: real("discrimination").default(0.0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attempts = pgTable("attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").references(() => quizzes.id),
  userId: varchar("user_id").references(() => users.id),
  score: real("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  itemStatsJson: jsonb("item_stats_json"), // per-question analytics
  adaptiveData: jsonb("adaptive_data"), // difficulty adjustments
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(), // 'quiz_start', 'quiz_complete', 'module_view', etc.
  payload: jsonb("payload").notNull(),
  sessionId: varchar("session_id"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const recommendations = pgTable("recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  moduleId: varchar("module_id").references(() => modules.id),
  reason: text("reason").notNull(),
  confidence: real("confidence").default(0.5),
  modelVersion: varchar("model_version"),
  masteryGain: real("mastery_gain"), // predicted mastery increase
  difficulty: integer("difficulty"),
  estimatedTime: integer("estimated_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const masteryStates = pgTable("mastery_states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  knowledgeComponent: varchar("knowledge_component").notNull(), // KC tag
  mastery: real("mastery").default(0.0), // 0.0 to 1.0
  attempts: integer("attempts").default(0),
  lastCorrect: boolean("last_correct"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const flRounds = pgTable("fl_rounds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roundNum: integer("round_num").notNull(),
  clientCount: integer("client_count").notNull(),
  participatingClients: integer("participating_clients"),
  dpEpsilon: real("dp_epsilon"),
  globalMetrics: jsonb("global_metrics"),
  status: varchar("status").default('pending'), // pending, running, completed, failed
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const flClients = pgTable("fl_clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nodeId: varchar("node_id").notNull().unique(),
  region: varchar("region").notNull(),
  status: varchar("status").default('active'), // active, inactive, slow, dropout
  lastSeen: timestamp("last_seen").defaultNow(),
  totalRounds: integer("total_rounds").default(0),
  avgLatency: real("avg_latency"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serverlessJobs = pgTable("serverless_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  functionName: varchar("function_name").notNull(),
  description: text("description"),
  schedule: varchar("schedule"), // cron expression
  lastInvocation: timestamp("last_invocation"),
  status: varchar("status").default('idle'), // idle, running, completed, failed
  concurrency: integer("concurrency").default(1),
  coldStart: boolean("cold_start").default(true),
  avgDuration: real("avg_duration"), // seconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const cloudRegions = pgTable("cloud_regions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  status: varchar("status").default('healthy'), // healthy, degraded, down
  latency: integer("latency").default(50), // ms
  load: integer("load").default(30), // percentage
  activeUsers: integer("active_users").default(0),
  workerNodes: integer("worker_nodes").default(3),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const streaks = pgTable("streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivity: timestamp("last_activity").defaultNow(),
  badges: jsonb("badges").$type<string[]>(), // earned badges
});

// Learning paths for personalized education
export const learningPaths = pgTable("learning_paths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  moduleSequence: jsonb("module_sequence").$type<string[]>(), // ordered module IDs
  currentModuleIndex: integer("current_module_index").default(0),
  estimatedDuration: integer("estimated_duration"), // total minutes
  adaptiveWeights: jsonb("adaptive_weights"), // AI-determined importance weights
  learningStyle: varchar("learning_style"), // visual, auditory, kinesthetic
  difficultyProgression: varchar("difficulty_progression").default('adaptive'), // linear, adaptive, accelerated
  completionRate: real("completion_rate").default(0.0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Federated model weights storage
export const modelWeights = pgTable("model_weights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roundId: varchar("round_id").references(() => flRounds.id),
  institutionId: varchar("institution_id").references(() => institutions.id),
  edgeDeviceId: varchar("edge_device_id"),
  weightsHash: varchar("weights_hash").notNull(),
  weightsSize: integer("weights_size"), // bytes
  layerWeights: jsonb("layer_weights"), // serialized model weights
  performance: jsonb("performance"), // local validation metrics
  privacyBudget: real("privacy_budget"), // remaining DP budget
  contributionScore: real("contribution_score"), // quality of contribution
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Student interaction analytics for instructors
export const studentAnalytics = pgTable("student_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  institutionId: varchar("institution_id").references(() => institutions.id),
  moduleId: varchar("module_id").references(() => modules.id),
  timeSpent: integer("time_spent"), // seconds
  interactionCount: integer("interaction_count").default(0),
  errorPatterns: jsonb("error_patterns"), // common mistakes
  learningVelocity: real("learning_velocity"), // concepts/hour
  engagementScore: real("engagement_score"), // 0-1
  difficultyRating: integer("difficulty_rating"), // student's perceived difficulty
  date: timestamp("date").defaultNow(),
});

// Privacy-preserving computation logs
export const privacyLogs = pgTable("privacy_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  institutionId: varchar("institution_id").references(() => institutions.id),
  operation: varchar("operation").notNull(), // 'model_update', 'data_aggregation', 'analytics_compute'
  epsilonUsed: real("epsilon_used"), // differential privacy budget consumed
  noiseLevel: real("noise_level"), // amount of noise added
  dataSubjects: integer("data_subjects"), // number of students affected
  purpose: text("purpose"), // reason for computation
  approvalStatus: varchar("approval_status").default('pending'), // pending, approved, rejected
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const institutionsRelations = relations(institutions, ({ many }) => ({
  users: many(users),
  modelWeights: many(modelWeights),
  studentAnalytics: many(studentAnalytics),
  privacyLogs: many(privacyLogs),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [users.institutionId],
    references: [institutions.id],
  }),
  attempts: many(attempts),
  events: many(events),
  recommendations: many(recommendations),
  masteryStates: many(masteryStates),
  streaks: many(streaks),
  learningPaths: many(learningPaths),
  studentAnalytics: many(studentAnalytics),
  privacyLogs: many(privacyLogs),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  modules: many(modules),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
  quizzes: many(quizzes),
  recommendations: many(recommendations),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  module: one(modules, {
    fields: [quizzes.moduleId],
    references: [modules.id],
  }),
  questions: many(questions),
  attempts: many(attempts),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
}));

export const attemptsRelations = relations(attempts, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [attempts.quizId],
    references: [quizzes.id],
  }),
  user: one(users, {
    fields: [attempts.userId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  user: one(users, {
    fields: [recommendations.userId],
    references: [users.id],
  }),
  module: one(modules, {
    fields: [recommendations.moduleId],
    references: [modules.id],
  }),
}));

export const masteryStatesRelations = relations(masteryStates, ({ one }) => ({
  user: one(users, {
    fields: [masteryStates.userId],
    references: [users.id],
  }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, {
    fields: [streaks.userId],
    references: [users.id],
  }),
}));

export const learningPathsRelations = relations(learningPaths, ({ one }) => ({
  user: one(users, {
    fields: [learningPaths.userId],
    references: [users.id],
  }),
}));

export const modelWeightsRelations = relations(modelWeights, ({ one }) => ({
  round: one(flRounds, {
    fields: [modelWeights.roundId],
    references: [flRounds.id],
  }),
  institution: one(institutions, {
    fields: [modelWeights.institutionId],
    references: [institutions.id],
  }),
}));

export const studentAnalyticsRelations = relations(studentAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [studentAnalytics.userId],
    references: [users.id],
  }),
  institution: one(institutions, {
    fields: [studentAnalytics.institutionId],
    references: [institutions.id],
  }),
  module: one(modules, {
    fields: [studentAnalytics.moduleId],
    references: [modules.id],
  }),
}));

export const privacyLogsRelations = relations(privacyLogs, ({ one }) => ({
  user: one(users, {
    fields: [privacyLogs.userId],
    references: [users.id],
  }),
  institution: one(institutions, {
    fields: [privacyLogs.institutionId],
    references: [institutions.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions, {
  tags: z.array(z.string()).optional(),
  options: z.unknown(), // required and matches unknown
}).omit({
  id: true,
  createdAt: true,
});

export const insertAttemptSchema = createInsertSchema(attempts).omit({
  id: true,
  startedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  timestamp: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
});

export const insertMasteryStateSchema = createInsertSchema(masteryStates).omit({
  id: true,
  updatedAt: true,
});

export const insertInstitutionSchema = createInsertSchema(institutions).omit({
  id: true,
  createdAt: true,
});

export const insertLearningPathSchema = createInsertSchema(learningPaths, {
  moduleSequence: z.array(z.string()).optional(),
  adaptiveWeights: z.any(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModelWeightsSchema = createInsertSchema(modelWeights).omit({
  id: true,
  uploadedAt: true,
});

export const insertStudentAnalyticsSchema = createInsertSchema(studentAnalytics).omit({
  id: true,
  date: true,
});

export const insertPrivacyLogSchema = createInsertSchema(privacyLogs).omit({
  id: true,
  timestamp: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema> & { id?: string };
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Attempt = typeof attempts.$inferSelect;
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type MasteryState = typeof masteryStates.$inferSelect;
export type InsertMasteryState = z.infer<typeof insertMasteryStateSchema>;
export type FLRound = typeof flRounds.$inferSelect;
export type FLClient = typeof flClients.$inferSelect;
export type ServerlessJob = typeof serverlessJobs.$inferSelect;
export type CloudRegion = typeof cloudRegions.$inferSelect;
export type Streak = typeof streaks.$inferSelect;
export type Institution = typeof institutions.$inferSelect;
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;
export type ModelWeights = typeof modelWeights.$inferSelect;
export type InsertModelWeights = z.infer<typeof insertModelWeightsSchema>;
export type StudentAnalytics = typeof studentAnalytics.$inferSelect;
export type InsertStudentAnalytics = z.infer<typeof insertStudentAnalyticsSchema>;
export type PrivacyLog = typeof privacyLogs.$inferSelect;
export type InsertPrivacyLog = z.infer<typeof insertPrivacyLogSchema>;
