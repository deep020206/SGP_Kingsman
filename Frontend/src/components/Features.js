import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BoltIcon, SparklesIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

const Features = React.memo(() => {
  const prefersReducedMotion = useReducedMotion();
  
  const features = useMemo(() => [
    {
      icon: <BoltIcon className="h-12 w-12 text-[#FF6B2B]" />,
      title: 'Lightning Fast Delivery',
      description: 'Get your favorite meals delivered in 30 minutes or less, guaranteed.'
    },
    {
      icon: <SparklesIcon className="h-12 w-12 text-[#FF6B2B]" />,
      title: 'Farm Fresh Ingredients',
      description: 'We source the finest, freshest ingredients from local farms daily.'
    },
    {
      icon: <DevicePhoneMobileIcon className="h-12 w-12 text-[#FF6B2B]" />,
      title: 'Easy Online Ordering',
      description: 'Simple, intuitive app experience with real-time order tracking.'
    }
  ], []); // Empty dependency array since icons are static

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3,
                delay: prefersReducedMotion ? 0 : Math.min(index * 0.1, 0.3)
              }}
              whileHover={prefersReducedMotion ? {} : { y: -5 }}
              className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition duration-300"
            >
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-orange-100 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <motion.button
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                className="text-[#FF6B2B] font-medium hover:text-orange-600 transition duration-300"
                onClick={() => {
                  // Add your learn more action here
                  console.log(`Learn more about ${feature.title}`);
                }}
              >
                Learn More
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
});

Features.displayName = 'Features';

export default Features;