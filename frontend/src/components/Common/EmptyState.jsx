import React from 'react';
import { motion } from 'framer-motion';
import Button from '../UI/Button';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionText,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 ${className}`}
    >
      {Icon && (
        <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      )}
      
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      
      {action && actionText && (
        <Button onClick={action}>
          {actionText}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;