# 🚀 Vercel Environment Variables Setup

## Required Environment Variables for Deployment

Add these environment variables in your Vercel project dashboard:

### **1. JWT_SECRET** (Critical)
```
Name: JWT_SECRET
Value: [Generate a secure 32+ character string]
```

**Generate secure JWT_SECRET:**
```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 2: OpenSSL  
openssl rand -base64 32

# Option 3: Manual (32+ characters)
mySecureJWTSecret2024ForDSMSProduction123456
```

### **2. DATABASE_URL** (TiDB Connection)
```
Name: DATABASE_URL
Value: mysql://root:YOUR_PASSWORD@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/YOUR_DATABASE?sslmode=require
```

**Replace:**
- `YOUR_PASSWORD` with your TiDB password
- `YOUR_DATABASE` with your database name (or keep `test` if using default)

### **3. NODE_ENV** (Environment)
```
Name: NODE_ENV
Value: production
```

### **4. NEXT_PUBLIC_APP_URL** (Optional)
```
Name: NEXT_PUBLIC_APP_URL
Value: https://your-app-name.vercel.app
```

### **5. NEXT_PUBLIC_SOCKET_URL** (Required for Real-time Features)
```
Name: NEXT_PUBLIC_SOCKET_URL
Value: https://your-socket-server.onrender.com
```
**Note:** You'll get this URL after deploying your socket server to Render (Step 4 below)

## 📋 Steps to Add in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your `diseases-surveillance-systems` project

2. **Navigate to Environment Variables**
   - Click "Settings" tab
   - Click "Environment Variables" in sidebar

3. **Add Each Variable**
   - Click "Add New"
   - Enter Name and Value
   - Select "Production" environment
   - Click "Save"

4. **Redeploy**
   - Go to "Deployments" tab
   - Click "Redeploy" on latest deployment
   - Or push a new commit to trigger deployment

## ✅ Verification

After adding environment variables and redeploying:
- ✅ Build should complete successfully
- ✅ No JWT_SECRET errors
- ✅ Database connection established
- ✅ Application accessible at your Vercel URL

## 🔧 Troubleshooting

**If deployment still fails:**
1. Check all environment variables are set correctly
2. Verify TiDB connection string format
3. Ensure JWT_SECRET is 32+ characters
4. Check Vercel build logs for specific errors

**Common Issues:**
- Missing JWT_SECRET → Add the environment variable
- Database connection failed → Check DATABASE_URL format
- Build errors → Check application logs in Vercel dashboard
