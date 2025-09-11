import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, BarChart3, TrendingUp, Download } from 'lucide-react';
import AttendanceChart from '../Charts/AttendanceChart';
import Button from '../UI/Button';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';

const AttendanceTrends = ({ data, title = "Attendance Trends", onExport }) => {
  const [timeframe, setTimeframe] = useState('week'); // week, month, semester
  const [viewType, setViewType] = useState('line'); // line, bar, area

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let startDate;
    let groupBy;

    switch (timeframe) {
      case 'week':
        startDate = startOfWeek(now);
        groupBy = 'day';
        break;
      case 'month':
        startDate = startOfMonth(now);
        groupBy = 'week';
        break;
      case 'semester':
        startDate = subDays(now, 120); // ~4 months
        groupBy = 'month';
        break;
      default:
        startDate = startOfWeek(now);
        groupBy = 'day';
    }

    // Group data by timeframe
    const grouped = data
      .filter(item => new Date(item.date) >= startDate)
      .reduce((acc, item) => {
        let key;
        const date = new Date(item.date);
        
        switch (groupBy) {
          case 'day':
            key = format(date, 'MMM dd');
            break;
          case 'week':
            key = `Week ${format(date, 'w')}`;
            break;
          case 'month':
            key = format(date, 'MMM yyyy');
            break;
          default:
            key = format(date, 'MMM dd');
        }

        if (!acc[key]) {
          acc[key] = { 
            date: key, 
            present: 0, 
            absent: 0, 
            total: 0, 
            attendance: 0 
          };
        }

        acc[key].present += item.present || 0;
        acc[key].absent += item.absent || 0;
        acc[key].total += (item.present || 0) + (item.absent || 0);
        
        return acc;
      }, {});

    // Calculate attendance percentages
    return Object.values(grouped).map(item => ({
      ...item,
      attendance: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0
    }));
  }, [data, timeframe]);

  const averageAttendance = useMemo(() => {
    if (processedData.length === 0) return 0;
    const total = processedData.reduce((sum, item) => sum + item.attendance, 0);
    return Math.round(total / processedData.length);
  }, [processedData]);

  const trend = useMemo(() => {
    if (processedData.length < 2) return 0;
    const recent = processedData.slice(-3);
    const earlier = processedData.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, item) => sum + item.attendance, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, item) => sum + item.attendance, 0) / earlier.length;
    
    return Math.round(((recentAvg - earlierAvg) / earlierAvg) * 100) || 0;
  }, [processedData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card card-padding"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">Avg:</span>
            <span className="font-semibold text-gray-900">{averageAttendance}%</span>
            {trend !== 0 && (
              <span className={`flex items-center ${
                trend > 0 ? 'text-success-600' : 'text-error-600'
              }`}>
                {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(trend)}%
              </span>
            )}
          </div>
          
          {onExport && (
            <Button
              size="small"
              variant="outline"
              onClick={onExport}
              icon={Download}
            >
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          {['week', 'month', 'semester'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeframe === period
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex space-x-2">
          {['line', 'bar', 'area'].map((type) => (
            <button
              key={type}
              onClick={() => setViewType(type)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewType === type
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <AttendanceChart
        data={processedData}
        type={viewType}
        height={height}
        showLegend={showLegend}
        colors={colors}
      />

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-success-600">
            {processedData.reduce((sum, item) => sum + item.present, 0)}
          </p>
          <p className="text-sm text-gray-600">Total Present</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-error-600">
            {processedData.reduce((sum, item) => sum + item.absent, 0)}
          </p>
          <p className="text-sm text-gray-600">Total Absent</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary-600">
            {processedData.reduce((sum, item) => sum + item.total, 0)}
          </p>
          <p className="text-sm text-gray-600">Total Sessions</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AttendanceTrends;