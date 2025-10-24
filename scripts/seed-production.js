#!/usr/bin/env node

/**
 * Safe Production Database Seeding Script
 * This script helps you safely seed your production database
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🌱 DSMS Production Database Seeding Tool');
console.log('==========================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Please run this script from your project root directory');
  process.exit(1);
}

// Check if .env.backup exists
const envBackupExists = fs.existsSync('.env.backup');
const envExists = fs.existsSync('.env');

console.log('📋 Pre-flight Checks:');
console.log(`   .env file exists: ${envExists ? '✅' : '❌'}`);
console.log(`   .env.backup exists: ${envBackupExists ? '✅' : '⚠️  Will create backup'}`);

// Create backup if it doesn't exist
if (envExists && !envBackupExists) {
  console.log('\n💾 Creating backup of current .env file...');
  fs.copyFileSync('.env', '.env.backup');
  console.log('✅ Backup created: .env.backup');
}

// Check if .env.production exists
if (!fs.existsSync('.env.production')) {
  console.log('\n❌ Error: .env.production file not found!');
  console.log('📝 Please create .env.production with your TiDB Cloud credentials:');
  console.log(`
DATABASE_URL="mysql://user:password@host:port/database?sslaccept=strict"
ADMIN_PASSWORD="your-secure-admin-password"
HEALTH_PASSWORD="your-secure-health-password"
JWT_SECRET="your-jwt-secret"
  `);
  process.exit(1);
}

// Confirm with user
console.log('\n⚠️  WARNING: This will seed your PRODUCTION database!');
console.log('📊 This will create:');
console.log('   - Admin user (admin@example.com)');
console.log('   - Health worker (health@example.com)');
console.log('   - Sample diseases, reports, and alerts');
console.log('\n🔄 Process:');
console.log('   1. Switch to production database');
console.log('   2. Run migrations');
console.log('   3. Seed data');
console.log('   4. Restore local environment');

// Simple confirmation (in a real CLI tool, you'd use a proper prompt library)
console.log('\n⏳ Starting in 5 seconds... Press Ctrl+C to cancel');

// Wait 5 seconds
setTimeout(() => {
  try {
    console.log('\n🔄 Step 1: Switching to production environment...');
    fs.copyFileSync('.env.production', '.env');
    console.log('✅ Switched to production database');

    console.log('\n🔄 Step 2: Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('\n🔄 Step 3: Deploying migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    console.log('\n🔄 Step 4: Seeding database...');
    execSync('npm run db:seed', { stdio: 'inherit' });

    console.log('\n🔄 Step 5: Restoring local environment...');
    if (fs.existsSync('.env.backup')) {
      fs.copyFileSync('.env.backup', '.env');
      console.log('✅ Restored local development environment');
    }

    console.log('\n🎉 Production seeding completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Verify data in TiDB Cloud dashboard');
    console.log('   2. Test login with admin@example.com');
    console.log('   3. Deploy your app to Vercel');

  } catch (error) {
    console.error('\n❌ Error during seeding:', error.message);
    
    // Try to restore environment
    if (fs.existsSync('.env.backup')) {
      fs.copyFileSync('.env.backup', '.env');
      console.log('🔄 Restored local environment after error');
    }
    
    process.exit(1);
  }
}, 5000);

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n🛑 Seeding cancelled by user');
  
  // Restore environment if needed
  if (fs.existsSync('.env.backup') && fs.existsSync('.env.production')) {
    const currentEnv = fs.readFileSync('.env', 'utf8');
    const productionEnv = fs.readFileSync('.env.production', 'utf8');
    
    if (currentEnv === productionEnv) {
      fs.copyFileSync('.env.backup', '.env');
      console.log('🔄 Restored local environment');
    }
  }
  
  process.exit(0);
});
