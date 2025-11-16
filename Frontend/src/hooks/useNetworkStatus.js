import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network: Back online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('❌ Network: Gone offline');
      setIsOnline(false);
    };

    const handleConnectionChange = () => {
      // Detect connection type if available
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type || 'unknown');
        console.log('🔄 Network: Connection changed to', connection.effectiveType || connection.type);
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for connection changes (if supported)
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
      // Set initial connection type
      setConnectionType(connection.effectiveType || connection.type || 'unknown');
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return { isOnline, connectionType };
};

export default useNetworkStatus;