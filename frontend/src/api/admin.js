import apiClient from './auth';

export const adminAPI = {
  getDashboardStats: () => apiClient.get('/admin/dashboard-stats'),
  getSystemAnalytics: (params = {}) => apiClient.get('/admin/analytics', { params }),
  getAuditLogs: (params = {}) => apiClient.get('/admin/audit-logs', { params }),
  exportData: (type, params = {}) => apiClient.get(`/admin/export/${type}`, { params }),
  bulkUpdateUsers: (data) => apiClient.post('/admin/bulk-update-users', data),
  systemHealthCheck: () => apiClient.get('/admin/health'),
  getUsers: (params = {}) => apiClient.get('/users', { params }),
  getUserById: (id) => apiClient.get(`/users/${id}`),
  updateUser: (id, data) => apiClient.patch(`/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
};