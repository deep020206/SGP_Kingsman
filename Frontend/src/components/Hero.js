import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ClockIcon, StarIcon, TruckIcon } from '@heroicons/react/24/outline';

const Hero = () => {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28"
          >
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <span role="img" aria-label="rocket">🚀</span>
              <span>Now Available in Your City</span>
            </div>
            
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block text-[#FF6B2B] xl:inline">Fusion</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              Discover culinary excellence delivered to your doorstep. Fresh ingredients, bold flavors, and lightning-fast delivery.
            </p>

            <div className="flex items-center space-x-8 mt-6">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-[#FF6B2B]" />
                <span className="ml-2 text-sm text-gray-600">30 min delivery</span>
              </div>
              <div className="flex items-center">
                <StarIcon className="h-5 w-5 text-[#FF6B2B]" />
                <span className="ml-2 text-sm text-gray-600">4.9★ rated</span>
              </div>
              <div className="flex items-center">
                <TruckIcon className="h-5 w-5 text-[#FF6B2B]" />
                <span className="ml-2 text-sm text-gray-600">Free delivery</span>
              </div>
            </div>

            <div className="mt-8 sm:mt-10 space-x-4">
              <Link to="/order" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-[#FF6B2B] hover:bg-orange-600 transition duration-300">
                Order Now
              </Link>
              <Link to="/menu" className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition duration-300">
                View Menu
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="relative h-64 sm:h-72 md:h-96 lg:h-full">
          <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-1 shadow-md z-10">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm font-medium">Live Order Tracking</span>
            </span>
          </div>
          <div className="absolute bottom-4 right-4 bg-[#FF6B2B] text-white rounded-lg px-3 py-1 shadow-md z-10 flex items-center space-x-2">
            <span role="img" aria-label="lightning">⚡</span>
            <span className="text-sm font-medium">Super Fast</span>
            <span className="text-xs">30 min delivery</span>
          </div>
          <img
            className="h-full w-full object-cover"
            src="/path/to/your/food-image.jpg"
            alt="Delicious food"
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(Hero);