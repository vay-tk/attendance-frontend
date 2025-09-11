import React from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Shield, Bell, Palette } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account preferences and system settings
        </p>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card card-padding"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Manage your personal information, profile photo, and account details.
          </p>
          <a 
            href="/profile" 
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Go to Profile →
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card card-padding"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <Shield className="w-6 h-6 text-secondary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Change your password and manage security preferences.
          </p>
          <a 
            href="/profile" 
            className="text-secondary-600 hover:text-secondary-700 font-medium"
          >
            Security Settings →
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card card-padding"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-accent-100 rounded-lg">
              <Bell className="w-6 h-6 text-accent-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Configure how you receive notifications and alerts.
          </p>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 rounded" />
              <span className="ml-2 text-sm text-gray-700">Email notifications</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 rounded" />
              <span className="ml-2 text-sm text-gray-700">Session reminders</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" />
              <span className="ml-2 text-sm text-gray-700">SMS notifications</span>
            </label>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card card-padding"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Palette className="w-6 h-6 text-warning-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Customize the look and feel of your interface.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <select className="input-field">
                <option>Light</option>
                <option>Dark</option>
                <option>Auto</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>

      {/* System Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card card-padding"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Settings className="w-6 h-6 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Version:</span>
            <span className="ml-2 font-medium">1.0.0</span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 font-medium">January 2025</span>
          </div>
          <div>
            <span className="text-gray-600">Environment:</span>
            <span className="ml-2 font-medium">Development</span>
          </div>
          <div>
            <span className="text-gray-600">Support:</span>
            <span className="ml-2 font-medium">support@attendancesystem.com</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;