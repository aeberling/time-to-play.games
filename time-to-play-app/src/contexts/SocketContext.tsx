'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  joinGame: (gameId: string) => void;
  leaveGame: (gameId: string) => void;
  sendMove: (gameId: string, move: any) => void;
  sendChatMessage: (gameId: string, message: string) => void;
  setPlayerReady: (gameId: string, isReady: boolean) => void;
  reconnectToGame: (gameId: string) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Get access token from cookies
    const getAccessToken = () => {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find((c) => c.trim().startsWith('access_token='));
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    };

    const token = getAccessToken();
    if (!token) {
      console.error('No access token available for socket connection');
      return;
    }

    // Create socket connection
    const socketInstance = io({
      path: '/socket.io',
      auth: {
        token,
      },
      autoConnect: true,
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user]);

  // Join a game room
  const joinGame = useCallback(
    (gameId: string) => {
      if (!socket || !isConnected) {
        console.error('Socket not connected');
        return;
      }
      socket.emit('game:join', gameId);
    },
    [socket, isConnected]
  );

  // Leave a game room
  const leaveGame = useCallback(
    (gameId: string) => {
      if (!socket || !isConnected) {
        console.error('Socket not connected');
        return;
      }
      socket.emit('game:leave', gameId);
    },
    [socket, isConnected]
  );

  // Send a move
  const sendMove = useCallback(
    (gameId: string, move: any) => {
      if (!socket || !isConnected) {
        console.error('Socket not connected');
        return;
      }
      socket.emit('game:move', { gameId, move });
    },
    [socket, isConnected]
  );

  // Send a chat message
  const sendChatMessage = useCallback(
    (gameId: string, message: string) => {
      if (!socket || !isConnected) {
        console.error('Socket not connected');
        return;
      }
      socket.emit('chat:message', { gameId, message });
    },
    [socket, isConnected]
  );

  // Set player ready status
  const setPlayerReady = useCallback(
    (gameId: string, isReady: boolean) => {
      if (!socket || !isConnected) {
        console.error('Socket not connected');
        return;
      }
      socket.emit('player:ready', { gameId, isReady });
    },
    [socket, isConnected]
  );

  // Reconnect to a game
  const reconnectToGame = useCallback(
    (gameId: string) => {
      if (!socket || !isConnected) {
        console.error('Socket not connected');
        return;
      }
      socket.emit('game:reconnect', gameId);
    },
    [socket, isConnected]
  );

  const value: SocketContextValue = {
    socket,
    isConnected,
    joinGame,
    leaveGame,
    sendMove,
    sendChatMessage,
    setPlayerReady,
    reconnectToGame,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
