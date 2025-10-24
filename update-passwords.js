/**
 * Root script to update user password hashes in the database
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Database connection configuration from env
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dengue_tracker',
};

// Password bcrypt hash for 'password123'
// This is a pre-computed hash for faster execution
const PASSWORD_HASH = '$2a$10$8hXLWRn8KGb0eSdJvRu1UuEb6ZXsTgWgNS3zotCsVOdOlv3NsJJfK';

async function updatePasswords() {
  let connection;
  
  try {
    console.log('Connecting to MySQL database...');
    connection = await mysql.createConnection(connectionConfig);
    
    // Fetch all users
    console.log('Fetching users from database...');
    const [users] = await connection.execute('SELECT id, email FROM users');
    
    if (!users.length) {
      console.log('No users found in the database.');
      return;
    }
    
    console.log(`Found ${users.length} users to update.`);
    
    // Update each user's password
    for (const user of users) {
      console.log(`Updating password for ${user.email} (ID: ${user.id})...`);
      
      await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [PASSWORD_HASH, user.id]
      );
    }
    
    console.log('✅ All passwords updated successfully!');
    console.log('\nTest accounts (all with password: password123):');
    for (const user of users) {
      console.log(`- ${user.email}`);
    }
    
  } catch (error) {
    console.error('❌ Error updating passwords:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the update
updatePasswords(); 