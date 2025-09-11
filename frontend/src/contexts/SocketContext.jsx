import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { tokenManager } from '../utils/tokenManager';
import logger from '../utils/logger';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user]);

  const connectSocket = () => {
    if (socketRef.current?.connected) {
      return;
    }

    const token = tokenManager.getAccessToken();
    if (!token) return;

    try {
      socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        logger.info('Socket connected');
      });

      socketRef.current.on('disconnect', (reason) => {
        setIsConnected(false);
        logger.warn('Socket disconnected:', reason);
      });

      socketRef.current.on('connect_error', (error) => {
        setIsConnected(false);
        logger.error('Socket connection error:', error);
      });

      // Real-time event handlers
      socketRef.current.on('sessionStarted', (data) => {
        toast.success(`Session "${data.title}" has started!`);
      });

      socketRef.current.on('sessionClosed', (data) => {
        toast.info(`Session "${data.title}" has ended`);
      });

      socketRef.current.on('attendanceMarked', (data) => {
        if (user?.role === 'faculty') {
          toast.success(`${data.studentName} marked attendance (${data.status})`);
        }
      });

      socketRef.current.on('qrTokenRefreshed', (data) => {
        // This will be handled by the QR display component
      });

      socketRef.current.on('courseEnrolled', (data) => {
        toast.success(`You have been enrolled in ${data.courseCode}`);
      });

      socketRef.current.on('courseUnenrolled', (data) => {
        toast.info(`You have been removed from ${data.courseCode}`);
      });

      socketRef.current.on('sessionCreated', (data) => {
        if (user?.role === 'student') {
          toast.info(`New session scheduled: ${data.title}`);
        }
      });

      socketRef.current.on('sessionCancelled', (data) => {
        toast.warning(`Session "${data.title}" has been cancelled`);
      });

    } catch (error) {
      logger.error('Failed to connect socket:', error);
    }
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const joinSession = (sessionId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_session', sessionId);
      logger.info(`Joined session: ${sessionId}`);
    }
  };

  const leaveSession = (sessionId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave_session', sessionId);
      logger.info(`Left session: ${sessionId}`);
    }
  };

  const emit = (event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    joinSession,
    leaveSession,
    emit,
    on,
    off
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;