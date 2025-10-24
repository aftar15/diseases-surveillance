# 🚀 Deploy Socket Server to Render (Free)

## 📋 Prerequisites
- GitHub account
- Render account (free): https://render.com

## 🔧 Step-by-Step Deployment

### **Step 1: Create Separate Repository for Socket Server**

1. **Create new GitHub repository**
   - Name: `dsms-socket-server`
   - Make it public (required for Render free tier)

2. **Upload socket server files**
   - Copy the entire `socket-server` folder contents
   - Upload: `package.json`, `server.js`, `.env.example`

### **Step 2: Deploy to Render**

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Select "Build and deploy from a Git repository"
   - Connect your `dsms-socket-server` repository

3. **Configure Service**
   ```
   Name: dsms-socket-server
   Region: Oregon (US West) - Free tier
   Branch: main
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Set Environment Variables**
   ```
   PORT: 10000 (Render's default)
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)

### **Step 3: Get Your Socket Server URL**

After deployment, you'll get a URL like:
```
https://dsms-socket-server.onrender.com
```

### **Step 4: Update Vercel Environment Variables**

Add this to your Vercel project:
```
NEXT_PUBLIC_SOCKET_URL=https://dsms-socket-server.onrender.com
```

### **Step 5: Update Socket Server CORS**

In your `server.js`, update the CORS origin:
```javascript
origin: [
  "http://localhost:3000",
  "https://your-actual-vercel-app.vercel.app", // Your real Vercel URL
  /\.vercel\.app$/, // Allow any Vercel subdomain
]
```

## ✅ Testing

1. **Test Socket Server Health**
   ```
   https://your-socket-server.onrender.com/health
   ```

2. **Test in Your App**
   - Deploy your Next.js app to Vercel
   - Check browser console for socket connection
   - Test real-time features

## 🔧 Troubleshooting

**Common Issues:**
- **CORS errors**: Update CORS origins in server.js
- **Connection failed**: Check NEXT_PUBLIC_SOCKET_URL in Vercel
- **Server sleeping**: Render free tier sleeps after 15min inactivity

**Render Free Tier Limitations:**
- Service sleeps after 15 minutes of inactivity
- 750 hours/month (enough for testing)
- Cold start delay when waking up

## 💡 Alternative: Quick Deploy Button

You can also use this one-click deploy:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Just point it to your socket server repository.
