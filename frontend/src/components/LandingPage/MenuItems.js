import React, { useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { categoryImages } from './constants';

const MenuItem = React.memo(({ item, isDarkMode, onAddToCart, delay, prefersReducedMotion }) => {
  const handleError = useCallback((e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = categoryImages[item.name] || '/default-food.png';
  }, [item.name]);

  const handleAddToCart = useCallback(() => {
    onAddToCart(item);
  }, [item, onAddToCart]);

  return (
    <motion.div 
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : Math.min(delay * 0.1, 0.3) }}
      className={`relative rounded-xl overflow-hidden flex flex-col justify-end min-h-[320px] ${
        isDarkMode ? 'bg-gray-700' : 'bg-white'
      } hover:shadow-2xl transition group border ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}
    >
      <img 
        src={item.image || item.imageUrl || categoryImages[item.name] || '/default-food.png'} 
        alt={item.name}
        onError={handleError}
        className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-300"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/60 z-10"/>
      <div className="relative z-20 flex flex-col items-center justify-center h-full p-6">
        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg text-center">{item.name}</h3>
        <div className="font-semibold mb-2 text-yellow-400 text-lg drop-shadow">₹{item.price}</div>
        <button 
          onClick={handleAddToCart}
          className="mt-4 px-6 py-2 bg-yellow-500 text-gray-900 rounded-full font-semibold hover:bg-yellow-400 shadow-lg transition"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
});

MenuItem.displayName = 'MenuItem';

const MenuItems = React.memo(({ isDarkMode, loading, error, foodItems, onAddToCart }) => {
  const prefersReducedMotion = useReducedMotion();
  
  const headerAnimation = useMemo(() => ({
    initial: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
    viewport: { once: true }
  }), [prefersReducedMotion]);

  return (
    <section className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>    
      <div className="max-w-7xl mx-auto px-4">
        <motion.div {...headerAnimation} className="text-center mb-12">
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white':'text-gray-900'} mb-4`}>
            Popular Menu Items
          </h2>
          <p className={`${isDarkMode?'text-gray-400':'text-gray-600'} max-w-2xl mx-auto`}>
            Our most loved dishes, carefully crafted for your enjoyment
          </p>
        </motion.div>
        
        {loading ? (
          <div className={`text-center ${isDarkMode? 'text-gray-400':'text-gray-600'}`}>
            Loading...
          </div>
        ) : error ? (
          <div className="text-center text-red-400">{error}</div>
        ) : Array.isArray(foodItems) && foodItems.length === 0 ? (
          <div className={`text-center ${isDarkMode? 'text-gray-400':'text-gray-600'}`}>
            No menu items available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {foodItems.map((item, index) => (
              <MenuItem
                key={item._id || index}
                item={item}
                isDarkMode={isDarkMode}
                onAddToCart={onAddToCart}
                delay={index}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

MenuItems.displayName = 'MenuItems';
export default MenuItems;
