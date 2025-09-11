import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Play,
  Square,
  RefreshCw,
  Users,
  Clock,
  Calendar,
  MapPin,
  Download,
  Edit,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSocket } from '../../hooks/useSocket';
import { sessionsAPI } from '../../api/sessions';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import QRDisplay from '../../components/Faculty/QRDisplay';
import AttendanceList from '../../components/Faculty/AttendanceList';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const SessionDetails = () => {
  const { sessionId } = useParams();
  const { socket, joinSession, leaveSession } = useSocket();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('qr');

  // Fetch session details
  const { data: sessionData, isLoading } = useQuery(
    ['session-details', sessionId],
    () => sessionsAPI.getSessionById(sessionId),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      onError: (error) => {
        console.error('Failed to fetch session:', error);
      }
    }
  );

  // Fetch attendance data
  const { data: attendanceData } = useQuery(
    ['session-attendance', sessionId],
    () => sessionsAPI.getSessionAttendance(sessionId),
    {
      refetchInterval: 10000, // Refresh every 10 seconds for active sessions
      onError: (error) => {
        console.error('Failed to fetch attendance:', error);
      }
    }
  );

  const session = sessionData?.data?.data?.session;
  const attendance = attendanceData?.data?.data?.attendance || [];
  const attendanceStats = attendanceData?.data?.data?.stats || {};

  // Mutations
  const startSession = useMutation(sessionsAPI.startSession, {
    onSuccess: () => {
      queryClient.invalidateQueries(['session-details', sessionId]);
      toast.success('Session started successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to start session');
    }
  });

  const closeSession = useMutation(sessionsAPI.closeSession, {
    onSuccess: () => {
      queryClient.invalidateQueries(['session-details', sessionId]);
      toast.success('Session closed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to close session');
    }
  });

  const refreshQR = useMutation(sessionsAPI.refreshQRToken, {
    onSuccess: () => {
      queryClient.invalidateQueries(['session-details', sessionId]);
      toast.success('QR code refreshed');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to refresh QR code');
    }
  });

  // Socket connection for real-time updates
  useEffect(() => {
    if (sessionId && socket) {
      joinSession(sessionId);
      
      // Listen for attendance updates
      socket.on('attendanceMarked', (data) => {
        queryClient.invalidateQueries(['session-attendance', sessionId]);
        toast.success(`${data.studentName} marked attendance (${data.status})`);
      });

      return () => {
        leaveSession(sessionId);
        socket.off('attendanceMarked');
      };
    }
  }, [sessionId, socket, joinSession, leaveSession, queryClient]);

  const handleStartSession = async () => {
    await startSession.mutateAsync(sessionId);
  };

  const handleCloseSession = async () => {
    if (window.confirm('Are you sure you want to close this session?')) {
      await closeSession.mutateAsync(sessionId);
    }
  };

  const handleRefreshQR = async () => {
    await refreshQR.mutateAsync(sessionId);
  };

  const exportAttendance = () => {
    if (!attendance.length) return;
    
    const csv = [
      ['Name', 'Roll No', 'Status', 'Method', 'Time', 'Confidence'].join(','),
      ...attendance.map(record => [
        record.studentId?.name || 'N/A',
        record.studentId?.rollNo || 'N/A',
        record.status,
        record.method,
        format(new Date(record.markedAt), 'MMM dd, yyyy HH:mm:ss'),
        record.confidence ? Math.round(record.confidence * 100) + '%' : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${session?.title}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Attendance exported successfully');
  };

  const tabs = [
    { id: 'qr', label: 'QR Display', icon: RefreshCw },
    { id: 'attendance', label: 'Live Attendance', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Session not found</h3>
        <Link to="/faculty/sessions" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Back to sessions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/faculty/sessions"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {format(new Date(session.date), 'MMM dd, yyyy')}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {format(new Date(session.startAt), 'h:mm a')} - {format(new Date(session.endAt), 'h:mm a')}
              </span>
              {session.location && (
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {session.location}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`status-badge ${
            session.status === 'ACTIVE' ? 'success' : 
            session.status === 'SCHEDULED' ? 'info' : 'gray'
          }`}>
            {session.status}
          </span>

          {session.status === 'SCHEDULED' && (
            <Button
              onClick={handleStartSession}
              loading={startSession.isLoading}
              icon={Play}
            >
              Start Session
            </Button>
          )}

          {session.status === 'ACTIVE' && (
            <Button
              onClick={handleCloseSession}
              loading={closeSession.isLoading}
              variant="outline"
              icon={Square}
            >
              Close Session
            </Button>
          )}
        </div>
      </div>

      {/* Course Information */}
      <div className="card card-padding">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {session.courseId?.code} - {session.courseId?.title}
            </h3>
            <p className="text-gray-600">{session.courseId?.department}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{session.totalEnrolled}</p>
            <p className="text-sm text-gray-600">enrolled students</p>
          </div>
        </div>

        {session.description && (
          <p className="mt-3 text-gray-700">{session.description}</p>
        )}
      </div>

      {/* Attendance Summary */}
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
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.PRESENT || 0}</p>
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
            <AlertTriangle className="h-8 w-8 text-warning-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Late</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.LATE || 0}</p>
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
            <XCircle className="h-8 w-8 text-error-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.ABSENT || 0}</p>
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
            <BarChart3 className="h-8 w-8 text-primary-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.attendancePercentage || 0}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'qr' && (
            <QRDisplay
              session={session}
              onRefresh={handleRefreshQR}
              refreshLoading={refreshQR.isLoading}
            />
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Live Attendance ({attendance.length})
                </h3>
                <Button
                  onClick={exportAttendance}
                  variant="outline"
                  size="small"
                  icon={Download}
                  disabled={!attendance.length}
                >
                  Export CSV
                </Button>
              </div>
              <AttendanceList attendance={attendance} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Attendance by Method */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Attendance by Method</h4>
                  {['QR', 'FACE', 'MANUAL', 'UPLOAD'].map(method => {
                    const count = attendance.filter(a => a.method === method).length;
                    const percentage = attendance.length > 0 ? (count / attendance.length) * 100 : 0;
                    
                    return (
                      <div key={method} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{method}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Flagged Attendance */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Quality Control</h4>
                  <div className="text-sm text-gray-600">
                    <p>Flagged for review: {attendance.filter(a => a.flagged).length}</p>
                    <p>Low confidence: {attendance.filter(a => a.confidence && a.confidence < 0.7).length}</p>
                    <p>Average confidence: {
                      attendance.filter(a => a.confidence).length > 0
                        ? Math.round((attendance.filter(a => a.confidence).reduce((sum, a) => sum + a.confidence, 0) / attendance.filter(a => a.confidence).length) * 100)
                        : 'N/A'
                    }%</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Attendance Timeline</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {attendance
                    .sort((a, b) => new Date(b.markedAt) - new Date(a.markedAt))
                    .map((record, index) => (
                      <div key={record._id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {format(new Date(record.markedAt), 'HH:mm:ss')}
                        </span>
                        <span className="font-medium">{record.studentId?.name}</span>
                        <span className={`status-badge ${
                          record.status === 'PRESENT' ? 'success' :
                          record.status === 'LATE' ? 'warning' :
                          record.status === 'ABSENT' ? 'error' : 'gray'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;