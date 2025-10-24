"use client";

import { ReactNode, useEffect } from 'react';
import { useSocket } from '@/hooks/use-socket';

interface SocketProviderProps {
  children: ReactNode;
}

/**
 * Socket provider component that establishes and maintains Socket.io connection
 */
export function SocketProvider({ children }: SocketProviderProps) {
  // Initialize socket connection
  const { isConnected } = useSocket();
  
  // Log connection status changes
  useEffect(() => {
    if (isConnected) {
      console.log('Socket connection established');
    } else {
      console.log('Socket disconnected');
    }
  }, [isConnected]);
  
  return <>{children}</>;
} 