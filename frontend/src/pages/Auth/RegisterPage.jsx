import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  UserPlus,
  GraduationCap,
  Briefcase,
  Phone
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/UI/Button';
import { validators, getValidationMessage } from '../../utils/validation';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  
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

  const onSubmit = async (data) => {
    const result = await registerUser(data);
    
    if (result.success) {
      toast.success('Registration successful! Welcome aboard!');
      
      // Redirect based on role
      const dashboardRoutes = {
        student: '/dashboard',
        faculty: '/faculty/dashboard',
        admin: '/admin/dashboard'
      };
      
      navigate(dashboardRoutes[result.user.role] || '/dashboard');
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  const roleOptions = [
    { value: 'student', label: 'Student', icon: GraduationCap, color: 'text-primary-600' },
    { value: 'faculty', label: 'Faculty', icon: Briefcase, color: 'text-secondary-600' }
  ];

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center"
          >
            <UserPlus className="h-6 w-6 text-white" />
          </motion.div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the attendance management system
          </p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am registering as
            </label>
            <div className="grid grid-cols-2 gap-3">
              {roleOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <label key={option.value} className="relative cursor-pointer">
                    <input
                      {...register('role', { required: getValidationMessage.required })}
                      type="radio"
                      value={option.value}
                      className="sr-only"
                    />
                    <div className={`
                      border-2 rounded-lg p-4 text-center transition-all duration-200
                      ${watchRole === option.value 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}>
                      <Icon className={`h-6 w-6 mx-auto mb-2 ${
                        watchRole === option.value ? option.color : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
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

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('name', {
                    required: getValidationMessage.required,
                    validate: (value) => validators.name(value) || getValidationMessage.name
                  })}
                  type="text"
                  className={`input-field pl-10 ${errors.name ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: getValidationMessage.required,
                    validate: (value) => validators.email(value) || getValidationMessage.email
                  })}
                  type="email"
                  autoComplete="email"
                  className={`input-field pl-10 ${errors.email ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('department', {
                    required: getValidationMessage.required,
                    minLength: { value: 2, message: getValidationMessage.minLength(2) }
                  })}
                  type="text"
                  className={`input-field pl-10 ${errors.department ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="Enter your department"
                />
              </div>
              {errors.department && (
                <p className="mt-1 text-sm text-error-600">{errors.department.message}</p>
              )}
            </div>

            {/* Role-specific fields */}
            {watchRole === 'student' && (
              <div>
                <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700 mb-2">
                  Roll Number
                </label>
                <input
                  {...register('rollNo', {
                    required: getValidationMessage.required,
                    validate: (value) => validators.rollNumber(value) || getValidationMessage.rollNumber
                  })}
                  type="text"
                  className={`input-field ${errors.rollNo ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="Enter your roll number"
                />
                {errors.rollNo && (
                  <p className="mt-1 text-sm text-error-600">{errors.rollNo.message}</p>
                )}
              </div>
            )}

            {watchRole === 'faculty' && (
              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <input
                  {...register('employeeId', {
                    required: getValidationMessage.required,
                    validate: (value) => validators.employeeId(value) || getValidationMessage.employeeId
                  })}
                  type="text"
                  className={`input-field ${errors.employeeId ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="Enter your employee ID"
                />
                {errors.employeeId && (
                  <p className="mt-1 text-sm text-error-600">{errors.employeeId.message}</p>
                )}
              </div>
            )}

            {/* Phone (Optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-gray-500">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phone', {
                    validate: (value) => !value || validators.phone(value) || getValidationMessage.phone
                  })}
                  type="tel"
                  className={`input-field pl-10 ${errors.phone ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-error-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: getValidationMessage.required,
                    validate: (value) => validators.password(value) || getValidationMessage.password
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
              )}
              <div className="mt-1 text-xs text-gray-500">
                Password must contain at least 8 characters with uppercase, lowercase, number, and special character
              </div>
            </div>
          </div>

          {/* Terms and conditions */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register('agreeToTerms', {
                  required: 'You must agree to the terms and conditions'
                })}
                id="agree-terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agree-terms" className="text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500 font-medium">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-500 font-medium">
                  Privacy Policy
                </Link>
              </label>
              {errors.agreeToTerms && (
                <p className="mt-1 text-sm text-error-600">{errors.agreeToTerms.message}</p>
              )}
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            loading={isLoading}
            className="w-full"
            size="large"
          >
            Create Account
          </Button>

          {/* Login link */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in here
              </Link>
            </span>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default RegisterPage;