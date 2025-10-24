# Disease Surveillance Management System (DSMS)

A comprehensive real-time web application for monitoring and managing disease outbreaks, built with Next.js, React, and MySQL.

![Next.js](https://img.shields.io/badge/Next.js-15.3.0-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.6.0-2D3748)

## 🌟 Features

### Core Functionality
- **📊 Real-Time Disease Monitoring** - Track disease cases with live updates
- **🗺️ Interactive Mapping** - Visualize disease hotspots with heatmaps
- **📝 Anonymous Reporting** - Public can report disease symptoms anonymously
- **🔔 Alert System** - Real-time health alerts via Socket.io
- **📈 Analytics Dashboard** - Comprehensive data visualization and trends
- **👥 Role-Based Access Control** - Admin, Health Worker, Researcher, Public roles
- **🦟 Multi-Disease Tracking** - Monitor both communicable and non-communicable diseases

### Responsive Design
- ✅ **Mobile-First Approach** - Optimized for 320px to 1440px+ screens
- ✅ **Adaptive Layouts** - Elements rearrange intelligently across devices
- ✅ **Touch-Friendly** - 44px minimum touch targets on mobile
- ✅ **Progressive Enhancement** - Enhanced shadow/depth system for visual hierarchy

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- MySQL 8.0.0 or higher
- npm 9.0.0 or higher

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd "Dengue Monitoring System/dengue"

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your MySQL credentials

# 4. Set up database
npm run prisma:generate
npm run prisma:migrate
npm run db:seed  # Optional: adds sample data

# 5. Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

📖 **For detailed setup instructions, see [SETUP.md](./SETUP.md)**

## 📱 Responsive Breakpoints

The application is optimized for the following screen sizes:

| Device | Breakpoint | Features |
|--------|-----------|----------|
| Small Mobile | 320px - 639px | Single column, hamburger menu, compact cards |
| Mobile | 640px - 767px | 2-column grids, larger touch targets |
| Tablet | 768px - 1023px | Expanded layouts, visible search |
| Desktop | 1024px+ | Sidebar visible, 4-column grids, full features |

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15.3.0 (App Router)
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS 4.0
- **Components**: Radix UI, Shadcn UI
- **Animations**: Framer Motion
- **Charts**: Chart.js, Recharts
- **Maps**: Leaflet, Mapbox GL JS

### Backend
- **Runtime**: Node.js
- **Database**: MySQL 8.0+
- **ORM**: Prisma 6.6.0
- **Real-time**: Socket.io
- **Authentication**: JWT, bcryptjs
- **Validation**: Zod, React Hook Form

## 📁 Project Structure

```
dengue/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   ├── ui/          # Base UI components (Shadcn)
│   │   ├── forms/       # Form components
│   │   ├── layout/      # Layout components
│   │   └── maps/        # Map components
│   ├── lib/             # Utilities and configs
│   ├── hooks/           # Custom React hooks
│   ├── contexts/        # React contexts
│   └── types/           # TypeScript types
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeding
└── public/              # Static assets
```

## 🔐 Authentication & Roles

The system supports four user roles:

- **Admin** - Full system access, user management
- **Health Worker** - Report validation, alert creation
- **Researcher** - Read-only access to analytics
- **Public** - Anonymous disease reporting

## 🗄️ Database Schema

Key tables:
- `users` - User accounts with role-based access
- `diseases` - Disease types (communicable/non-communicable)
- `symptoms` - Disease symptoms
- `reports` - Public disease reports
- `alerts` - Health alerts with geospatial data
- `hotspots` - Generated disease clusters

See [Prisma Schema](./prisma/schema.prisma) for complete details.

## 🔄 Real-Time Features

The application uses Socket.io for:
- Live disease case updates
- Real-time health alerts
- Instant report notifications
- Live analytics updates

### Running with Real-Time Features

```bash
npm run dev:socket    # Development
npm run start:socket  # Production
```

## 🛠️ Available Scripts

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
npm run prisma:studio  # Open Prisma Studio (database GUI)
npm run prisma:migrate # Run database migrations
npm run db:seed        # Seed database with sample data
```

## 🧪 Testing the Responsive Design

1. Open Chrome DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Test these viewports:
   - iPhone SE (375px)
   - iPad Mini (768px)
   - Desktop (1024px+)

Key features to test:
- ✅ Sidebar hidden on mobile, visible on desktop
- ✅ Mobile navigation via hamburger menu
- ✅ Cards stack properly on mobile
- ✅ Forms are touch-friendly
- ✅ No horizontal scrolling

## 📝 Environment Variables

Required environment variables (see `.env.example`):

```env
DATABASE_URL           # MySQL connection string
DB_HOST               # MySQL host
DB_PORT               # MySQL port (default: 3306)
DB_USER               # MySQL username
DB_PASSWORD           # MySQL password
DB_NAME               # Database name
JWT_SECRET            # JWT signing secret
NODE_ENV              # development/production
NEXT_PUBLIC_APP_URL   # Application URL
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Other Platforms
- Railway - Full-stack with MySQL
- Render - Node.js + MySQL
- AWS/GCP/Azure - Enterprise deployment

See [SETUP.md](./SETUP.md#production-deployment) for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- 📚 [Setup Guide](./SETUP.md)
- 🐛 [Report Issues](../../issues)
- 💬 Contact: support@dsms.gov

## 📊 Responsive UI Features

Based on the principles from `uienhancement.md`:

### Box-Based Layouts
Every design starts as a system of boxes with clear relationships and natural balance for inherent flexibility.

### Shadow & Depth System
- **Color Layering**: 4-level elevation system
- **Dual Shadows**: Light (top) + dark (bottom) for realistic depth
- **Light from Above**: Simulates natural lighting with lighter-on-top gradients

### Progressive Enhancement
- Elements shift, flow, and reprioritize across breakpoints
- Maintains clarity and rhythm at all screen sizes
- Color contrast alone separates elements (minimal borders)

---

**Built with ❤️ for Public Health**

**Ministry of Health - Disease Surveillance Division**

*Last Updated: October 2025*
