/**
 * Simple script to run the database setup from the project root
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('Starting database setup...');

try {
  // Navigate to the scripts directory and run the setup
  const scriptsDir = path.join(__dirname, 'scripts');
  
  console.log('Installing dependencies...');
  execSync('npm install', { 
    cwd: scriptsDir,
    stdio: 'inherit' 
  });
  
  console.log('Running database setup script...');
  execSync('npm run setup-db', { 
    cwd: scriptsDir,
    stdio: 'inherit' 
  });
  
  console.log('✅ Database setup completed successfully!');
} catch (error) {
  console.error('❌ Error setting up database:', error.message);
  process.exit(1);
} 