import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../components/Auth/AuthContext';

const useSocket = () => {
  const socketRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Connect to Socket.IO server
      socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      // Join user room for notifications
      socketRef.current.emit('join-room', user._id);

      // Handle connection events
      socketRef.current.on('connect', () => {
        console.log('Connected to notification server');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from notification server');
      });

      // Cleanup on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.emit('leave-room', user._id);
          socketRef.current.disconnect();
        }
      };
    }
  }, [user]);

  return socketRef.current;
};

export default useSocket;
