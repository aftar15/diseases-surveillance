import { 
  mysqlTable, 
  varchar, 
  text, 
  timestamp, 
  json,
  int, 
  double,
  mysqlEnum,
  primaryKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';

// Users table
export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  password: varchar('password', { length: 255 }),
  role: mysqlEnum('role', ['admin', 'health_worker', 'researcher', 'public']).notNull().default('public'),
  organization: varchar('organization', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => {
  return {
    emailIdx: uniqueIndex('email_idx').on(table.email),
  };
});

// Dengue reports table
export const reports = mysqlTable('reports', {
  id: varchar('id', { length: 36 }).primaryKey().notNull(),
  latitude: double('latitude').notNull(),
  longitude: double('longitude').notNull(),
  symptoms: json('symptoms').$type<string[]>().notNull(),
  reportDate: timestamp('report_date').defaultNow().notNull(),
  status: mysqlEnum('status', ['pending', 'validated', 'rejected']).notNull().default('pending'),
  notes: text('notes'),
  submittedBy: varchar('submitted_by', { length: 36 }),
  validatedBy: varchar('validated_by', { length: 36 }),
  validatedAt: timestamp('validated_at'),
  locationAddress: varchar('location_address', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => {
  return {
    statusIdx: index('status_idx').on(table.status),
    locationIdx: index('location_idx').on(table.latitude, table.longitude),
    dateIdx: index('date_idx').on(table.reportDate),
  };
});

// Hotspots table
export const hotspots = mysqlTable('hotspots', {
  id: varchar('id', { length: 36 }).primaryKey().notNull(),
  latitude: double('latitude').notNull(),
  longitude: double('longitude').notNull(),
  intensity: double('intensity').notNull(),
  reportCount: int('report_count').notNull().default(0),
  radius: double('radius').notNull().default(500), // in meters
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date'),
  isActive: int('is_active').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => {
  return {
    locationIdx: index('location_idx').on(table.latitude, table.longitude),
    activeIdx: index('active_idx').on(table.isActive),
  };
});

// Alerts table
export const alerts = mysqlTable('alerts', {
  id: varchar('id', { length: 36 }).primaryKey().notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  message: text('message').notNull(),
  severity: mysqlEnum('severity', ['info', 'warning', 'critical']).notNull().default('info'),
  areaType: mysqlEnum('area_type', ['point', 'polygon']).notNull().default('point'),
  areaCoordinates: json('area_coordinates').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: varchar('created_by', { length: 36 }),
  expiresAt: timestamp('expires_at'),
  isActive: int('is_active').notNull().default(1),
}, (table) => {
  return {
    severityIdx: index('severity_idx').on(table.severity),
    activeIdx: index('active_idx').on(table.isActive),
  };
});

// Report-to-hotspot relationship table
export const reportHotspots = mysqlTable('report_hotspots', {
  reportId: varchar('report_id', { length: 36 }).notNull(),
  hotspotId: varchar('hotspot_id', { length: 36 }).notNull(),
  relationStrength: double('relation_strength').notNull().default(1.0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.reportId, table.hotspotId] }),
    reportIdx: index('report_idx').on(table.reportId),
    hotspotIdx: index('hotspot_idx').on(table.hotspotId),
  };
}); 