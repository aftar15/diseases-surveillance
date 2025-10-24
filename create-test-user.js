/**
 * Root script to create a test user in the database
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

// This is the same hash used in mock-db.ts
const TEST_USER = {
  id: 'test123',
  email: 'test@example.com',
  name: 'Test User',
  password: '$2a$10$8hXLWRn8KGb0eSdJvRu1UuEb6ZXsTgWgNS3zotCsVOdOlv3NsJJfK', // password123
  role: 'admin'
};

async function createTestUser() {
  let connection;
  
  try {
    console.log('Connecting to MySQL database...');
    connection = await mysql.createConnection(connectionConfig);
    
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [TEST_USER.email]
    );
    
    if (existingUsers.length > 0) {
      console.log(`User ${TEST_USER.email} already exists. Updating password...`);
      
      await connection.execute(
        'UPDATE users SET password = ? WHERE email = ?',
        [TEST_USER.password, TEST_USER.email]
      );
    } else {
      console.log(`Creating new test user: ${TEST_USER.email}...`);
      
      await connection.execute(
        'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [TEST_USER.id, TEST_USER.name, TEST_USER.email, TEST_USER.password, TEST_USER.role]
      );
    }
    
    console.log('✅ Test user created successfully!');
    console.log('\nTest account credentials:');
    console.log(`- Email: ${TEST_USER.email}`);
    console.log('- Password: password123');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
createTestUser(); 