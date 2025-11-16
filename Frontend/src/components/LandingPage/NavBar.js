import React, { useState } from 'react';
import { HomeIcon, Bars3Icon, UserGroupIcon, PhoneIcon, ShoppingCartIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useDarkMode } from './DarkModeContext';

const NavButton = React.memo(({ onClick, children }) => (
  <button
    onClick={onClick}
    className="group px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 relative"
  >
    {children}
    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
  </button>
));

const NavBar = ({ activeSection='home', handleNavigation=()=>{}, cartCount=0, onLoginClick, onSignupClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-sm transition-colors duration-300`}>      
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl md:text-2xl font-bold text-yellow-500">Kingsman</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavButton onClick={() => handleNavigation('home')}>
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hover:text-yellow-500`}>
                Home
              </span>
            </NavButton>
            <NavButton onClick={() => handleNavigation('about')}>
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hover:text-yellow-500`}>
                About Us
              </span>
            </NavButton>
            <NavButton onClick={() => handleNavigation('menu')}>
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hover:text-yellow-500`}>
                Menu
              </span>
            </NavButton>
            <NavButton onClick={() => handleNavigation('contact')}>
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hover:text-yellow-500`}>
                Contact Us
              </span>
            </NavButton>
          </div>

          {/* Auth & Cart Buttons */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${
                isDarkMode 
                  ? 'text-yellow-400 hover:bg-gray-800' 
                  : 'text-gray-600 hover:bg-gray-100'
              } transition-colors duration-200`}
            >
              {isDarkMode ? <SunIcon className="h-6 w-6"/> : <MoonIcon className="h-6 w-6"/>}
            </button>

            <button
              onClick={onSignupClick}
              className={`hidden md:block px-6 py-2 ${
                isDarkMode
                  ? 'text-yellow-400 border-yellow-400 hover:bg-gray-800'
                  : 'text-yellow-500 border-yellow-500 hover:bg-yellow-50'
              } border-2 rounded-lg transition duration-300`}
            >
              Sign Up
            </button>
            <button
              onClick={onLoginClick}
              className="hidden md:block px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300"
            >
              Login
            </button>
            <div className="relative">
              <button 
                onClick={onLoginClick} 
                className={`p-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hover:text-yellow-500 transition-all relative`}
              >
                <ShoppingCartIcon className="h-6 w-6"/>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hover:text-yellow-500`}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className={`py-4 space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <NavButton onClick={() => handleNavigation('home')}>Home</NavButton>
            <NavButton onClick={() => handleNavigation('about')}>About Us</NavButton>
            <NavButton onClick={() => handleNavigation('menu')}>Menu</NavButton>
            <NavButton onClick={() => handleNavigation('contact')}>Contact Us</NavButton>
            <div className="pt-4 flex space-x-4">
              <button
                onClick={onSignupClick}
                className={`w-1/2 px-4 py-2 ${
                  isDarkMode
                    ? 'text-yellow-400 border-yellow-400 hover:bg-gray-800'
                    : 'text-yellow-500 border-yellow-500 hover:bg-yellow-50'
                } border-2 rounded-lg transition duration-300`}
              >
                Sign Up
              </button>
              <button
                onClick={onLoginClick}
                className="w-1/2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default React.memo(NavBar);
