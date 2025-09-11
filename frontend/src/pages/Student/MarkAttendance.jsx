import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Camera, 
  Upload,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useQuery, useMutation } from 'react-query';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { sessionsAPI } from '../../api/sessions';
import { attendanceAPI } from '../../api/attendance';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import QRScanner from '../../components/Attendance/QRScanner';
import FaceCapture from '../../components/Attendance/FaceCapture';
import ImageUpload from '../../components/Attendance/ImageUpload';
import toast from 'react-hot-toast';

const MarkAttendance = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [activeMethod, setActiveMethod] = useState('qr');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  // Fetch active sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery(
    'active-sessions',
    () => sessionsAPI.getSessions({ status: 'ACTIVE', limit: 20 }),
    {
      onError: (error) => {
        console.error('Failed to fetch sessions:', error);
      }
    }
  );

  const activeSessions = sessionsData?.data?.data?.sessions || [];

  // Attendance marking mutations
  const markQRAttendance = useMutation(attendanceAPI.markAttendanceQR, {
    onSuccess: (data) => {
      toast.success('Attendance marked successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  });

  const markFaceAttendance = useMutation(attendanceAPI.markAttendanceFace, {
    onSuccess: (data) => {
      if (data.data.attendance.flagged) {
        toast.warning('Attendance marked but flagged for review');
      } else {
        toast.success('Attendance marked successfully!');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          setLocationError('Location access denied. Some sessions may require location.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleQRScan = async (qrData) => {
    try {
      const data = JSON.parse(qrData);
      
      await markQRAttendance.mutateAsync({
        sessionId: data.sessionId,
        qrToken: data.token,
        geoLocation: location
      });
    } catch (error) {
      toast.error('Invalid QR code');
    }
  };

  const handleFaceCapture = async (imageFile, sessionId) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('sessionId', sessionId);

    await markFaceAttendance.mutateAsync(formData);
  };

  const handleImageUpload = async (imageFile, sessionId) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('sessionId', sessionId);

    await markFaceAttendance.mutateAsync(formData);
  };

  const attendanceMethods = [
    {
      id: 'qr',
      name: 'QR Code',
      icon: QrCode,
      description: 'Scan QR code displayed by faculty',
      color: 'primary'
    },
    {
      id: 'face',
      name: 'Face Recognition',
      icon: Camera,
      description: 'Use facial recognition for contactless attendance',
      color: 'secondary'
    },
    {
      id: 'upload',
      name: 'Upload Photo',
      icon: Upload,
      description: 'Upload your photo for verification',
      color: 'accent'
    }
  ];

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-600 mt-2">
          Choose your preferred method to mark attendance
        </p>
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-center space-x-2 text-sm">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-success-600" />
            <span className="text-success-600">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-error-600" />
            <span className="text-error-600">Offline</span>
          </>
        )}
      </div>

      {/* Location Status */}
      {locationError && (
        <div className="flex items-center justify-center p-3 bg-warning-50 rounded-lg">
          <MapPin className="w-5 h-5 text-warning-600 mr-2" />
          <span className="text-sm text-warning-700">{locationError}</span>
        </div>
      )}

      {/* Active Sessions Alert */}
      {activeSessions.length === 0 && (
        <div className="card card-padding text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Sessions</h3>
          <p className="text-gray-600">
            There are no active attendance sessions at the moment. 
            Please wait for your instructor to start a session.
          </p>
        </div>
      )}

      {activeSessions.length > 0 && (
        <>
          {/* Method Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {attendanceMethods.map((method) => {
              const Icon = method.icon;
              const isActive = activeMethod === method.id;
              
              return (
                <motion.button
                  key={method.id}
                  onClick={() => setActiveMethod(method.id)}
                  className={`
                    p-6 rounded-xl border-2 transition-all duration-200 text-left
                    ${isActive 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`
                    w-8 h-8 mb-3
                    ${isActive ? 'text-primary-600' : 'text-gray-600'}
                  `} />
                  <h3 className="font-semibold text-gray-900 mb-1">{method.name}</h3>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </motion.button>
              );
            })}
          </div>

          {/* Attendance Interface */}
          <div className="card card-padding">
            {activeMethod === 'qr' && (
              <QRScanner 
                onScan={handleQRScan}
                loading={markQRAttendance.isLoading}
              />
            )}

            {activeMethod === 'face' && (
              <FaceCapture 
                sessions={activeSessions}
                onCapture={handleFaceCapture}
                loading={markFaceAttendance.isLoading}
              />
            )}

            {activeMethod === 'upload' && (
              <ImageUpload 
                sessions={activeSessions}
                onUpload={handleImageUpload}
                loading={markFaceAttendance.isLoading}
              />
            )}
          </div>

          {/* Active Sessions List */}
          <div className="card card-padding">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Active Sessions ({activeSessions.length})
            </h3>
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session._id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{session.title}</h4>
                    <p className="text-sm text-gray-600">
                      {session.courseId?.code} - {session.courseId?.title}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      Started at {new Date(session.startAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="status-badge success">
                      {session.status}
                    </span>
                    {session.mode && (
                      <span className="status-badge info">
                        {session.mode}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MarkAttendance;