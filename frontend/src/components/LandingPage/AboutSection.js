import React from 'react';
import { motion } from 'framer-motion';

const AboutSection = ({ isDarkMode }) => (
  <section className={`${isDarkMode ? 'bg-gray-900 text-gray-100':'bg-gray-50 text-gray-800'} py-16`}>
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.5}} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6">Why Choose Us</h2>
          <p className="mb-4 leading-relaxed">We combine technology, culinary expertise, and local partnerships to bring you a seamless food ordering experience. From curated recommendations to real-time tracking, everything is designed for speed, reliability, and delight.</p>
          <ul className="space-y-3">
            {['Freshly prepared meals','Fast delivery network','Exclusive vendor partnerships','Secure payments & tracking'].map(point=>(
              <li key={point} className="flex items-start">
                <span className="text-yellow-500 mr-3 mt-1">✔</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 to-yellow-600/10 rounded-3xl blur-lg" />
          <div className={`${isDarkMode?'bg-gray-800':'bg-white'} relative p-8 rounded-2xl shadow-xl border ${isDarkMode?'border-gray-700':'border-gray-200'}`}>
            <div className="grid grid-cols-2 gap-6">
              {[
                {num:'120+', label:'Vendors'},
                {num:'10K+', label:'Orders Delivered'},
                {num:'4.8★', label:'Avg Rating'},
                {num:'50+', label:'Cities'},
              ].map(stat=>(
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{stat.num}</div>
                  <div className="text-sm mt-1 opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default React.memo(AboutSection);
