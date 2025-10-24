import mysql from 'mysql2/promise';
import { connectionPool } from './index';

// SQL statements for creating the alerts table
const CREATE_ALERTS_TABLE = `
CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  severity ENUM('info', 'warning', 'critical') NOT NULL DEFAULT 'info',
  area_type ENUM('point', 'polygon') NOT NULL DEFAULT 'point',
  area_coordinates JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  expires_at TIMESTAMP NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1
);
`;

// SQL statements for creating indexes
const CREATE_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_is_active ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
`;

// Sample data for initial alerts
const SAMPLE_ALERTS = [
  {
    id: '1',
    title: 'High dengue activity in Downtown',
    message: 'Multiple cases reported in the downtown area over the past week. Take preventive measures.',
    severity: 'warning',
    area_type: 'point',
    area_coordinates: JSON.stringify({ lat: 14.5896, lng: 120.9842 }),
    created_at: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 19).replace('T', ' '), // 2 days ago
    created_by: 'system',
    is_active: 1
  },
  {
    id: '2',
    title: 'Critical outbreak in Eastern District',
    message: 'Significant increase in dengue cases. Authorities are spraying insecticides and urge residents to eliminate standing water.',
    severity: 'critical',
    area_type: 'polygon',
    area_coordinates: JSON.stringify([
      { lat: 14.6041, lng: 120.9822 },
      { lat: 14.6032, lng: 121.0058 },
      { lat: 14.5855, lng: 121.0037 },
      { lat: 14.5864, lng: 120.9801 }
    ]),
    created_at: new Date(Date.now() - 86400000).toISOString().slice(0, 19).replace('T', ' '), // 1 day ago
    created_by: 'system',
    is_active: 1
  },
  {
    id: '3',
    title: 'Preventive measures in Western Zone',
    message: 'No significant cases reported, but residents are advised to take preventive measures due to rainy season.',
    severity: 'info',
    area_type: 'point',
    area_coordinates: JSON.stringify({ lat: 14.5647, lng: 120.9542 }),
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    created_by: 'system',
    expires_at: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 19).replace('T', ' '), // expires in 7 days
    is_active: 1
  }
];

// Function to run migrations
export async function runMigrations() {
  try {
    console.log('Running migrations using connection pool...');
    
    // Database connection configuration for initial setup
    const connectionConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      multipleStatements: true
    };
    
    // First connect without specifying a database to create it if needed
    const initialConnection = await mysql.createConnection({
      host: connectionConfig.host,
      port: connectionConfig.port,
      user: connectionConfig.user,
      password: connectionConfig.password,
      multipleStatements: true
    });
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'dengue_tracker';
    console.log(`Creating database ${dbName} if it doesn't exist...`);
    await initialConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName};`);
    
    // Close initial connection
    await initialConnection.end();
    
    // Use the connection pool for the rest of the operations
    const connection = await connectionPool.getConnection();
    
    try {
      // Create tables
      console.log('Creating alerts table...');
      await connection.query(CREATE_ALERTS_TABLE);
      
      // Create indexes
      console.log('Creating indexes...');
      await connection.query(CREATE_INDEXES);
      
      // Check if alerts table is empty
      const [rows] = await connection.query('SELECT COUNT(*) as count FROM alerts');
      const count = (rows as any)[0].count;
      
      if (count === 0) {
        console.log('Inserting sample alerts...');
        
        // Insert sample alerts
        for (const alert of SAMPLE_ALERTS) {
          const query = `
            INSERT INTO alerts (
              id, title, message, severity, area_type, area_coordinates, 
              created_at, created_by, expires_at, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          const params = [
            alert.id,
            alert.title,
            alert.message,
            alert.severity,
            alert.area_type,
            alert.area_coordinates,
            alert.created_at,
            alert.created_by,
            alert.expires_at || null,
            alert.is_active
          ];
          
          await connection.query(query, params);
        }
      }
      
      console.log('Database migration completed successfully!');
      return true;
    } finally {
      // Release connection back to the pool
      connection.release();
    }
  } catch (error) {
    console.error('Error running migrations:', error);
    return false;
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations().then(success => {
    if (success) {
      console.log('Migration completed successfully.');
      process.exit(0);
    } else {
      console.error('Migration failed.');
      process.exit(1);
    }
  });
} 