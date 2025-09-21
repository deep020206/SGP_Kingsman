import Profile from './Profile';
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';
import { motion } from 'framer-motion';
import ResponsiveLayout from '../Layout/ResponsiveLayout';
import Orders from './Orders';
import { toast } from 'react-toastify';
import { 
  ShoppingCartIcon, 
  UserIcon, 
  SunIcon, 
  MoonIcon, 
  ArrowRightOnRectangleIcon,
  HomeIcon,
  ClockIcon,
  StarIcon,
  HeartIcon,
  CurrencyDollarIcon,
  PlusIcon,
  MinusIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import InstructionsModal from '../Menu/InstructionsModal';
import SearchBar from '../Search/SearchBar';
import searchService from '../../services/searchService';

const UserDashboard = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  
  // Menu and cart state
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [menuQuantities, setMenuQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Order state
  const [orders, setOrders] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [scheduleTime, setScheduleTime] = useState('');
  const [orderError, setOrderError] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // UI state
  const [orderToRate, setOrderToRate] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [activeView, setActiveView] = useState('browse');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Instructions modal state
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priceMin: 0,
    priceMax: 1000,
    isVegetarian: false,
    spiceLevel: '',
    sortBy: 'name'
  });
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Fetch menu items from backend
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response = await api.get('/menu');
        const items = response.data || [];
        setMenuItems(items);
        setFilteredMenuItems(items);
        
        // Update price range based on actual data
        const priceRange = searchService.getPriceRange(items);
        setFilters(prev => ({
          ...prev,
          priceMin: priceRange.min,
          priceMax: priceRange.max
        }));
        
        setError('');
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setError('Failed to load menu items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMenuItems();
    }
  }, [token]);

  // Handle search and filtering
  useEffect(() => {
    const filtered = searchService.searchMenuItems(menuItems, searchQuery, filters);
    setFilteredMenuItems(filtered);
  }, [menuItems, searchQuery, filters]);

  // Fetch orders function
  const fetchOrders = useCallback(async () => {
    try {
      console.log('🔄 Fetching orders...');
      const response = await api.get('/orders/my-orders');
      if (response.data.success) {
        console.log('✅ Orders fetched:', response.data.orders.length, 'orders');
        setOrders(response.data.orders);
      } else {
        console.error('❌ Failed to fetch orders:', response.data);
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      setOrders([]);
    }
  }, []); // Empty dependency array to prevent recreation

  // Fetch orders - only run once with token
  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]); // Remove fetchOrders from dependency array

  // Cart functions
  const addToCart = (menuItem, selectedInstructions = [], customInstructions = '') => {
    // Create a unique key for this cart item combination
    const itemKey = `${menuItem._id}-${JSON.stringify(selectedInstructions)}-${customInstructions}`;
    
    const existingItemIndex = cart.findIndex(item => 
      item._id === menuItem._id && 
      JSON.stringify(item.selectedInstructions || []) === JSON.stringify(selectedInstructions) &&
      (item.customInstructions || '') === customInstructions
    );
    
    if (existingItemIndex !== -1) {
      // Update existing item quantity
      const updatedCart = [...cart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: updatedCart[existingItemIndex].quantity + 1
      };
      setCart(updatedCart);
    } else {
      // Calculate total price including instruction modifiers
      const instructionPrice = selectedInstructions.reduce((total, inst) => total + (inst.priceModifier || 0), 0);
      const totalItemPrice = menuItem.price + instructionPrice;
      
      setCart([...cart, { 
        ...menuItem, 
        quantity: 1,
        selectedInstructions,
        customInstructions,
        totalItemPrice,
        itemKey // Add unique key for identification
      }]);
    }
  };

  const openInstructionsModal = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setShowInstructionsModal(true);
  };

  // Search and filter handlers
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const removeFromCart = (itemKey) => {
    setCart(cart.filter(item => item.itemKey !== itemKey));
  };

  const updateCartQuantity = (itemKey, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemKey);
    } else {
      setCart(cart.map(item =>
        item.itemKey === itemKey
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + ((item.totalItemPrice || item.price) * item.quantity), 0);
  };

  // Menu quantity functions
  const updateMenuQuantity = (itemId, change) => {
    setMenuQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change)
    }));
  };

  const addMenuItemToCart = (menuItem) => {
    const quantity = menuQuantities[menuItem._id] || 1;
    for (let i = 0; i < quantity; i++) {
      addToCart(menuItem);
    }
    setMenuQuantities(prev => ({ ...prev, [menuItem._id]: 0 }));
  };

  // Order functions
  const placeOrder = async () => {
    if (cart.length === 0) {
      setOrderError('Cart is empty');
      return;
    }

    if (!deliveryAddress.trim()) {
      setOrderError('Please enter delivery address');
      return;
    }

    if (!paymentMethod) {
      setOrderError('Please select a payment method');
      return;
    }

    try {
      // Prepare items with proper menu item references
      // Group items by vendor
      const itemsByVendor = cart.reduce((acc, item) => {
        const vendorId = item.vendorId || (item.menuItem && item.menuItem.vendorId);
        if (!vendorId) {
          throw new Error(`No vendor found for item: ${item.name}`);
        }
        
        if (!acc[vendorId]) {
          acc[vendorId] = [];
        }
        acc[vendorId].push(item);
        return acc;
      }, {});

      const vendors = Object.keys(itemsByVendor);
      if (vendors.length > 1) {
        throw new Error('Cannot place order with items from multiple vendors');
      }

      // Check if all items are from the same vendor
      const vendorId = cart[0]?.vendorId || cart[0]?.menuItem?.vendorId;
      const allSameVendor = cart.every(item => 
        (item.vendorId || item.menuItem?.vendorId) === vendorId
      );

      if (!vendorId) {
        throw new Error('Vendor information is missing from menu items');
      }

      if (!allSameVendor) {
        throw new Error('All items must be from the same vendor');
      }

      const preparedItems = cart.map(item => {
        if (!item._id && !item.menuItem) {
          throw new Error(`Invalid menu item reference for ${item.name}`);
        }
        return {
          menuItem: item._id || item.menuItem._id,
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price),
          selectedInstructions: item.selectedInstructions || [],
          customInstructions: item.customInstructions || '',
          totalItemPrice: item.totalItemPrice || item.price
        };
      });

      const orderData = {
        items: preparedItems,
        vendorId: vendorId,
        totalAmount: parseFloat(getTotalPrice()),
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod: paymentMethod,
        scheduledFor: scheduleTime ? new Date(scheduleTime).toISOString() : null,
        specialInstructions: specialInstructions.trim() || '',
        status: 'pending'
      };

      const response = await api.post('/orders', orderData);

      if (response.data) {
        // Clear cart and form
        setCart([]);
        setDeliveryAddress('');
        setSpecialInstructions('');
        setScheduleTime('');
        setOrderError('');
        
        // Refresh orders automatically
        await fetchOrders();
        
        alert('Order placed successfully!');
        
        // Switch to orders view to show the new order
        setActiveView('orders');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      let errorMessage = 'Failed to place order';
      
      if (error.message.includes('Vendor information is missing')) {
        errorMessage = 'Could not determine vendor for the order. Please try again or contact support.';
      } else if (error.message.includes('same vendor')) {
        errorMessage = 'All items in your order must be from the same vendor.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setOrderError(errorMessage);
    }
  };

  const handleNavigation = (viewId) => {
    setActiveView(viewId);
  };

  // Reorder function
  const handleReorder = async (order) => {
    try {
      // Get available items from the original order
      const availableItems = order.items.filter(item => !item.isRejected && item.menuItemId);
      
      if (availableItems.length === 0) {
        alert('No available items to reorder');
        return;
      }

      // Add items to cart
      const newCartItems = [];
      for (const item of availableItems) {
        // Check if item still exists in menu
        const menuItem = menuItems.find(m => m._id === item.menuItemId._id);
        if (menuItem) {
          newCartItems.push({
            ...menuItem,
            quantity: item.quantity
          });
        }
      }

      if (newCartItems.length === 0) {
        alert('Items are no longer available in the menu');
        return;
      }

      // Update cart with reordered items
      setCart(newCartItems);
      
      // Copy delivery details
      setDeliveryAddress(order.deliveryAddress || '');
      setSpecialInstructions(order.specialInstructions || '');
      
      // Switch to browse view to complete the order
      setActiveView('browse');
      
      alert(`${newCartItems.length} items added to cart from your previous order`);
      
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Failed to reorder items');
    }
  };

  // Cancel order function
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.patch(`/orders/${orderId}/cancel`, {});
      
      // Refresh orders
      await fetchOrders();
      
      // Show success message
      toast.success('Order cancelled successfully');
      
      console.log('Cancel order response:', response.data);
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel order';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Browse Menu View
  const BrowseMenuView = () => (
  <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 py-2">
      {/* Quick Stats */}
  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className={`p-6 rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <ClipboardDocumentListIcon className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Orders</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{Array.isArray(orders) ? orders.length : 0}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
              <CurrencyDollarIcon className={`h-6 w-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Spent</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{Array.isArray(orders) ? orders.reduce((sum, order) => sum + order.totalAmount, 0) : 0}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
              <ShoppingCartIcon className={`h-6 w-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cart Items</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{Array.isArray(cart) ? cart.length : 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <SearchBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        isDarkMode={isDarkMode}
        categories={searchService.getCategories(menuItems)}
        priceRange={searchService.getPriceRange(menuItems)}
        filters={filters}
      />

      {/* Menu Items */}
  <div className={`rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-yellow-100'}`}> 
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Available Menu Items
            </h2>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {filteredMenuItems.length} of {menuItems.length} items
            </span>
          </div>
        </div>
        
  <div className="p-3 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading menu items...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className={`${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className={`mt-4 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
              >
                Retry
              </button>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="text-center py-12">
              {searchQuery || Object.values(filters).some(f => f && f !== '' && f !== false) ? (
                <div>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No items found matching your search criteria.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({
                        category: '',
                        priceMin: searchService.getPriceRange(menuItems).min,
                        priceMax: searchService.getPriceRange(menuItems).max,
                        isVegetarian: false,
                        spiceLevel: '',
                        sortBy: 'name'
                      });
                    }}
                    className={`mt-4 px-4 py-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                  >
                    Clear Search & Filters
                  </button>
                </div>
              ) : (
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No menu items available at the moment.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredMenuItems.map((item) => (
                <div key={item._id} className={`border rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-yellow-100 bg-white'}`}> 
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                  <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>₹{item.price}</span>
                    {item.avgRating > 0 && (
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className={`ml-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.avgRating}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateMenuQuantity(item._id, -1)}
                          className={`p-1 rounded-full border hover:shadow-md transition-colors ${
                            isDarkMode 
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                          disabled={!menuQuantities[item._id]}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className={`w-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{menuQuantities[item._id] || 0}</span>
                        <button
                          onClick={() => updateMenuQuantity(item._id, 1)}
                          className={`p-1 rounded-full border hover:shadow-md transition-colors ${
                            isDarkMode 
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => addMenuItemToCart(item)}
                        disabled={!menuQuantities[item._id]}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed ${
                          !menuQuantities[item._id] 
                            ? `${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'}` 
                            : `${isDarkMode ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`
                        }`}
                      >
                        Add to Cart
                      </button>
                    </div>
                    
                    {/* Instructions Button */}
                    <button
                      onClick={() => openInstructionsModal(item)}
                      className={`w-full px-4 py-2 rounded-lg border transition-colors flex items-center justify-center space-x-2 ${
                        isDarkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Cog6ToothIcon className="h-4 w-4" />
                      <span>Customize</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Orders View
  const OrdersView = () => (
    <div className="space-y-6">
      <div className={`rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Orders</h2>
        </div>
        
        <div className="p-6">
          {!Array.isArray(orders) || orders.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No orders yet. Start browsing the menu!</p>
              <button
                onClick={() => setActiveView('browse')}
                className={`mt-4 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order #{order.orderNumber}</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' || order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'out_for_delivery' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'accepted' ? 'Accepted' :
                       order.status === 'out_for_delivery' ? 'Out for Delivery' :
                       order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  
                  {/* Show rejection notice if there are rejected items */}
                  {order.hasRejectedItems && order.rejectionReason && (
                    <div className={`mb-3 p-3 rounded-lg ${isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-600'}`}>
                      <p className="text-sm font-medium">⚠️ Some items were not available:</p>
                      <p className="text-sm">{order.rejectionReason}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {order.items?.map((item, index) => (
                      <div key={index} className={`flex justify-between text-sm ${item.isRejected ? 'opacity-50' : ''}`}>
                        <span className={item.isRejected ? 'line-through' : ''}>
                          {item.menuItem?.name || item.name || 'Unknown Item'} x{item.quantity}
                          {item.isRejected && (
                            <span className={`ml-2 text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-600'}`}>
                              Not Available
                            </span>
                          )}
                        </span>
                        <span className={item.isRejected ? 'line-through' : ''}>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                    
                    {/* Action buttons based on order status */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {/* Reorder button for rejected or completed orders */}
                      {(order.status === 'rejected' || order.status === 'delivered' || order.hasRejectedItems) && (
                        <button
                          onClick={() => handleReorder(order)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            isDarkMode 
                              ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                              : 'bg-yellow-500 text-white hover:bg-yellow-600'
                          }`}
                        >
                          {order.hasRejectedItems ? 'Reorder Available Items' : 'Order Again'}
                        </button>
                      )}
                      
                      {/* Cancel button for pending/accepted orders */}
                      {(order.status === 'pending' || order.status === 'accepted') && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            isDarkMode 
                              ? 'bg-red-600 text-white hover:bg-red-700' 
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          Cancel Order
                        </button>
                      )}
                      
                      {/* Status indicator for processing orders */}
                      {(order.status === 'preparing' || order.status === 'out_for_delivery') && (
                        <span className={`px-3 py-1 rounded text-sm ${
                          isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {order.status === 'preparing' ? '👨‍🍳 Being Prepared' : '🚚 On the Way'}
                        </span>
                      )}
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

  // Event handlers for form inputs - use useCallback to prevent re-renders
  const handleAddressChange = useCallback((e) => {
    setDeliveryAddress(e.target.value);
  }, []);

  const handleSpecialInstructionsChange = useCallback((e) => {
    setSpecialInstructions(e.target.value);
  }, []);

  const handlePaymentMethodChange = useCallback((e) => {
    setPaymentMethod(e.target.value);
  }, []);

  const handleScheduleTimeChange = useCallback((e) => {
    setScheduleTime(e.target.value);
  }, []);

  // Cart View
  const CartView = () => (
    <div className="space-y-6">
      <div className={`rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Shopping Cart</h2>
        </div>
        
        <div className="p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCartIcon className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your cart is empty</p>
              <button
                onClick={() => setActiveView('browse')}
                className={`mt-4 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart Items */}
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={item.itemKey || `${item._id}-${index}`} className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Base: ₹{item.price} each
                          {item.totalItemPrice && item.totalItemPrice !== item.price && (
                            <span className="ml-2 text-green-600 font-medium">
                              Total: ₹{item.totalItemPrice} each
                            </span>
                          )}
                        </p>
                        
                        {/* Display selected instructions */}
                        {item.selectedInstructions && item.selectedInstructions.length > 0 && (
                          <div className="mt-2">
                            <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Add-ons:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selectedInstructions.map((instruction, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    instruction.priceModifier > 0 
                                      ? 'bg-green-100 text-green-700' 
                                      : instruction.priceModifier < 0 
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {instruction.name}
                                  {instruction.priceModifier !== 0 && (
                                    <span className="ml-1">
                                      {instruction.priceModifier > 0 ? '+' : ''}₹{instruction.priceModifier}
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Display custom instructions */}
                        {item.customInstructions && (
                          <div className="mt-2">
                            <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Special Instructions:</p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
                              "{item.customInstructions}"
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartQuantity(item.itemKey, item.quantity - 1)}
                          className={`p-1 rounded-full border hover:bg-gray-100 ${
                            isDarkMode 
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className={`w-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.itemKey, item.quantity + 1)}
                          className={`p-1 rounded-full border hover:bg-gray-100 ${
                            isDarkMode 
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ₹{(item.totalItemPrice || item.price) * item.quantity}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.itemKey)}
                          className={`text-sm hover:underline ${
                            isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
                          }`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className={`border-t pt-6 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className={`rounded-lg p-4 space-y-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className={`flex justify-between text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span>Total: ₹{getTotalPrice()}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Delivery Address *
                      </label>
                      <textarea
                        key="delivery-address-input"
                        value={deliveryAddress}
                        onChange={handleAddressChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-300 focus:bg-gray-600' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white'
                        }`}
                        rows="3"
                        placeholder="Enter your full delivery address"
                        required
                        autoComplete="address-line1"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={handlePaymentMethodChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:bg-gray-600' 
                            : 'bg-white border-gray-300 text-gray-900 focus:bg-white'
                        }`}
                      >
                        <option value="cash">Cash on Delivery</option>
                        <option value="online">Online Payment</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Delivery Date & Time (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduleTime}
                        onChange={handleScheduleTimeChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:bg-gray-600' 
                            : 'bg-white border-gray-300 text-gray-900 focus:bg-white'
                        }`}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Special Instructions (Optional)
                      </label>
                      <textarea
                        key="special-instructions-input"
                        value={specialInstructions}
                        onChange={handleSpecialInstructionsChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-300 focus:bg-gray-600' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white'
                        }`}
                        rows="2"
                        placeholder="Any special instructions for your order"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  
                  {orderError && (
                    <div className={`text-sm p-3 rounded-lg ${isDarkMode ? 'text-red-300 bg-red-900/20' : 'text-red-600 bg-red-50'}`}>
                      {orderError}
                    </div>
                  )}
                  
                  <button
                    onClick={placeOrder}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      isDarkMode 
                        ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Favorites View (placeholder)
  const FavoritesView = () => (
    <div className="space-y-6">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Favorite Items</h2>
        </div>
        
        <div className="p-6">
          <div className="text-center py-12">
            <HeartIcon className={`h-12 w-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} mx-auto mb-4`} />
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>No favorite items yet</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} mt-2`}>Add items to favorites while browsing the menu</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (activeView) {
      case 'browse':
        return <BrowseMenuView />;
      case 'orders':
        return <OrdersView />;
      case 'cart':
        return <CartView />;
      case 'favorites':
        return <FavoritesView />;
      case 'profile':
        return <Profile isDarkMode={isDarkMode} />;
      default:
        return <BrowseMenuView />;
    }
  };

  return (
    <>
      <ResponsiveLayout 
        currentPage={activeView} 
        onNavigate={handleNavigation}
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
        cartItemCount={cart.length}
      >
        {renderCurrentView()}
      </ResponsiveLayout>
      
      {/* Instructions Modal */}
      <InstructionsModal
        isOpen={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
        menuItem={selectedMenuItem}
        selectedInstructions={[]}
        onInstructionsChange={(instructions) => {
          if (selectedMenuItem) {
            addToCart(selectedMenuItem, instructions, '');
          }
        }}
        customInstructions=""
        onCustomInstructionsChange={(custom) => {
          if (selectedMenuItem) {
            addToCart(selectedMenuItem, [], custom);
          }
        }}
      />
    </>
  );
};

export default UserDashboard;
