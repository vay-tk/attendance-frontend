import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  padding = true,
  hover = true,
  ...props 
}) => {
  const cardVariants = {
    hover: { 
      y: -2,
      boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={hover ? "hover" : undefined}
      className={`
        bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-300
        ${padding ? 'p-6' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;