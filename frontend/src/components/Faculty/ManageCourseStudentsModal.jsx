import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';
import axios from 'axios';
import { getAllStudents } from '../../api/users';
import apiClient from '../../api/auth';

const ManageCourseStudentsModal = ({ course, onClose }) => {
  const [students, setStudents] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    fetchAllStudents();
    // eslint-disable-next-line
  }, [course]);

  const fetchAllStudents = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all students using API function
      const res = await getAllStudents();
      setStudents(res.data.data.users);
      // Fetch enrolled students for this course
      const enrolledRes = await apiClient.get(`/courses/${course._id}/students`);
      setEnrolledIds(enrolledRes.data.data.students.map(s => s._id));
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (studentId) => {
    setActionLoading(studentId);
    setError('');
    try {
      await apiClient.post(`/courses/${course._id}/enroll`, { studentId });
      setEnrolledIds([...enrolledIds, studentId]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll student');
    } finally {
      setActionLoading('');
    }
  };

  const handleUnenroll = async (studentId) => {
    setActionLoading(studentId);
    setError('');
    try {
      await apiClient.post(`/courses/${course._id}/unenroll`, { studentId });
      setEnrolledIds(enrolledIds.filter(id => id !== studentId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unenroll student');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`Manage Students for ${course.code}`}> 
      <div className="space-y-4 px-6 sm:px-10 md:px-16 py-8 bg-white rounded-md shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="text-sm sm:text-base font-semibold text-gray-700">
            Enrolled: <span className="font-medium text-gray-900">{enrolledIds.length}</span> / {course.maxEnrollment}
          </div>
          <Button size="small" variant="outline" onClick={fetchAllStudents}>
            Refresh
          </Button>
        </div>

        {/* All Students List */}
        <div>
          <div className="font-semibold text-gray-800 mb-3 text-base">All Students</div>

          {loading ? (
            <LoadingSpinner size="small" />
          ) : students.length === 0 ? (
            <div className="text-sm text-gray-500">No students found.</div>
          ) : (
            <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
              {students.map(student => {
                const isEnrolled = enrolledIds.includes(student._id);
                return (
                  <li key={student._id} className="flex items-center justify-between py-3 px-2">
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.email} | {student.rollNo}</div>
                    </div>
                    {isEnrolled ? (
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleUnenroll(student._id)}
                        loading={actionLoading === student._id}
                      >
                        Unenroll
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        onClick={() => handleEnroll(student._id)}
                        loading={actionLoading === student._id}
                      >
                        Enroll
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Error Display */}
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </div>

    </Modal>
  );
};

export default ManageCourseStudentsModal;
