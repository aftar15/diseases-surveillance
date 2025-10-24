import { MySql2Database, drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

// Database connection configuration
// In production, these would come from environment variables
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dengue_monitor',
};

// Global database singleton
let db: MySql2Database | null = null;

// Initialize database connection
export async function initDB() {
  if (db) return db;
  
  try {
    const connection = await mysql.createConnection(connectionConfig);
    db = drizzle(connection);
    console.log('✅ Database connection established');
    return db;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    throw error;
  }
}

// Get database connection (initialize if needed)
export async function getDB(): Promise<MySql2Database> {
  if (!db) {
    return await initDB();
  }
  return db;
} 