import React from 'react';

const Footer = ({ isDarkMode }) => (
  <footer className={`${isDarkMode?'bg-gray-900 text-gray-400':'bg-gray-100 text-gray-600'} py-8 mt-16`} id="contact">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
      <div className="text-sm">© {new Date().getFullYear()} Food Ordering Platform. All rights reserved.</div>
      <div className="flex space-x-6 text-sm">
        <a href="#privacy" className="hover:text-yellow-500 transition">Privacy</a>
        <a href="#terms" className="hover:text-yellow-500 transition">Terms</a>
        <a href="#contact" className="hover:text-yellow-500 transition">Contact</a>
      </div>
    </div>
  </footer>
);

export default React.memo(Footer);
