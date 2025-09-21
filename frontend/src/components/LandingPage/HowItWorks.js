import React from 'react';
import { motion } from 'framer-motion';
import { howItWorks } from './constants';

const HowItWorks = ({ isDarkMode }) => (
  <section className={`py-16 ${isDarkMode ? 'bg-gray-800':'bg-white'}`}>    
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.5}} className="text-center mb-12">
        <h2 className={`text-3xl font-bold mb-4 ${isDarkMode?'text-white':'text-gray-900'}`}>How It Works</h2>
        <p className={`${isDarkMode?'text-gray-400':'text-gray-600'} max-w-2xl mx-auto`}>Super easy ordering experience in just a few steps</p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {howItWorks.map((step,i)=>(
          <motion.div key={step.title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.5,delay:i*0.1}} className={`${isDarkMode?'bg-gray-700/60 border-gray-600 text-white':'bg-white border-gray-200 text-gray-900'} p-8 rounded-xl border backdrop-blur-sm relative overflow-hidden group`}>            
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:to-yellow-500/5 transition" />
            <div className="w-14 h-14 rounded-full bg-yellow-500 flex items-center justify-center mb-6 text-xl font-bold text-gray-900 shadow-lg">{`0${i+1}`}</div>
            <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
            <p className={`${isDarkMode?'text-gray-300':'text-gray-600'}`}>{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default React.memo(HowItWorks);
