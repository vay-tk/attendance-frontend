import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/UI/Button';
import { validators, getValidationMessage } from '../../utils/validation';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/auth'; // ✅ Import authAPI

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { isLoading } = useAuth(); // ✅ removed forgotPassword from here

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // ✅ Now using authAPI instead of axios
  const onSubmit = async (data) => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await authAPI.forgotPassword(data.email);
      setMessage(res.data.message || 'Password reset email sent!');
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
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

  if (emailSent) {
    return (
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-md w-full text-center space-y-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto h-16 w-16 bg-success-100 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="h-8 w-8 text-success-600" />
          </motion.div>
          
          <div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a password reset link to your email address. 
              Please check your inbox and follow the instructions.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            
            <Button
              onClick={() => setEmailSent(false)}
              variant="outline"
              className="w-full"
            >
              Try again
            </Button>
            
            <Link
              to="/login"
              className="flex items-center justify-center text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

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
            <Mail className="h-6 w-6 text-white" />
          </motion.div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
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
                placeholder="Enter your email address"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            loading={isLoading || loading}
            className="w-full"
            size="large"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          {message && <div className="text-green-600 mt-4">{message}</div>}
          {error && <div className="text-red-600 mt-4">{error}</div>}

          <div className="text-center">
            <Link
              to="/login"
              className="flex items-center justify-center text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to sign in
            </Link>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordPage;
