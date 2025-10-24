const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 3001;

// Create HTTP server
const httpServer = createServer();

// Create Socket.io server with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://diseases-surveillance-systems.vercel.app/", // Replace with your actual Vercel URL
      /\.vercel\.app$/, // Allow any Vercel subdomain
      /^https:\/\/.*\.vercel\.app$/
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] User connected: ${socket.id}`);

  // Join user to their role-based room
  socket.on('join-role-room', (role) => {
    socket.join(`role:${role}`);
    console.log(`[${new Date().toISOString()}] User ${socket.id} joined role room: ${role}`);
  });

  // Handle new report notifications
  socket.on('new-report', (reportData) => {
    console.log(`[${new Date().toISOString()}] New report received:`, reportData);
    
    // Broadcast to health workers and admins
    socket.to('role:health_worker').emit('report-notification', {
      type: 'new-report',
      data: reportData,
      timestamp: new Date().toISOString()
    });
    
    socket.to('role:admin').emit('report-notification', {
      type: 'new-report',
      data: reportData,
      timestamp: new Date().toISOString()
    });
  });

  // Handle alert notifications
  socket.on('new-alert', (alertData) => {
    console.log(`[${new Date().toISOString()}] New alert created:`, alertData);
    
    // Broadcast to all connected users
    io.emit('alert-notification', {
      type: 'new-alert',
      data: alertData,
      timestamp: new Date().toISOString()
    });
  });

  // Handle alert updates
  socket.on('alert-updated', (alertData) => {
    console.log(`[${new Date().toISOString()}] Alert updated:`, alertData);
    
    // Broadcast to all connected users
    io.emit('alert-notification', {
      type: 'alert-updated',
      data: alertData,
      timestamp: new Date().toISOString()
    });
  });

  // Handle hotspot updates
  socket.on('hotspot-update', (hotspotData) => {
    console.log(`[${new Date().toISOString()}] Hotspot updated:`, hotspotData);
    
    // Broadcast to health workers, researchers, and admins
    socket.to('role:health_worker').emit('hotspot-notification', {
      type: 'hotspot-update',
      data: hotspotData,
      timestamp: new Date().toISOString()
    });
    
    socket.to('role:researcher').emit('hotspot-notification', {
      type: 'hotspot-update',
      data: hotspotData,
      timestamp: new Date().toISOString()
    });
    
    socket.to('role:admin').emit('hotspot-notification', {
      type: 'hotspot-update',
      data: hotspotData,
      timestamp: new Date().toISOString()
    });
  });

  // Handle user status updates
  socket.on('user-status', (statusData) => {
    console.log(`[${new Date().toISOString()}] User status update:`, statusData);
    
    // Broadcast to admins
    socket.to('role:admin').emit('user-status-notification', {
      type: 'user-status',
      data: statusData,
      timestamp: new Date().toISOString()
    });
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`[${new Date().toISOString()}] User disconnected: ${socket.id}, reason: ${reason}`);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] Socket error for ${socket.id}:`, error);
  });
});

// Health check endpoint
httpServer.on('request', (req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      connections: io.engine.clientsCount,
      uptime: process.uptime()
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 DSMS Socket Server running on port ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🔌 Socket.io server ready for connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
