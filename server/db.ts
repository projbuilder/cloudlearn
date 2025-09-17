import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let db: any = null;
let pool: Pool | null = null;
let dbConnected = false;

// Initialize database connection with fallback handling
async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set. Running with in-memory storage fallback.");
    return;
  }

  try {
    console.log("Attempting to connect to database...");
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000 // 5 second timeout
    });
    
    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    db = drizzle({ client: pool, schema });
    dbConnected = true;
    console.log("Database connection successful");
  } catch (error: any) {
    console.warn("Database connection failed, using in-memory storage fallback:", error?.message || error);
    dbConnected = false;
    db = null;
    if (pool) {
      pool.end();
      pool = null;
    }
  }
}

// Initialize on module load
initializeDatabase().catch(console.error);

export { db, pool, dbConnected };