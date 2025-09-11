import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Users,
  BookOpen,
  Calendar
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../hooks/useAuth';
import { coursesAPI } from '../../api/courses';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import CreateCourseModal from '../../components/Faculty/CreateCourseModal';
import EditCourseModal from '../../components/Faculty/EditCourseModal';
import ManageCourseStudentsModal from '../../components/Faculty/ManageCourseStudentsModal';
import toast from 'react-hot-toast';

const ManageCourses = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null);

  // Fetch courses
  const { data: coursesData, isLoading } = useQuery(
    ['faculty-courses', searchTerm, filterDepartment],
    () => coursesAPI.getCourses(),
    {
      onError: (error) => {
        console.error('Failed to fetch courses:', error);
      }
    }
  );

  const courses = coursesData?.data?.data?.courses || [];

  // Delete course mutation
  const deleteCourse = useMutation(coursesAPI.deleteCourse, {
    onSuccess: () => {
      queryClient.invalidateQueries('faculty-courses');
      toast.success('Course deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    }
  });

  const handleDeleteCourse = async (courseId, courseName) => {
    if (window.confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) {
      await deleteCourse.mutateAsync(courseId);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
          <p className="text-gray-600">Create and manage your courses</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0"
          icon={Plus}
        >
          Create Course
        </Button>
      </div>

      {/* Filters */}
      <div className="card card-padding">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="input-field"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card card-padding"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{course.code}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{course.title}</p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingCourse(course)}
                    className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course._id, course.title)}
                    className="p-2 text-gray-400 hover:text-error-600 rounded-lg hover:bg-error-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span>{course.department}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>
                    {course.enrollmentCount} / {course.maxEnrollment} students
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{course.credits} credits</span>
                </div>

                {course.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {course.description}
                  </p>
                )}

                {/* Enrollment Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Enrollment</span>
                    <span className="font-medium text-gray-900">
                      {Math.round((course.enrollmentCount / course.maxEnrollment) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((course.enrollmentCount / course.maxEnrollment) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Schedule Display */}
                {course.schedule && course.schedule.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-1">Schedule:</p>
                    <div className="space-y-1">
                      {course.schedule.slice(0, 2).map((slot, idx) => (
                        <p key={idx} className="text-xs text-gray-600">
                          {slot.day}: {slot.startTime} - {slot.endTime}
                        </p>
                      ))}
                      {course.schedule.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{course.schedule.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className={`status-badge ${course.isActive ? 'success' : 'gray'}`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setEditingCourse(course)}
                    >
                      Manage
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => {
                        setSelectedCourseForStudents(course);
                        setShowStudentsModal(true);
                      }}
                    >
                      Students
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'No courses match your search criteria.' : 'Get started by creating your first course.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateModal(true)} icon={Plus}>
              Create Your First Course
            </Button>
          )}
        </motion.div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateCourseModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries('faculty-courses');
          }}
        />
      )}

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSuccess={() => {
            setEditingCourse(null);
            queryClient.invalidateQueries('faculty-courses');
          }}
        />
      )}

      {showStudentsModal && selectedCourseForStudents && (
        <ManageCourseStudentsModal
          course={selectedCourseForStudents}
          onClose={() => setShowStudentsModal(false)}
        />
      )}
    </div>
  );
};

export default ManageCourses;