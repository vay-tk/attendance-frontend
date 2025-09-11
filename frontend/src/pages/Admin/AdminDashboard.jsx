import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  Shield,
  Activity,
  Database,
  Server,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

const AdminDashboard = () => {
  // Fetch dashboard data
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'admin-dashboard-stats',
    adminAPI.getDashboardStats,
    {
      onError: (error) => {
        console.error('Failed to fetch dashboard stats:', error);
      }
    }
  );

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    'admin-analytics',
    () => adminAPI.getSystemAnalytics({ groupBy: 'week' }),
    {
      onError: (error) => {
        console.error('Failed to fetch analytics:', error);
      }
    }
  );

  const { data: healthData, isLoading: healthLoading } = useQuery(
    'system-health',
    adminAPI.systemHealthCheck,
    { 
      refetchInterval: 60000,
      onError: (error) => {
        console.error('Failed to fetch health data:', error);
      }
    }
  );

  const stats = statsData?.data?.data || {};
  const analytics = analyticsData?.data?.data || {};
  const health = healthData?.data || { status: 'unknown' };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-success-600 bg-success-100';
      case 'warning': return 'text-warning-600 bg-warning-100';
      case 'error': return 'text-error-600 bg-error-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      default: return Shield;
    }
  };

  if (statsLoading || analyticsLoading || healthLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/admin/users">
            <Button>
              <Users size={16} className="mr-2" />
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* System Health Status */}
      <div className="card card-padding">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <span className={`status-badge ${getHealthStatusColor(health.status).replace('text-', '').replace('bg-', '')}`}>
            {health.status?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(health.services || {}).map(([service, serviceHealth]) => {
            const Icon = getHealthIcon(serviceHealth.status);
            return (
              <div key={service} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Icon className={`w-6 h-6 ${getHealthStatusColor(serviceHealth.status)}`} />
                <div>
                  <p className="font-medium text-gray-900 capitalize">{service}</p>
                  <p className="text-sm text-gray-600">{serviceHealth.status || 'unknown'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card card-padding"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.users?.total || 0}</p>
              <p className="text-xs text-gray-500">{stats.users?.active || 0} active</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card card-padding"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.courses?.totalCourses || 0}</p>
              <p className="text-xs text-gray-500">{stats.courses?.activeCourses || 0} active</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card card-padding"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sessions?.total || 0}</p>
              <p className="text-xs text-gray-500">{stats.sessions?.thisWeek || 0} this week</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card card-padding"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Face Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.faceEnrollments || 0}</p>
              <p className="text-xs text-gray-500">AI ready students</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card card-padding"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Registration Trends</h3>
          {analytics.userTrends?.length > 0 ? (
            <div className="h-64">
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
            <div className="flex items-center justify-center h-64 text-gray-500">
              No trend data available
            </div>
          )}
        </motion.div>

        {/* Department Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card card-padding"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Department</h3>
          {analytics.departmentStats?.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="studentCount" fill="#14B8A6" name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No department data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card card-padding"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            <Link to="/admin/users" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats.recentActivity?.users?.length > 0 ? (
              stats.recentActivity.users.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`status-badge ${user.role === 'student' ? 'info' : user.role === 'faculty' ? 'success' : 'warning'}`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent users</p>
            )}
          </div>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card card-padding"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
            <Link to="/admin/analytics" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View analytics
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats.recentActivity?.sessions?.length > 0 ? (
              stats.recentActivity.sessions.map((session) => (
                <div key={session._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{session.title}</p>
                    <p className="text-sm text-gray-600">{session.courseId?.code}</p>
                  </div>
                  <div className="text-right">
                    <span className={`status-badge ${
                      session.status === 'ACTIVE' ? 'success' : 
                      session.status === 'CLOSED' ? 'gray' : 'info'
                    }`}>
                      {session.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {session.facultyId?.name}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent sessions</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* System Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="card card-padding"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Activity className="w-12 h-12 text-primary-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Today's Attendance</h4>
            <p className="text-2xl font-bold text-gray-900">{stats.attendance?.today || 0}</p>
          </div>
          
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-warning-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Flagged Records</h4>
            <p className="text-2xl font-bold text-gray-900">{stats.attendance?.flagged || 0}</p>
          </div>
          
          <div className="text-center">
            <Database className="w-12 h-12 text-secondary-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Total Enrollments</h4>
            <p className="text-2xl font-bold text-gray-900">{stats.courses?.totalEnrollments || 0}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="card card-padding"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/users" className="block">
            <div className="p-4 text-center rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group">
              <Users className="w-8 h-8 text-gray-600 group-hover:text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 group-hover:text-primary-900">
                Manage Users
              </p>
            </div>
          </Link>
          
          <Link to="/admin/analytics" className="block">
            <div className="p-4 text-center rounded-lg border border-gray-200 hover:border-secondary-300 hover:bg-secondary-50 transition-colors group">
              <TrendingUp className="w-8 h-8 text-gray-600 group-hover:text-secondary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 group-hover:text-secondary-900">
                System Analytics
              </p>
            </div>
          </Link>
          
          <div className="p-4 text-center rounded-lg border border-gray-200 hover:border-accent-300 hover:bg-accent-50 transition-colors group cursor-pointer">
            <Shield className="w-8 h-8 text-gray-600 group-hover:text-accent-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 group-hover:text-accent-900">
              Security Settings
            </p>
          </div>
          
          <div className="p-4 text-center rounded-lg border border-gray-200 hover:border-warning-300 hover:bg-warning-50 transition-colors group cursor-pointer">
            <Server className="w-8 h-8 text-gray-600 group-hover:text-warning-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 group-hover:text-warning-900">
              System Health
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;