import React from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useMutation } from 'react-query';
import { adminAPI } from '../../api/admin';
import Button from '../UI/Button';
import { validators, getValidationMessage } from '../../utils/validation';
import toast from 'react-hot-toast';

const EditUserModal = ({ user, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      department: user.department,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive
    }
  });

  const updateUser = useMutation(
    (data) => adminAPI.updateUser(user._id, data),
    {
      onSuccess: () => {
        toast.success('User updated successfully');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user');
      }
    }
  );

  const onSubmit = (data) => {
    updateUser.mutate(data);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Edit User: {user.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                {...register('name', {
                  required: getValidationMessage.required,
                  validate: (value) => validators.name(value) || getValidationMessage.name
                })}
                type="text"
                className={`input-field ${errors.name ? 'border-error-300' : ''}`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                {...register('email', {
                  required: getValidationMessage.required,
                  validate: (value) => validators.email(value) || getValidationMessage.email
                })}
                type="email"
                className={`input-field ${errors.email ? 'border-error-300' : ''}`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                {...register('department', {
                  required: getValidationMessage.required
                })}
                className={`input-field ${errors.department ? 'border-error-300' : ''}`}
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Information Technology">Information Technology</option>
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-error-600">{errors.department.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                {...register('phone', {
                  validate: (value) => !value || validators.phone(value) || getValidationMessage.phone
                })}
                type="tel"
                className={`input-field ${errors.phone ? 'border-error-300' : ''}`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-error-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                {...register('role', {
                  required: getValidationMessage.required
                })}
                className={`input-field ${errors.role ? 'border-error-300' : ''}`}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-error-600">{errors.role.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                {...register('isActive')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">User is active</span>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={updateUser.isLoading}
              >
                Update User
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditUserModal;