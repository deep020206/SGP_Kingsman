import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon, CurrencyDollarIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const Analytics = ({ isDarkMode, orders = [], menuItems = [] }) => {
  // Memoize derived values so they are only recomputed when inputs change
  const { totalRevenue, totalOrders, totalItems, recentOrders, popularItems } = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    return {
      totalRevenue: revenue,
      totalOrders: orders.length,
      totalItems: menuItems.length,
      recentOrders: orders.slice(0, 5),
      popularItems: menuItems.slice(0, 5)
    };
  }, [orders, menuItems]);

  return (
    <div>
      <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analytics</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <CurrencyDollarIcon className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Revenue</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{totalRevenue}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
              <ShoppingBagIcon className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Orders</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalOrders}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
              <ChartBarIcon className={`h-8 w-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Menu Items</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalItems}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <ShoppingBagIcon className={`h-12 w-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className="text-sm">No orders yet</p>
                <p className="text-xs mt-1">Orders will appear here once customers start ordering</p>
              </div>
            ) : recentOrders.map((order, index) => (
              <div key={order._id || index} className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order #{order.orderNumber}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{order.userId?.name || 'Unknown'}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>₹{order.totalAmount}</p>
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Popular Items</h3>
          <div className="space-y-3">
            {popularItems.length === 0 ? (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <ChartBarIcon className={`h-12 w-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className="text-sm">No menu items yet</p>
                <p className="text-xs mt-1">Add items to your menu to see analytics</p>
              </div>
            ) : popularItems.map((item, index) => (
              <div key={item._id || index} className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.category}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>₹{item.price}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
