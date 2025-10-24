/**
 * All-in-one script to fix login issues
 * 
 * This script will:
 * 1. Connect to your MySQL database
 * 2. Create a test user if needed
 * 3. Update all existing users to use the same password
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

// Database connection configuration from env
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dengue_tracker',
};

// This known working password hash for 'password123'
const WORKING_PASSWORD_HASH = '$2a$10$8hXLWRn8KGb0eSdJvRu1UuEb6ZXsTgWgNS3zotCsVOdOlv3NsJJfK';

// Test user to create
const TEST_USER = {
  id: 'test123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin'
};

async function fixLoginIssues() {
  let connection;
  
  try {
    console.log('🔄 Starting login fix script...');
    console.log('Connecting to MySQL database...');
    
    // First try to connect without specifying database to create it if needed
    try {
      connection = await mysql.createConnection({
        host: connectionConfig.host,
        port: connectionConfig.port,
        user: connectionConfig.user,
        password: connectionConfig.password,
      });
      
      // Check if database exists, create if not
      console.log(`Checking if database "${connectionConfig.database}" exists...`);
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${connectionConfig.database}`);
      
      // Switch to the database
      await connection.changeUser({ database: connectionConfig.database });
      
    } catch (error) {
      console.error('Error creating/switching to database:', error);
      return;
    }
    
    // Check if users table exists, create if not
    console.log('Checking if users table exists...');
    try {
      const [tables] = await connection.execute(`SHOW TABLES LIKE 'users'`);
      
      if (tables.length === 0) {
        console.log('Creating users table...');
        await connection.execute(`
          CREATE TABLE users (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            password VARCHAR(255),
            role ENUM('admin', 'health_worker', 'researcher', 'public') NOT NULL DEFAULT 'public',
            organization VARCHAR(100),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY email_idx (email)
          )
        `);
      }
    } catch (error) {
      console.error('Error checking/creating users table:', error);
    }
    
    // Create test user
    console.log('Creating test user...');
    try {
      // Check if user exists
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [TEST_USER.email]
      );
      
      if (existingUsers.length > 0) {
        console.log(`User ${TEST_USER.email} already exists. Updating password...`);
        
        await connection.execute(
          'UPDATE users SET password = ? WHERE email = ?',
          [WORKING_PASSWORD_HASH, TEST_USER.email]
        );
      } else {
        console.log(`Creating new test user: ${TEST_USER.email}...`);
        
        await connection.execute(
          'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
          [TEST_USER.id, TEST_USER.name, TEST_USER.email, WORKING_PASSWORD_HASH, TEST_USER.role]
        );
      }
    } catch (error) {
      console.error('Error creating/updating test user:', error);
    }
    
    // Update all user passwords
    console.log('Updating all user passwords...');
    try {
      await connection.execute(
        'UPDATE users SET password = ?',
        [WORKING_PASSWORD_HASH]
      );
      
      // Get all users
      const [users] = await connection.execute('SELECT email FROM users');
      
      console.log('✅ All passwords updated successfully!');
      console.log('\nUser accounts (all with password: password123):');
      for (const user of users) {
        console.log(`- ${user.email}`);
      }
    } catch (error) {
      console.error('Error updating passwords:', error);
    }
    
    console.log('\n⭐ LOGIN FIX COMPLETE ⭐');
    console.log('\nYou can now log in with any of these accounts using password: password123');
    console.log('- test@example.com (Admin)');
    console.log('\nIf login still fails:');
    console.log('1. Check server logs for more details');
    console.log('2. Clear browser cookies/localStorage');
    console.log('3. Restart the Next.js server');
    
  } catch (error) {
    console.error('❌ Error running login fix script:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the fix
fixLoginIssues(); 