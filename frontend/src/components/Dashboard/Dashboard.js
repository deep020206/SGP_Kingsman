
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';
import Profile from './Profile';
import AddMenuItemForm from './AddMenuItemForm';
import MenuManagement from './MenuManagement';
import Orders from './Orders';
import Analytics from './Analytics';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  SunIcon, 
  MoonIcon, 
  ArrowRightOnRectangleIcon,
  HomeIcon,
  Bars3Icon,
  ShoppingBagIcon,
  ChartBarIcon,
  UserIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'rejected',
];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-gray-100 text-gray-800',
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [vendor, setVendor] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState(null);
  const [rejectOrderItems, setRejectOrderItems] = useState([]);
  const [selectedUnavailable, setSelectedUnavailable] = useState([]);
  const [deliveryTimers, setDeliveryTimers] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Redirect if not logged in or not a vendor
  useEffect(() => {
    if (!token || !user) {
      console.log('🚫 No auth token or user, redirecting to login');
      navigate('/', { replace: true });
      return;
    }
    
    if (user.role !== 'vendor') {
      console.log('🚫 User is not a vendor, redirecting to home');
      navigate('/', { replace: true });
      return;
    }
  }, [token, user, navigate]);

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Helper to clear timer for an order
  const clearDeliveryTimer = (orderId) => {
    if (deliveryTimers[orderId]) {
      clearTimeout(deliveryTimers[orderId]);
      setDeliveryTimers((prev) => {
        const newTimers = { ...prev };
        delete newTimers[orderId];
        return newTimers;
      });
    }
  };

  // Function to fetch all vendor data
  const fetchVendorData = async () => {
    console.log('🔄 Fetching vendor data...');
    setLoading(true);
    setError(null);

    try {
      // Fetch vendor profile
      console.log('📋 Fetching vendor profile...');
      const profileRes = await api.get('/vendor/me');
      const vendorData = profileRes.data;
      console.log('✅ Vendor profile loaded:', vendorData);
      setVendor(vendorData);

      // Fetch menu items
      console.log('🍽️ Fetching menu items...');
      const menuRes = await api.get('/vendor/my-items');
      const items = menuRes.data.items || [];
      console.log('✅ Menu items loaded:', items.length, 'items -', menuRes.data.message);
      setMenuItems(items);

      // Fetch orders
      console.log('📦 Fetching orders...');
      const ordersRes = await api.get('/vendor/orders');
      
      // Handle both array and object with orders property
      const ordersData = Array.isArray(ordersRes.data) 
        ? ordersRes.data 
        : (ordersRes.data.orders || []);
        
      console.log('✅ Orders loaded:', ordersData.length, 'orders');
      setOrders(ordersData);

      console.log('🎉 All data loaded successfully!');
    } catch (error) {
      console.error('❌ Error fetching vendor data:', error);
      setError(error.response?.data?.message || 'Error loading vendor data');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch menu items only
  const fetchMenuItems = async () => {
    try {
      console.log('🍽️ Fetching menu items...');
      const menuRes = await api.get('/vendor/my-items');
      const items = menuRes.data.items || [];
      console.log('✅ Menu items loaded:', items.length, 'items -', menuRes.data.message);
      setMenuItems(items);
    } catch (error) {
      console.error('❌ Error fetching menu items:', error);
    }
  };

  // Function to update order status
  const updateOrderStatus = async (orderId, newStatus, reason = '', rejectedItems = []) => {
    try {
      console.log('🔄 Updating order status:', orderId, 'to', newStatus);
      
      const payload = { status: newStatus };
      if (reason) payload.rejectionReason = reason;
      if (rejectedItems.length > 0) payload.rejectedItems = rejectedItems;
      
      const response = await api.patch(`/vendor/orders/${orderId}/status`, payload);
      
      console.log('✅ Order status updated successfully:', response.data);
      
      // Get the order that was updated
      const updatedOrder = orders.find(order => order._id === orderId);
      const orderNumber = updatedOrder?.orderNumber || 'Unknown';
      
      // Update the orders list locally
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus, rejectionReason: reason, rejectedItems }
            : order
        )
      );
      
      // Show a toast notification
      const statusLabel = STATUS_LABELS[newStatus] || newStatus;
      let toastMessage;
      let toastType = 'success';
      
      switch(newStatus) {
        case 'accepted':
          toastMessage = `Order #${orderNumber} accepted successfully`;
          break;
        case 'preparing':
          toastMessage = `Order #${orderNumber} is now being prepared`;
          break;
        case 'out_for_delivery':
          toastMessage = `Order #${orderNumber} is out for delivery`;
          break;
        case 'delivered':
          toastMessage = `Order #${orderNumber} marked as delivered`;
          break;
        case 'rejected':
          toastMessage = `Order #${orderNumber} has been rejected`;
          toastType = 'error';
          break;
        case 'cancelled':
          toastMessage = `Order #${orderNumber} has been cancelled`;
          toastType = 'warning';
          break;
        default:
          toastMessage = `Order #${orderNumber} status updated to ${statusLabel}`;
      }
      
      // Show toast notification
      if (toastType === 'success') {
        toast.success(toastMessage);
      } else if (toastType === 'error') {
        toast.error(toastMessage);
      } else if (toastType === 'warning') {
        toast.warning(toastMessage);
      } else {
        toast.info(toastMessage);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating order status:', error.response?.data || error.message);
      
      // Show error toast
      toast.error(`Failed to update order status: ${error.response?.data?.message || error.message}`);
      
      throw error;
    }
  };

  // Single useEffect for data fetching - only runs when user/token changes
  useEffect(() => {
    if (!token || !user || user.role !== 'vendor') {
      return;
    }

    const fetchVendorData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching vendor data...');

        // Fetch all data in parallel for better performance
        const [vendorRes, menuRes, ordersRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/vendor/my-items'),
          api.get('/vendor/orders')
        ]);

        console.log('✅ Vendor profile loaded:', vendorRes.data);
        setVendor(vendorRes.data);

        const { items = [], message } = menuRes.data;
        console.log('✅ Menu items loaded:', items.length, 'items -', message);
        setMenuItems(items);
        if (items.length === 0) {
          setError(message);
        } else {
          setError(null);
        }

        console.log('✅ Orders loaded:', ordersRes.data.orders?.length || 0, 'orders');
        setOrders(ordersRes.data.orders || []);
        
        console.log('🎉 All data loaded successfully!');
      } catch (err) {
        console.error('❌ Error fetching vendor data:', err);
        
        if (err.response) {
          console.error('📡 Server response:', err.response.status, err.response.data);
          
          if (err.response.status === 401) {
            setError('Session expired or unauthorized. Please login again.');
            logout();
            navigate('/login');
          } else if (err.response.status === 404) {
            setError('API endpoint not found. Please check server configuration.');
          } else if (err.response.status === 500) {
            setError('Server error. Please try again later.');
          } else {
            setError(`Server error: ${err.response.data?.message || err.response.statusText}`);
          }
        } else if (err.request) {
          console.error('🌐 Network error:', err.request);
          setError('Cannot connect to server. Please check if the backend is running on port 5002.');
        } else {
          console.error('❓ Other error:', err.message);
          setError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();

    // Cleanup timers on unmount
    return () => {
      Object.values(deliveryTimers).forEach(clearTimeout);
    };
  }, [token, user, navigate, logout]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                <ShoppingBagIcon className={`h-5 w-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
              <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Vendor Panel</span>
            </div>
            <button
              onClick={toggleMode}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-yellow-600'}`}
            >
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Horizontal Navigation Tabs */}
          <div className="mt-4 flex space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard' 
                  ? `${isDarkMode ? 'bg-yellow-500 text-gray-900' : 'bg-yellow-500 text-white'}` 
                  : `${isDarkMode ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600'}`
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'menu' 
                  ? `${isDarkMode ? 'bg-yellow-500 text-gray-900' : 'bg-yellow-500 text-white'}` 
                  : `${isDarkMode ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600'}`
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'orders' 
                  ? `${isDarkMode ? 'bg-yellow-500 text-gray-900' : 'bg-yellow-500 text-white'}` 
                  : `${isDarkMode ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600'}`
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'analytics' 
                  ? `${isDarkMode ? 'bg-yellow-500 text-gray-900' : 'bg-yellow-500 text-white'}` 
                  : `${isDarkMode ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600'}`
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'profile' 
                  ? `${isDarkMode ? 'bg-yellow-500 text-gray-900' : 'bg-yellow-500 text-white'}` 
                  : `${isDarkMode ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600'}`
              }`}
            >
              Profile
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className={`w-64 ${isDarkMode ? 'bg-gray-800/50 backdrop-blur-md' : 'bg-white'} border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} text-${isDarkMode ? 'gray-200' : 'gray-800'} flex flex-col py-8 px-4 min-h-screen shadow-lg`}>
          <div className="mb-8 flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
              <ShoppingBagIcon className={`h-6 w-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Vendor Panel</span>
          </div>
          <nav className="flex-1 space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg transition font-medium flex items-center ${activeTab === 'dashboard' ? `${isDarkMode ? 'bg-yellow-500 text-gray-900' : 'bg-yellow-500 text-white'} shadow font-bold` : `${isDarkMode ? 'hover:bg-gray-700 hover:text-yellow-400' : 'hover:bg-gray-100 hover:text-yellow-600'}`}`}
            >
              <HomeIcon className="h-5 w-5 mr-3" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`w-full text-left px-4 py-3 rounded-lg transition font-medium flex items-center ${activeTab === 'menu' ? `${isDarkMode ? 'bg-yellow-500 text-gray-900' : 'bg-yellow-500 text-white'} shadow font-bold` : `${isDarkMode ? 'hover:bg-gray-700 hover:text-yellow-400' : 'hover:bg-gray-100 hover:text-yellow-600'}`}`}
            >
              <Bars3Icon className="h-5 w-5 mr-3" />
              Menu Management
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-3 rounded-lg transition font-medium flex items-center ${activeTab === 'orders' ? `${isDarkMode ? 'bg-yellow-500 text-gray-900' : 'bg-yellow-500 text-white'} shadow font-bold` : `${isDarkMode ? 'hover:bg-gray-700 hover:text-yellow-400' : 'hover:bg-gray-100 hover:text-yellow-600'}`}`}
            >
              <ShoppingBagIcon className="h-5 w-5 mr-3" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full text-left px-4 py-3 rounded-lg transition font-medium flex items-center ${activeTab === 'analytics' ? `${isDarkMode ? 'bg-yellow-500 text-gray-900' : 'bg-yellow-500 text-white'} shadow font-bold` : `${isDarkMode ? 'hover:bg-gray-700 hover:text-yellow-400' : 'hover:bg-gray-100 hover:text-yellow-600'}`}`}
            >
              <ChartBarIcon className="h-5 w-5 mr-3" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-lg transition font-medium flex items-center ${activeTab === 'profile' ? `${isDarkMode ? 'bg-yellow-500 text-gray-900' : 'bg-yellow-500 text-white'} shadow font-bold` : `${isDarkMode ? 'hover:bg-gray-700 hover:text-yellow-400' : 'hover:bg-gray-100 hover:text-yellow-600'}`}`}
            >
              <UserIcon className="h-5 w-5 mr-3" />
              Profile
            </button>
          </nav>

          <div className="mt-auto space-y-2">
            <button
              onClick={toggleMode}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-yellow-600 hover:bg-gray-200'}`}
            >
              {isDarkMode ? <SunIcon className="h-5 w-5 mr-2" /> : <MoonIcon className="h-5 w-5 mr-2" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  logout();
                  window.location.href = '/';
                }
              }}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </aside>

        {/* Desktop Main Content */}
        <main className="flex-1 p-8">
          {loading ? (
            <div className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</div>
          ) : error ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Welcome Section */}
                  <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg mb-8`}>
                    <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Welcome back, {vendor?.name || 'Vendor'}!</h1>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ready to manage your restaurant and orders?</p>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}>
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                          <ShoppingBagIcon className={`h-6 w-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                        </div>
                        <div className="ml-4">
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Orders</p>
                          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{orders.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}>
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                          <Bars3Icon className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                        <div className="ml-4">
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Menu Items</p>
                          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{menuItems.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}>
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                          <CurrencyDollarIcon className={`h-6 w-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                        </div>
                        <div className="ml-4">
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Revenue</p>
                          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            ₹{Array.isArray(orders) ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) : 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}>
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                          <StarIcon className={`h-6 w-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        </div>
                        <div className="ml-4">
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rating</p>
                          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>4.8★</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}>
                    <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Orders</h3>
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order._id} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order #{order.orderNumber}</p>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>₹{order.totalAmount}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'menu' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <MenuManagement 
                    isDarkMode={isDarkMode} 
                    menuItems={menuItems || []} 
                    onMenuItemsUpdate={fetchMenuItems}
                  />
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Orders isDarkMode={isDarkMode} orders={orders || []} onUpdateOrderStatus={updateOrderStatus} />
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Analytics isDarkMode={isDarkMode} orders={orders || []} menuItems={menuItems || []} />
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Profile isDarkMode={isDarkMode} vendor={vendor} />
                </motion.div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 bg-yellow-500 text-white p-3 rounded-full shadow-lg"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl p-4 transform transition-transform duration-300"
               onClick={e => e.stopPropagation()}>
            <div className="flex flex-col space-y-4">
              {Object.entries(TABS).map(([key, { label, icon: Icon }]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 p-3 rounded-lg transition-colors duration-200
                    ${activeTab === key 
                      ? 'bg-yellow-500 text-white' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Main Content */}
      <div className="md:hidden p-4 pb-20">
        {loading ? (
          <div className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</div>
        ) : error ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Welcome Section */}
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4 shadow-lg mb-6`}>
                  <h1 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Welcome back, {vendor?.name || 'Vendor'}!</h1>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ready to manage your restaurant and orders?</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                  <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-3 sm:p-4 shadow-lg`}>
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                        <ShoppingBagIcon className={`h-5 w-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                      </div>
                      <div className="ml-3">
                        <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Orders</p>
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{orders.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4 shadow-lg`}>
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                        <Bars3Icon className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div className="ml-3">
                        <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Menu Items</p>
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{menuItems.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4 shadow-lg`}>
                  <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Orders</h3>
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order._id} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-3`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order #{order.orderNumber}</p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>₹{order.totalAmount}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'menu' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <MenuManagement 
                  isDarkMode={isDarkMode} 
                  menuItems={menuItems || []} 
                  onMenuItemsUpdate={fetchMenuItems}
                />
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Orders isDarkMode={isDarkMode} orders={orders || []} onUpdateOrderStatus={updateOrderStatus} />
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Analytics isDarkMode={isDarkMode} orders={orders || []} menuItems={menuItems || []} />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Profile isDarkMode={isDarkMode} vendor={vendor} />
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
