import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  XMarkIcon, 
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';

const NotificationCenter = ({ isOpen, onClose, isDarkMode }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, activeTab]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications', {
        params: {
          page: 1,
          limit: 50,
          unreadOnly: activeTab === 'unread'
        }
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      if (!notifications.find(n => n._id === notificationId)?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type, priority) => {
    const iconClass = `h-5 w-5 ${
      priority === 'urgent' ? 'text-red-500' :
      priority === 'high' ? 'text-orange-500' :
      priority === 'medium' ? 'text-blue-500' :
      'text-gray-500'
    }`;

    switch (type) {
      case 'order_placed':
      case 'order_accepted':
      case 'order_delivered':
        return <CheckCircleIcon className={iconClass} />;
      case 'order_cancelled':
      case 'order_rejected':
        return <XCircleIcon className={iconClass} />;
      case 'promotion':
        return <InformationCircleIcon className={iconClass} />;
      case 'system':
        return <ExclamationTriangleIcon className={iconClass} />;
      default:
        return <InformationCircleIcon className={iconClass} />;
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-md w-full max-h-[80vh] rounded-xl shadow-2xl border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-2">
            <BellIcon className={`h-6 w-6 ${isDarkMode ? 'text-yellow-400' : 'text-gray-900'}`} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-medium">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? isDarkMode
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-blue-600 border-b-2 border-blue-500'
                : isDarkMode
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'unread'
                ? isDarkMode
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-blue-600 border-b-2 border-blue-500'
                : isDarkMode
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className={`p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={markAllAsRead}
              className={`text-sm flex items-center space-x-1 transition-colors ${
                isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              <CheckIcon className="h-4 w-4" />
              <span>Mark all as read</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <BellIcon className={`h-12 w-12 mx-auto mb-2 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <div className={`${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'} divide-y`}>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-50'
                  } ${
                    !notification.isRead 
                      ? isDarkMode 
                        ? 'bg-yellow-500/10 border-l-4 border-yellow-500' 
                        : 'bg-blue-50 border-l-4 border-blue-500'
                      : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {getTimeAgo(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm mt-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                              isDarkMode
                                ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20'
                                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                            }`}
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20'
                              : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
