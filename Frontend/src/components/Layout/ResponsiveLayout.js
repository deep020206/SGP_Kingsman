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
  MoonIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import MobileBottomNav from './MobileBottomNav';
import NotificationBell from '../Notifications/NotificationBell';
import NotificationCenter from '../Notifications/NotificationCenter';
import { useFavorites } from '../../hooks/useFavorites';
import { useOrders } from '../../hooks/useOrders';

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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Real user statistics from hooks
  const { getFavoritesCount, fetchFavoriteIds, favoriteIds } = useFavorites();
  const { getOrderStats } = useOrders();
  
  // State to track favorites count and force re-render
  const [favCount, setFavCount] = useState(0);
  
  // Fetch favorites when component mounts
  useEffect(() => {
    if (user) {
      fetchFavoriteIds();
    }
  }, [user, fetchFavoriteIds]);
  
  // Update favorite count when favoriteIds changes
  useEffect(() => {
    setFavCount(getFavoritesCount());
  }, [favoriteIds, getFavoritesCount]);
  
  const userStats = {
    totalOrders: getOrderStats.totalOrders,
    totalSpent: getOrderStats.totalSpent,
    favoriteItems: favCount,
    rewardPoints: Math.floor(getOrderStats.totalSpent / 10)
  };

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
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate logout delay
      logout();
      setIsProfileOpen(false);
      setShowLogoutConfirm(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Desktop Sidebar Component
  const DesktopSidebar = () => (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className={`flex flex-col flex-grow pt-6 transition-all duration-300 ${
        isDarkMode ? 'bg-gray-900 border-r border-gray-800' : 'bg-white border-r border-gray-200'
      }`}>
        <div className="flex items-center flex-shrink-0 px-6 mb-8">
          <div className="flex items-center">
            <div className={`bg-yellow-500 text-gray-900 rounded-lg w-10 h-10 flex items-center justify-center mr-3 font-bold text-lg shadow-lg transition-all duration-300 ${
              isDarkMode ? 'hover:bg-yellow-400 hover:shadow-yellow-500/25' : 'hover:bg-yellow-600'
            }`}>
              K
            </div>
            <div>
              <h1 className={`text-xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Kingsman
              </h1>
            </div>
          </div>
        </div>
        
        {/* Navigation - Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          <nav className="px-3 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item)}
                className={`${
                  activeView === item.id
                    ? isDarkMode 
                      ? 'bg-yellow-500/10 text-yellow-400 border-r-4 border-yellow-400 shadow-lg shadow-yellow-500/20' 
                      : 'bg-yellow-50 text-yellow-700 border-r-4 border-yellow-500'
                    : isDarkMode 
                      ? 'text-gray-400 hover:text-yellow-300 hover:bg-yellow-500/5 hover:border-r-4 hover:border-yellow-500/30 hover:shadow-md hover:shadow-yellow-500/10' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-r-4 hover:border-yellow-300'
                } group flex items-center px-4 py-3 text-sm font-medium rounded-l-lg transition-all duration-300 relative w-full text-left transform hover:scale-[1.02] hover:translate-x-1`}
              >
                <item.icon className={`mr-4 h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${
                  activeView === item.id 
                    ? isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                    : isDarkMode ? 'text-gray-400 group-hover:text-yellow-400' : 'text-gray-500 group-hover:text-yellow-600'
                }`} />
                <span className="flex-1 transition-colors duration-300">{item.name}</span>
                {item.badge && (
                  <span className={`bg-yellow-500 text-gray-900 text-xs rounded-full px-2 py-1 font-semibold min-w-[20px] text-center transition-all duration-300 shadow-md ${
                    isDarkMode ? 'hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/40' : 'hover:bg-yellow-600 hover:text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Section - Always Visible (User Stats + Logout) */}
        <div className="flex-shrink-0 px-6 pb-6 space-y-3 border-t pt-4 mt-4 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}">
          <div className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
            isDarkMode 
              ? 'bg-yellow-500/10 border border-yellow-500/30 hover:border-yellow-400 hover:bg-yellow-500/15 hover:shadow-xl hover:shadow-yellow-500/20' 
              : 'bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300'
          } p-4 rounded-lg`}>
            <div className={`text-sm font-medium transition-colors duration-300 ${
              isDarkMode ? 'text-yellow-400 group-hover:text-yellow-300' : 'text-yellow-600 group-hover:text-yellow-700'
            }`}>Total Orders</div>
            <div className={`text-2xl font-bold mt-1 transition-colors duration-300 ${
              isDarkMode ? 'text-yellow-300 group-hover:text-yellow-200' : 'text-yellow-700 group-hover:text-yellow-800'
            }`}>{userStats.totalOrders}</div>
          </div>
          <div className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
            isDarkMode 
              ? 'bg-yellow-500/10 border border-yellow-500/30 hover:border-yellow-400 hover:bg-yellow-500/15 hover:shadow-xl hover:shadow-yellow-500/20' 
              : 'bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300'
          } p-4 rounded-lg`}>
            <div className={`text-sm font-medium transition-colors duration-300 ${
              isDarkMode ? 'text-yellow-400 group-hover:text-yellow-300' : 'text-yellow-600 group-hover:text-yellow-700'
            }`}>Favorite Items</div>
            <div className={`text-2xl font-bold mt-1 transition-colors duration-300 ${
              isDarkMode ? 'text-yellow-300 group-hover:text-yellow-200' : 'text-yellow-700 group-hover:text-yellow-800'
            }`}>{userStats.favoriteItems}</div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:translate-x-1 ${
              isDarkMode 
                ? 'text-red-400 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/20 border border-red-500/30 hover:border-red-400' 
                : 'text-red-600 hover:bg-red-50 hover:shadow-md border border-red-200 hover:border-red-300'
            }`}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 transition-transform duration-300 hover:scale-110" />
            <span className="font-medium">Logout</span>
          </button>
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
          className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm z-20 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-30 w-64 transform transition-all duration-300 ease-in-out md:hidden backdrop-blur-xl shadow-2xl ${
        isDarkMode ? 'bg-gray-900/95 border-r border-gray-800 shadow-black/50' : 'bg-white/95 border-r border-gray-200'
      }`}>
        <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto">
          {/* Mobile Header */}
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900 rounded-xl w-10 h-10 flex items-center justify-center mr-3 font-bold text-lg shadow-lg">
                K
              </div>
              <div>
                <h1 className={`text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent`}>
                  Kingsman
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Food Ordering
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className={`ml-auto p-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800 hover:shadow-lg hover:shadow-yellow-500/20' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Mobile User Info */}
          <div className={`mx-6 mb-6 p-4 rounded-lg border ${
            isDarkMode 
              ? 'border-gray-800 bg-yellow-500/10' 
              : 'border-gray-200 bg-yellow-50'
          }`}>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900 font-bold text-lg shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name || 'User'}
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-3 space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:translate-x-1 relative w-full text-left ${
                    activeView === item.id
                      ? isDarkMode 
                        ? 'bg-yellow-500/10 text-yellow-400 shadow-lg shadow-yellow-500/20 border border-yellow-500/30' 
                        : 'bg-yellow-50 text-yellow-700 shadow-lg shadow-yellow-500/20 border border-yellow-300'
                      : isDarkMode 
                        ? 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/5 hover:shadow-lg hover:shadow-yellow-500/10 hover:border hover:border-yellow-500/20' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:shadow-md'
                  }`}
                >
                  <item.icon className={`mr-4 h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${
                    activeView === item.id 
                      ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600')
                      : (isDarkMode ? 'text-gray-400 group-hover:text-yellow-400' : 'text-gray-500 group-hover:text-yellow-600')
                  }`} />
                  <span className="flex-1 transition-colors duration-300">{item.name}</span>
                  {item.badge && (
                    <span className={`bg-yellow-500 text-gray-900 text-xs rounded-full px-2 py-1 font-semibold min-w-[20px] text-center transition-all duration-300 shadow-md ${
                      isDarkMode ? 'hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/40' : 'hover:bg-yellow-600 hover:text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {activeView === item.id && (
                    <div className="ml-auto w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </nav>

            {/* Mobile Quick Stats */}
            <div className={`mx-3 mt-6 p-4 rounded-lg border ${
              isDarkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  isDarkMode 
                    ? 'bg-yellow-500/10 hover:bg-yellow-500/15 border border-yellow-500/30 hover:border-yellow-400 hover:shadow-yellow-500/20' 
                    : 'bg-white hover:bg-yellow-50 hover:shadow-yellow-500/20 border border-gray-200 hover:border-yellow-300'
                }`}>
                  <div className={`text-lg font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {userStats?.totalOrders || 0}
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Orders
                  </div>
                </div>
                <div className={`p-3 rounded-lg text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  isDarkMode 
                    ? 'bg-yellow-500/10 hover:bg-yellow-500/15 border border-yellow-500/30 hover:border-yellow-400 hover:shadow-yellow-500/20' 
                    : 'bg-white hover:bg-yellow-50 hover:shadow-yellow-500/20 border border-gray-200 hover:border-yellow-300'
                }`}>
                  <div className={`text-lg font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    ₹{userStats?.totalSpent || 0}
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Spent
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Logout */}
            <div className="mx-3 mt-4">
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  handleLogout();
                }}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:translate-x-1 ${
                  isDarkMode 
                    ? 'text-red-400 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/20 border border-red-500/30 hover:border-red-400' 
                    : 'text-red-600 hover:bg-red-50 hover:shadow-md border border-red-200 hover:border-red-300'
                }`}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 transition-transform duration-300 hover:scale-110" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Top Bar Component
  const TopBar = () => (
    <div className={`shadow-lg border-b fixed top-0 right-0 left-0 md:left-64 z-10 backdrop-blur-md transition-all duration-300 ${
      isDarkMode ? 'bg-gray-900/95 border-gray-800 shadow-gray-900/50' : 'bg-white/95 border-gray-200'
    }`}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`md:hidden p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800 hover:shadow-lg hover:shadow-yellow-500/20' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <h2 className={`ml-3 text-xl font-bold transition-all duration-300 ${
            isDarkMode ? 'text-white hover:text-yellow-300' : 'text-gray-900'
          }`}>
            {activeView === 'browse' ? 'Browse Menu' : 
             activeView === 'orders' ? 'My Orders' :
             activeView === 'cart' ? 'Shopping Cart' :
             activeView === 'favorites' ? 'Favorites' : 
             activeView === 'profile' ? 'Profile' : 
             activeView === 'dashboard' ? 'Dashboard' : 'Browse Menu'}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <button 
            onClick={onThemeToggle}
            className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800 hover:shadow-lg hover:shadow-yellow-500/20' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
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
            className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800 hover:shadow-lg hover:shadow-yellow-500/20' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          
          {/* Notifications */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800 hover:shadow-lg hover:shadow-yellow-500/20' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
              3
            </span>
          </button>

          {/* Cart */}
          <button 
            onClick={() => handleNavigation('cart')}
            className={`relative p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800 hover:shadow-lg hover:shadow-yellow-500/20' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ShoppingCartIcon className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-gray-900 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-bounce">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button 
            onClick={() => handleNavigation('profile')}
            className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800 hover:shadow-lg hover:shadow-yellow-500/20' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900 font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </button>
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

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-xl shadow-2xl border max-w-md w-full transform transition-all duration-300 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <ArrowRightOnRectangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Confirm Logout
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Are you sure you want to logout?
                  </p>
                </div>
              </div>
              
              {isLoggingOut && (
                <div className="flex items-center justify-center py-4">
                  <div className="relative">
                    <div className="w-10 h-10 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <span className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Logging out...
                  </span>
                </div>
              )}
              
              {!isLoggingOut && (
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={cancelLogout}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveLayout;
