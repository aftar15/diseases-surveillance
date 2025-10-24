# Code Workflows & Detailed Explanations

## 📝 How Each Major Feature Works

---

## 1. Report Submission Workflow

### Step-by-Step Process

```
User Action → Frontend Component → API Route → Database → Response
```

### Detailed Flow

**Step 1: User fills the report form** (`src/components/forms/report-form.tsx`)
```typescript
// User inputs
- Reporter Name: "Juan Dela Cruz"
- Contact Number: "09074004795"
- Disease Type: "Dengue" (dropdown selection)
- Symptoms: [Checkboxes] "High Fever", "Severe Headache"
- Location: Click on map (lat: 10.0095, lng: 125.5708)
- Notes: "Experiencing symptoms for 3 days"
```

**Step 2: Form validation (Frontend)**
```typescript
// Zod schema validates:
- Name: must not be empty
- Phone: must be valid format (09XXXXXXXXX)
- Disease: must be selected
- Symptoms: at least one must be selected
- Location: coordinates must be valid
```

**Step 3: Submit to API** (`POST /api/reports`)
```typescript
const response = await fetch('/api/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reporterName: "Juan Dela Cruz",
    reporterNumber: "09074004795",
    diseaseId: "uuid-of-dengue",
    latitude: 10.0095,
    longitude: 125.5708,
    symptoms: ["symptom-uuid-1", "symptom-uuid-2"], // IDs not names!
    notes: "Experiencing symptoms for 3 days"
  })
});
```

**Step 4: API validates and saves** (`src/app/api/reports/route.ts`)
```typescript
export async function POST(request) {
  // 1. Parse request body
  const body = await request.json();
  
  // 2. Validate with Zod schema
  const validatedData = reportSchema.parse(body);
  
  // 3. Save to database
  const report = await db.report.create({
    data: {
      reporterName: validatedData.reporterName,
      reporterNumber: validatedData.reporterNumber,
      diseaseId: validatedData.diseaseId,
      latitude: validatedData.latitude,
      longitude: validatedData.longitude,
      symptoms: JSON.stringify(validatedData.symptoms),
      status: 'pending',
      reportDate: new Date()
    }
  });
  
  // 4. Return success response
  return NextResponse.json({ 
    success: true, 
    report: report 
  });
}
```

**Step 5: Database stores the report**
```sql
INSERT INTO reports (
  id, reporter_name, reporter_number, disease_id,
  latitude, longitude, symptoms, status, report_date
) VALUES (
  'uuid-generated',
  'Juan Dela Cruz',
  '09074004795',
  'dengue-uuid',
  10.0095,
  125.5708,
  '["symptom-uuid-1","symptom-uuid-2"]',
  'pending',
  NOW()
);
```

**Step 6: Frontend shows success**
```typescript
// User sees confirmation message
toast({
  title: "Success",
  description: "Your report has been submitted successfully"
});

// Redirect to success page
router.push('/report/success');
```

---

## 2. Report Validation & Hotspot Generation

### When Admin Validates a Report

**Step 1: Admin clicks "Validate" button**
```typescript
// From: src/components/reports/client-reports-view.tsx
<Button onClick={() => handleValidate(report.id)}>
  <CheckIcon /> Validate
</Button>
```

**Step 2: Send PATCH request to API**
```typescript
await fetch('/api/reports', {
  method: 'PATCH',
  body: JSON.stringify({
    id: report.id,
    action: "validate",
    validatedBy: "Admin User"
  })
});
```

**Step 3: API updates report** (`src/app/api/reports/route.ts`)
```typescript
// Update report status
await db.report.update({
  where: { id: id },
  data: {
    status: 'validated',
    validatedBy: 'Admin User',
    validatedAt: new Date()
  }
});
```

**Step 4: Trigger hotspot generation** (`src/lib/hotspot-utils.ts`)
```typescript
if (status === 'validated') {
  // Run hotspot algorithm
  await generateAndUpdateHotspots();
  
  // Emit Socket.io event
  emitNewValidatedReport(report);
  emitHotspotsUpdate();
}
```

**Step 5: Hotspot Algorithm Runs**
```typescript
export async function generateAndUpdateHotspots() {
  // 1. Fetch all validated reports
  const reports = await db.report.findMany({
    where: { status: 'validated' }
  });
  
  // 2. Group nearby reports (clustering)
  const clusters = [];
  const RADIUS = 0.01; // ~1.1 km
  
  for (const report of reports) {
    let foundCluster = false;
    
    // Check if report belongs to existing cluster
    for (const cluster of clusters) {
      const distance = calculateDistance(
        report.latitude,
        report.longitude,
        cluster.centerLat,
        cluster.centerLng
      );
      
      if (distance < RADIUS) {
        cluster.reports.push(report);
        foundCluster = true;
        break;
      }
    }
    
    // Create new cluster if not found
    if (!foundCluster) {
      clusters.push({
        centerLat: report.latitude,
        centerLng: report.longitude,
        reports: [report]
      });
    }
  }
  
  // 3. Calculate intensity for each cluster
  const hotspots = clusters.map(cluster => {
    const avgLat = average(cluster.reports.map(r => r.latitude));
    const avgLng = average(cluster.reports.map(r => r.longitude));
    
    return {
      latitude: avgLat,
      longitude: avgLng,
      intensity: calculateIntensity(cluster.reports.length),
      reportCount: cluster.reports.length,
      lastReportDate: getLatestDate(cluster.reports)
    };
  });
  
  // 4. Update database
  await db.hotspot.deleteMany({}); // Clear old hotspots
  await db.hotspot.createMany({ data: hotspots });
  
  return { success: true };
}

function calculateIntensity(reportCount) {
  // More reports = higher intensity
  // Range: 0.0 to 1.0
  return Math.min(reportCount / 20, 1.0);
}
```

**Step 6: Socket.io broadcasts update** (`server.js`)
```javascript
export function emitHotspotsUpdate() {
  io.to('disease-monitoring').emit('hotspots-updated');
}
```

**Step 7: All clients receive update**
```typescript
// src/hooks/use-socket.ts
socket.on('hotspots-updated', () => {
  // Fetch new hotspots
  fetchHotspots();
});
```

**Step 8: Map updates automatically**
```typescript
// src/components/maps/leaflet-map.tsx
useEffect(() => {
  // Socket event triggers this
  fetch('/api/hotspots')
    .then(res => res.json())
    .then(hotspots => {
      // Update map heatmap layer
      setHotspots(hotspots);
    });
}, []);
```

---

## 3. Disease Map Display

### How the map shows reports and hotspots

**Step 1: Map component loads** (`src/components/maps/leaflet-map.tsx`)
```typescript
useEffect(() => {
  // Fetch validated reports
  fetchReports();
  
  // Fetch hotspots
  fetchHotspots();
  
  // Connect to Socket.io for real-time updates
  connectSocket();
}, []);
```

**Step 2: Fetch validated reports**
```typescript
async function fetchReports() {
  const response = await fetch('/api/reports?status=validated');
  const data = await response.json();
  
  // data = [
  //   {
  //     id: "uuid",
  //     diseaseId: "dengue-uuid",
  //     diseaseName: "Dengue",
  //     latitude: 10.0095,
  //     longitude: 125.5708,
  //     symptoms: ["High Fever", "Severe Headache"],
  //     reportDate: "2025-10-19T12:00:00Z"
  //   },
  //   ...
  // ]
  
  setReports(data);
}
```

**Step 3: Display reports as markers**
```typescript
{reports.map(report => (
  <Marker
    key={report.id}
    position={[report.latitude, report.longitude]}
    icon={diseaseIcon} // Custom marker icon
  >
    <Popup>
      <div>
        <h3>{report.diseaseName}</h3>
        <p>Symptoms: {report.symptoms.join(', ')}</p>
        <p>Date: {formatDate(report.reportDate)}</p>
      </div>
    </Popup>
  </Marker>
))}
```

**Step 4: Display hotspots as heatmap**
```typescript
// src/components/maps/leaflet-heatmap-layer.tsx
<HeatmapLayer
  points={hotspots.map(h => [
    h.latitude,
    h.longitude,
    h.intensity // 0.0 to 1.0
  ])}
  longitudeExtractor={point => point[1]}
  latitudeExtractor={point => point[0]}
  intensityExtractor={point => point[2]}
  radius={25}
  blur={15}
  gradient={{
    0.0: 'green',
    0.5: 'yellow',
    0.7: 'orange',
    1.0: 'red'
  }}
/>
```

**Visual Result:**
- 🟢 Low intensity (few reports) = Green
- 🟡 Medium intensity = Yellow
- 🟠 High intensity = Orange
- 🔴 Very high intensity (many reports) = Red

---

## 4. Admin Dashboard Statistics

### How statistics cards are calculated

**Step 1: Dashboard loads** (`src/app/dashboard/page.tsx`)
```typescript
useEffect(() => {
  fetchStatistics();
}, []);

async function fetchStatistics() {
  const [reports, diseases] = await Promise.all([
    fetch('/api/reports').then(r => r.json()),
    fetch('/api/diseases').then(r => r.json())
  ]);
  
  calculateStats(reports);
}
```

**Step 2: Calculate statistics**
```typescript
function calculateStats(reports) {
  const total = reports.length;
  
  const pending = reports.filter(
    r => r.status === 'pending'
  ).length;
  
  const validated = reports.filter(
    r => r.status === 'validated'
  ).length;
  
  const rejected = reports.filter(
    r => r.status === 'rejected'
  ).length;
  
  return { total, pending, validated, rejected };
}
```

**Step 3: Display in cards** (`src/components/dashboard/stats-cards.tsx`)
```typescript
<div className="grid gap-4 grid-cols-1 md:grid-cols-4">
  <StatsCard
    title="Total Reports"
    value={stats.total}
    icon={<FileTextIcon />}
  />
  <StatsCard
    title="Pending"
    value={stats.pending}
    icon={<ClockIcon />}
    color="amber"
  />
  <StatsCard
    title="Validated"
    value={stats.validated}
    icon={<CheckIcon />}
    color="green"
  />
  <StatsCard
    title="Rejected"
    value={stats.rejected}
    icon={<XIcon />}
    color="red"
  />
</div>
```

---

## 5. Authentication Flow

### Login Process

**Step 1: User submits login form**
```typescript
// src/components/auth/login-form.tsx
async function handleLogin(e) {
  e.preventDefault();
  
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: password
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Save token
    localStorage.setItem('token', data.token);
    
    // Redirect to dashboard
    router.push('/dashboard');
  }
}
```

**Step 2: API validates credentials** (`src/app/api/auth/login/route.ts`)
```typescript
export async function POST(request) {
  const { email, password } = await request.json();
  
  // 1. Find user by email
  const user = await db.user.findUnique({
    where: { email: email }
  });
  
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }
  
  // 2. Verify password
  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }
  
  // 3. Generate JWT token
  const token = jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  
  // 4. Return token
  return NextResponse.json({
    success: true,
    token: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}
```

**Step 3: Protected route checks authentication**
```typescript
// Middleware or component level
const token = localStorage.getItem('token');

if (!token) {
  redirect('/login');
}

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  // User is authenticated
  // Check role for authorization
} catch (error) {
  // Token invalid or expired
  redirect('/login');
}
```

---

## 6. Real-Time Alert System

### Broadcasting alerts to all users

**Step 1: Admin creates alert** (`src/app/dashboard/alerts/page.tsx`)
```typescript
async function handleCreateAlert() {
  const response = await fetch('/api/alerts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: "Dengue Outbreak Alert",
      message: "High cases reported in Poblacion area",
      severity: "warning",
      coordinates: { lat: 10.008, lng: 125.5718 }
    })
  });
}
```

**Step 2: API saves alert** (`src/app/api/alerts/route.ts`)
```typescript
// Save to database
const alert = await db.alert.create({
  data: {
    title: body.title,
    message: body.message,
    severity: body.severity,
    coordinates: JSON.stringify(body.coordinates),
    createdBy: userId,
    isActive: true
  }
});

// Broadcast via Socket.io
emitNewAlert(alert);
```

**Step 3: Socket.io broadcasts** (`server.js`)
```javascript
function emitNewAlert(alert) {
  io.to('disease-monitoring').emit('new-alert', {
    id: alert.id,
    title: alert.title,
    message: alert.message,
    severity: alert.severity
  });
}
```

**Step 4: All clients receive** (`src/hooks/use-socket.ts`)
```typescript
socket.on('new-alert', (alert) => {
  // Show toast notification
  toast({
    title: alert.title,
    description: alert.message,
    variant: alert.severity === 'critical' ? 'destructive' : 'default'
  });
  
  // Play sound
  playNotificationSound();
});
```

---

## 7. Analytics Data Generation

### How charts get their data

**Trend Chart** (`/api/analytics/trend`)
```typescript
export async function GET() {
  // Group reports by date
  const reports = await db.report.findMany({
    where: { status: 'validated' },
    select: { reportDate: true }
  });
  
  // Count reports per day
  const grouped = reports.reduce((acc, report) => {
    const date = format(report.reportDate, 'yyyy-MM-dd');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  
  // Return data for line chart
  return NextResponse.json({
    dates: Object.keys(grouped),
    counts: Object.values(grouped)
  });
}
```

**Disease Distribution** (`/api/analytics/disease-distribution`)
```typescript
export async function GET() {
  // Count reports by disease
  const counts = await db.report.groupBy({
    by: ['diseaseId'],
    where: { status: 'validated' },
    _count: { id: true }
  });
  
  // Get disease names
  const diseases = await db.disease.findMany({
    where: { id: { in: counts.map(c => c.diseaseId) } }
  });
  
  // Combine data
  return NextResponse.json(
    counts.map(c => ({
      disease: diseases.find(d => d.id === c.diseaseId)?.name,
      count: c._count.id
    }))
  );
}
```

---

## Key Takeaways

### Most Important Concepts

1. **Three-Tier Architecture**
   - Separation of concerns
   - Easier to maintain and scale

2. **Prisma ORM**
   - Type-safe database queries
   - Prevents SQL injection
   - Auto-generates TypeScript types

3. **Socket.io Real-Time**
   - WebSocket connection
   - Event-based communication
   - Instant updates without refresh

4. **JWT Authentication**
   - Stateless authentication
   - Secure token-based access
   - Role-based authorization

5. **Hotspot Algorithm**
   - Clustering nearby reports
   - Intensity calculation
   - Automated regeneration

### Best Practices Used

✅ Input validation (Zod)
✅ Password hashing (bcrypt)
✅ Environment variables for secrets
✅ TypeScript for type safety
✅ Responsive design (mobile-first)
✅ Error handling
✅ Loading states
✅ Optimistic UI updates

---

**Use this document alongside the Defense Guide for comprehensive understanding of your system!**
