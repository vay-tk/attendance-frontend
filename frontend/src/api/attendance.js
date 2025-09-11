import apiClient from './auth';

export const attendanceAPI = {
  markAttendanceQR: (data) => apiClient.post('/attendance/qr', data),
  markAttendanceFace: (formData) => {
    return apiClient.post('/attendance/face', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getStudentAttendance: (studentId, params = {}) => 
    apiClient.get(`/attendance/student/${studentId}`, { params }),
  updateAttendance: (id, data) => apiClient.patch(`/attendance/${id}`, data),
  flagAttendance: (id, data) => apiClient.post(`/attendance/${id}/flag`, data),
  verifyAttendance: (id) => apiClient.post(`/attendance/${id}/verify`),
  getAttendanceAnalytics: (params = {}) => 
    apiClient.get('/attendance/analytics', { params }),
};