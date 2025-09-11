import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Camera,
  QrCode,
  Upload,
  Edit,
  Flag,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import Button from '../UI/Button';

const AttendanceList = ({ attendance }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT': return CheckCircle;
      case 'LATE': return AlertTriangle;
      case 'ABSENT': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'text-success-600';
      case 'LATE': return 'text-warning-600';
      case 'ABSENT': return 'text-error-600';
      default: return 'text-gray-600';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'QR': return QrCode;
      case 'FACE': return Camera;
      case 'UPLOAD': return Upload;
      case 'MANUAL': return Edit;
      default: return User;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'QR': return 'bg-blue-100 text-blue-800';
      case 'FACE': return 'bg-purple-100 text-purple-800';
      case 'UPLOAD': return 'bg-green-100 text-green-800';
      case 'MANUAL': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = record.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.studentId?.rollNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || record.status === statusFilter;
    const matchesMethod = !methodFilter || record.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="ABSENT">Absent</option>
            <option value="EXCUSED">Excused</option>
          </select>
          
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Methods</option>
            <option value="QR">QR Code</option>
            <option value="FACE">Face Recognition</option>
            <option value="UPLOAD">Upload</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>
      </div>

      {/* Attendance List */}
      {filteredAttendance.length > 0 ? (
        <div className="space-y-2">
          {filteredAttendance.map((record, index) => {
            const StatusIcon = getStatusIcon(record.status);
            const MethodIcon = getMethodIcon(record.method);
            
            return (
              <motion.div
                key={record._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {/* Profile Image */}
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {record.studentId?.profileImageUrl ? (
                      <img
                        src={record.studentId.profileImageUrl}
                        alt={record.studentId.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  {/* Student Info */}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {record.studentId?.name || 'Unknown Student'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {record.studentId?.rollNo || 'No Roll Number'}
                    </p>
                  </div>
                </div>

                {/* Status and Method */}
                <div className="flex items-center space-x-4">
                  {/* Time */}
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {format(new Date(record.markedAt), 'HH:mm:ss')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(record.markedAt), 'MMM dd')}
                    </p>
                  </div>

                  {/* Method */}
                  <div className="flex items-center space-x-2">
                    <MethodIcon className="w-4 h-4 text-gray-500" />
                    <span className={`text-xs px-2 py-1 rounded-full ${getMethodColor(record.method)}`}>
                      {record.method}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={`w-5 h-5 ${getStatusColor(record.status)}`} />
                    <span className={`status-badge ${
                      record.status === 'PRESENT' ? 'success' :
                      record.status === 'LATE' ? 'warning' :
                      record.status === 'ABSENT' ? 'error' : 'gray'
                    }`}>
                      {record.status}
                    </span>
                  </div>

                  {/* Confidence Score */}
                  {record.confidence && (
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Confidence</p>
                      <p className={`text-sm font-medium ${
                        record.confidence >= 0.8 ? 'text-success-600' :
                        record.confidence >= 0.6 ? 'text-warning-600' : 'text-error-600'
                      }`}>
                        {Math.round(record.confidence * 100)}%
                      </p>
                    </div>
                  )}

                  {/* Flagged Indicator */}
                  {record.flagged && (
                    <Flag className="w-4 h-4 text-warning-600" title={`Flagged: ${record.flagReason}`} />
                  )}

                  {/* Actions */}
                  <div className="flex space-x-1">
                    <button
                      className="p-1 text-gray-400 hover:text-primary-600 rounded transition-colors"
                      title="Edit attendance"
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {searchTerm || statusFilter || methodFilter 
              ? 'No attendance records match your filters'
              : 'No attendance records yet'
            }
          </p>
          {(searchTerm || statusFilter || methodFilter) && (
            <Button
              variant="outline"
              size="small"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setMethodFilter('');
              }}
              className="mt-3"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceList;