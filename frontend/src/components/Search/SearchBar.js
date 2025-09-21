import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  FunnelIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const SearchBar = ({ 
  onSearch, 
  onFilterChange, 
  isDarkMode, 
  categories = [], 
  priceRange = { min: 0, max: 1000 },
  filters = {}
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    category: '',
    priceMin: priceRange.min,
    priceMax: priceRange.max,
    isVegetarian: false,
    spiceLevel: '',
    sortBy: 'name' // name, price, rating
  });

  // Sync local filters with parent filters
  useEffect(() => {
    if (filters) {
      setLocalFilters(prev => ({
        ...prev,
        ...filters
      }));
    }
  }, [filters]);

  // Update price range when it changes
  useEffect(() => {
    setLocalFilters(prev => ({
      ...prev,
      priceMin: prev.priceMin === 0 ? priceRange.min : prev.priceMin,
      priceMax: prev.priceMax === 1000 ? priceRange.max : prev.priceMax
    }));
  }, [priceRange]);

  // DISABLED to prevent infinite loops - search only on input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Immediate search call without useEffect
    if (onSearch) {
      onSearch(value);
    }
  };

  // DISABLED to prevent infinite loops - filters updated manually
  const handleFilterChangeAndUpdate = (key, value) => {
    const newFilters = {
      ...localFilters,
      [key]: value
    };
    setLocalFilters(newFilters);
    
    // Immediate filter call without useEffect
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleFilterChange = (key, value) => {
    handleFilterChangeAndUpdate(key, value);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      priceMin: priceRange.min,
      priceMax: priceRange.max,
      isVegetarian: false,
      spiceLevel: '',
      sortBy: 'name'
    };
    setLocalFilters(clearedFilters);
    setSearchQuery('');
    
    // Immediately notify parent without useEffect
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
    if (onSearch) {
      onSearch('');
    }
  };

  const hasActiveFilters = localFilters.category || 
    localFilters.isVegetarian || 
    localFilters.spiceLevel || 
    localFilters.priceMin > priceRange.min || 
    localFilters.priceMax < priceRange.max;

  return (
    <div className={`space-y-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
        <input
          key="search-input"
          type="text"
          value={searchQuery}
          onChange={handleSearchInputChange}
          placeholder="Search for food items..."
          className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-300 focus:bg-gray-600' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white'
          }`}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters || hasActiveFilters
              ? isDarkMode
                ? 'bg-yellow-500 text-gray-900 border-yellow-500'
                : 'bg-yellow-500 text-white border-yellow-500'
              : isDarkMode
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FunnelIcon className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {Object.values(localFilters).filter(v => v && v !== 'name').length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={`text-sm px-3 py-1 rounded ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className={`space-y-4 p-4 rounded-lg border ${
          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          {/* Category Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Category
            </label>
            <select
              value={localFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                isDarkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Price Range: ₹{localFilters.priceMin} - ₹{localFilters.priceMax}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={localFilters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', parseInt(e.target.value))}
                className="w-full"
              />
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={localFilters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Vegetarian Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="vegetarian"
              checked={localFilters.isVegetarian}
              onChange={(e) => handleFilterChange('isVegetarian', e.target.checked)}
              className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
            />
            <label htmlFor="vegetarian" className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Vegetarian Only
            </label>
          </div>

          {/* Spice Level */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Spice Level
            </label>
            <select
              value={localFilters.spiceLevel}
              onChange={(e) => handleFilterChange('spiceLevel', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                isDarkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Spice Levels</option>
              <option value="mild">Mild</option>
              <option value="medium">Medium</option>
              <option value="spicy">Spicy</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Sort By
            </label>
            <select
              value={localFilters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                isDarkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="rating">Rating (High to Low)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(SearchBar);
