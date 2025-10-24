/**
 * Database Setup Script for Dengue Monitoring System
 * 
 * This script will:
 * 1. Create the database if it doesn't exist
 * 2. Create all required tables
 * 3. Add indexes for performance
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

// Database connection configuration from env
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

const dbName = process.env.DB_NAME || 'dengue_tracker';

// SQL statements for creating tables
const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255),
  role ENUM('admin', 'health_worker', 'researcher', 'public') NOT NULL DEFAULT 'public',
  organization VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY email_idx (email)
);
`;

const CREATE_REPORTS_TABLE = `
CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(36) PRIMARY KEY,
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  symptoms JSON NOT NULL,
  report_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'validated', 'rejected') NOT NULL DEFAULT 'pending',
  notes TEXT,
  submitted_by VARCHAR(36),
  validated_by VARCHAR(36),
  validated_at TIMESTAMP NULL,
  location_address VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX status_idx (status),
  INDEX location_idx (latitude, longitude),
  INDEX date_idx (report_date)
);
`;

const CREATE_HOTSPOTS_TABLE = `
CREATE TABLE IF NOT EXISTS hotspots (
  id VARCHAR(36) PRIMARY KEY,
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  intensity DOUBLE NOT NULL,
  report_count INT NOT NULL DEFAULT 0,
  radius DOUBLE NOT NULL DEFAULT 500,
  start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX location_idx (latitude, longitude),
  INDEX active_idx (is_active)
);
`;

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
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  INDEX severity_idx (severity),
  INDEX active_idx (is_active)
);
`;

const CREATE_REPORT_HOTSPOTS_TABLE = `
CREATE TABLE IF NOT EXISTS report_hotspots (
  report_id VARCHAR(36) NOT NULL,
  hotspot_id VARCHAR(36) NOT NULL,
  relation_strength DOUBLE NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (report_id, hotspot_id),
  INDEX report_idx (report_id),
  INDEX hotspot_idx (hotspot_id)
);
`;

// Function to run migrations
async function runMigrations() {
  // Connect to MySQL
  let connection;
  try {
    console.log('Connecting to MySQL server...');
    
    // First connect without specifying a database to create it if needed
    connection = await mysql.createConnection(connectionConfig);
    
    // Create database if it doesn't exist
    console.log(`Creating database ${dbName} if it doesn't exist...`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    
    // Switch to the database
    console.log(`Switching to database ${dbName}...`);
    await connection.changeUser({ database: dbName });
    
    // Create tables
    console.log('Creating users table...');
    await connection.execute(CREATE_USERS_TABLE);
    
    console.log('Creating reports table...');
    await connection.execute(CREATE_REPORTS_TABLE);
    
    console.log('Creating hotspots table...');
    await connection.execute(CREATE_HOTSPOTS_TABLE);
    
    console.log('Creating alerts table...');
    await connection.execute(CREATE_ALERTS_TABLE);
    
    console.log('Creating report-hotspots relationship table...');
    await connection.execute(CREATE_REPORT_HOTSPOTS_TABLE);
    
    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the migrations
runMigrations(); 