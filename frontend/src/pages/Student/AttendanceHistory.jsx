import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Filter, 
  Download, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  BarChart3
} from 'lucide-react';
import { useQuery } from 'react-query';
import { useAuth } from '../../hooks/useAuth';
import { attendanceAPI } from '../../api/attendance';
import { coursesAPI } from '../../api/courses';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import { format } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const AttendanceHistory = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'chart'

  // Fetch data
  const { data: coursesData, isLoading: coursesLoading } = useQuery(
    'student-courses',
    () => coursesAPI.getCourses({ limit: 50 }),
    {
      onError: (error) => {
        console.error('Failed to fetch courses:', error);
      }
    }
  );

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery(
    ['student-attendance', selectedCourse, user?._id],
    () => attendanceAPI.getStudentAttendance(user?._id, {
      courseId: selectedCourse || undefined,
      limit: 100 
    }),
    {
      enabled: !!user?._id && user._id !== 'undefined',
      onError: (error) => {
        console.error('Failed to fetch attendance:', error);
      }
    }
  );

  const courses = coursesData?.data?.data?.courses || [];
  const attendanceRecords = attendanceData?.data?.data?.attendance || [];
  const attendanceStats = attendanceData?.data?.data?.stats || {};

  const filteredRecords = attendanceRecords.filter(record =>
    record.sessionId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':
      case 'LATE':
        return CheckCircle;
      case 'ABSENT':
        return XCircle;
      case 'EXCUSED':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'text-success-600 bg-success-100';
      case 'LATE':
        return 'text-warning-600 bg-warning-100';
      case 'ABSENT':
        return 'text-error-600 bg-error-100';
      case 'EXCUSED':
        return 'text-primary-600 bg-primary-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMethodBadgeColor = (method) => {
    switch (method) {
      case 'QR':
        return 'bg-blue-100 text-blue-800';
      case 'FACE':
        return 'bg-purple-100 text-purple-800';
      case 'MANUAL':
        return 'bg-gray-100 text-gray-800';
      case 'UPLOAD':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate chart data
  const chartData = React.useMemo(() => {
    const groupedByMonth = {};
    
    attendanceRecords.forEach(record => {
      const month = format(new Date(record.markedAt), 'MMM yyyy');
      if (!groupedByMonth[month]) {
        groupedByMonth[month] = { month, present: 0, absent: 0, total: 0 };
      }
      groupedByMonth[month].total++;
      if (record.status === 'PRESENT' || record.status === 'LATE') {
        groupedByMonth[month].present++;
      } else {
        groupedByMonth[month].absent++;
      }
    });

    return Object.values(groupedByMonth).map(data => ({
      ...data,
      percentage: Math.round((data.present / data.total) * 100) || 0
    })).sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [attendanceRecords]);

  if (coursesLoading || attendanceLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
          <p className="text-gray-600">Track your attendance across all courses</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('list')}
            size="small"
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'chart' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('chart')}
            size="small"
          >
            <BarChart3 size={16} className="mr-1" />
            Chart View
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card card-padding"
        >
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-success-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.presentCount || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card card-padding"
        >
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-error-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.absentCount || 0}</p>
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
            <AlertCircle className="h-8 w-8 text-warning-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Late</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.lateCount || 0}</p>
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
            <Calendar className="h-8 w-8 text-primary-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.attendancePercentage || 0}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="card card-padding">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="input-field"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
            <Button variant="outline" size="small">
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'chart' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card card-padding"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trends</h3>
          {chartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Attendance %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No attendance data to display</p>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card card-padding"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Attendance Records ({filteredRecords.length})
          </h3>
          
          {filteredRecords.length > 0 ? (
            <div className="space-y-3">
              {filteredRecords.map((record) => {
                const StatusIcon = getStatusIcon(record.status);
                
                return (
                  <div key={record._id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 mr-4">
                      <StatusIcon className={`w-6 h-6 ${
                        record.status === 'PRESENT' ? 'text-success-600' :
                        record.status === 'LATE' ? 'text-warning-600' :
                        record.status === 'ABSENT' ? 'text-error-600' : 'text-gray-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          {record.sessionId?.title || 'Session'}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className={`status-badge ${getStatusColor(record.status).replace('text-', '').replace('bg-', '')}`}>
                            {record.status}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getMethodBadgeColor(record.method)}`}>
                            {record.method}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {record.courseId?.code} - {record.courseId?.title}
                      </p>
                      
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(record.markedAt), 'PPp')}
                        {record.confidence && (
                          <span className="ml-4">
                            Confidence: {Math.round(record.confidence * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No attendance records found</p>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                  className="mt-3"
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AttendanceHistory;