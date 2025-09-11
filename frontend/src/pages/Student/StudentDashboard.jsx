import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  TrendingUp, 
  QrCode,
  Camera,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useQuery } from 'react-query';
import { useAuth } from '../../hooks/useAuth';
import { coursesAPI } from '../../api/courses';
import { sessionsAPI } from '../../api/sessions';
import { attendanceAPI } from '../../api/attendance';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import { Link } from 'react-router-dom';
import { format, isToday, isTomorrow } from 'date-fns';

const StudentDashboard = () => {
  const { user } = useAuth();

  // Fetch student data
  const { data: coursesData, isLoading: coursesLoading } = useQuery(
    'student-courses',
    () => coursesAPI.getCourses({ limit: 50 }),
    {
      onError: (error) => {
        console.error('Failed to fetch courses:', error);
      }
    }
  );

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery(
    'upcoming-sessions',
    () => sessionsAPI.getSessions({ upcoming: true, limit: 10 }),
    {
      onError: (error) => {
        console.error('Failed to fetch sessions:', error);
      }
    }
  );

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery(
    'student-attendance',
    () => attendanceAPI.getStudentAttendance(user.id, { limit: 100 }),
    {
      enabled: !!user?.id,
      onError: (error) => {
        console.error('Failed to fetch attendance:', error);
      }
    }
  );

  const courses = coursesData?.data?.data?.courses || [];
  const upcomingSessions = sessionsData?.data?.data?.sessions || [];
  const attendanceRecords = attendanceData?.data?.data?.attendance || [];
  const attendanceStats = attendanceData?.data?.data?.stats || {};

  // Calculate dashboard metrics
  const totalCourses = courses.length;
  const todaySessions = upcomingSessions.filter(session => 
    isToday(new Date(session.startAt))
  );
  const overallAttendancePercentage = attendanceStats.attendancePercentage || 0;

  const formatSessionTime = (startAt, endAt) => {
    const start = format(new Date(startAt), 'h:mm a');
    const end = format(new Date(endAt), 'h:mm a');
    return `${start} - ${end}`;
  };

  const getSessionDateLabel = (date) => {
    const sessionDate = new Date(date);
    if (isToday(sessionDate)) return 'Today';
    if (isTomorrow(sessionDate)) return 'Tomorrow';
    return format(sessionDate, 'MMM d');
  };

  const getAttendanceStatusColor = (percentage) => {
    if (percentage >= 85) return 'text-success-600 bg-success-100';
    if (percentage >= 75) return 'text-warning-600 bg-warning-100';
    return 'text-error-600 bg-error-100';
  };

  const getAttendanceStatusIcon = (percentage) => {
    if (percentage >= 85) return CheckCircle;
    if (percentage >= 75) return AlertCircle;
    return XCircle;
  };

  if (coursesLoading || sessionsLoading || attendanceLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            {todaySessions.length > 0 
              ? `You have ${todaySessions.length} session${todaySessions.length > 1 ? 's' : ''} today`
              : 'No sessions scheduled for today'
            }
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/mark-attendance">
            <Button className="w-full sm:w-auto">
              <QrCode size={16} className="mr-2" />
              Mark Attendance
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card card-padding"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
              <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
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
              <Calendar className="h-8 w-8 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{todaySessions.length}</p>
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
              <TrendingUp className={`h-8 w-8 ${
                overallAttendancePercentage >= 75 ? 'text-success-600' : 'text-error-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overall Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{overallAttendancePercentage}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card card-padding"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h3>
            <Link to="/sessions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </Link>
          </div>
          
          <div className="space-y-3">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.slice(0, 5).map((session) => (
                <div key={session._id} className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{session.title}</p>
                    <p className="text-xs text-gray-500">{session.courseId?.code} - {session.courseId?.title}</p>
                    <p className="text-xs text-gray-600">
                      {getSessionDateLabel(session.startAt)} • {formatSessionTime(session.startAt, session.endAt)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`status-badge ${
                      session.status === 'ACTIVE' ? 'success' : 'gray'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming sessions</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Course Attendance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card card-padding"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Course Attendance</h3>
            <Link to="/attendance-history" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View details
            </Link>
          </div>
          
          <div className="space-y-3">
            {courses.length > 0 ? (
              courses.slice(0, 5).map((course) => {
                // Mock attendance percentage for demonstration
                const attendancePercentage = Math.floor(Math.random() * 40) + 60;
                const StatusIcon = getAttendanceStatusIcon(attendancePercentage);
                
                return (
                  <div key={course._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <StatusIcon className={`w-5 h-5 ${
                          attendancePercentage >= 85 ? 'text-success-600' : 
                          attendancePercentage >= 75 ? 'text-warning-600' : 'text-error-600'
                        }`} />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{course.code}</p>
                        <p className="text-xs text-gray-500">{course.title}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className={`text-sm font-semibold px-2 py-1 rounded ${getAttendanceStatusColor(attendancePercentage)}`}>
                        {attendancePercentage}%
                      </span>
                      <Link to={`/courses/${course._id}`} className="text-xs text-primary-600 hover:underline mt-1">View</Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No courses enrolled</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card card-padding"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/mark-attendance" className="block">
            <div className="p-4 text-center rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group">
              <QrCode className="w-8 h-8 text-gray-600 group-hover:text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 group-hover:text-primary-900">QR Attendance</p>
            </div>
          </Link>
          
          <Link to="/mark-attendance?mode=face" className="block">
            <div className="p-4 text-center rounded-lg border border-gray-200 hover:border-secondary-300 hover:bg-secondary-50 transition-colors group">
              <Camera className="w-8 h-8 text-gray-600 group-hover:text-secondary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 group-hover:text-secondary-900">Face Recognition</p>
            </div>
          </Link>
          
          <Link to="/attendance-history" className="block">
            <div className="p-4 text-center rounded-lg border border-gray-200 hover:border-accent-300 hover:bg-accent-50 transition-colors group">
              <TrendingUp className="w-8 h-8 text-gray-600 group-hover:text-accent-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 group-hover:text-accent-900">View History</p>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;