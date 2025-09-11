import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-200',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-100 border border-gray-300',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-200',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-200',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-200',
    outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-200',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
  };

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-5 py-2.5 text-sm',
    large: 'px-6 py-3 text-base',
  };

  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      variants={buttonVariants}
      whileHover={!isDisabled ? "hover" : undefined}
      whileTap={!isDisabled ? "tap" : undefined}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="small" className="mr-2" />
          Loading...
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={16} className="mr-2" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={16} className="ml-2" />}
        </>
      )}
    </motion.button>
  );
};

export default Button;