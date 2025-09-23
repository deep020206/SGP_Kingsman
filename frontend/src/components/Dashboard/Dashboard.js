// DEPRECATED: This file has been refactored into a modular architecture
// The functionality is now split across:
// - VendorDashboardLayout.js (main orchestrator)
// - services/dashboard/vendorDashboardService.js (business logic)
// - hooks/dashboard/useVendorDashboard.js (state management)
// - components/VendorDashboard/ (UI components)

import React from 'react';
import VendorDashboardLayout from './VendorDashboard/VendorDashboardLayout';

const Dashboard = () => {
  // Redirect to the new modular architecture
  return <VendorDashboardLayout />;
};

export default Dashboard;
