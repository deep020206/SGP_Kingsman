import React from 'react';
import { ClockIcon, UserIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

const HeroSection = ({ onSignupClick, isDarkMode }) => (
  <section className={`min-h-screen w-full flex items-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300 pt-16 md:pt-0`}>
    <div className="container mx-auto px-4 lg:px-8 flex flex-col-reverse lg:flex-row items-center justify-between gap-4 md:gap-8 py-4 md:py-8 lg:py-0">
      {/* Left Content */}
      <div className="lg:w-1/2 w-full text-center lg:text-left">
        <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 md:mb-6 transition-colors duration-300`}>
          Welcome to <span className="text-yellow-500">Kingsman</span><br />Your Campus Food Hub
        </h1>
        <p className={`text-base md:text-lg mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
          Serving fresh, delicious meals to CHARUSAT University students and faculty in Changa. Quick, convenient, and tasty food just for you!
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className={`flex items-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-yellow-50'} transition-colors duration-300`}>
            <div className="w-12 h-12 rounded-full bg-yellow-500 bg-opacity-20 flex items-center justify-center shrink-0">
              <UserIcon className="h-6 w-6 text-yellow-500"/>
            </div>
            <span className={`ml-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Select your food</span>
          </div>
          <div className={`flex items-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-yellow-50'} transition-colors duration-300`}>
            <div className="w-12 h-12 rounded-full bg-yellow-500 bg-opacity-20 flex items-center justify-center shrink-0">
              <ShoppingCartIcon className="h-6 w-6 text-yellow-500"/>
            </div>
            <span className={`ml-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Add to cart</span>
          </div>
          <div className={`flex items-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-yellow-50'} transition-colors duration-300`}>
            <div className="w-12 h-12 rounded-full bg-yellow-500 bg-opacity-20 flex items-center justify-center shrink-0">
              <ClockIcon className="h-6 w-6 text-yellow-500"/>
            </div>
            <span className={`ml-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Quick delivery</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <button
            onClick={onSignupClick}
            className="px-8 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors duration-300 shadow-lg"
          >
            Order Now
          </button>
          <button
            onClick={() => window.scrollTo({top: 600, behavior: 'smooth'})}
            className={`px-8 py-3 border-2 ${
              isDarkMode 
                ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            } font-semibold rounded-lg transition-colors duration-300`}
          >
            View Menu
          </button>
        </div>
      </div>

      {/* Right Content - Food Image */}
      <div className="lg:w-1/2 w-full">
        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px]">
          {/* Background circle */}
          <div 
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] ${
              isDarkMode ? 'bg-yellow-500' : 'bg-yellow-400'
            } rounded-full opacity-20 transition-colors duration-300`}
          />

          {/* Main food image */}
          <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%]">
            <img
              src="https://png.pngtree.com/png-clipart/20250103/original/pngtree-junk-food-png-image_19962665.png"
              alt="Fresh Food"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default React.memo(HeroSection);
