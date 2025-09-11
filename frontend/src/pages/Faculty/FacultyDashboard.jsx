import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  Users, 
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { coursesAPI } from '../../api/courses';
import { sessionsAPI } from '../../api/sessions';
import { attendanceAPI } from '../../api/attendance';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';

const FacultyDashboard = () => {
  const { user } = useAuth();

  // Fetch faculty data
  const { data: coursesData, isLoading: coursesLoading } = useQuery(
    'faculty-courses',
    () => coursesAPI.getCourses({ facultyId: user.id })
  );

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery(
    'faculty-sessions',
    () => sessionsAPI.getSessions({ limit: 20 }),
    {
      onError: (error) => {
        console.error('Failed to fetch sessions:', error);
      }
    }
  );

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    'faculty-analytics',
    () => attendanceAPI.getAttendanceAnalytics(),
    {
      onError: (error) => {
        console.error('Failed to fetch analytics:', error);
      }
    }
  );

  const courses = coursesData?.data?.data?.courses || [];
  const sessions = sessionsData?.data?.data?.sessions || [];
  const analytics = analyticsData?.data?.data?.overall || {};

  // Filter sessions by time
  const todaySessions = sessions.filter(session => isToday(new Date(session.startAt)));
  const upcomingSessions = sessions.filter(session => {
    const sessionDate = new Date(session.startAt);
    return sessionDate > new Date() && isThisWeek(sessionDate);
  });
  const activeSessions = sessions.filter(session => session.status === 'ACTIVE');

  // Calculate metrics
  const totalCourses = courses.length;
  const totalStudents = courses.reduce((total, course) => total + course.enrollmentCount, 0);
  const attendanceRate = analytics.totalAttendance > 0 
    ? Math.round((analytics.presentCount / analytics.totalAttendance) * 100) 
    : 0;

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

  if (coursesLoading || sessionsLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-center items-center sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            {activeSessions.length > 0 
              ? `${activeSessions.length} session${activeSessions.length > 1 ? 's' : ''} currently active`
              : todaySessions.length > 0
                ? `${todaySessions.length} session${todaySessions.length > 1 ? 's' : ''} scheduled today`
                : 'No sessions scheduled for today'
            }
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link to="/faculty/courses">
            <Button variant="outline">
              <Plus size={16} className="mr-2" />
              New Course
            </Button>
          </Link>
          <Link to="/faculty/sessions">
            <Button>
              <Calendar size={16} className="mr-2" />
              New Session
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <p className="text-sm font-medium text-gray-600">My Courses</p>
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
              <Users className="h-8 w-8 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
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
              <Clock className="h-8 w-8 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{activeSessions.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card card-padding"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className={`h-8 w-8 ${
                attendanceRate >= 75 ? 'text-success-600' : 'text-warning-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Active Sessions Alert */}
      {activeSessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-success-50 border border-success-200 rounded-lg p-4"
        >
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-success-800">Active Sessions</h3>
              <div className="mt-2 space-y-1">
                {activeSessions.map(session => (
                  <div key={session._id} className="flex items-center justify-between">
                    <span className="text-sm text-success-700">
                      {session.title} - {session.courseId?.code}
                    </span>
                    <Link
                      to={`/faculty/sessions/${session._id}`}
                      className="text-sm text-success-600 hover:text-success-800 font-medium"
                    >
                      Manage →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card card-padding"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Sessions</h3>
            <Link 
              to="/faculty/sessions" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          
          <div className="space-y-3">
            {todaySessions.length > 0 ? (
              todaySessions.map((session) => (
                <Link
                  key={session._id}
                  to={`/faculty/sessions/${session._id}`}
                  className="block"
                >
                  <div className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        session.status === 'ACTIVE' ? 'bg-success-100' :
                        session.status === 'SCHEDULED' ? 'bg-primary-100' :
                        'bg-gray-100'
                      }`}>
                        {session.status === 'ACTIVE' ? (
                          <CheckCircle className="w-5 h-5 text-success-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-primary-600" />
                        )}
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{session.title}</p>
                      <p className="text-xs text-gray-500">{session.courseId?.code}</p>
                      <p className="text-xs text-gray-600">
                        {formatSessionTime(session.startAt, session.endAt)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`status-badge ${
                        session.status === 'ACTIVE' ? 'success' : 
                        session.status === 'SCHEDULED' ? 'info' : 'gray'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No sessions scheduled for today</p>
                <Link to="/faculty/sessions">
                  <Button variant="outline" className="mt-3" size="small">
                    Schedule Session
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* My Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card card-padding"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
            <Link 
              to="/faculty/courses" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Manage
            </Link>
          </div>
          
          <div className="space-y-3">
            {courses.length > 0 ? (
              courses.slice(0, 5).map((course) => (
                <div key={course._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{course.code}</p>
                      <p className="text-xs text-gray-500">{course.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{course.enrollmentCount}</p>
                    <p className="text-xs text-gray-500">students</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No courses assigned</p>
                <Link to="/faculty/courses">
                  <Button variant="outline" className="mt-3" size="small">
                    Create Course
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card card-padding"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/faculty/sessions" className="block">
            <div className="p-4 text-center rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group">
              <Plus className="w-8 h-8 text-gray-600 group-hover:text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 group-hover:text-primary-900">
                Create Session
              </p>
            </div>
          </Link>
          
          <Link to="/faculty/courses" className="block">
            <div className="p-4 text-center rounded-lg border border-gray-200 hover:border-secondary-300 hover:bg-secondary-50 transition-colors group">
              <BookOpen className="w-8 h-8 text-gray-600 group-hover:text-secondary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 group-hover:text-secondary-900">
                Manage Courses
              </p>
            </div>
          </Link>
          
          <Link to="/faculty/analytics" className="block">
            <div className="p-4 text-center rounded-lg border border-gray-200 hover:border-accent-300 hover:bg-accent-50 transition-colors group">
              <TrendingUp className="w-8 h-8 text-gray-600 group-hover:text-accent-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 group-hover:text-accent-900">
                View Analytics
              </p>
            </div>
          </Link>
          
          <div className="p-4 text-center rounded-lg border border-gray-200 hover:border-warning-300 hover:bg-warning-50 transition-colors group cursor-pointer">
            <AlertTriangle className="w-8 h-8 text-gray-600 group-hover:text-warning-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 group-hover:text-warning-900">
              Flagged Attendance
            </p>
          </div>
        </div>
      </motion.div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="card card-padding"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming This Week ({upcomingSessions.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingSessions.slice(0, 4).map((session) => (
              <Link
                key={session._id}
                to={`/faculty/sessions/${session._id}`}
                className="block p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{session.title}</h4>
                  <span className="text-xs text-gray-500">{session.courseId?.code}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{getSessionDateLabel(session.startAt)} • {formatSessionTime(session.startAt, session.endAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FacultyDashboard;