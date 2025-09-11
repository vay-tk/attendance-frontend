import apiClient from './auth';

export const coursesAPI = {
  getCourses: (params = {}) => apiClient.get('/courses', { params }),
  getCourseById: (id) => apiClient.get(`/courses/${id}`),
  createCourse: (data) => apiClient.post('/courses', data),
  updateCourse: (id, data) => apiClient.patch(`/courses/${id}`, data),
  deleteCourse: (id) => apiClient.delete(`/courses/${id}`),
  enrollStudent: (courseId, studentId) => 
    apiClient.post(`/courses/${courseId}/enroll`, { studentId }),
  unenrollStudent: (courseId, studentId) => 
    apiClient.post(`/courses/${courseId}/unenroll`, { studentId }),
  getCourseStudents: (courseId) => apiClient.get(`/courses/${courseId}/students`),
};