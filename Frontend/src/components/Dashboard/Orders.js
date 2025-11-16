// DEPRECATED: This file has been refactored into a modular architecture
// The functionality is now split across:
// - VendorOrdersLayout.js (main orchestrator)
// - services/vendorOrderService.js (business logic)
// - hooks/useVendorOrders.js (state management)
// - components/VendorOrders/ (UI components)

import React from 'react';
import VendorOrdersLayout from '../VendorOrders/VendorOrdersLayout';

const Orders = ({ isDarkMode, orders = [], onUpdateOrderStatus }) => {
  // Redirect to the new modular architecture
  return (
    <VendorOrdersLayout 
      isDarkMode={isDarkMode}
      orders={orders}
      onUpdateOrderStatus={onUpdateOrderStatus}
    />
  );
};

export default Orders;
