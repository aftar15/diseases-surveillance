import { PrismaClient, ReportStatus, UserRole, AlertSeverity, AreaType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const saltRounds = 10;

async function main() {
  console.log('🌱 Seeding the database...');
  console.log('📊 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')); // Hide password in logs

  // Hash passwords - use environment variables for production
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const healthPassword = process.env.HEALTH_PASSWORD || 'health123';
  
  const adminPasswordHash = bcrypt.hashSync(adminPassword, saltRounds);
  const healthPasswordHash = bcrypt.hashSync(healthPassword, saltRounds);
  
  console.log('🔐 Using secure passwords from environment variables');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.admin,
      password: adminPasswordHash,
    },
  });

  // Create health worker
  const healthWorker = await prisma.user.upsert({
    where: { email: 'health@example.com' },
    update: {},
    create: {
      email: 'health@example.com',
      name: 'Health Worker',
      role: UserRole.health_worker,
      password: healthPasswordHash,
    },
  });

  // Get Dengue disease for sample reports (assuming it exists from disease seeding)
  let dengueDisease;
  try {
    dengueDisease = await prisma.disease.findFirst({
      where: { name: 'Dengue' }
    });
    
    if (!dengueDisease) {
      console.log('⚠️  Dengue disease not found. Running disease seeding first...');
      // Import and run disease seeding
      const { seedSimpleDiseases } = require('./simple-disease-seeds.js');
      await seedSimpleDiseases();
      
      dengueDisease = await prisma.disease.findFirst({
        where: { name: 'Dengue' }
      });
    }
  } catch (error) {
    console.log('⚠️  Disease table not found or error occurred. Skipping report seeding...');
    console.log('Please run disease seeding separately: node prisma/simple-disease-seeds.js');
  }

  // Create sample reports only if dengue disease exists
  if (dengueDisease) {
    console.log('Creating sample reports...');
    const reports = [
      {
        reporterName: 'John Doe',
        reporterNumber: '+63-123-456-7890',
        latitude: 9.7813, 
        longitude: 125.4943,
        diseaseId: dengueDisease.id,
        symptoms: JSON.stringify(['fever']),
        reportDate: new Date('2023-04-15'),
        status: ReportStatus.pending,
        notes: 'Patient reports having traveled to a dengue hotspot in the last 2 weeks.'
      },
      {
        reporterName: 'Jane Smith',
        reporterNumber: '+63-987-654-3210',
        latitude: 9.8102, 
        longitude: 125.5281,
        diseaseId: dengueDisease.id,
        symptoms: JSON.stringify(['fever', 'headache', 'muscle pain']),
        reportDate: new Date('2023-04-10'),
        status: ReportStatus.validated,
        validatedBy: admin.id,
        validatedAt: new Date('2023-04-12'),
        notes: 'Patient confirmed to have dengue NS1 antigen.'
      },
      {
        reporterName: 'Bob Johnson',
        reporterNumber: '+63-555-123-4567',
        latitude: 9.7452, 
        longitude: 125.5011,
        diseaseId: dengueDisease.id,
        symptoms: JSON.stringify(['fever', 'rash']),
        reportDate: new Date('2023-04-08'),
        status: ReportStatus.rejected,
        validatedBy: healthWorker.id,
        validatedAt: new Date('2023-04-09'),
        notes: 'Patient diagnosed with common flu, not dengue.'
      }
    ];

    for (const report of reports) {
      await prisma.report.create({
        data: report
      });
    }
    console.log(`✅ Created ${reports.length} sample reports`);
  }

  // Create sample hotspots
  const hotspots = [
    {
      latitude: 9.7813,
      longitude: 125.4943,
      intensity: 0.7,
      reportCount: 5,
      lastReportDate: new Date('2023-04-15')
    },
    {
      latitude: 9.8102,
      longitude: 125.5281,
      intensity: 0.9,
      reportCount: 12,
      lastReportDate: new Date('2023-04-14')
    },
    {
      latitude: 9.7452,
      longitude: 125.5011,
      intensity: 0.5,
      reportCount: 3,
      lastReportDate: new Date('2023-04-10')
    }
  ];

  for (const hotspot of hotspots) {
    await prisma.hotspot.create({
      data: hotspot
    });
  }

  // Create sample alert
  await prisma.alert.create({
    data: {
      title: 'Disease Outbreak Alert',
      message: 'High number of disease cases reported in the area. Take precautions.',
      severity: AlertSeverity.warning,
      areaType: AreaType.point,
      coordinates: JSON.stringify({
        lat: 9.7813,
        lng: 125.4943,
        radius: 1000
      }),
      createdBy: admin.id,
      expiresAt: new Date('2023-05-15'),
      isActive: true
    }
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 