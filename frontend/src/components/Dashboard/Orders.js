import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  XMarkIcon, 
  EyeIcon, 
  PencilIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const Orders = ({ isDarkMode, orders = [], onUpdateOrderStatus }) => {
  console.log('📦 Rendering Orders component with:', orders.length, 'orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updatingOrders, setUpdatingOrders] = useState({});
  const [error, setError] = useState('');
  const [rejectedItems, setRejectedItems] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLargeView, setIsLargeView] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const ORDER_STATUSES = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'accepted', label: 'Accepted', color: 'bg-blue-100 text-blue-800' },
    { value: 'preparing', label: 'Preparing', color: 'bg-purple-100 text-purple-800' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-gray-100 text-gray-800' }
  ];

  const VENDOR_UPDATABLE_STATUSES = [
    { value: 'accepted', label: 'Accept Order', color: 'bg-blue-100 text-blue-800' },
    { value: 'preparing', label: 'Preparing', color: 'bg-purple-100 text-purple-800' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' }
  ];

  const getStatusColor = (status) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status === 'pending' ? 'accepted' : order.status);
    setIsEditModalOpen(true);
  };

  const handleRejectItems = (order) => {
    setSelectedOrder(order);
    setRejectedItems([]);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const toggleItemRejection = (itemId) => {
    setRejectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handlePartialReject = async () => {
    if (selectedOrder && rejectedItems.length > 0 && onUpdateOrderStatus) {
      try {
        setUpdating(true);
        setError('');
        
        // If all items are rejected, reject the entire order
        if (rejectedItems.length === selectedOrder.items.length) {
          await onUpdateOrderStatus(selectedOrder._id, 'rejected', rejectionReason);
        } else {
          // Partially reject items
          await onUpdateOrderStatus(selectedOrder._id, 'partially_rejected', rejectionReason, rejectedItems);
        }
        
        setIsRejectModalOpen(false);
        setSelectedOrder(null);
        setRejectedItems([]);
        setRejectionReason('');
      } catch (error) {
        console.error('Error rejecting items:', error);
        setError(error.response?.data?.message || 'Failed to reject items. Please try again.');
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleUpdateStatus = async () => {
    if (selectedOrder && newStatus && onUpdateOrderStatus) {
      try {
        setUpdating(true);
        setError('');
        await onUpdateOrderStatus(selectedOrder._id, newStatus);
        setIsEditModalOpen(false);
        setSelectedOrder(null);
        setNewStatus('');
      } catch (error) {
        console.error('Error updating order status:', error);
        setError('Failed to update order status. Please try again.');
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleQuickStatusUpdate = async (orderId, newStatus) => {
    try {
      // Set this specific order as updating
      setUpdatingOrders(prev => ({ ...prev, [orderId]: true }));
      setError('');
      await onUpdateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update order status. Please try again.');
      
      // Show error toast
      toast.error('Failed to update order status. Please try again.');
    } finally {
      // Clear the updating state for this specific order
      setUpdatingOrders(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const closeModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsRejectModalOpen(false);
    setSelectedOrder(null);
    setNewStatus('');
    setError('');
    setRejectedItems([]);
    setRejectionReason('');
  };
  return (
    <div>
      {/* Mobile Order Header */}
      <div className="md:hidden sticky top-16 bg-gray-50 dark:bg-gray-900 z-10 -mx-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Orders</h2>
            <span className={`text-sm px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {orders.length} Total
            </span>
          </div>
          
          {/* Mobile Order Filters */}
          <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
            {['all', ...new Set(orders.map(order => order.status))].map(status => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeFilter === status
                    ? 'bg-yellow-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Orders' : STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex justify-between items-center mb-6">
        <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Orders</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsLargeView(!isLargeView)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isLargeView ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Table View</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Large View</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Order List */}
      <div className="md:hidden -mx-4">
        {!Array.isArray(orders) ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40">
            <ShoppingBagIcon className="h-10 w-10 text-gray-400 mb-2" />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {orders
              .filter(order => activeFilter === 'all' || order.status === activeFilter)
              .map((order) => (
                <div
                  key={order._id}
                  className={`p-4 ${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'} transition-colors duration-200`}
                  onClick={() => handleViewOrder(order)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Order #{order.orderNumber}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        ₹{order.totalAmount.toFixed(2)}
                      </span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        · {order.items.length} items
                      </span>
                    </div>
                    <button
                      className={`text-sm px-3 py-1 rounded-lg ${
                        isDarkMode
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Desktop View */}
      {isLargeView ? (
        // Large View - Card Layout
        <div className="hidden md:grid gap-6">
          {!Array.isArray(orders) ? (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center py-12 rounded-xl border shadow-lg ${
                isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              <div className={`mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <ShoppingBagIcon className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <p className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No orders yet</p>
              <p className="text-sm">Orders from customers will appear here</p>
            </motion.div>
          ) : orders.map((order, index) => (
            <motion.div
              key={order._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`border rounded-xl p-6 shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Order #{order.orderNumber}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {order.formattedDate}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    {order.vendorId?.name} • {order.itemCount} items
                  </p>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-1`}>
                    Total: ₹{order.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => handleRejectItems(order)}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'} transition-colors`}
                    >
                      <XMarkIcon className="h-4 w-4" />
                      <span>Reject Items</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Customer</label>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.userId?.name || 'Unknown'}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Amount</label>
                  <p className={`text-lg font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>₹{order.totalAmount}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Payment</label>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.paymentMethod || 'Cash'}</p>
                </div>
              </div>

              {/* Delivery Address */}
              {order.deliveryAddress && (
                <div className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Delivery Address</label>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.deliveryAddress}</p>
                  {order.specialInstructions && (
                    <div className="mt-2">
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Special Instructions</label>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{order.specialInstructions}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Order Items */}
              <div className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order Items</h4>
                <div className="space-y-2">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.menuItem?.name || item.name}</span>
                        <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>x{item.quantity}</span>
                      </div>
                      <span className={`font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update Controls */}
              {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'rejected' && (
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Update Order Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {VENDOR_UPDATABLE_STATUSES.map((status) => {
                      const isCurrentStatus = status.value === order.status;
                      const isDisabled = updatingOrders[order._id] || isCurrentStatus;
                      const isUpdating = updatingOrders[order._id];
                      
                      return (
                        <button
                          key={status.value}
                          onClick={() => handleQuickStatusUpdate(order._id, status.value)}
                          disabled={isDisabled}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isCurrentStatus
                              ? `${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'} cursor-not-allowed`
                              : isUpdating
                                ? `${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} opacity-70 cursor-not-allowed`
                                : `${isDarkMode ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`
                          }`}
                        >
                          {isUpdating ? 'Updating...' : status.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        // Table View - Original Layout
        <div className="overflow-x-auto">
        <table className={`min-w-full border rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <tr>
              <th className={`py-3 px-4 border-b ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'} font-semibold`}>Order #</th>
              <th className={`py-3 px-4 border-b ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'} font-semibold`}>Status</th>
              <th className={`py-3 px-4 border-b ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'} font-semibold`}>Total</th>
              <th className={`py-3 px-4 border-b ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'} font-semibold`}>Customer</th>
              <th className={`py-3 px-4 border-b ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'} font-semibold`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 mb-3 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <ShoppingBagIcon className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <p className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No orders yet</p>
                    <p className="text-sm">Orders from customers will appear here</p>
                  </div>
                </td>
              </tr>
            ) : orders.map((order, index) => (
              <motion.tr 
                key={order._id || index} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${isDarkMode ? 'hover:bg-gray-700 border-gray-600' : 'hover:bg-gray-50 border-gray-200'} border-b transition-colors`}
              >
                <td className={`py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <div>
                    <div className="font-medium">{order.orderNumber}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {order.formattedDate}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className={`py-3 px-4`}>
                  <div className={`font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    ₹{order.totalAmount?.toFixed(2)}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {order.itemCount} items
                  </div>
                </td>
                <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="text-sm">
                    <div className="font-medium">{order.vendorId?.name || 'Unknown Vendor'}</div>
                    <div className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      {order.deliveryAddress || 'No address provided'}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleViewOrder(order)}
                      className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'} transition-colors`}
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    
                    {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'rejected' && (
                      <button 
                        onClick={() => handleEditOrder(order)}
                        className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'} transition-colors`}
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Update</span>
                      </button>
                    )}
                    
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => handleRejectItems(order)}
                        className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'} transition-colors`}
                      >
                        <XMarkIcon className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    )}
                    
                    {/* Quick Action Buttons */}
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => handleQuickStatusUpdate(order._id, 'accepted')}
                        disabled={updatingOrders[order._id]}
                        className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                          updatingOrders[order._id] 
                            ? `${isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-300 text-blue-800'} opacity-60 cursor-not-allowed` 
                            : `${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`
                        } transition-colors`}
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>{updatingOrders[order._id] ? 'Accepting...' : 'Accept'}</span>
                      </button>
                    )}
                    
                    {order.status === 'accepted' && (
                      <button 
                        onClick={() => handleQuickStatusUpdate(order._id, 'preparing')}
                        disabled={updatingOrders[order._id]}
                        className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                          updatingOrders[order._id]
                            ? `${isDarkMode ? 'bg-purple-800 text-purple-300' : 'bg-purple-300 text-purple-800'} opacity-60 cursor-not-allowed` 
                            : `${isDarkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-500 text-white hover:bg-purple-600'}`
                        } transition-colors`}
                      >
                        <ClockIcon className="h-4 w-4" />
                        <span>{updatingOrders[order._id] ? 'Processing...' : 'Prepare'}</span>
                      </button>
                    )}
                    
                    {order.status === 'preparing' && (
                      <button 
                        onClick={() => handleQuickStatusUpdate(order._id, 'out_for_delivery')}
                        disabled={updatingOrders[order._id]}
                        className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                          updatingOrders[order._id]
                            ? `${isDarkMode ? 'bg-indigo-800 text-indigo-300' : 'bg-indigo-300 text-indigo-800'} opacity-60 cursor-not-allowed` 
                            : `${isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`
                        } transition-colors`}
                      >
                        <TruckIcon className="h-4 w-4" />
                        <span>{updatingOrders[order._id] ? 'Sending...' : 'Deliver'}</span>
                      </button>
                    )}
                    
                    {order.status === 'out_for_delivery' && (
                      <button 
                        onClick={() => handleQuickStatusUpdate(order._id, 'delivered')}
                        disabled={updatingOrders[order._id]}
                        className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                          updatingOrders[order._id]
                            ? `${isDarkMode ? 'bg-green-800 text-green-300' : 'bg-green-300 text-green-800'} opacity-60 cursor-not-allowed` 
                            : `${isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'}`
                        } transition-colors`}
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>{updatingOrders[order._id] ? 'Completing...' : 'Delivered'}</span>
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {/* View Order Modal */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Order Details - {selectedOrder.orderNumber}
              </h3>
              <button
                onClick={closeModals}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Order Info */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</label>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Amount</label>
                    <p className={`text-lg font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>₹{selectedOrder.totalAmount}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Customer</label>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedOrder.userId?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Order Date</label>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              {selectedOrder.deliveryAddress && (
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delivery Information</h4>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedOrder.deliveryAddress}</p>
                  {selectedOrder.specialInstructions && (
                    <div className="mt-2">
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Special Instructions</label>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedOrder.specialInstructions}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Order Items */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
                        <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>x{item.quantity}</span>
                      </div>
                      <span className={`font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Status Modal */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Update Order Status
              </h3>
              <button
                onClick={closeModals}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Order: {selectedOrder.orderNumber}
                </label>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Current Status: 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </label>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {VENDOR_UPDATABLE_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className={`text-sm p-3 rounded-lg ${isDarkMode ? 'text-red-300 bg-red-900/20' : 'text-red-600 bg-red-50'}`}>
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={closeModals}
                  disabled={updating}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating || newStatus === selectedOrder?.status}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    updating || newStatus === selectedOrder?.status
                      ? 'opacity-50 cursor-not-allowed' 
                      : isDarkMode 
                        ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Rejection Modal */}
      {isRejectModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Reject Items - {selectedOrder.orderNumber}
              </h3>
              <button
                onClick={closeModals}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Select items to reject (unavailable):
                </label>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                      <input
                        type="checkbox"
                        id={`item-${index}`}
                        checked={rejectedItems.includes(item.menuItem._id)}
                        onChange={() => toggleItemRejection(item.menuItem._id)}
                        className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label htmlFor={`item-${index}`} className={`flex-1 cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{item.menuItem?.name || item.name}</span>
                            <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>x{item.quantity}</span>
                          </div>
                          <span className={`font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>₹{item.price * item.quantity}</span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Reason for rejection (optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-300' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  rows="3"
                  placeholder="e.g., Item out of stock, ingredients not available..."
                />
              </div>

              {rejectedItems.length === selectedOrder.items?.length && (
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-600'}`}>
                  <p className="text-sm font-medium">⚠️ All items will be rejected. This will cancel the entire order.</p>
                </div>
              )}

              {error && (
                <div className={`text-sm p-3 rounded-lg ${isDarkMode ? 'text-red-300 bg-red-900/20' : 'text-red-600 bg-red-50'}`}>
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={closeModals}
                  disabled={updating}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePartialReject}
                  disabled={updating || rejectedItems.length === 0}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    updating || rejectedItems.length === 0
                      ? 'opacity-50 cursor-not-allowed' 
                      : isDarkMode 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {updating ? 'Rejecting...' : `Reject ${rejectedItems.length} Item${rejectedItems.length > 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
