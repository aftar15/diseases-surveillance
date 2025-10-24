# 🌱 Production Database Seeding Guide

## 📋 Overview

This guide helps you safely seed your TiDB Cloud production database with initial data including:
- Admin and Health Worker users
- Sample diseases (Dengue, Chikungunya, etc.)
- Sample reports and hotspots
- Initial alerts

## ⚠️ **CRITICAL SAFETY STEPS**

### **Before You Start**
1. **Backup your current .env file**
2. **Never commit production credentials to Git**
3. **Always restore local .env after seeding**

## 🔧 **Step-by-Step Process**

### **Step 1: Backup Your Local Environment**
```bash
# Create backup of your current .env
cp .env .env.backup
```

### **Step 2: Create Production Environment File**
Create a temporary `.env.production` file:
```bash
# Production Database (TiDB Cloud)
DATABASE_URL="mysql://3fyw8AEVqgw7PH5.root:YOUR_TIDB_PASSWORD@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict"

# Secure Production Passwords
ADMIN_PASSWORD="your-super-secure-admin-password-2024"
HEALTH_PASSWORD="your-secure-health-worker-password-2024"

# JWT Secret (same as in Vercel)
JWT_SECRET="your-production-jwt-secret-32-characters"
```

**Replace:**
- `YOUR_TIDB_PASSWORD` with your actual TiDB password
- Use strong, unique passwords for admin and health worker accounts

### **Step 3: Temporarily Switch to Production Database**
```bash
# Copy production environment to .env
cp .env.production .env
```

### **Step 4: Run Database Migrations (if needed)**
```bash
# Generate Prisma client
npx prisma generate

# Deploy migrations to production
npx prisma migrate deploy
```

### **Step 5: Run Seeding**
```bash
# Seed the production database
npm run db:seed
```

**Expected Output:**
```
🌱 Seeding the database...
📊 Database URL: mysql://3fyw8AEVqgw7PH5.root:****@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict
🔐 Using secure passwords from environment variables
✅ Created admin user: admin@example.com
✅ Created health worker: health@example.com
⚠️  Dengue disease not found. Running disease seeding first...
✅ Created 3 sample reports
✅ Created 3 hotspots
✅ Created sample alert
Database seeding completed successfully!
```

### **Step 6: Verify Data in TiDB Cloud**
1. **Login to TiDB Cloud Dashboard**
2. **Go to your cluster → Data App**
3. **Run queries to verify:**
   ```sql
   SELECT * FROM users;
   SELECT * FROM diseases;
   SELECT * FROM reports LIMIT 5;
   SELECT * FROM hotspots;
   SELECT * FROM alerts;
   ```

### **Step 7: Restore Local Environment (CRITICAL)**
```bash
# Restore your local development environment
cp .env.backup .env

# Clean up production file
rm .env.production
```

## 🔐 **Production Credentials**

### **Admin Account**
- **Email:** `admin@example.com`
- **Password:** (Set via `ADMIN_PASSWORD` environment variable)
- **Role:** Admin

### **Health Worker Account**
- **Email:** `health@example.com`
- **Password:** (Set via `HEALTH_PASSWORD` environment variable)
- **Role:** Health Worker

## ✅ **Verification Checklist**

After seeding, verify:
- [ ] Admin user can login to your deployed app
- [ ] Health worker can login
- [ ] Sample diseases appear in disease management
- [ ] Sample reports show on dashboard
- [ ] Hotspots display on map
- [ ] Alerts are visible
- [ ] Local .env restored to development database

## 🚨 **Troubleshooting**

### **Connection Issues**
```bash
# Test connection to TiDB
npx prisma db push --preview-feature
```

### **Migration Issues**
```bash
# Reset migrations (CAUTION: Data loss)
npx prisma migrate reset

# Or deploy specific migration
npx prisma migrate deploy
```

### **Seeding Errors**
```bash
# Check Prisma client generation
npx prisma generate

# Run seeding with verbose output
DEBUG=* npm run db:seed
```

### **Permission Errors**
- Ensure TiDB user has CREATE, INSERT, UPDATE permissions
- Check database name in connection string
- Verify SSL settings

## 🔄 **Re-seeding (If Needed)**

If you need to seed again:
1. **Clear existing data** (optional):
   ```sql
   DELETE FROM alerts;
   DELETE FROM reports;
   DELETE FROM hotspots;
   DELETE FROM users;
   DELETE FROM diseases;
   ```
2. **Follow steps 1-7 again**

## 📝 **Notes**

- **One-time process:** Only run this once per environment
- **Development vs Production:** Always use different passwords
- **Security:** Never commit production credentials
- **Backup:** Consider backing up production data before seeding

---

**⚠️ Remember: Always restore your local .env file after seeding!**
