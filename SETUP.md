# Disease Surveillance Management System (DSMS) - Setup Guide

Complete setup instructions for running the DSMS application locally or in production.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Database Setup](#database-setup)
4. [Running the Application](#running-the-application)
5. [Creating Admin User](#creating-admin-user)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 9.0.0 or higher (comes with Node.js)
- **MySQL** 8.0.0 or higher ([Download](https://dev.mysql.com/downloads/))
- **Git** (for cloning the repository)

### Verify Installation

```bash
node --version    # Should show v18.0.0 or higher
npm --version     # Should show 9.0.0 or higher
mysql --version   # Should show 8.0.0 or higher
```

---

## 📦 Installation Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd "Dengue Monitoring System/dengue"
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15.3.0
- React 19
- Prisma (ORM)
- Tailwind CSS
- Socket.io (real-time features)
- And other dependencies

---

## 🗄️ Database Setup

### 1. Create MySQL Database

Open MySQL command line or your preferred MySQL client:

```sql
CREATE DATABASE dengue_monitor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update with your MySQL credentials:

```env
# Database Configuration
DATABASE_URL="mysql://root:your_password@localhost:3306/dengue_monitor"

# Individual DB Config
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=dengue_monitor

# JWT Secret (IMPORTANT: Change this!)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **Security Warning**: 
- Never commit `.env` file to version control
- Always use a strong, random JWT_SECRET in production
- Use different credentials for development and production

### 3. Run Database Migrations

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run database migrations to create tables:

```bash
npm run prisma:migrate
```

When prompted, enter a migration name (e.g., "initial_setup").

### 4. Seed the Database (Optional)

Populate the database with sample disease and symptom data:

```bash
npm run db:seed
```

This will create:
- Sample diseases (Dengue, Tuberculosis, Diabetes, etc.)
- Associated symptoms for each disease
- Disease-symptom relationships

---

## 🚀 Running the Application

### Development Mode

#### Option 1: Standard Development Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

#### Option 2: With Socket.io Real-Time Features

```bash
npm run dev:socket
```

This starts both the Next.js dev server and Socket.io server for real-time alerts.

### Production Mode

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm run start
```

Or with Socket.io:

```bash
npm run build:socket
npm run start:socket
```

---

## 👤 Creating Admin User

### Using the Database Directly

1. Open MySQL command line:

```bash
mysql -u root -p dengue_monitor
```

2. Create an admin user:

```sql
INSERT INTO users (id, name, email, password, role, created_at, updated_at)
VALUES (
    UUID(),
    'Admin User',
    'admin@dsms.gov',
    '$2a$10$YourHashedPasswordHere',  -- Replace with bcrypt hash
    'admin',
    NOW(),
    NOW()
);
```

### Using bcryptjs to Hash Password

Create a file `hash-password.js`:

```javascript
const bcrypt = require('bcryptjs');
const password = 'YourAdminPassword123!';
const hash = bcrypt.hashSync(password, 10);
console.log('Hashed password:', hash);
```

Run: `node hash-password.js` and use the output in the SQL above.

### Default Login Credentials (If seeded)

If you ran the seed script, you may have default users:

```
Email: admin@dsms.gov
Password: admin123

Email: healthworker@dsms.gov
Password: worker123
```

⚠️ **Change these passwords immediately in production!**

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Port 3000 Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:

Windows:
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Mac/Linux:
```bash
lsof -ti:3000 | xargs kill -9
```

#### 2. Database Connection Failed

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solutions**:
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env` file
- Ensure database `dengue_monitor` exists
- Verify firewall allows port 3306

#### 3. Prisma Migration Errors

**Error**: `Can't reach database server`

**Solutions**:

```bash
# Reset the database (⚠️ WARNING: Deletes all data!)
npx prisma migrate reset

# Or manually drop and recreate
mysql -u root -p -e "DROP DATABASE dengue_monitor; CREATE DATABASE dengue_monitor;"
npm run prisma:migrate
```

#### 4. Module Not Found Errors

**Error**: `Cannot find module './vendor-chunks/@radix-ui.js'`

**Solution**:

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
npm run dev
```

#### 5. Permission Denied (MySQL)

**Error**: `Access denied for user 'root'@'localhost'`

**Solution**:

```sql
-- Grant all privileges
GRANT ALL PRIVILEGES ON dengue_monitor.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🌐 Production Deployment

### Environment Variables for Production

Update your production `.env`:

```env
NODE_ENV=production
DATABASE_URL="mysql://user:password@production-host:3306/dengue_monitor"
JWT_SECRET=<use-a-long-random-string-at-least-64-characters>
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Deployment Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (64+ characters)
- [ ] Enable SSL/TLS for database connection
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Set up firewall rules
- [ ] Use environment-specific `.env` files
- [ ] Enable HTTPS for the application
- [ ] Configure rate limiting

### Recommended Platforms

- **Vercel** (Frontend + Serverless API)
  - Connect GitHub repository
  - Add environment variables
  - Deploy automatically

- **Railway/Render** (Full-stack with MySQL)
  - Deploy Node.js app
  - Provision MySQL database
  - Configure environment variables

- **AWS/GCP/Azure** (Enterprise)
  - EC2/Compute Engine for app
  - RDS/Cloud SQL for database
  - CloudFront/CDN for assets

---

## 📝 Additional Scripts

```bash
# View database in browser
npm run prisma:studio

# Generate Prisma types
npm run prisma:generate

# Check for linting errors
npm run lint

# Run development with Socket.io
npm run dev:socket
```

---

## 🆘 Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review error logs in the console
3. Check Prisma logs: `npx prisma studio`
4. Open an issue on GitHub (if applicable)
5. Contact the development team

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Last Updated**: October 2025
**Version**: 1.0.0

