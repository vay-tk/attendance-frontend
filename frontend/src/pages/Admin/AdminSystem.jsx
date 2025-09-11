import React from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  Database, 
  Shield, 
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download
} from 'lucide-react';
import { useQuery } from 'react-query';
import { adminAPI } from '../../api/admin';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import { format } from 'date-fns';

const AdminSystem = () => {
  // Fetch system health data
  const { data: healthData, isLoading, refetch } = useQuery(
    'system-health',
    adminAPI.systemHealthCheck,
    { refetchInterval: 60000 } // Refresh every minute
  );

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
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600">Monitor system status and performance</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            onClick={() => refetch()}
            variant="outline"
            icon={RefreshCw}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall System Status */}
      <div className="card card-padding">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Overall System Status</h3>
          <span className={`status-badge ${getHealthStatusColor(health.status).replace('text-', '').replace('bg-', '')}`}>
            {health.status?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(health.services || {}).map(([service, serviceHealth]) => {
            const Icon = getHealthIcon(serviceHealth.status);
            return (
              <div key={service} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Icon className={`w-8 h-8 ${getHealthStatusColor(serviceHealth.status)}`} />
                <div>
                  <p className="font-medium text-gray-900 capitalize">{service}</p>
                  <p className="text-sm text-gray-600">{serviceHealth.status || 'unknown'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card card-padding"
        >
          <div className="flex items-center">
            <Server className="h-8 w-8 text-primary-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor((health.uptime || 0) / 3600)}h {Math.floor(((health.uptime || 0) % 3600) / 60)}m
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card card-padding"
        >
          <div className="flex items-center">
            <Database className="h-8 w-8 text-secondary-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Database</p>
              <p className="text-2xl font-bold text-gray-900">
                {health.services?.database?.status === 'connected' ? 'Connected' : 'Disconnected'}
              </p>
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
            <Activity className="h-8 w-8 text-accent-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {health.services?.memory?.heapUsed || 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Service Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card card-padding"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
        
        <div className="space-y-4">
          {Object.entries(health.services || {}).map(([service, details]) => (
            <div key={service} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  details.status === 'healthy' || details.status === 'connected' ? 'bg-success-500' :
                  details.status === 'warning' ? 'bg-warning-500' : 'bg-error-500'
                }`} />
                <div>
                  <p className="font-medium text-gray-900 capitalize">{service}</p>
                  <p className="text-sm text-gray-600">{details.status}</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                {details.heapUsed && <p>Memory: {details.heapUsed}</p>}
                {details.readyState && <p>State: {details.readyState}</p>}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* System Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card card-padding"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Version Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">System Version:</span>
                <span className="font-medium">{health.version || '1.0.0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">{format(new Date(), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Environment</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Environment:</span>
                <span className="font-medium">Development</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Node Version:</span>
                {/* <span className="font-medium">{process.version || 'Unknown'}</span> */}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSystem;