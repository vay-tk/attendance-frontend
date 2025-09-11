import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        variants={spinnerVariants}
        animate="animate"
        className={`border-2 border-primary-200 border-t-primary-600 rounded-full ${sizeClasses[size]}`}
      />
    </div>
  );
};

export default LoadingSpinner;