import React, { useEffect, useState } from 'react';
import { refreshApiConfig } from '../config/api';

const NetworkMonitor = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastNetworkChange, setLastNetworkChange] = useState(Date.now());

  useEffect(() => {
    const handleOnline = async () => {
      console.log('🌐 Network came online');
      setIsOnline(true);
      setLastNetworkChange(Date.now());
      
      // Refresh API configuration when coming back online
      try {
        await refreshApiConfig();
        console.log('✅ API configuration refreshed after network change');
      } catch (error) {
        console.error('❌ Failed to refresh API config:', error);
      }
    };

    const handleOffline = () => {
      console.log('📴 Network went offline');
      setIsOnline(false);
      setLastNetworkChange(Date.now());
    };

    // Listen for network changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Also listen for visibilitychange (when switching tabs/apps)
    const handleVisibilityChange = async () => {
      if (!document.hidden && navigator.onLine) {
        // User came back to the tab and is online
        const timeSinceLastCheck = Date.now() - lastNetworkChange;
        
        // If it's been more than 30 seconds, refresh config
        if (timeSinceLastCheck > 30000) {
          console.log('🔄 Refreshing config after visibility change');
          try {
            await refreshApiConfig();
          } catch (error) {
            console.error('❌ Failed to refresh API config on visibility change:', error);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [lastNetworkChange]);

  // Don't render anything visible, this is just a monitoring component
  return null;
};

export default NetworkMonitor;