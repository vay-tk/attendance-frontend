import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const DashboardStats = ({ stats, loading = false }) => {
  const StatCard = ({ title, value, change, icon: Icon, color = 'primary', index = 0 }) => {
    const getTrendIcon = () => {
      if (!change) return Minus;
      return change > 0 ? TrendingUp : TrendingDown;
    };

    const getTrendColor = () => {
      if (!change) return 'text-gray-500';
      return change > 0 ? 'text-success-600' : 'text-error-600';
    };

    const TrendIcon = getTrendIcon();

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="card card-padding"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg bg-${color}-100`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded" />
                ) : (
                  value
                )}
              </p>
            </div>
          </div>
          
          {change !== undefined && !loading && (
            <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
              <TrendIcon size={16} />
              <span className="text-sm font-medium">
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>

        {change !== undefined && !loading && (
          <div className="mt-2 text-xs text-gray-500">
            {change > 0 ? 'Increased' : change < 0 ? 'Decreased' : 'No change'} from last period
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          color={stat.color}
          index={index}
        />
      ))}
    </div>
  );
};

export default DashboardStats;