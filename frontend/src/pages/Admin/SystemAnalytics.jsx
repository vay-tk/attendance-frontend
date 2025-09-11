import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';
import { useQuery } from 'react-query';
import { adminAPI } from '../../api/admin';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { format, subDays } from 'date-fns';

const SystemAnalytics = () => {
  const [dateRange, setDateRange] = useState(30); // days
  const [groupBy, setGroupBy] = useState('day');

  // Calculate date range
  const endDate = new Date();
  const startDate = subDays(endDate, dateRange);

  // Fetch analytics data
  const { data: analyticsData, isLoading, refetch } = useQuery(
    ['system-analytics', startDate, endDate, groupBy],
    () => adminAPI.getSystemAnalytics(),
    {
      onError: (error) => {
        console.error('Failed to fetch analytics:', error);
      }
    }
  );

  const analytics = analyticsData?.data?.data || {};

  const exportData = (dataType) => {
    const data = analytics[dataType];
    if (!data || data.length === 0) {
      toast.warning('No data to export');
      return;
    }

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataType}-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-600">Comprehensive system usage and performance metrics</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            onClick={() => refetch()}
            variant="outline"
            icon={RefreshCw}
          >
            Refresh
          </Button>
          <Button
            onClick={() => exportData('userTrends')}
            variant="outline"
            icon={Download}
          >
            Export Data
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="card card-padding">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                className="input-field"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="input-field"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* User Registration Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card card-padding"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">User Registration Trends</h3>
          </div>
          <Button
            size="small"
            variant="outline"
            onClick={() => exportData('userTrends')}
            icon={Download}
          >
            Export
          </Button>
        </div>
        
        {analytics.userTrends?.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.userTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id.date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-80 text-gray-500">
            No user registration data available
          </div>
        )}
      </motion.div>

      {/* Course Creation Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card card-padding"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-secondary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Course Creation Trends</h3>
          </div>
          <Button
            size="small"
            variant="outline"
            onClick={() => exportData('courseTrends')}
            icon={Download}
          >
            Export
          </Button>
        </div>
        
        {analytics.courseTrends?.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.courseTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#14B8A6" name="New Courses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-80 text-gray-500">
            No course creation data available
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card card-padding"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Students by Department</h3>
            </div>
          </div>
          
          {analytics.departmentStats?.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.departmentStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="_id" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="studentCount" fill="#3B82F6" name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500">
              No department data available
            </div>
          )}
        </motion.div>

        {/* Faculty Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card card-padding"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-success-600" />
              <h3 className="text-lg font-semibold text-gray-900">Top Faculty by Sessions</h3>
            </div>
          </div>
          
          {analytics.facultyStats?.length > 0 ? (
            <div className="space-y-4">
              {analytics.facultyStats.slice(0, 8).map((faculty, index) => (
                <div key={faculty._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{faculty.facultyName}</p>
                    <p className="text-sm text-gray-600">{faculty.facultyEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{faculty.sessionsCount}</p>
                    <p className="text-sm text-gray-600">sessions</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 text-gray-500">
              No faculty data available
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SystemAnalytics;