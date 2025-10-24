# 🚀 DSMS Production Deployment Guide

This guide provides step-by-step instructions for deploying the Disease Surveillance Management System to production.

## 📋 Pre-Deployment Checklist

### ✅ **Required Before Deployment**
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] Production database configured
- [ ] Environment variables set
- [ ] SSL certificate configured
- [ ] Domain name configured
- [ ] Database migrations tested

### ⚠️ **Security Requirements**
- [ ] JWT_SECRET is cryptographically secure
- [ ] Database uses strong credentials
- [ ] HTTPS is enforced
- [ ] Environment variables are secure
- [ ] No sensitive data in code

---

## 🌐 Deployment Options

### 🥇 **Option 1: Vercel (Recommended)**

**Best for:** Quick deployment, automatic scaling, zero configuration

#### Steps:
1. **Connect Repository**
   ```bash
   # Push your code to GitHub (already done)
   git push origin master
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Deploy automatically

3. **Environment Variables in Vercel**
   ```
   DATABASE_URL=mysql://user:pass@host:port/db
   JWT_SECRET=your-32-character-secure-secret
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

4. **Database Options for Vercel**
   - **PlanetScale** (Recommended): Serverless MySQL
   - **Railway**: Full MySQL hosting
   - **AWS RDS**: Enterprise-grade MySQL

---

### 🥈 **Option 2: Railway**

**Best for:** Full-stack deployment with database included

#### Steps:
1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway add mysql
   railway deploy
   ```

3. **Configure Environment**
   Railway will auto-generate `DATABASE_URL`. Add:
   ```
   JWT_SECRET=your-32-character-secure-secret
   NODE_ENV=production
   ```

---

### 🥉 **Option 3: Docker + VPS**

**Best for:** Full control, custom infrastructure

#### Steps:
1. **Build Docker Image**
   ```bash
   docker build -t dsms-app .
   ```

2. **Run with Docker Compose**
   ```bash
   # Copy environment template
   cp env.production.template .env.production
   
   # Edit .env.production with your values
   nano .env.production
   
   # Deploy
   docker-compose up -d
   ```

3. **Configure Reverse Proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl;
       server_name your-domain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

---

## 🔐 Environment Variables Guide

### **Required Variables**
```bash
# Database connection
DATABASE_URL="mysql://username:password@host:port/database"

# JWT secret (CRITICAL - must be secure)
JWT_SECRET="your-super-secure-32-character-secret"

# Environment
NODE_ENV="production"
```

### **Optional Variables**
```bash
# Application URL
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Server port
PORT="3000"

# Individual database config (alternative to DATABASE_URL)
DB_HOST="your-db-host"
DB_PORT="3306"
DB_USER="your-db-user"
DB_PASSWORD="your-db-password"
DB_NAME="your-db-name"
```

### **Generate Secure JWT Secret**
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator (use with caution)
# Visit: https://generate-secret.vercel.app/32
```

---

## 🗄️ Database Setup

### **1. Create Production Database**
```sql
-- Create database
CREATE DATABASE dsms_production;

-- Create user with limited permissions
CREATE USER 'dsms_user'@'%' IDENTIFIED BY 'secure_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON dsms_production.* TO 'dsms_user'@'%';
FLUSH PRIVILEGES;
```

### **2. Run Migrations**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

### **3. Database Providers**

#### **PlanetScale (Recommended for Vercel)**
- Serverless MySQL platform
- Automatic scaling
- Built-in connection pooling
- Free tier available

#### **Railway MySQL**
- Traditional MySQL hosting
- Simple setup
- Good for full-stack deployments

#### **AWS RDS**
- Enterprise-grade MySQL
- High availability
- Automated backups
- Best for large-scale deployments

---

## 🔒 Security Configuration

### **1. HTTPS Setup**
```bash
# For custom domains, use Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

### **2. Environment Security**
- Never commit `.env` files
- Use deployment platform's environment variables
- Rotate secrets regularly
- Use strong database passwords

### **3. Database Security**
- Use dedicated database user
- Limit database permissions
- Enable SSL connections
- Regular security updates

---

## 📊 Monitoring & Maintenance

### **1. Health Checks**
The application includes built-in health checks:
- `/api/database/status` - Database connectivity
- Docker health checks configured

### **2. Logging**
Production logging is configured:
- Structured JSON logs in production
- Error tracking and monitoring
- Performance metrics

### **3. Backup Strategy**
```bash
# Database backup (MySQL)
mysqldump -u username -p database_name > backup.sql

# Automated backups (cron job)
0 2 * * * /usr/bin/mysqldump -u username -p database_name > /backups/dsms_$(date +\%Y\%m\%d).sql
```

---

## 🚨 Troubleshooting

### **Common Issues**

#### **1. Database Connection Failed**
```bash
# Check DATABASE_URL format
mysql://username:password@host:port/database

# Test connection
mysql -h host -P port -u username -p database
```

#### **2. JWT Secret Error**
```bash
# Ensure JWT_SECRET is set and 32+ characters
echo $JWT_SECRET | wc -c
```

#### **3. Build Failures**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### **4. Migration Errors**
```bash
# Reset migrations (CAUTION: Data loss)
npx prisma migrate reset

# Or apply specific migration
npx prisma migrate deploy
```

---

## 📞 Support

### **Getting Help**
- 📚 Check [SETUP.md](./SETUP.md) for detailed setup
- 🐛 Report issues on GitHub
- 💬 Contact: support@dsms.gov

### **Deployment Support**
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Railway**: [Railway Documentation](https://docs.railway.app)
- **Docker**: [Docker Documentation](https://docs.docker.com)

---

## ✅ Post-Deployment Checklist

After successful deployment:
- [ ] Test all major features
- [ ] Verify database connectivity
- [ ] Check authentication flow
- [ ] Test real-time features (Socket.io)
- [ ] Verify SSL certificate
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Update DNS records
- [ ] Test mobile responsiveness
- [ ] Verify environment variables

---

**🎉 Congratulations! Your DSMS is now live in production!**

*Last Updated: October 2025*
