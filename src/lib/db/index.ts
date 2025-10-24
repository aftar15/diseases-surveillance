import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
// Import specific schema elements instead of the entire schema
import { users, reports, hotspots, alerts as schemaAlerts, reportHotspots } from './schema';
// Import the Prisma client instance (exported as db)
import { db } from '../db';

// Rename the imported schema for clarity
const schema = { users, reports, hotspots, alerts: schemaAlerts, reportHotspots };

// Database connection configuration
// In production, these would be environment variables
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dengue_tracker',
};

// Create MySQL connection pool
export const connectionPool = mysql.createPool(connectionConfig);

// Create drizzle instance with the connection and schema
export const drizzleDb = drizzle(connectionPool, { schema, mode: 'default' });

// Helper function to test database connection
export async function testDatabaseConnection() {
  try {
    const connection = await connectionPool.getConnection();
    console.log('Successfully connected to the database');
    connection.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    return false;
  }
}

// Re-export the Prisma client (imported as db)
export { db };
// Export schema tables with explicit names to avoid conflicts
export { 
  users, 
  reports, 
  hotspots, 
  schemaAlerts as alerts, 
  reportHotspots 
}; 