import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Calendar,
  BarChart3,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react';
import { useQuery } from 'react-query';
import { useAuth } from '../../hooks/useAuth';
import { attendanceAPI } from '../../api/attendance';
import { coursesAPI } from '../../api/courses';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import AttendanceChart from '../../components/Charts/AttendanceChart';
import { format, subDays } from 'date-fns';

const FacultyAnalytics = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState(30);
  const [selectedCourse, setSelectedCourse] = useState('');

  // Fetch data
  const { data: coursesData, isLoading: coursesLoading } = useQuery(
    'faculty-courses',
    () => coursesAPI.getCourses({ limit: 50 }),
    {
      onError: (error) => {
        console.error('Failed to fetch courses:', error);
      }
    }
  );

  const { data: analyticsData, isLoading: analyticsLoading, refetch } = useQuery(
    ['faculty-analytics', selectedCourse, dateRange],
    () => attendanceAPI.getAttendanceAnalytics({
      courseId: selectedCourse || undefined,
      dateFrom: subDays(new Date(), dateRange).toISOString(),
      dateTo: new Date().toISOString()
    }),
    {
      onError: (error) => {
        console.error('Failed to fetch analytics:', error);
      }
    }
  );

  const courses = coursesData?.data?.data?.courses || [];
  const analytics = analyticsData?.data?.data || {};

  // Ensure courses is always an array
  const safeCourses = Array.isArray(courses) ? courses : [];

  const exportData = () => {
    const csv = [
      ['Date', 'Present', 'Absent', 'Attendance %'],
      ...(analytics.trends || []).map(trend => [
        trend._id,
        trend.present,
        trend.absent,
        Math.round((trend.present / (trend.present + trend.absent)) * 100)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `faculty-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (coursesLoading || analyticsLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Faculty Analytics</h1>
          <p className="text-gray-600">Analyze attendance patterns and course performance</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            onClick={() => refetch()}
            variant="outline"
            icon={RefreshCw}
          >
            Refresh
          </Button>
          <Button
            onClick={exportData}
            variant="outline"
            icon={Download}
          >
            Export Data
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="card card-padding">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="input-field"
              >
                <option value="">All Courses</option>
                {safeCourses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                className="input-field"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card card-padding"
        >
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overall?.totalAttendance || 0}</p>
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
            <TrendingUp className="h-8 w-8 text-success-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overall?.presentCount || 0}</p>
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
            <Calendar className="h-8 w-8 text-error-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overall?.absentCount || 0}</p>
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
            <BarChart3 className="h-8 w-8 text-warning-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overall?.totalAttendance > 0 
                  ? Math.round((analytics.overall.presentCount / analytics.overall.totalAttendance) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Attendance Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card card-padding"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trends</h3>
        {analytics.trends?.length > 0 ? (
          <AttendanceChart
            data={analytics.trends}
            type="line"
            height={300}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>No attendance data available</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Method Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card card-padding"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance by Method</h3>
        {analytics.byMethod?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.byMethod.map((method, index) => (
              <div key={method._id} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{method.count}</p>
                <p className="text-sm text-gray-600">{method._id}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No method data available
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FacultyAnalytics;