import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'medium',
  className = '' 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    info: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800'
  };

  const sizes = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-0.5 text-xs',
    large: 'px-3 py-1 text-sm'
  };

  return (
    <span className={`
      inline-flex items-center rounded-full font-medium
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {children}
    </span>
  );
};

export default Badge;