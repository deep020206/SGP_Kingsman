import React, { useState } from 'react';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const HeartButton = ({ 
  menuItemId, 
  isFavorite, 
  onToggle, 
  size = 'md',
  className = '',
  disabled = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || isAnimating) return;

    setIsAnimating(true);
    
    try {
      await onToggle(menuItemId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      // Reset animation after a delay
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-8 w-8';
      case 'xl':
        return 'h-10 w-10';
      default:
        return 'h-6 w-6';
    }
  };

  const getButtonClasses = () => {
    const baseClasses = `
      relative inline-flex items-center justify-center
      rounded-full transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
      ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}
      ${isAnimating ? 'scale-125' : ''}
    `;

    const sizeClasses = size === 'sm' ? 'p-1' : size === 'lg' ? 'p-3' : 'p-2';
    
    return `${baseClasses} ${sizeClasses} ${className}`;
  };

  const getHeartClasses = () => {
    const baseClasses = `
      transition-all duration-200 ease-in-out
      ${getSizeClasses()}
      ${isAnimating ? 'animate-pulse' : ''}
    `;

    if (isFavorite) {
      return `${baseClasses} text-red-500 drop-shadow-sm`;
    } else {
      return `${baseClasses} text-gray-400 hover:text-red-400`;
    }
  };

  const HeartIcon = isFavorite ? HeartIconSolid : HeartIconOutline;

  return (
    <button
      onClick={handleClick}
      className={getButtonClasses()}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      disabled={disabled}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <HeartIcon className={getHeartClasses()} />
      
      {/* Animated ring effect on click */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75" />
      )}
    </button>
  );
};

export default HeartButton;