/**
 * Script to install necessary dependencies for authentication
 */

const { execSync } = require('child_process');

console.log('Installing authentication dependencies...');

try {
  execSync('npm install bcryptjs jsonwebtoken mysql2', { 
    stdio: 'inherit' 
  });
  
  console.log('✅ Dependencies installed successfully!');
  
  console.log('\nNow you can run the application with:');
  console.log('npm run dev');
  
  console.log('\nLogin with credentials from the database:');
  console.log('- Public User: public@example.com / password123');
  console.log('- Health Worker: worker@health.gov / password123');
  console.log('- Admin: admin@denguetrack.org / password123');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
} 