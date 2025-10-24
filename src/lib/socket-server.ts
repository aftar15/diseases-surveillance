import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { Alert } from '@/types';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Global variable to store socket server instance
let io: SocketIOServer | null = null;

// Create and initialize the socket server
export function initSocketServer(server: NetServer) {
  if (!io) {
    console.log('Initializing Socket.io server...');
    io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_APP_URL 
          : 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Listen for client events
      socket.on('join-alerts-channel', () => {
        socket.join('alerts-channel');
        console.log(`Client ${socket.id} joined alerts channel`);
      });
      
      socket.on('join-reports-channel', () => {
        socket.join('reports-channel');
        console.log(`Client ${socket.id} joined reports channel`);
      });
      
      socket.on('join-hotspots-channel', () => {
        socket.join('hotspots-channel');
        console.log(`Client ${socket.id} joined hotspots channel`);
      });
      
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
  
  return io;
}

// Get the socket server instance
export function getSocketServer() {
  return io;
}

// Emit a new alert to all connected clients
export function emitNewAlert(alert: Alert) {
  if (io) {
    io.to('alerts-channel').emit('new-alert', alert);
    console.log(`Emitted new alert: ${alert.id}`);
  }
}

// Emit an alert update to all connected clients
export function emitUpdateAlert(alert: Alert) {
  if (io) {
    io.to('alerts-channel').emit('update-alert', alert);
    console.log(`Emitted alert update: ${alert.id}`);
  }
}

// Emit an alert deletion to all connected clients
export function emitDeleteAlert(alertId: string) {
  if (io) {
    io.to('alerts-channel').emit('delete-alert', alertId);
    console.log(`Emitted alert deletion: ${alertId}`);
  }
}

// Emit a new validated report to all connected clients
export function emitNewValidatedReport(report: any) {
  if (io) {
    io.to('reports-channel').emit('new-validated-report', report);
    console.log(`Emitted new validated report: ${report.id}`);
  }
}

// Emit a report update to all connected clients
export function emitUpdateReport(report: any) {
  if (io) {
    io.to('reports-channel').emit('update-report', report);
    console.log(`Emitted report update: ${report.id}`);
  }
}

// Emit hotspots update to all connected clients
export function emitHotspotsUpdate() {
  if (io) {
    io.to('hotspots-channel').emit('hotspots-updated');
    console.log(`Emitted hotspots update`);
  }
} 