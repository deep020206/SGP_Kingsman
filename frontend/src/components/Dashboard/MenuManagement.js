// DEPRECATED: This file has been refactored into a modular architecture
// The functionality is now split across:
// - MenuManagementLayout.js (main orchestrator)
// - services/menu/menuManagementService.js (business logic)
// - hooks/menu/useMenuManagement.js (state management)
// - components/MenuManagement/ (UI components)

import React from 'react';
import MenuManagementLayout from './MenuManagement/MenuManagementLayout';

const MenuManagement = ({ isDarkMode, menuItems, onMenuItemsUpdate }) => {
  // Redirect to the new modular architecture
  return (
    <MenuManagementLayout 
      isDarkMode={isDarkMode}
      menuItems={menuItems}
      onMenuItemsUpdate={onMenuItemsUpdate}
    />
  );
};

export default MenuManagement;
