import errorLogger from '../utils/errorLogger';

class SearchService {
  constructor() {
    // Search result cache
    this.cache = new Map();
    this.maxCacheSize = 100;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    
    // Performance monitoring
    this.searchMetrics = {
      totalSearches: 0,
      averageSearchTime: 0,
      slowSearches: 0
    };
    
    // Debounce state
    this.debounceTimers = new Map();
    this.defaultDebounceMs = 300;
    
    // Search index for better performance
    this.searchIndex = null;
    this.lastIndexedItems = null;
  }

  /**
   * Create search cache key
   * @param {string} query - Search query
   * @param {Object} filters - Filter object
   * @returns {string} - Cache key
   */
  createCacheKey(query, filters) {
    try {
      const normalizedQuery = (query || '').toLowerCase().trim();
      const sortedFilters = Object.keys(filters || {})
        .sort()
        .reduce((result, key) => {
          result[key] = filters[key];
          return result;
        }, {});
      
      return JSON.stringify({ query: normalizedQuery, filters: sortedFilters });
    } catch (error) {
      errorLogger.logError(error, 'createCacheKey', { query, filters });
      return `fallback_${Date.now()}_${Math.random()}`;
    }
  }

  /**
   * Get cached search result
   * @param {string} cacheKey - Cache key
   * @returns {Array|null} - Cached result or null
   */
  getCachedResult(cacheKey) {
    try {
      if (this.cache.has(cacheKey)) {
        this.cacheHits++;
        const cached = this.cache.get(cacheKey);
        
        // Move to end (LRU)
        this.cache.delete(cacheKey);
        this.cache.set(cacheKey, cached);
        
        return cached.result;
      }
      
      this.cacheMisses++;
      return null;
    } catch (error) {
      errorLogger.logError(error, 'getCachedResult', { cacheKey });
      return null;
    }
  }

  /**
   * Cache search result
   * @param {string} cacheKey - Cache key
   * @param {Array} result - Search result
   */
  setCachedResult(cacheKey, result) {
    try {
      // Implement LRU cache
      if (this.cache.size >= this.maxCacheSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      
      this.cache.set(cacheKey, {
        result: [...result],
        timestamp: Date.now()
      });
    } catch (error) {
      errorLogger.logError(error, 'setCachedResult', { cacheKey, resultCount: result?.length });
    }
  }

  /**
   * Build search index for better performance
   * @param {Array} items - Menu items
   */
  buildSearchIndex(items) {
    try {
      if (!Array.isArray(items)) {
        return;
      }

      // Check if we need to rebuild index
      if (this.lastIndexedItems === items) {
        return;
      }

      const startTime = performance.now();
      
      this.searchIndex = {
        byName: new Map(),
        byCategory: new Map(),
        byIngredient: new Map(),
        byDescription: new Map(),
        items: items
      };

      items.forEach((item, index) => {
        if (!item || typeof item !== 'object') return;

        // Index by name
        if (item.name) {
          const nameWords = item.name.toLowerCase().split(/\s+/);
          nameWords.forEach(word => {
            if (!this.searchIndex.byName.has(word)) {
              this.searchIndex.byName.set(word, new Set());
            }
            this.searchIndex.byName.get(word).add(index);
          });
        }

        // Index by category
        if (item.category) {
          const category = item.category.toLowerCase();
          if (!this.searchIndex.byCategory.has(category)) {
            this.searchIndex.byCategory.set(category, new Set());
          }
          this.searchIndex.byCategory.get(category).add(index);
        }

        // Index by ingredients
        if (Array.isArray(item.ingredients)) {
          item.ingredients.forEach(ingredient => {
            if (ingredient && typeof ingredient === 'string') {
              const ing = ingredient.toLowerCase();
              if (!this.searchIndex.byIngredient.has(ing)) {
                this.searchIndex.byIngredient.set(ing, new Set());
              }
              this.searchIndex.byIngredient.get(ing).add(index);
            }
          });
        }

        // Index by description
        if (item.description) {
          const descWords = item.description.toLowerCase().split(/\s+/);
          descWords.forEach(word => {
            if (word.length > 2) { // Skip short words
              if (!this.searchIndex.byDescription.has(word)) {
                this.searchIndex.byDescription.set(word, new Set());
              }
              this.searchIndex.byDescription.get(word).add(index);
            }
          });
        }
      });

      this.lastIndexedItems = items;
      
      const endTime = performance.now();
      if (endTime - startTime > 100) {
        console.warn(`Slow search index build: ${endTime - startTime}ms for ${items.length} items`);
      }
    } catch (error) {
      errorLogger.logError(error, 'buildSearchIndex', { itemsCount: items?.length });
      this.searchIndex = null;
    }
  }

  /**
   * Fast search using index
   * @param {Array} items - Menu items
   * @param {string} query - Search query
   * @returns {Set} - Set of matching item indices
   */
  fastTextSearch(items, query) {
    try {
      if (!query || !this.searchIndex) {
        return new Set(items.map((_, index) => index));
      }

      const searchTerms = query.toLowerCase().trim().split(/\s+/);
      let matchingIndices = null;

      searchTerms.forEach(term => {
        const termMatches = new Set();

        // Search in indexed fields
        [this.searchIndex.byName, this.searchIndex.byCategory, 
         this.searchIndex.byIngredient, this.searchIndex.byDescription].forEach(index => {
          for (const [key, indices] of index) {
            if (key.includes(term)) {
              indices.forEach(idx => termMatches.add(idx));
            }
          }
        });

        // Intersection with previous terms
        if (matchingIndices === null) {
          matchingIndices = termMatches;
        } else {
          matchingIndices = new Set([...matchingIndices].filter(idx => termMatches.has(idx)));
        }
      });

      return matchingIndices || new Set();
    } catch (error) {
      errorLogger.logError(error, 'fastTextSearch', { itemsCount: items?.length, query });
      return new Set(items.map((_, index) => index));
    }
  }
  /**
   * Enhanced search menu items with caching, indexing, and performance monitoring
   * @param {Array} items - Menu items
   * @param {string} query - Search query
   * @param {Object} filters - Filter options
   * @returns {Array} - Filtered menu items
   */
  searchMenuItems(items, query, filters = {}) {
    const startTime = performance.now();
    
    try {
      if (!Array.isArray(items)) {
        console.warn('Invalid items array provided to searchMenuItems');
        return [];
      }

      // Create cache key
      const cacheKey = this.createCacheKey(query, filters);
      
      // Check cache first
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Build search index if needed
      this.buildSearchIndex(items);

      let filteredItems = [...items];

      // Text search using index if available
      if (query && query.trim()) {
        if (this.searchIndex) {
          const matchingIndices = this.fastTextSearch(items, query);
          filteredItems = Array.from(matchingIndices).map(index => items[index]);
        } else {
          // Fallback to traditional search
          const searchTerm = query.toLowerCase().trim();
          filteredItems = filteredItems.filter(item => {
            if (!item) return false;
            
            return (
              (item.name && item.name.toLowerCase().includes(searchTerm)) ||
              (item.description && item.description.toLowerCase().includes(searchTerm)) ||
              (item.category && item.category.toLowerCase().includes(searchTerm)) ||
              (Array.isArray(item.ingredients) && item.ingredients.some(ingredient => 
                ingredient && ingredient.toLowerCase().includes(searchTerm)
              ))
            );
          });
        }
      }

      // Apply filters
      filteredItems = this.applyFilters(filteredItems, filters);

      // Sort items
      filteredItems = this.sortItems(filteredItems, filters.sortBy);

      // Cache result
      this.setCachedResult(cacheKey, filteredItems);

      // Update metrics
      this.updateSearchMetrics(startTime);

      return filteredItems;
    } catch (error) {
      errorLogger.logError(error, 'searchMenuItems', { 
        itemsCount: items?.length, 
        query, 
        filters 
      });
      return items || [];
    }
  }

  /**
   * Apply filters to items
   * @param {Array} items - Items to filter
   * @param {Object} filters - Filter options
   * @returns {Array} - Filtered items
   */
  applyFilters(items, filters) {
    try {
      let filteredItems = [...items];

      // Category filter
      if (filters.category && filters.category !== 'all') {
        filteredItems = filteredItems.filter(item => 
          item.category === filters.category
        );
      }

      // Price range filter
      if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
        const minPrice = parseFloat(filters.priceMin) || 0;
        const maxPrice = parseFloat(filters.priceMax) || Infinity;
        
        filteredItems = filteredItems.filter(item => {
          const price = parseFloat(item.price) || 0;
          return price >= minPrice && price <= maxPrice;
        });
      }

      // Vegetarian filter
      if (filters.isVegetarian === true) {
        filteredItems = filteredItems.filter(item => 
          item.isVegetarian === true
        );
      }

      // Spice level filter
      if (filters.spiceLevel && filters.spiceLevel !== 'all') {
        filteredItems = filteredItems.filter(item => 
          item.spiceLevel === filters.spiceLevel
        );
      }

      // Rating filter
      if (filters.minRating !== undefined) {
        const minRating = parseFloat(filters.minRating) || 0;
        filteredItems = filteredItems.filter(item => 
          (parseFloat(item.avgRating) || 0) >= minRating
        );
      }

      // Availability filter
      if (filters.availableOnly === true) {
        filteredItems = filteredItems.filter(item => 
          item.isAvailable !== false && item.stock !== 0
        );
      }

      return filteredItems;
    } catch (error) {
      errorLogger.logError(error, 'applyFilters', { itemsCount: items?.length, filters });
      return items;
    }
  }

  /**
   * Update search performance metrics
   * @param {number} startTime - Search start time
   */
  updateSearchMetrics(startTime) {
    try {
      const duration = performance.now() - startTime;
      this.searchMetrics.totalSearches++;
      
      // Update average
      this.searchMetrics.averageSearchTime = 
        (this.searchMetrics.averageSearchTime * (this.searchMetrics.totalSearches - 1) + duration) / 
        this.searchMetrics.totalSearches;
      
      // Track slow searches
      if (duration > 100) {
        this.searchMetrics.slowSearches++;
        console.warn(`Slow search detected: ${duration.toFixed(2)}ms`);
      }
    } catch (error) {
      errorLogger.logError(error, 'updateSearchMetrics', { startTime });
    }
  }

  /**
   * Enhanced sort items with error handling
   * @param {Array} items - Items to sort
   * @param {string} sortBy - Sort criteria
   * @returns {Array} - Sorted items
   */
  sortItems(items, sortBy) {
    try {
      if (!Array.isArray(items)) {
        return [];
      }

      const sortedItems = [...items];

      switch (sortBy) {
        case 'name':
          return sortedItems.sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
          });
        
        case 'price-low':
        case 'price_low':
          return sortedItems.sort((a, b) => {
            const priceA = parseFloat(a.price) || 0;
            const priceB = parseFloat(b.price) || 0;
            return priceA - priceB;
          });
        
        case 'price-high':
        case 'price_high':
          return sortedItems.sort((a, b) => {
            const priceA = parseFloat(a.price) || 0;
            const priceB = parseFloat(b.price) || 0;
            return priceB - priceA;
          });
        
        case 'rating':
          return sortedItems.sort((a, b) => {
            const ratingA = parseFloat(a.avgRating) || 0;
            const ratingB = parseFloat(b.avgRating) || 0;
            return ratingB - ratingA;
          });
        
        case 'popularity':
          return sortedItems.sort((a, b) => {
            const countA = parseInt(a.orderCount) || 0;
            const countB = parseInt(b.orderCount) || 0;
            return countB - countA;
          });
        
        default:
          return sortedItems;
      }
    } catch (error) {
      errorLogger.logError(error, 'sortItems', { itemsCount: items?.length, sortBy });
      return items || [];
    }
  }

  /**
   * Get unique categories from menu items with error handling
   * @param {Array} items - Menu items
   * @returns {Array} - Array of categories
   */
  getCategories(items) {
    try {
      if (!Array.isArray(items)) {
        return [];
      }

      const categories = [...new Set(items
        .map(item => item?.category)
        .filter(category => category && typeof category === 'string')
      )];
      
      return categories.sort();
    } catch (error) {
      errorLogger.logError(error, 'getCategories', { itemsCount: items?.length });
      return [];
    }
  }

  /**
   * Get price range from menu items with error handling
   * @param {Array} items - Menu items
   * @returns {Object} - Price range {min, max}
   */
  getPriceRange(items) {
    try {
      if (!Array.isArray(items) || items.length === 0) {
        return { min: 0, max: 1000 };
      }
      
      const prices = items
        .map(item => parseFloat(item?.price))
        .filter(price => !isNaN(price) && price > 0);
      
      if (prices.length === 0) {
        return { min: 0, max: 1000 };
      }
      
      return {
        min: Math.floor(Math.min(...prices)),
        max: Math.ceil(Math.max(...prices))
      };
    } catch (error) {
      errorLogger.logError(error, 'getPriceRange', { itemsCount: items?.length });
      return { min: 0, max: 1000 };
    }
  }

  /**
   * Get search suggestions with caching and error handling
   * @param {Array} items - Menu items
   * @param {string} query - Search query
   * @returns {Array} - Array of suggestions
   */
  getSearchSuggestions(items, query) {
    try {
      if (!query || query.length < 2 || !Array.isArray(items)) {
        return [];
      }

      const cacheKey = `suggestions_${query.toLowerCase()}`;
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return cached;
      }

      const searchTerm = query.toLowerCase();
      const suggestions = new Set();

      items.forEach(item => {
        if (!item || typeof item !== 'object') return;

        // Add name suggestions
        if (item.name && item.name.toLowerCase().includes(searchTerm)) {
          suggestions.add(item.name);
        }

        // Add category suggestions
        if (item.category && item.category.toLowerCase().includes(searchTerm)) {
          suggestions.add(item.category);
        }

        // Add ingredient suggestions
        if (Array.isArray(item.ingredients)) {
          item.ingredients.forEach(ingredient => {
            if (ingredient && typeof ingredient === 'string' && 
                ingredient.toLowerCase().includes(searchTerm)) {
              suggestions.add(ingredient);
            }
          });
        }
      });

      const result = Array.from(suggestions).slice(0, 8);
      this.setCachedResult(cacheKey, result);
      
      return result;
    } catch (error) {
      errorLogger.logError(error, 'getSearchSuggestions', { 
        itemsCount: items?.length, 
        query 
      });
      return [];
    }
  }

  /**
   * Highlight search terms in text
   * @param {string} text - Text to highlight
   * @param {string} searchTerm - Search term
   * @returns {string} - Text with highlighted terms
   */
  highlightSearchTerm(text, searchTerm) {
    try {
      if (!searchTerm || !text || typeof text !== 'string') {
        return text || '';
      }

      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900">$1</mark>');
    } catch (error) {
      errorLogger.logError(error, 'highlightSearchTerm', { text, searchTerm });
      return text || '';
    }
  }

  /**
   * Get search analytics with performance data
   * @param {Array} items - Menu items
   * @param {string} query - Search query
   * @param {Object} filters - Applied filters
   * @returns {Object} - Analytics data
   */
  getSearchAnalytics(items, query, filters) {
    try {
      if (!Array.isArray(items)) {
        return this.getDefaultAnalytics();
      }

      const totalItems = items.length;
      const filteredItems = this.searchMenuItems(items, query, filters);
      const filteredCount = filteredItems.length;

      return {
        totalItems,
        filteredCount,
        hasResults: filteredCount > 0,
        searchTerm: query || '',
        activeFilters: Object.keys(filters || {}).filter(key => 
          filters[key] && filters[key] !== '' && filters[key] !== false
        ).length,
        cacheStats: {
          hits: this.cacheHits,
          misses: this.cacheMisses,
          hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
        },
        performance: this.searchMetrics
      };
    } catch (error) {
      errorLogger.logError(error, 'getSearchAnalytics', { 
        itemsCount: items?.length, 
        query, 
        filters 
      });
      return this.getDefaultAnalytics();
    }
  }

  /**
   * Get default analytics object
   * @returns {Object} - Default analytics
   */
  getDefaultAnalytics() {
    return {
      totalItems: 0,
      filteredCount: 0,
      hasResults: false,
      searchTerm: '',
      activeFilters: 0,
      cacheStats: { hits: 0, misses: 0, hitRate: 0 },
      performance: { totalSearches: 0, averageSearchTime: 0, slowSearches: 0 }
    };
  }

  /**
   * Clear cache and reset metrics
   */
  clearCache() {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.searchIndex = null;
    this.lastIndexedItems = null;
  }

  /**
   * Get performance statistics
   * @returns {Object} - Performance stats
   */
  getPerformanceStats() {
    return {
      ...this.searchMetrics,
      cacheSize: this.cache.size,
      cacheHitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0,
      indexBuilt: !!this.searchIndex
    };
  }

  /**
   * Debounced search function
   * @param {string} key - Debounce key
   * @param {Function} searchFn - Search function
   * @param {number} delay - Debounce delay
   * @returns {Function} - Debounced function
   */
  createDebouncedSearch(key, searchFn, delay = this.defaultDebounceMs) {
    return (...args) => {
      if (this.debounceTimers.has(key)) {
        clearTimeout(this.debounceTimers.get(key));
      }

      const timer = setTimeout(() => {
        this.debounceTimers.delete(key);
        searchFn(...args);
      }, delay);

      this.debounceTimers.set(key, timer);
    };
  }
}

export default new SearchService();
