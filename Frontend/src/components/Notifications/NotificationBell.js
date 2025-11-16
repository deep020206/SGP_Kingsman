import React, { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import api from '../../api/axios';

const NotificationBell = ({ isDarkMode, onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);
  const isLoadingRef = useRef(false);
  const timeoutRef = useRef(null);

  // Simple fetch function with minimal logic
  const fetchNotifications = async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    try {
      const response = await api.get('/notifications/count');
      if (response.data?.success) {
        const count = response.data.unreadCount || 0;
        setUnreadCount(count);
        setHasUnread(count > 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      isLoadingRef.current = false;
    }
  };

  // Only run once on mount - no dependencies to avoid re-runs
  useEffect(() => {
    // Initial fetch after a small delay
    timeoutRef.current = setTimeout(fetchNotifications, 500);
    
    // Set up interval for periodic updates (5 minutes to reduce frequency)
    const intervalId = setInterval(fetchNotifications, 300000);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array - runs only once

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-full transition-colors ${
        isDarkMode 
          ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {hasUnread ? (
        <BellIconSolid className="h-6 w-6" />
      ) : (
        <BellIcon className="h-6 w-6" />
      )}
      
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
