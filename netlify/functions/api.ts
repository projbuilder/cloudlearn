import serverless from 'serverless-http';
import express, { type Request, Response, NextFunction } from 'express';
import { registerRoutes } from '../../server/routes.js';

// Create Express app
const app = express();

// Basic middleware setup  
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware (simplified for serverless)
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      console.log(logLine);
    }
  });

  next();
});

// Initialize the handler
let handler: any;

async function initHandler() {
  if (!handler) {
    // Register routes (this returns a Server but we just need the app configured)
    await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Create the serverless handler
    handler = serverless(app);
  }
  return handler;
}

// Export the handler function
export const handler = async (event: any, context: any) => {
  const h = await initHandler();
  return h(event, context);
};