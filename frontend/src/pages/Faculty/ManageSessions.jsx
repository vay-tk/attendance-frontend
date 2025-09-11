import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Play, 
  Square, 
  Users,
  Edit,
  Trash2,
  QrCode,
  BarChart3
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { sessionsAPI } from '../../api/sessions';
import { coursesAPI } from '../../api/courses';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import CreateSessionModal from '../../components/Faculty/CreateSessionModal';
import EditSessionModal from '../../components/Faculty/EditSessionModal';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const ManageSessions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch data
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery(
    ['faculty-sessions', searchTerm, selectedCourse, statusFilter],
    () => sessionsAPI.getSessions({ limit: 50 }),
    {
      onError: (error) => {
        console.error('Failed to fetch sessions:', error);
      }
    }
  );

  const { data: coursesData, isLoading: coursesLoading } = useQuery(
    'faculty-courses-for-sessions',
    () => coursesAPI.getCourses({ limit: 100 }),
    {
      onError: (error) => {
        console.error('Failed to fetch courses:', error);
      }
    }
  );

  const sessions = sessionsData?.data?.data?.sessions || [];
  const courses = coursesData?.data?.data?.courses || [];

  // Ensure courses is always an array
  const safeCourses = Array.isArray(courses) ? courses : [];

  // Mutations
  const startSession = useMutation(sessionsAPI.startSession, {
    onSuccess: () => {
      queryClient.invalidateQueries('faculty-sessions');
      toast.success('Session started successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to start session');
    }
  });

  const closeSession = useMutation(sessionsAPI.closeSession, {
    onSuccess: () => {
      queryClient.invalidateQueries('faculty-sessions');
      toast.success('Session closed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to close session');
    }
  });

  const updateSession = useMutation(
    ({ id, data }) => sessionsAPI.updateSession(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('faculty-sessions');
        // Optionally show a success message
      },
      onError: (error) => {
        // Optionally show an error message
      }
    }
  );

  const deleteSession = useMutation(
    (id) => sessionsAPI.deleteSession(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('faculty-sessions');
        // Optionally show a success message
      },
      onError: (error) => {
        // Optionally show an error message
      }
    }
  );

  const handleStartSession = async (sessionId) => {
    await startSession.mutateAsync(sessionId);
  };

  const handleCloseSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to close this session?')) {
      await closeSession.mutateAsync(sessionId);
    }
  };

  const handleUpdateSession = async (id, data) => {
    await updateSession.mutateAsync({ id, data });
  };

  const handleDeleteSession = async (sessionId, sessionTitle) => {
    if (window.confirm(`Are you sure you want to cancel "${sessionTitle}"?`)) {
      await deleteSession.mutateAsync(sessionId);
    }
  };

  const handleEditSession = (session) => {
    console.log('Edit clicked for session:', session);
    setEditingSession(session);
    setShowEditModal(true);
  };

  const handleEditSessionSubmit = async (updatedData) => {
    if (editingSession) {
      await handleUpdateSession(editingSession._id, updatedData);
      setShowEditModal(false);
      setEditingSession(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'SCHEDULED': return 'info';
      case 'CLOSED': return 'gray';
      case 'CANCELLED': return 'error';
      default: return 'gray';
    }
  };

  const getSessionDateLabel = (date, startAt) => {
    const sessionDate = new Date(date);
    const sessionStart = new Date(startAt);
    
    if (isToday(sessionDate)) return 'Today';
    if (isTomorrow(sessionDate)) return 'Tomorrow';
    if (isPast(sessionStart)) return 'Past';
    return format(sessionDate, 'MMM d');
  };

  const formatTime = (startAt, endAt) => {
    const start = format(new Date(startAt), 'h:mm a');
    const end = format(new Date(endAt), 'h:mm a');
    return `${start} - ${end}`;
  };

  if (sessionsLoading || coursesLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Sessions</h1>
          <p className="text-gray-600">Create and manage your class sessions</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0"
          icon={Plus}
        >
          Create Session
        </Button>
      </div>

      {/* Filters */}
      <div className="card card-padding">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <motion.div
              key={session._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card card-padding"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                    <span className={`status-badge ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{session.courseId?.code} - {session.courseId?.title}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        {getSessionDateLabel(session.date, session.startAt)} • {formatTime(session.startAt, session.endAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{session.totalEnrolled} students</span>
                    </div>
                    
                    <div className="flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      <span>{session.mode} mode</span>
                    </div>
                  </div>

                  {session.description && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {session.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {session.status === 'SCHEDULED' && (
                    <>
                      <Button
                        size="small"
                        onClick={() => handleStartSession(session._id)}
                        loading={startSession.isLoading}
                        icon={Play}
                      >
                        Start
                      </Button>
                      <button
                        onClick={() => handleEditSession(session)}
                        className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                    </>
                  )}
                  
                  {session.status === 'ACTIVE' && (
                    <>
                      <Link to={`/faculty/sessions/${session._id}`}>
                        <Button size="small" icon={QrCode}>
                          Manage
                        </Button>
                      </Link>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleCloseSession(session._id)}
                        loading={closeSession.isLoading}
                        icon={Square}
                      >
                        Close
                      </Button>
                    </>
                  )}
                  
                  {session.status === 'CLOSED' && (
                    <Link to={`/faculty/sessions/${session._id}`}>
                      <Button size="small" variant="outline" icon={BarChart3}>
                        View Results
                      </Button>
                    </Link>
                  )}
                  
                  {(session.status === 'SCHEDULED' || session.status === 'CANCELLED') && (
                    <button
                      onClick={() => handleDeleteSession(session._id, session.title)}
                      className="p-2 text-gray-400 hover:text-error-600 rounded-lg hover:bg-error-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Attendance Progress for Active/Closed Sessions */}
              {(session.status === 'ACTIVE' || session.status === 'CLOSED') && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Attendance Progress</span>
                    <span className="font-medium text-gray-900">
                      {session.totalPresent || 0} / {session.totalEnrolled} 
                      ({Math.round(((session.totalPresent || 0) / session.totalEnrolled) * 100) || 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-success-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(((session.totalPresent || 0) / session.totalEnrolled) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCourse || statusFilter 
              ? 'No sessions match your current filters.' 
              : 'Create your first session to get started.'
            }
          </p>
          {!searchTerm && !selectedCourse && !statusFilter && (
            <Button onClick={() => setShowCreateModal(true)} icon={Plus}>
              Create Your First Session
            </Button>
          )}
        </motion.div>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <CreateSessionModal
          courses={safeCourses}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries('faculty-sessions');
          }}
        />
      )}

      {/* Edit Session Modal */}
      {showEditModal && editingSession && (
        <EditSessionModal
          session={editingSession}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSessionSubmit}
        />
      )}
    </div>
  );
};

export default ManageSessions;