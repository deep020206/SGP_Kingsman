import React from 'react';
import { motion } from 'framer-motion';
import { categories, categoryImages } from './constants';

const CategoryGrid = ({ isDarkMode }) => (
  <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`} id="categories">
    <div className="max-w-7xl mx-auto px-4">
      <motion.div 
        initial={{opacity:0, y:20}} 
        whileInView={{opacity:1, y:0}} 
        transition={{duration:0.5}} 
        className="text-center mb-12"
      >
        <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white':'text-gray-900'} mb-4`}>
          Browse by Category
        </h2>
        <p className={`${isDarkMode ? 'text-gray-400':'text-gray-600'} max-w-2xl mx-auto`}>
          Explore our diverse menu categories and discover your new favorite dishes
        </p>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {categories.map((cat, i) => (
          <motion.div 
            key={cat.name} 
            initial={{opacity:0, y:20}} 
            whileInView={{opacity:1, y:0}} 
            transition={{duration:0.5, delay:i*0.1}} 
            className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
          >
            <img 
              src={categoryImages[cat.name]} 
              alt={cat.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className={`text-white text-xl font-bold px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-black/50' : 'bg-black/40'
              } backdrop-blur-sm`}>
                {cat.name}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default React.memo(CategoryGrid);
