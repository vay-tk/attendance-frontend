import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { useMutation } from 'react-query';
import { coursesAPI } from '../../api/courses';
import Button from '../UI/Button';
import { validators, getValidationMessage } from '../../utils/validation';
import toast from 'react-hot-toast';

const EditCourseModal = ({ course, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...course,
      schedule: course.schedule?.length > 0 ? course.schedule : [
        { day: 'Monday', startTime: '09:00', endTime: '10:00', location: '' }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'schedule'
  });

  const updateCourse = useMutation(
    (data) => coursesAPI.updateCourse(course._id, data),
    {
      onSuccess: () => {
        toast.success('Course updated successfully');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update course');
      }
    }
  );

  const onSubmit = (data) => {
    updateCourse.mutate(data);
  };

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
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
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Course: {course.code}
            </h2>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Code *
                </label>
                <input
                  {...register('code', {
                    required: getValidationMessage.required,
                    validate: (value) => validators.courseCode(value) || getValidationMessage.courseCode
                  })}
                  type="text"
                  className={`input-field ${errors.code ? 'border-error-300' : ''}`}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-error-600">{errors.code.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credits
                </label>
                <input
                  {...register('credits', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Credits must be positive' },
                    max: { value: 10, message: 'Credits cannot exceed 10' }
                  })}
                  type="number"
                  min="0"
                  max="10"
                  className="input-field"
                />
                {errors.credits && (
                  <p className="mt-1 text-sm text-error-600">{errors.credits.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                {...register('title', {
                  required: getValidationMessage.required,
                  minLength: { value: 1, message: getValidationMessage.minLength(1) },
                  maxLength: { value: 200, message: getValidationMessage.maxLength(200) }
                })}
                type="text"
                className={`input-field ${errors.title ? 'border-error-300' : ''}`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description', {
                  maxLength: { value: 1000, message: getValidationMessage.maxLength(1000) }
                })}
                rows="3"
                className="input-field"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  {...register('department', {
                    required: getValidationMessage.required
                  })}
                  className={`input-field ${errors.department ? 'border-error-300' : ''}`}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Information Technology">Information Technology</option>
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-error-600">{errors.department.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <select
                  {...register('semester', {
                    valueAsNumber: true
                  })}
                  className="input-field"
                >
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Enrollment
                </label>
                <input
                  {...register('maxEnrollment', {
                    valueAsNumber: true,
                    min: { value: 1, message: 'Must be at least 1' },
                    max: { value: 200, message: 'Cannot exceed 200' }
                  })}
                  type="number"
                  min="1"
                  max="200"
                  className="input-field"
                />
                {errors.maxEnrollment && (
                  <p className="mt-1 text-sm text-error-600">{errors.maxEnrollment.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year *
                </label>
                <input
                  {...register('academicYear', {
                    required: getValidationMessage.required,
                    pattern: {
                      value: /^\d{4}-\d{4}$/,
                      message: 'Format must be YYYY-YYYY'
                    }
                  })}
                  type="text"
                  className={`input-field ${errors.academicYear ? 'border-error-300' : ''}`}
                />
                {errors.academicYear && (
                  <p className="mt-1 text-sm text-error-600">{errors.academicYear.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attendance Threshold (%)
                </label>
                <input
                  {...register('attendanceThreshold', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Must be between 0 and 100' },
                    max: { value: 100, message: 'Must be between 0 and 100' }
                  })}
                  type="number"
                  min="0"
                  max="100"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    {...register('isActive')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Course is active</span>
                </label>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Class Schedule
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="small"
                  onClick={() => append({ day: 'Monday', startTime: '09:00', endTime: '10:00', location: '' })}
                  icon={Plus}
                >
                  Add Slot
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border border-gray-200 rounded-lg">
                    <div>
                      <select
                        {...register(`schedule.${index}.day`)}
                        className="input-field"
                      >
                        {daysOfWeek.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <input
                        {...register(`schedule.${index}.startTime`)}
                        type="time"
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <input
                        {...register(`schedule.${index}.endTime`)}
                        type="time"
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <input
                        {...register(`schedule.${index}.location`)}
                        type="text"
                        placeholder="Room/Location"
                        className="input-field"
                      />
                    </div>

                    <div className="flex justify-end">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Enrollment Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Enrollment Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <span className="font-medium">Current Enrollment:</span>
                  <span className="ml-2">{course.enrollmentCount} students</span>
                </div>
                <div>
                  <span className="font-medium">Available Slots:</span>
                  <span className="ml-2">{course.availableSlots} remaining</span>
                </div>
              </div>
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
                loading={updateCourse.isLoading}
              >
                Update Course
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditCourseModal;