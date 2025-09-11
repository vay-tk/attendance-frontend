import React from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, GraduationCap, Briefcase } from 'lucide-react';
import { useMutation } from 'react-query';
import { authAPI } from '../../api/auth';
import Button from '../UI/Button';
import toast from 'react-hot-toast';

const CreateUserModal = ({ onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: 'student'
    }
  });

  const watchRole = watch('role');

  const createUser = useMutation(authAPI.register, {
    onSuccess: () => {
      toast.success('User created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  });

  const onSubmit = (data) => {
    createUser.mutate(data);
  };

  const roleOptions = [
    { value: 'student', label: 'Student', icon: GraduationCap },
    { value: 'faculty', label: 'Faculty', icon: Briefcase },
    { value: 'admin', label: 'Admin', icon: User }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                User Role *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label key={option.value} className="relative cursor-pointer">
                      <input
                        {...register('role', { required: 'Role is required' })}
                        type="radio"
                        value={option.value}
                        className="sr-only"
                      />
                      <div className={`
                        border-2 rounded-lg p-3 text-center transition-all duration-200
                        ${watchRole === option.value 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}>
                        <Icon className={`h-5 w-5 mx-auto mb-1 ${
                          watchRole === option.value ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                        <span className={`text-xs font-medium ${
                          watchRole === option.value ? 'text-primary-900' : 'text-gray-700'
                        }`}>
                          {option.label}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                className={`input-field ${errors.name ? 'border-error-300' : ''}`}
                placeholder="Enter full name"
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
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email'
                  }
                })}
                type="email"
                className={`input-field ${errors.email ? 'border-error-300' : ''}`}
                placeholder="Enter email address"
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
                {...register('department', { required: 'Department is required' })}
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

            {/* Role-specific fields */}
            {watchRole === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roll Number *
                </label>
                <input
                  {...register('rollNo', { required: 'Roll number is required' })}
                  type="text"
                  className={`input-field ${errors.rollNo ? 'border-error-300' : ''}`}
                  placeholder="Enter roll number"
                />
                {errors.rollNo && (
                  <p className="mt-1 text-sm text-error-600">{errors.rollNo.message}</p>
                )}
              </div>
            )}

            {(watchRole === 'faculty' || watchRole === 'admin') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID *
                </label>
                <input
                  {...register('employeeId', { required: 'Employee ID is required' })}
                  type="text"
                  className={`input-field ${errors.employeeId ? 'border-error-300' : ''}`}
                  placeholder="Enter employee ID"
                />
                {errors.employeeId && (
                  <p className="mt-1 text-sm text-error-600">{errors.employeeId.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="input-field"
                placeholder="Enter phone number (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
                type="password"
                className={`input-field ${errors.password ? 'border-error-300' : ''}`}
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
              )}
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
                loading={createUser.isLoading}
              >
                Create User
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateUserModal;