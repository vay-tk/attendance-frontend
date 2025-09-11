import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Edit, 
  Trash2, 
  MoreVertical,
  Download,
  Upload,
  Shield,
  User,
  GraduationCap,
  Briefcase,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../api/admin';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import EditUserModal from '../../components/Admin/EditUserModal';
import CreateUserModal from '../../components/Admin/CreateUserModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch users
  const { data: usersData, isLoading } = useQuery(
    ['admin-users', page, searchTerm, roleFilter, departmentFilter],
    () => adminAPI.getUsers(),
    {
      onError: (error) => {
        console.error('Failed to fetch users:', error);
      }
    }
  );

  const users = usersData?.data?.data?.users || [];
  const pagination = usersData?.data?.data?.pagination || {};

  // Delete user mutation
  const deleteUser = useMutation(adminAPI.deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-users');
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  });

  // Bulk update users mutation
  const bulkUpdateUsers = useMutation(adminAPI.bulkUpdateUsers, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('admin-users');
      setSelectedUsers([]);
      toast.success(`${data.data.modifiedCount} users updated successfully`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update users');
    }
  });

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
      await deleteUser.mutateAsync(userId);
    }
  };

  const handleBulkAction = async (action, value) => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select users first');
      return;
    }

    const updates = {};
    updates[action] = value;

    if (window.confirm(`Apply this action to ${selectedUsers.length} selected users?`)) {
      await bulkUpdateUsers.mutateAsync({
        userIds: selectedUsers,
        updates
      });
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map(u => u._id));
  };

  const exportUsers = () => {
    // Simple CSV export
    const headers = ['Name', 'Email', 'Role', 'Department', 'Roll No', 'Employee ID', 'Status', 'Created'];
    const csvData = [
      headers,
      ...users.map(user => [
        user.name,
        user.email,
        user.role,
        user.department,
        user.rollNo || '',
        user.employeeId || '',
        user.isActive ? 'Active' : 'Inactive',
        format(new Date(user.createdAt), 'yyyy-MM-dd')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Users exported successfully');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student': return GraduationCap;
      case 'faculty': return Briefcase;
      case 'admin': return Shield;
      default: return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'faculty': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-600">View and manage all system users</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            onClick={exportUsers}
            variant="outline"
            icon={Download}
          >
            Export
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            icon={UserPlus}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card card-padding">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
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

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-800">
                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => handleBulkAction('isActive', true)}
                >
                  Activate
                </Button>
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => handleBulkAction('isActive', false)}
                >
                  Deactivate
                </Button>
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => setSelectedUsers([])}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={toggleAllUsers}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => {
                const RoleIcon = getRoleIcon(user.role);
                
                return (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profileImageUrl ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.profileImageUrl}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {(user.rollNo || user.employeeId) && (
                            <div className="text-xs text-gray-400">
                              {user.rollNo ? `Roll: ${user.rollNo}` : `ID: ${user.employeeId}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <RoleIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.department}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.isActive ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                            <span className="text-success-800 text-sm">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-error-500 mr-2" />
                            <span className="text-error-800 text-sm">Inactive</span>
                          </>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="text-error-600 hover:text-error-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((page - 1) * 20) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(page * 20, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">
            {searchTerm || roleFilter || departmentFilter
              ? 'No users match your current filters.'
              : 'No users have been created yet.'
            }
          </p>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            queryClient.invalidateQueries('admin-users');
          }}
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries('admin-users');
          }}
        />
      )}
    </div>
  );
};

export default ManageUsers;