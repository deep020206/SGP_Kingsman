import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-[#FF6B2B]">Fusion</Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/menu" className="text-gray-700 hover:text-[#FF6B2B]">Menu</Link>
            <Link to="/about" className="text-gray-700 hover:text-[#FF6B2B]">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-[#FF6B2B]">Contact</Link>
            
            <div className="flex items-center bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
              <span role="img" aria-label="fire">🔥</span>
              <span className="ml-1 text-sm">30% Off First Order</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Link to="/cart">
                <ShoppingCartIcon className="h-6 w-6 text-gray-700 hover:text-[#FF6B2B]" />
                <span className="absolute -top-2 -right-2 bg-[#FF6B2B] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
              </Link>
            </div>
            <Link to="/signin" className="text-gray-700 hover:text-[#FF6B2B]">
              <UserIcon className="h-6 w-6" />
            </Link>
            <Link to="/order" className="bg-[#FF6B2B] text-white px-4 py-2 rounded-full hover:bg-orange-600 transition duration-300">
              Order Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;