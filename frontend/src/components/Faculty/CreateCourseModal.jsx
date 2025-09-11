import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { useMutation } from 'react-query';
import { coursesAPI } from '../../api/courses';
import Button from '../UI/Button';
import { validators, getValidationMessage } from '../../utils/validation';
import toast from 'react-hot-toast';

const CreateCourseModal = ({ onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      schedule: [{ day: 'Monday', startTime: '09:00', endTime: '10:00', location: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'schedule'
  });

  const createCourse = useMutation(coursesAPI.createCourse, {
    onSuccess: () => {
      toast.success('Course created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create course');
    }
  });

  const onSubmit = (data) => {
    createCourse.mutate(data);
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
            <h2 className="text-xl font-semibold text-gray-900">Create New Course</h2>
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
                  placeholder="e.g., CS101"
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
                  defaultValue={3}
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
                placeholder="Enter course title"
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
                placeholder="Course description (optional)"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  defaultValue={60}
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
                      message: 'Format must be YYYY-YYYY (e.g., 2024-2025)'
                    }
                  })}
                  type="text"
                  placeholder="e.g., 2024-2025"
                  className={`input-field ${errors.academicYear ? 'border-error-300' : ''}`}
                />
                {errors.academicYear && (
                  <p className="mt-1 text-sm text-error-600">{errors.academicYear.message}</p>
                )}
              </div>
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
                defaultValue={75}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum attendance percentage required for the course
              </p>
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
                loading={createCourse.isLoading}
              >
                Create Course
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateCourseModal;