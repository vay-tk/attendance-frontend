import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricsCard = ({ 
  title, 
  value, 
  subtitle,
  change,
  changeLabel,
  icon: Icon,
  color = 'primary',
  loading = false,
  onClick,
  className = ''
}) => {
  const getTrendIcon = () => {
    if (change === undefined || change === null) return Minus;
    return change > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = () => {
    if (change === undefined || change === null) return 'text-gray-500';
    return change > 0 ? 'text-success-600' : 'text-error-600';
  };

  const TrendIcon = getTrendIcon();
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    secondary: 'bg-secondary-100 text-secondary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    error: 'bg-error-100 text-error-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <motion.div
      whileHover={onClick ? { y: -2 } : undefined}
      className={`
        card card-padding transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {Icon && (
              <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                <Icon size={20} />
              </div>
            )}
            <p className="text-sm font-medium text-gray-600">{title}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-900">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded" />
              ) : (
                value
              )}
            </p>
            
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>

          {(change !== undefined && !loading) && (
            <div className="flex items-center space-x-1 mt-2">
              <TrendIcon size={14} className={getTrendColor()} />
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {Math.abs(change)}%
              </span>
              {changeLabel && (
                <span className="text-xs text-gray-500">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MetricsCard;