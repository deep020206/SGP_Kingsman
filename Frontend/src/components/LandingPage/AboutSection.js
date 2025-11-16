import React from 'react';
import { motion } from 'framer-motion';

const AboutSection = ({ isDarkMode }) => (
  <section className={`${isDarkMode ? 'bg-gray-900 text-gray-100':'bg-gray-50 text-gray-800'} py-16`}>
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.5}} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6">Why Choose Us</h2>
          <p className="mb-4 leading-relaxed">Welcome to Kingsman - your favorite local food shop near CHARUSAT University, Changa! We serve fresh, delicious meals to students and faculty with the convenience of online ordering. From quick snacks to hearty meals, we're here to fuel your academic journey.</p>
          <ul className="space-y-3">
            {['Fresh daily preparations','Quick campus delivery','Student-friendly prices','Easy online ordering'].map(point=>(
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
                {num:'500+', label:'Happy Students'},
                {num:'2K+', label:'Orders Served'},
                {num:'4.9★', label:'Customer Rating'},
                {num:'5min', label:'Avg Delivery'},
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
