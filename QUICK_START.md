# 🚀 DSMS Quick Start Guide

**Get the Disease Surveillance Management System running in 5 minutes!**

## ⚡ TL;DR (Too Long; Didn't Read)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and edit it
cp .env.example .env
# Edit .env with your MySQL password

# 3. Set up database
npm run prisma:generate
npm run prisma:migrate
npm run db:seed

# 4. Run the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📋 Prerequisites Checklist

Before you start, make sure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **MySQL 8.0+** installed ([Download](https://dev.mysql.com/downloads/))
- ✅ **Git** installed (for cloning)

### Quick Check:

```bash
node --version   # Should show v18.0.0 or higher
mysql --version  # Should show 8.0.0 or higher
```

---

## 🎯 Step-by-Step Setup

### Step 1: Clone & Navigate

```bash
git clone <your-repo-url>
cd "Dengue Monitoring System/dengue"
```

### Step 2: Install Dependencies

```bash
npm install
```

⏱️ *This takes 1-2 minutes*

### Step 3: Database Setup

#### A. Create MySQL Database

Open MySQL:
```bash
mysql -u root -p
```

Create database:
```sql
CREATE DATABASE dengue_monitor;
EXIT;
```

#### B. Configure Environment

```bash
# Copy example file
cp .env.example .env
```

Edit `.env` file:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/dengue_monitor"
DB_PASSWORD=YOUR_PASSWORD
JWT_SECRET=change-this-to-random-string
```

⚠️ Replace `YOUR_PASSWORD` with your actual MySQL password!

#### C. Run Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

When prompted for migration name, type: `initial_setup`

#### D. Add Sample Data (Optional)

```bash
npm run db:seed
```

### Step 4: Start Development Server

```bash
npm run dev
```

✅ **Success!** Visit: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Default Login (If Seeded)

| Email | Password | Role |
|-------|----------|------|
| `admin@dsms.gov` | `admin123` | Admin |
| `healthworker@dsms.gov` | `worker123` | Health Worker |

⚠️ **Change these passwords immediately!**

---

## 🎨 Testing Responsive Design

1. Open Chrome DevTools (`F12`)
2. Click device toggle icon (`Ctrl+Shift+M`)
3. Select device:
   - iPhone SE (375px) - Mobile
   - iPad Mini (768px) - Tablet
   - Responsive (1024px+) - Desktop

### What to Check:
- ✅ Sidebar hidden on mobile
- ✅ Hamburger menu works
- ✅ Cards stack properly
- ✅ Forms are touch-friendly
- ✅ No horizontal scroll

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev:socket       # With real-time features

# Database
npm run prisma:studio    # Visual database editor
npm run prisma:migrate   # Run migrations
npm run db:seed          # Seed sample data

# Production
npm run build            # Build for production
npm run start            # Start production server

# Utilities
npm run lint             # Check code quality
```

---

## ⚠️ Troubleshooting

### Port 3000 Already in Use

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

### Can't Connect to Database

1. Check MySQL is running:
   ```bash
   mysql -u root -p
   ```

2. Verify `.env` file has correct credentials

3. Check database exists:
   ```sql
   SHOW DATABASES;
   ```

### Module Not Found Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run dev
```

### Prisma Errors

```bash
# Reset database (⚠️ Deletes all data!)
npx prisma migrate reset

# Then re-run
npm run prisma:migrate
npm run db:seed
```

---

## 📂 Project Structure (Quick Overview)

```
dengue/
├── src/
│   ├── app/           # Pages (Next.js App Router)
│   ├── components/    # React components
│   ├── lib/          # Utilities
│   └── types/        # TypeScript types
├── prisma/
│   └── schema.prisma # Database schema
├── .env              # Your config (DO NOT COMMIT!)
└── package.json      # Dependencies
```

---

## 🎯 Next Steps

1. ✅ Got it running? Great! Now read [README.md](./README.md) for features
2. 📖 Want detailed setup? See [SETUP.md](./SETUP.md)
3. 🤝 Want to contribute? Check [CONTRIBUTING.md](./CONTRIBUTING.md)
4. 🐛 Found a bug? [Report it](../../issues)

---

## 💡 Pro Tips

- 🔄 Use `npm run dev:socket` for real-time alerts
- 🎨 Use Prisma Studio (`npm run prisma:studio`) to view/edit data
- 📱 Test on actual mobile devices for best results
- 🔐 Never commit `.env` file to Git
- 🔑 Change default passwords in production

---

## 🆘 Still Stuck?

1. Check [SETUP.md](./SETUP.md) for detailed instructions
2. Search [existing issues](../../issues)
3. Ask in [Discussions](../../discussions)
4. Email: support@dsms.gov

---

**You're all set! Happy coding! 🚀**

*Last Updated: October 2025*

