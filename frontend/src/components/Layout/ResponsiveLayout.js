import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingBagIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  BellIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import MobileBottomNav from './MobileBottomNav';
import NotificationBell from '../Notifications/NotificationBell';
import NotificationCenter from '../Notifications/NotificationCenter';

const ResponsiveLayout = ({ children, currentPage = 'browse', onNavigate, isDarkMode = false, onThemeToggle, cartItemCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cartItems, setCartItems] = useState(2); // Mock cart count
  const [activeView, setActiveView] = useState(currentPage);
  const [showNotifications, setShowNotifications] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false); // Close mobile sidebar on desktop
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navigation = [
    { name: 'Browse Menu', icon: HomeIcon, id: 'browse' },
    { name: 'My Orders', icon: ClipboardDocumentListIcon, id: 'orders' },
    { name: 'Cart', icon: ShoppingCartIcon, id: 'cart', badge: cartItems },
    { name: 'Favorites', icon: HeartIcon, id: 'favorites' },
    { name: 'Profile', icon: UserIcon, id: 'profile' },
  ];

  // Accept either string (viewId) or object (with id)
  const handleNavigation = (view) => {
    const viewId = typeof view === 'string' ? view : view.id;
    setActiveView(viewId);
    if (onNavigate) {
      onNavigate(viewId);
    }
    // Close mobile sidebar after navigation
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  // Desktop Sidebar Component
  const DesktopSidebar = () => (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className={`flex flex-col flex-grow pt-5 overflow-y-auto ${
        isDarkMode ? 'bg-gray-900' : 'bg-white border-r border-gray-200'
      }`}>
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className={`text-xl font-bold flex items-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <span className="bg-yellow-500 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center mr-2">
              🍕
            </span>
            FoodApp
          </h1>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          {/* Profile card removed. Profile details will be shown in the Profile form only. */}

          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item)}
                className={`${
                  activeView === item.id
                    ? isDarkMode ? 'bg-gray-800 text-white' : 'bg-yellow-100 text-yellow-900'
                    : isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md relative w-full text-left`}
              >
                <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                {item.name}
                {item.badge && (
                  <span className="ml-auto bg-yellow-500 text-gray-900 text-xs rounded-full px-2 py-1">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User Stats */}
          <div className="px-4 pb-4 space-y-2">
            <div className="bg-blue-900/50 p-3 rounded-lg">
              <div className="text-blue-300 text-sm">Total Orders</div>
              <div className="text-white font-bold">0</div>
            </div>
            <div className="bg-green-900/50 p-3 rounded-lg">
              <div className="text-green-300 text-sm">Favorite Items</div>
              <div className="text-white font-bold">5</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <>
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
        isDarkMode ? 'bg-gray-900' : 'bg-white border-r border-gray-200'
      }`}>
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className={`text-xl font-bold flex items-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <span className="bg-yellow-500 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                🍕
              </span>
              FoodApp
            </h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className={`ml-auto ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mt-8 flex-grow flex flex-col">
            {/* Profile card removed from mobile sidebar. */}

            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  className={`${
                    activeView === item.id
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md relative w-full text-left`}
                >
                  <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto bg-yellow-500 text-gray-900 text-xs rounded-full px-2 py-1">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );

  // Top Bar Component
  const TopBar = () => (
    <div className={`shadow-sm border-b fixed top-0 right-0 left-0 md:left-64 z-10 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`md:hidden ${
              isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h2 className={`ml-2 text-lg font-semibold capitalize ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {activeView === 'browse' ? 'Browse Menu' : 
             activeView === 'orders' ? 'My Orders' :
             activeView === 'cart' ? 'Shopping Cart' :
             activeView === 'favorites' ? 'Favorites' : 'Dashboard'}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button 
            onClick={onThemeToggle}
            className={`${
              isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isDarkMode ? (
              <SunIcon className="h-6 w-6" />
            ) : (
              <MoonIcon className="h-6 w-6" />
            )}
          </button>
          
          {/* Search */}
          <button 
            onClick={() => {
              // Navigate to browse view and focus search
              if (onNavigate) {
                onNavigate('browse');
              }
            }}
            className={`${
              isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
          </button>
          
          {/* Notifications */}
          <NotificationBell 
            isDarkMode={isDarkMode}
            onClick={() => setShowNotifications(true)}
          />

          {/* Cart */}
          <button 
            onClick={() => handleNavigation({ id: 'cart' })}
            className={`relative ${
              isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingCartIcon className="h-6 w-6" />
            {cartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-gray-900 text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {cartItems}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-gray-900" />
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile Settings
                </button>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Help & Support
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <DesktopSidebar />
      <MobileSidebar />
      
      <div className="md:pl-64 flex flex-col flex-1">
        <TopBar />
        
        <main className={`flex-1 pt-16 p-4 ${isMobile ? 'pb-20' : ''}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileBottomNav
          activeView={activeView}
          onNavigate={handleNavigation}
          isDarkMode={isDarkMode}
          cartItemCount={cartItemCount}
        />
      )}
      
      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default ResponsiveLayout;
