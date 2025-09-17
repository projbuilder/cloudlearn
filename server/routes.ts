import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { federatedLearningService } from "./services/federated-learning";
import { contentService } from "./services/content-service";
import { quizService } from "./services/quiz-service";
import { aiTutorService } from "./services/ai-tutor";
import { analyticsService } from "./services/analytics";
import {
  insertCourseSchema,
  insertModuleSchema,
  insertQuizSchema,
  insertAttemptSchema,
  insertEventSchema,
  insertRecommendationSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Add logout endpoint
  app.get('/api/logout', async (req, res) => {
    // Clear the authentication cookie
    res.clearCookie('connect.sid', { path: '/' });
    // Redirect to the landing page
    res.redirect('/');
  });

  // Course routes
  app.get('/api/courses', isAuthenticated, async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', isAuthenticated, async (req, res) => {
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

  app.post('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      // Only admins and instructors can create courses
      if (!['admin', 'instructor'].includes(req.user.claims.role)) {
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

  // Module routes
  app.get('/api/courses/:courseId/modules', isAuthenticated, async (req, res) => {
    try {
      const modules = await storage.getModulesByCourse(req.params.courseId);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  app.get('/api/modules/:id', isAuthenticated, async (req, res) => {
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

  // Quiz routes
  app.get('/api/modules/:moduleId/quizzes', isAuthenticated, async (req, res) => {
    try {
      const quizzes = await storage.getQuizzesByModule(req.params.moduleId);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.get('/api/quizzes/:id', isAuthenticated, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      const questions = await storage.getQuestionsByQuiz(quiz.id);
      res.json({ ...quiz, questions });
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  app.post('/api/quizzes/:id/generate', isAuthenticated, async (req: any, res) => {
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

  // Attempt routes
  app.post('/api/quizzes/:id/attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attemptData = {
        ...insertAttemptSchema.parse(req.body),
        userId,
        quizId: req.params.id,
        completedAt: new Date(),
      };

      const attempt = await storage.createAttempt(attemptData);

      // Update mastery states based on attempt
      await quizService.updateMasteryFromAttempt(attempt);

      // Log event
      await storage.createEvent({
        userId,
        type: 'quiz_complete',
        payload: {
          quizId: req.params.id,
          score: attempt.score,
          correctAnswers: attempt.correctAnswers,
          totalQuestions: attempt.totalQuestions,
        },
      });

      res.status(201).json(attempt);
    } catch (error) {
      console.error("Error creating attempt:", error);
      res.status(400).json({ message: "Invalid attempt data" });
    }
  });

  app.get('/api/users/:userId/attempts', isAuthenticated, async (req, res) => {
    try {
      const attempts = await storage.getAttemptsByUser(req.params.userId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching attempts:", error);
      res.status(500).json({ message: "Failed to fetch attempts" });
    }
  });

  // Recommendation routes
  app.get('/api/users/:userId/recommendations', isAuthenticated, async (req, res) => {
    try {
      const recommendations = await storage.getRecommendationsByUser(req.params.userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.post('/api/users/:userId/recommendations/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const { privacyLevel } = req.body;

      const recommendations = await analyticsService.generateRecommendations(userId, privacyLevel);
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Mastery routes
  app.get('/api/users/:userId/mastery', isAuthenticated, async (req, res) => {
    try {
      const masteryStates = await storage.getMasteryStatesByUser(req.params.userId);
      res.json(masteryStates);
    } catch (error) {
      console.error("Error fetching mastery states:", error);
      res.status(500).json({ message: "Failed to fetch mastery states" });
    }
  });

  // AI Tutor routes
  app.post('/api/tutor/chat', isAuthenticated, async (req: any, res) => {
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

  // Federated Learning routes
  app.get('/api/fl/rounds', isAuthenticated, async (req: any, res) => {
    try {
      // Only admins can view FL data
      if (req.user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const rounds = await storage.getFLRounds();
      res.json(rounds);
    } catch (error) {
      console.error("Error fetching FL rounds:", error);
      res.status(500).json({ message: "Failed to fetch FL rounds" });
    }
  });

  app.post('/api/fl/rounds', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.claims.role !== 'admin') {
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

  app.get('/api/fl/clients', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const clients = await storage.getFLClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching FL clients:", error);
      res.status(500).json({ message: "Failed to fetch FL clients" });
    }
  });

  // Cloud Operations routes
  app.get('/api/cloud/regions', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const regions = await storage.getCloudRegions();
      res.json(regions);
    } catch (error) {
      console.error("Error fetching cloud regions:", error);
      res.status(500).json({ message: "Failed to fetch cloud regions" });
    }
  });

  app.patch('/api/cloud/regions/:id', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status, latency, load } = req.body;
      const region = await storage.updateCloudRegion(req.params.id, {
        status,
        latency,
        load,
      });

      res.json(region);
    } catch (error) {
      console.error("Error updating cloud region:", error);
      res.status(500).json({ message: "Failed to update cloud region" });
    }
  });

  app.get('/api/cloud/jobs', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const jobs = await storage.getServerlessJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching serverless jobs:", error);
      res.status(500).json({ message: "Failed to fetch serverless jobs" });
    }
  });

  app.post('/api/cloud/jobs/:id/invoke', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.claims.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const job = await storage.updateServerlessJob(req.params.id, {
        status: 'running',
        lastInvocation: new Date(),
      });

      // Simulate job execution
      setTimeout(async () => {
        await storage.updateServerlessJob(req.params.id, {
          status: 'completed',
        });
      }, 5000);

      res.json(job);
    } catch (error) {
      console.error("Error invoking serverless job:", error);
      res.status(500).json({ message: "Failed to invoke serverless job" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/dashboard/:userId', isAuthenticated, async (req, res) => {
    try {
      const analytics = await analyticsService.getDashboardAnalytics(req.params.userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Streak routes
  app.get('/api/users/:userId/streak', isAuthenticated, async (req, res) => {
    try {
      const streak = await storage.getStreakByUser(req.params.userId);
      res.json(streak);
    } catch (error) {
      console.error("Error fetching streak:", error);
      res.status(500).json({ message: "Failed to fetch streak" });
    }
  });

  // Event routes
  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = {
        ...insertEventSchema.parse(req.body),
        userId,
      };

      const event = await storage.createEvent(eventData);

      // Broadcast event to WebSocket clients if needed
      if (event.type === 'quiz_complete' || event.type === 'module_complete') {
        broadcastToUser(userId, 'event', event);
      }

      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const userConnections = new Map<string, Set<WebSocket>>();

  wss.on('connection', (ws: WebSocket, req: any) => {
    let userId: string | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'auth') {
          userId = message.userId;
          if (userId) {
            if (!userConnections.has(userId)) {
              userConnections.set(userId, new Set());
            }
            userConnections.get(userId)!.add(ws);

            ws.send(JSON.stringify({ type: 'auth_success', userId }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId && userConnections.has(userId)) {
        userConnections.get(userId)!.delete(ws);
        if (userConnections.get(userId)!.size === 0) {
          userConnections.delete(userId);
        }
      }
    });
  });

  function broadcastToUser(userId: string, type: string, data: any) {
    const connections = userConnections.get(userId);
    if (connections) {
      const message = JSON.stringify({ type, data });
      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  }

  // Seed data on startup
  await seedInitialData();

  return httpServer;
}

async function seedInitialData() {
  try {
    // Check if database is available
    const courses = await storage.getCourses();
    if (courses.length === 0) {
      console.log('Seeding initial courses...');

      const mathCourse = await storage.createCourse({
        title: "Algebra & Trigonometry",
        subject: "Mathematics",
        description: "Comprehensive algebra and trigonometry course from OpenStax",
      });

      const csCourse = await storage.createCourse({
        title: "Computer Science Fundamentals",
        subject: "Computer Science",
        description: "Introduction to programming and computer science concepts",
      });

      // Seed modules for math course
      await storage.createModule({
        courseId: mathCourse.id,
        title: "Linear Equations",
        order: 1,
        summary: "Solving linear equations and systems",
        content: "# Linear Equations\n\nLearn to solve linear equations step by step...",
        difficulty: 2,
        estimatedTime: 45,
      });

      await storage.createModule({
        courseId: mathCourse.id,
        title: "Quadratic Functions",
        order: 2,
        summary: "Understanding quadratic functions and their graphs",
        content: "# Quadratic Functions\n\nExplore quadratic relationships...",
        difficulty: 3,
        estimatedTime: 60,
      });

      // Seed modules for CS course
      await storage.createModule({
        courseId: csCourse.id,
        title: "Python Basics",
        order: 1,
        summary: "Introduction to Python programming",
        content: "# Python Basics\n\nLearn Python fundamentals...",
        difficulty: 1,
        estimatedTime: 30,
      });

      console.log('Initial courses and modules seeded successfully');
    }

    // Seed cloud regions
    const regions = await storage.getCloudRegions();
    if (regions.length === 0) {
      console.log('Seeding cloud regions...');

      await storage.updateCloudRegion('1', {
        name: 'us-east-1',
        displayName: 'US-East-1',
        status: 'healthy',
        latency: 23,
        load: 67,
        activeUsers: 1247,
        workerNodes: 5,
      });

      console.log('Cloud regions seeded successfully');
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Database seeding failed - this is expected in development without database access:', errorMessage);
    console.log('The application will continue to run without seeded data');
  }
}