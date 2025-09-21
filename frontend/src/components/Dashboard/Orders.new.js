import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  XMarkIcon, 
  CheckCircleIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const Orders = ({ isDarkMode, orders = [], onUpdateOrderStatus }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updatingOrders, setUpdatingOrders] = useState({});
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    return () => {
      setSelectedOrder(null);
      setIsViewModalOpen(false);
      setIsEditModalOpen(false);
      setNewStatus('');
    };
  }, []);

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

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!onUpdateOrderStatus || updating) return;

    try {
      setUpdating(true);
      setUpdatingOrders(prev => ({ ...prev, [orderId]: true }));
      await onUpdateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      setIsEditModalOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update order status');
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
      setUpdatingOrders(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const closeModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedOrder(null);
    setNewStatus('');
  };

  return (
    <div className="md:hidden">
      {/* Mobile Filters */}
      <div className="sticky top-14 bg-gray-50 dark:bg-gray-900 z-10 shadow-sm">
        <div className="overflow-x-auto">
          <div className="flex space-x-2 p-4">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors
                ${activeFilter === 'all'
                  ? 'bg-yellow-500 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              All Orders
            </button>
            {ORDER_STATUSES.map(status => (
              <button
                key={status.value}
                onClick={() => setActiveFilter(status.value)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors
                  ${activeFilter === status.value
                    ? 'bg-yellow-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Order List */}
      <div className="px-4">
        {!Array.isArray(orders) ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40">
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} mb-3`}>
              <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No orders yet</p>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              New orders will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            {orders
              .filter(order => activeFilter === 'all' || order.status === activeFilter)
              .map((order) => (
                <div
                  key={order._id}
                  className={`${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  } rounded-lg shadow-sm border ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  } overflow-hidden`}
                >
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Order #{order.orderNumber}
                        </h3>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {ORDER_STATUSES.find(s => s.value === order.status)?.label || order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="px-4 py-3">
                    <div className="space-y-2">
                      {/* Items Summary */}
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {order.items?.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span>{item.name} × {item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total: </span>
                          <span className={`font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                            ₹{order.totalAmount?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditOrder(order);
                              }}
                              disabled={updating || updatingOrders[order._id]}
                              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                isDarkMode
                                  ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400'
                              }`}
                            >
                              {updating || updatingOrders[order._id] ? 'Updating...' : 'Update Status'}
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOrder(order);
                            }}
                            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                              isDarkMode
                                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            }`}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Edit Order Status Modal */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div 
            className={`w-full md:max-w-md ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } rounded-t-2xl md:rounded-lg overflow-hidden transform transition-transform duration-200 ease-out`}
          >
            <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Update Order Status
                  </h3>
                  <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Order #{selectedOrder.orderNumber}
                  </p>
                </div>
                <button
                  onClick={closeModals}
                  className={`p-2 rounded-full ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-400' 
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-4 py-3">
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Current Status: 
                </span>
                <span className={`ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {ORDER_STATUSES.find(s => s.value === selectedOrder.status)?.label}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {VENDOR_UPDATABLE_STATUSES
                  .filter(status => {
                    const currentIndex = VENDOR_UPDATABLE_STATUSES.findIndex(s => s.value === selectedOrder.status);
                    const statusIndex = VENDOR_UPDATABLE_STATUSES.findIndex(s => s.value === status.value);
                    return statusIndex > currentIndex || status.value === 'rejected';
                  })
                  .map(status => (
                    <button
                      key={status.value}
                      onClick={() => setNewStatus(status.value)}
                      className={`w-full px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
                        newStatus === status.value
                          ? isDarkMode
                            ? 'bg-yellow-500 text-white'
                            : 'bg-yellow-100 text-yellow-900'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <span>{status.label}</span>
                      {newStatus === status.value && (
                        <CheckCircleIcon className="h-5 w-5" />
                      )}
                    </button>
                  ))}
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={closeModals}
                  className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedOrder._id, newStatus)}
                  disabled={!newStatus || updating}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !newStatus || updating
                      ? isDarkMode
                        ? 'bg-gray-700 text-gray-500'
                        : 'bg-gray-100 text-gray-400'
                      : isDarkMode
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>

              {error && (
                <div className={`mt-4 text-sm p-3 rounded-lg ${isDarkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-600'}`}>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
