import React from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Users, QrCode, Camera } from 'lucide-react';
import { useMutation } from 'react-query';
import { sessionsAPI } from '../../api/sessions';
import Button from '../UI/Button';
import { getValidationMessage } from '../../utils/validation';
import toast from 'react-hot-toast';
import { format, addHours } from 'date-fns';

const CreateSessionModal = ({ courses, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      startAt: format(new Date(), 'HH:mm'),
      endAt: format(addHours(new Date(), 1), 'HH:mm'),
      mode: 'HYBRID'
    }
  });

  const selectedMode = watch('mode');
  const selectedDate = watch('date');
  const selectedStartTime = watch('startAt');

  const createSession = useMutation(sessionsAPI.createSession, {
    onSuccess: () => {
      toast.success('Session created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create session');
    }
  });

  const onSubmit = (data) => {
    // Combine date and time
    const startAt = new Date(`${data.date}T${data.startAt}`);
    const endAt = new Date(`${data.date}T${data.endAt}`);
    
    const sessionData = {
      ...data,
      date: new Date(data.date),
      startAt,
      endAt,
      attendanceSettings: {
        allowLateEntry: data.allowLateEntry || false,
        lateEntryMinutes: parseInt(data.lateEntryMinutes) || 15,
        requireGeofence: data.requireGeofence || false,
        requireFaceMatch: data.mode === 'FACE' || data.mode === 'HYBRID',
        minimumConfidence: parseFloat(data.minimumConfidence) || 0.8
      }
    };

    createSession.mutate(sessionData);
  };

  const modeOptions = [
    {
      value: 'QR',
      label: 'QR Code Only',
      icon: QrCode,
      description: 'Students scan QR code to mark attendance'
    },
    {
      value: 'FACE',
      label: 'Face Recognition Only',
      icon: Camera,
      description: 'Students use facial recognition'
    },
    {
      value: 'HYBRID',
      label: 'QR + Face Recognition',
      icon: Users,
      description: 'Both QR and face recognition available'
    },
    {
      value: 'MANUAL',
      label: 'Manual Only',
      icon: Users,
      description: 'Faculty marks attendance manually'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Create New Session</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Title *
                </label>
                <input
                  {...register('title', {
                    required: getValidationMessage.required,
                    minLength: { value: 1, message: getValidationMessage.minLength(1) },
                    maxLength: { value: 200, message: getValidationMessage.maxLength(200) }
                  })}
                  type="text"
                  placeholder="Enter session title"
                  className={`input-field ${errors.title ? 'border-error-300' : ''}`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <select
                  {...register('courseId', {
                    required: getValidationMessage.required
                  })}
                  className={`input-field ${errors.courseId ? 'border-error-300' : ''}`}
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.code} - {course.title} ({course.enrollmentCount} students)
                    </option>
                  ))}
                </select>
                {errors.courseId && (
                  <p className="mt-1 text-sm text-error-600">{errors.courseId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  {...register('date', {
                    required: getValidationMessage.required
                  })}
                  type="date"
                  className={`input-field ${errors.date ? 'border-error-300' : ''}`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-error-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  {...register('location')}
                  type="text"
                  placeholder="Room/Location (optional)"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  {...register('startAt', {
                    required: getValidationMessage.required
                  })}
                  type="time"
                  className={`input-field ${errors.startAt ? 'border-error-300' : ''}`}
                />
                {errors.startAt && (
                  <p className="mt-1 text-sm text-error-600">{errors.startAt.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  {...register('endAt', {
                    required: getValidationMessage.required,
                    validate: (value) => {
                      if (selectedDate && selectedStartTime && value <= selectedStartTime) {
                        return 'End time must be after start time';
                      }
                      return true;
                    }
                  })}
                  type="time"
                  className={`input-field ${errors.endAt ? 'border-error-300' : ''}`}
                />
                {errors.endAt && (
                  <p className="mt-1 text-sm text-error-600">{errors.endAt.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows="3"
                placeholder="Session description (optional)"
                className="input-field"
              />
            </div>

            {/* Attendance Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Attendance Mode *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label key={option.value} className="relative cursor-pointer">
                      <input
                        {...register('mode', { required: getValidationMessage.required })}
                        type="radio"
                        value={option.value}
                        className="sr-only"
                      />
                      <div className={`
                        border-2 rounded-lg p-4 transition-all duration-200
                        ${selectedMode === option.value 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}>
                        <Icon className={`
                          w-6 h-6 mb-2
                          ${selectedMode === option.value ? 'text-primary-600' : 'text-gray-400'}
                        `} />
                        <h4 className="font-medium text-gray-900 text-sm">{option.label}</h4>
                        <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.mode && (
                <p className="mt-1 text-sm text-error-600">{errors.mode.message}</p>
              )}
            </div>

            {/* Attendance Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Attendance Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    {...register('allowLateEntry')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow late entry</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Late Entry (minutes)
                  </label>
                  <input
                    {...register('lateEntryMinutes', {
                      valueAsNumber: true,
                      min: { value: 0, message: 'Must be 0 or more' },
                      max: { value: 60, message: 'Cannot exceed 60 minutes' }
                    })}
                    type="number"
                    min="0"
                    max="60"
                    defaultValue={15}
                    className="input-field"
                  />
                </div>
              </div>

              {(selectedMode === 'FACE' || selectedMode === 'HYBRID') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Face Recognition Confidence (0.5 - 1.0)
                  </label>
                  <input
                    {...register('minimumConfidence', {
                      valueAsNumber: true,
                      min: { value: 0.5, message: 'Minimum confidence is 0.5' },
                      max: { value: 1.0, message: 'Maximum confidence is 1.0' }
                    })}
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="1.0"
                    defaultValue={0.8}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Higher values require better face matches but may reject valid students
                  </p>
                </div>
              )}

              <label className="flex items-center">
                <input
                  {...register('requireGeofence')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Require location verification (geofencing)
                </span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createSession.isLoading}
              >
                Create Session
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateSessionModal;