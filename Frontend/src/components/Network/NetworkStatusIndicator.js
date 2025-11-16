import React, { useState, useEffect } from 'react';
import { WifiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import useNetworkStatus from '../../hooks/useNetworkStatus';

const NetworkStatusIndicator = () => {
  const { isOnline, connectionType } = useNetworkStatus();
  const [showIndicator, setShowIndicator] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true);
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      // Show reconnected message briefly
      setShowIndicator(true);
      const timer = setTimeout(() => {
        setShowIndicator(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!showIndicator) return null;

  return (
    <div
      className={`fixed top-20 right-4 z-50 px-4 py-2 rounded-lg shadow-lg border transition-all duration-300 ${
        isOnline
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <WifiIcon className="h-5 w-5 text-green-600" />
        ) : (
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
        )}
        <span className="text-sm font-medium">
          {isOnline ? (
            <>
              Connection restored
              {connectionType !== 'unknown' && (
                <span className="text-xs ml-1">({connectionType})</span>
              )}
            </>
          ) : (
            'No internet connection'
          )}
        </span>
      </div>
    </div>
  );
};

export default NetworkStatusIndicator;