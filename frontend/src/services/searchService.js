class SearchService {
  // Search menu items based on query and filters
  searchMenuItems(items, query, filters) {
    let filteredItems = [...items];

    // Text search
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.category?.toLowerCase().includes(searchTerm) ||
        item.ingredients?.some(ingredient => 
          ingredient.toLowerCase().includes(searchTerm)
        )
      );
    }

    // Category filter
    if (filters.category) {
      filteredItems = filteredItems.filter(item => 
        item.category === filters.category
      );
    }

    // Price range filter
    if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
      filteredItems = filteredItems.filter(item => 
        item.price >= filters.priceMin && item.price <= filters.priceMax
      );
    }

    // Vegetarian filter
    if (filters.isVegetarian) {
      filteredItems = filteredItems.filter(item => 
        item.isVegetarian === true
      );
    }

    // Spice level filter
    if (filters.spiceLevel) {
      filteredItems = filteredItems.filter(item => 
        item.spiceLevel === filters.spiceLevel
      );
    }

    // Sort items
    filteredItems = this.sortItems(filteredItems, filters.sortBy);

    return filteredItems;
  }

  // Sort items based on criteria
  sortItems(items, sortBy) {
    const sortedItems = [...items];

    switch (sortBy) {
      case 'name':
        return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
      
      case 'price-low':
        return sortedItems.sort((a, b) => a.price - b.price);
      
      case 'price-high':
        return sortedItems.sort((a, b) => b.price - a.price);
      
      case 'rating':
        return sortedItems.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
      
      default:
        return sortedItems;
    }
  }

  // Get unique categories from menu items
  getCategories(items) {
    const categories = [...new Set(items.map(item => item.category))];
    return categories.filter(category => category).sort();
  }

  // Get price range from menu items
  getPriceRange(items) {
    if (items.length === 0) return { min: 0, max: 1000 };
    
    const prices = items.map(item => item.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    };
  }

  // Get search suggestions based on menu items
  getSearchSuggestions(items, query) {
    if (!query || query.length < 2) return [];

    const searchTerm = query.toLowerCase();
    const suggestions = new Set();

    items.forEach(item => {
      // Add name suggestions
      if (item.name.toLowerCase().includes(searchTerm)) {
        suggestions.add(item.name);
      }

      // Add category suggestions
      if (item.category?.toLowerCase().includes(searchTerm)) {
        suggestions.add(item.category);
      }

      // Add ingredient suggestions
      item.ingredients?.forEach(ingredient => {
        if (ingredient.toLowerCase().includes(searchTerm)) {
          suggestions.add(ingredient);
        }
      });
    });

    return Array.from(suggestions).slice(0, 5);
  }

  // Highlight search terms in text
  highlightSearchTerm(text, searchTerm) {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900">$1</mark>');
  }

  // Get search analytics
  getSearchAnalytics(items, query, filters) {
    const totalItems = items.length;
    const filteredItems = this.searchMenuItems(items, query, filters);
    const filteredCount = filteredItems.length;

    return {
      totalItems,
      filteredCount,
      hasResults: filteredCount > 0,
      searchTerm: query,
      activeFilters: Object.keys(filters).filter(key => 
        filters[key] && filters[key] !== '' && filters[key] !== false
      ).length
    };
  }
}

export default new SearchService();
