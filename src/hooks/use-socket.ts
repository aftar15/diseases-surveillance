'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '@/store';
import { Alert } from '@/types';

// Initialize socket connection outside of hook to persist between renders
let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const { addAlert, updateReport, dismissAlert, addReport, setHotspots } = useAppStore();
  
  useEffect(() => {
    // Initialize socket connection if not already established
    if (!socket) {
      // Use external socket server URL
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
      
      socket = io(socketUrl, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }
    
    // Socket event handlers
    function onConnect() {
      setIsConnected(true);
      console.log('Socket connected');
      
      // Join channels to receive updates
      socket?.emit('join-alerts-channel');
      socket?.emit('join-reports-channel');
      socket?.emit('join-hotspots-channel');
    }
    
    function onDisconnect() {
      setIsConnected(false);
      console.log('Socket disconnected');
    }
    
    function onNewAlert(alert: Alert) {
      console.log('Received new alert:', alert);
      addAlert(alert);
    }
    
    function onUpdateAlert(alert: Alert) {
      console.log('Received alert update:', alert);
      // First remove the old alert, then add the updated one
      dismissAlert(alert.id);
      addAlert(alert);
    }
    
    function onDeleteAlert(alertId: string) {
      console.log('Received alert deletion:', alertId);
      dismissAlert(alertId);
    }
    
    function onNewValidatedReport(report: any) {
      console.log('Received new validated report:', report);
      addReport(report);
    }
    
    function onUpdateReportSocket(report: any) {
      console.log('Received report update:', report);
      updateReport(report.id, report);
    }
    
    async function onHotspotsUpdated() {
      console.log('Received hotspots update notification');
      // Fetch updated hotspots from API
      try {
        const response = await fetch('/api/hotspots');
        if (response.ok) {
          const data = await response.json();
          const fetchedHotspots = data.features.map((feature: any) => ({
            id: feature.properties.id,
            location: {
              lat: feature.geometry.coordinates[1],
              lng: feature.geometry.coordinates[0],
            },
            intensity: feature.properties.intensity,
            reportCount: feature.properties.reportCount,
            lastReportDate: feature.properties.lastReportDate,
          }));
          setHotspots(fetchedHotspots);
        }
      } catch (error) {
        console.error('Error fetching updated hotspots:', error);
      }
    }
    
    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new-alert', onNewAlert);
    socket.on('update-alert', onUpdateAlert);
    socket.on('delete-alert', onDeleteAlert);
    socket.on('new-validated-report', onNewValidatedReport);
    socket.on('update-report', onUpdateReportSocket);
    socket.on('hotspots-updated', onHotspotsUpdated);
    
    // Cleanup function
    return () => {
      socket?.off('connect', onConnect);
      socket?.off('disconnect', onDisconnect);
      socket?.off('new-alert', onNewAlert);
      socket?.off('update-alert', onUpdateAlert);
      socket?.off('delete-alert', onDeleteAlert);
      socket?.off('new-validated-report', onNewValidatedReport);
      socket?.off('update-report', onUpdateReportSocket);
      socket?.off('hotspots-updated', onHotspotsUpdated);
    };
  }, [addAlert, updateReport, dismissAlert, addReport, setHotspots]);
  
  return {
    socket,
    isConnected,
  };
} 