import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth.js';
import Layout from './components/Layout/Layout.jsx';
import LoadingSpinner from './components/UI/LoadingSpinner.jsx';

// Auth pages
import LoginPage from './pages/Auth/LoginPage.jsx';
import RegisterPage from './pages/Auth/RegisterPage.jsx';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage.jsx';

// Student pages
import StudentDashboard from './pages/Student/StudentDashboard.jsx';
import MarkAttendance from './pages/Student/MarkAttendance.jsx';
import AttendanceHistory from './pages/Student/AttendanceHistory.jsx';
import EnrolledCourseDetails from './pages/Student/EnrolledCourseDetails.jsx';

// Faculty pages
import FacultyDashboard from './pages/Faculty/FacultyDashboard.jsx';
import ManageCourses from './pages/Faculty/ManageCourses.jsx';
import ManageSessions from './pages/Faculty/ManageSessions.jsx';
import SessionDetails from './pages/Faculty/SessionDetails.jsx';
import FacultyAnalytics from './pages/Faculty/FacultyAnalytics.jsx';

// Admin pages
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import ManageUsers from './pages/Admin/ManageUsers.jsx';
import SystemAnalytics from './pages/Admin/SystemAnalytics.jsx';
import AdminSystem from './pages/Admin/AdminSystem.jsx';

// Shared pages
import ProfilePage from './pages/Shared/ProfilePage.jsx';
import SettingsPage from './pages/Shared/SettingsPage.jsx';
import NotFoundPage from './pages/Shared/NotFoundPage.jsx';

// Route guards
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (user) {
    const dashboardRoutes = {
      student: '/dashboard',
      faculty: '/faculty/dashboard',
      admin: '/admin/dashboard'
    };
    return <Navigate to={dashboardRoutes[user.role]} replace />;
  }
  
  return children;
};

function App() {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        } />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        
        {/* Protected routes with layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Student routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/mark-attendance" element={
            <ProtectedRoute roles={['student']}>
              <MarkAttendance />
            </ProtectedRoute>
          } />
          <Route path="/attendance-history" element={
            <ProtectedRoute roles={['student']}>
              <AttendanceHistory />
            </ProtectedRoute>
          } />
          <Route path="/courses/:courseId" element={
            <ProtectedRoute roles={['student']}>
              <EnrolledCourseDetails />
            </ProtectedRoute>
          } />
          
          {/* Faculty routes */}
          <Route path="/faculty/dashboard" element={
            <ProtectedRoute roles={['faculty']}>
              <FacultyDashboard />
            </ProtectedRoute>
          } />
          <Route path="/faculty/courses" element={
            <ProtectedRoute roles={['faculty']}>
              <ManageCourses />
            </ProtectedRoute>
          } />
          <Route path="/faculty/sessions" element={
            <ProtectedRoute roles={['faculty']}>
              <ManageSessions />
            </ProtectedRoute>
          } />
          <Route path="/faculty/sessions/:sessionId" element={
            <ProtectedRoute roles={['faculty']}>
              <SessionDetails />
            </ProtectedRoute>
          } />
          <Route path="/faculty/analytics" element={
            <ProtectedRoute roles={['faculty']}>
              <FacultyAnalytics />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <ManageUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute roles={['admin']}>
              <SystemAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/system" element={
            <ProtectedRoute roles={['admin']}>
              <AdminSystem />
            </ProtectedRoute>
          } />
          
          {/* Shared routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        
        {/* Catch all routes */}
        <Route path="/unauthorized" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
              <p className="text-lg text-gray-600">Unauthorized access</p>
            </div>
          </div>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;