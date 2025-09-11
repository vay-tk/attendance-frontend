import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../UI/Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'info'
  loading = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-error-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-warning-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-primary-600" />;
    }
  };

  const getConfirmButtonProps = () => {
    switch (type) {
      case 'danger':
        return { variant: 'danger' };
      case 'warning':
        return { variant: 'warning' };
      default:
        return { variant: 'primary' };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                {getIcon()}
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              </div>
              
              {message && (
                <p className="text-gray-600 mb-6">{message}</p>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  {cancelText}
                </Button>
                <Button
                  {...getConfirmButtonProps()}
                  onClick={onConfirm}
                  loading={loading}
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;