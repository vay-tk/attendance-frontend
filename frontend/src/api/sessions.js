import apiClient from './auth';

export const sessionsAPI = {
  getSessions: (params = {}) => apiClient.get('/sessions', { params }),
  getSessionById: (id) => apiClient.get(`/sessions/${id}`),
  createSession: (data) => apiClient.post('/sessions', data),
  updateSession: (id, data) => apiClient.patch(`/sessions/${id}`, data),
  deleteSession: (id) => apiClient.delete(`/sessions/${id}`),
  startSession: (id) => apiClient.post(`/sessions/${id}/start`),
  closeSession: (id) => apiClient.post(`/sessions/${id}/close`),
  refreshQRToken: (id) => apiClient.post(`/sessions/${id}/refresh-qr`),
  getSessionAttendance: (id) => apiClient.get(`/sessions/${id}/attendance`),
};