import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Button from '../../components/UI/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto"
      >
        {/* Large 404 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="mb-8"
        >
          <h1 className="text-9xl font-bold text-primary-200 select-none">
            404
          </h1>
        </motion.div>

        {/* Error message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered the wrong URL.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button icon={Home} className="w-full sm:w-auto">
                Go Home
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              icon={ArrowLeft}
              className="w-full sm:w-auto"
            >
              Go Back
            </Button>
          </div>

          {/* Search suggestion */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center text-sm text-gray-600 mb-2">
              <Search className="w-4 h-4 mr-2" />
              <span>Looking for something specific?</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
                Dashboard
              </Link>
              <Link to="/mark-attendance" className="text-primary-600 hover:text-primary-700">
                Mark Attendance
              </Link>
              <Link to="/profile" className="text-primary-600 hover:text-primary-700">
                Profile
              </Link>
              <Link to="/login" className="text-primary-600 hover:text-primary-700">
                Login
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-xs text-gray-400"
        >
          Error Code: 404 | Page Not Found
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;