import React, { useState, useEffect } from 'react';
import { 
  LightBulbIcon, 
  XMarkIcon,
  ClockIcon,
  ShoppingCartIcon,
  CurrencyRupeeIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const UXSuggestions = ({ isDarkMode, userStats, onClose }) => {
  const [currentSuggestion, setCurrentSuggestion] = useState(0);

  const suggestions = [
    {
      icon: <ClockIcon className="h-5 w-5" />,
      title: "Quick Reorder",
      message: "Found your favorite item? Long press on menu items to add them to favorites for quick access!",
      condition: userStats.totalOrders > 2
    },
    {
      icon: <CurrencyRupeeIcon className="h-5 w-5" />,
      title: "Budget Tracking",
      message: "Use the 'Reset' button in Total Spent to track your monthly or weekly food budget!",
      condition: userStats.totalSpent > 500
    },
    {
      icon: <ShoppingCartIcon className="h-5 w-5" />,
      title: "Smart Cart",
      message: "Pro tip: Items with same customizations automatically combine in your cart. Add different spice levels for variety!",
      condition: userStats.totalOrders > 0
    },
    {
      icon: <StarIcon className="h-5 w-5" />,
      title: "Reward Points",
      message: `You've earned ${userStats.rewardPoints} reward points! Keep ordering to unlock special discounts.`,
      condition: userStats.rewardPoints > 50
    },
    {
      icon: <LightBulbIcon className="h-5 w-5" />,
      title: "Order Scheduling",
      message: "Planning ahead? Use the schedule feature to place orders for specific times!",
      condition: userStats.totalOrders > 5
    }
  ];

  const availableSuggestions = suggestions.filter(s => s.condition);

  useEffect(() => {
    if (availableSuggestions.length > 1) {
      const interval = setInterval(() => {
        setCurrentSuggestion(prev => (prev + 1) % availableSuggestions.length);
      }, 5000); // Change suggestion every 5 seconds

      return () => clearInterval(interval);
    }
  }, [availableSuggestions.length]);

  if (availableSuggestions.length === 0) return null;

  const suggestion = availableSuggestions[currentSuggestion];

  return (
    <div className={`fixed bottom-4 right-4 max-w-sm p-4 rounded-lg shadow-lg border-l-4 border-yellow-500 animate-slide-up ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 p-2 rounded-full ${
          isDarkMode ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
        }`}>
          {suggestion.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {suggestion.title}
          </h4>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {suggestion.message}
          </p>
          {availableSuggestions.length > 1 && (
            <div className="flex space-x-1 mt-2">
              {availableSuggestions.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 w-6 rounded-full transition-colors ${
                    index === currentSuggestion
                      ? 'bg-yellow-500'
                      : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 p-1 rounded-full hover:bg-opacity-20 ${
            isDarkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default UXSuggestions;