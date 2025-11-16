import React from 'react';
import { 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  UserIcon,
  HeartIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { 
  ShoppingBagIcon as ShoppingBagIconSolid, 
  ShoppingCartIcon as ShoppingCartIconSolid, 
  UserIcon as UserIconSolid,
  HeartIcon as HeartIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid
} from '@heroicons/react/24/solid';

const MobileBottomNav = ({ 
  activeView, 
  onNavigate, 
  isDarkMode, 
  cartItemCount = 0 
}) => {
  const navItems = [
    {
      id: 'browse',
      label: 'Menu',
      icon: ShoppingBagIcon,
      activeIcon: ShoppingBagIconSolid,
      path: 'browse'
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingCartIcon,
      activeIcon: ShoppingCartIconSolid,
      path: 'cart',
      badge: cartItemCount > 0 ? cartItemCount : null
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ClipboardDocumentListIcon,
      activeIcon: ClipboardDocumentListIconSolid,
      path: 'orders'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: UserIcon,
      activeIcon: UserIconSolid,
      path: 'profile'
    }
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 md:hidden ${
      isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    } border-t shadow-lg`}>
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = activeView === item.path;
          const IconComponent = isActive ? item.activeIcon : item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 relative ${
                isActive
                  ? isDarkMode
                    ? 'text-yellow-400 bg-yellow-400/10'
                    : 'text-yellow-600 bg-yellow-50'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <IconComponent className="h-6 w-6" />
                {item.badge && (
                  <span className={`absolute -top-2 -right-2 h-5 w-5 rounded-full text-xs flex items-center justify-center font-bold ${
                    isDarkMode 
                      ? 'bg-yellow-500 text-gray-900' 
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${
                isActive 
                  ? isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                  : isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
