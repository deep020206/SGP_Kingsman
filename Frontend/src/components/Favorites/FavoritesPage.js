import React, { useEffect, useState } from 'react';
import { useFavorites } from '../../hooks/useFavorites';
import { useCart } from '../../hooks/useCart';
import { HeartIcon, ShoppingCartIcon, PlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import HeartButton from '../UI/HeartButton';

const FavoritesPage = ({ isDarkMode = false }) => {
  const { 
    favorites, 
    loading, 
    error, 
    removeFromFavorites, 
    fetchFavorites,
    toggleFavorite,
    isFavorite 
  } = useFavorites();
  
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(new Set());

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleAddToCart = async (item) => {
    setAddingToCart(prev => new Set([...prev, item._id]));
    
    try {
      await addToCart({
        _id: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        customizations: item.customizations || [],
        spiceLevel: item.spiceLevel,
        isVegetarian: item.isVegetarian
      }, 1, '', []);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(item._id);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className={`h-8 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded mb-6`}></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                  <div className={`h-48 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-4`}></div>
                  <div className={`h-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2`}></div>
                  <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-4`}></div>
                  <div className={`h-10 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto text-center py-12">
          <HeartIcon className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Oops! Something went wrong
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            {error}
          </p>
          <button
            onClick={fetchFavorites}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <HeartIconSolid className="h-8 w-8 text-red-500" />
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Your Favorites
            </h1>
          </div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {favorites.length > 0 
              ? `${favorites.length} favorite ${favorites.length === 1 ? 'item' : 'items'}` 
              : 'No favorites yet'
            }
          </p>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <HeartIcon className={`h-20 w-20 mx-auto mb-6 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <h2 className={`text-2xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No favorite items yet
            </h2>
            <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Browse the menu and tap the heart icon to add items to your favorites
            </p>
            <button
              onClick={() => window.location.href = '/menu'}
              className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => {
              const item = favorite.menuItemId;
              if (!item) return null;

              return (
                <div
                  key={favorite._id}
                  className={`
                    relative rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105
                    ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}
                  `}
                >
                  {/* Heart Button */}
                  <div className="absolute top-3 right-3 z-10">
                    <HeartButton
                      menuItemId={item._id}
                      isFavorite={isFavorite(item._id)}
                      onToggle={toggleFavorite}
                      size="md"
                      className={`
                        backdrop-blur-md
                        ${isDarkMode ? 'bg-gray-900/50' : 'bg-white/50'}
                      `}
                    />
                  </div>

                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`
                        w-full h-full flex items-center justify-center
                        ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
                      `}>
                        <span className={`text-6xl ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          🍽️
                        </span>
                      </div>
                    )}
                    
                    {/* Availability Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${item.isAvailable 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                        }
                      `}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className={`font-semibold text-lg mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </h3>
                    
                    {item.description && (
                      <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.isVegetarian && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          🥬 Veg
                        </span>
                      )}
                      {item.spiceLevel && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          🌶️ {item.spiceLevel}
                        </span>
                      )}
                      {item.category && (
                        <span className={`
                          px-2 py-1 text-xs rounded-full
                          ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}
                        `}>
                          {item.category}
                        </span>
                      )}
                    </div>

                    {/* Price and Add to Cart */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ₹{item.price}
                      </span>
                      
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.isAvailable || addingToCart.has(item._id)}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                          ${item.isAvailable
                            ? 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }
                        `}
                      >
                        {addingToCart.has(item._id) ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <>
                            <PlusIcon className="h-4 w-4" />
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;