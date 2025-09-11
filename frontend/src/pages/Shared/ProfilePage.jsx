import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  Camera,
  Upload,
  Key,
  Shield,
  Edit
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api/auth';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Button';
import { validators, getValidationMessage } from '../../utils/validation';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch profile data
  const { data: profileData, isLoading } = useQuery(
    'user-profile',
    authAPI.getProfile
  );

  const profile = profileData?.data?.user || user;

  // Update profile mutation
  const updateProfile = useMutation(authAPI.updateProfile, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('user-profile');
      updateUser(data.data.user);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  // Upload photo mutation
  const uploadPhoto = useMutation(authAPI.uploadPhoto, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('user-profile');
      updateUser({ profileImageUrl: data.data.profileImageUrl });
      setSelectedImage(null);
      setImagePreview(null);
      toast.success('Profile photo updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    }
  });

  // Change password mutation
  const changePassword = useMutation(authAPI.changePassword, {
    onSuccess: () => {
      toast.success('Password changed successfully');
      setActiveTab('profile');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  });

  // Face enrollment mutation
  const enrollFace = useMutation(authAPI.enrollFace, {
    onSuccess: () => {
      queryClient.invalidateQueries('user-profile');
      toast.success('Face enrolled successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to enroll face');
    }
  });

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
      department: profile?.department || ''
    }
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm();

  const newPassword = watchPassword('newPassword');

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validators.isValidFile(file)) {
      toast.error('Please select a valid image file (JPEG/PNG, max 20MB)');
      return;
    }

    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async () => {
    if (!selectedImage) return;
    
    const formData = new FormData();
    formData.append('photo', selectedImage);
    
    try {
      await uploadPhoto.mutateAsync(formData);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const onSubmitProfile = (data) => {
    updateProfile.mutate(data);
  };

  const onSubmitPassword = (data) => {
    changePassword.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
    resetPassword();
  };

  const handleFaceEnrollment = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Set face consent first
    try {
      await updateProfile.mutateAsync({ faceConsent: true });
    } catch (error) {
      console.error('Failed to set face consent:', error);
    }
    // Set face consent first
    try {
      await updateProfile.mutateAsync({ faceConsent: true });
    } catch (error) {
      console.error('Failed to set face consent:', error);
    }
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      await enrollFace.mutateAsync(formData);
    } catch (error) {
      console.error('Face enrollment error:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    ...(profile?.role === 'student' ? [{ id: 'biometrics', label: 'Face Recognition', icon: Camera }] : [])
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card card-padding">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : profile?.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
              <Camera size={16} />
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageSelect}
                className="sr-only"
              />
            </label>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{profile?.name}</h1>
            <p className="text-gray-600">{profile?.email}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <Building2 size={16} className="mr-1" />
                {profile?.department}
              </span>
              <span className={`status-badge ${
                profile?.role === 'student' ? 'info' : 
                profile?.role === 'faculty' ? 'success' : 'warning'
              }`}>
                {profile?.role}
              </span>
            </div>
          </div>

          {selectedImage && (
            <div className="flex space-x-2">
              <Button
                onClick={handleUploadPhoto}
                loading={uploadPhoto.isLoading}
                size="small"
                icon={Upload}
              >
                Upload
              </Button>
              <Button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                variant="outline"
                size="small"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                <Edit className="w-5 h-5 text-gray-400" />
              </div>

              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      {...registerProfile('name', {
                        required: getValidationMessage.required,
                        validate: (value) => validators.name(value) || getValidationMessage.name
                      })}
                      type="text"
                      className={`input-field ${profileErrors.name ? 'border-error-300' : ''}`}
                    />
                    {profileErrors.name && (
                      <p className="mt-1 text-sm text-error-600">{profileErrors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="input-field bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      {...registerProfile('phone', {
                        validate: (value) => !value || validators.phone(value) || getValidationMessage.phone
                      })}
                      type="tel"
                      className={`input-field ${profileErrors.phone ? 'border-error-300' : ''}`}
                    />
                    {profileErrors.phone && (
                      <p className="mt-1 text-sm text-error-600">{profileErrors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      {...registerProfile('department')}
                      type="text"
                      className="input-field"
                    />
                  </div>

                  {profile?.role === 'student' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        value={profile?.rollNo || ''}
                        disabled
                        className="input-field bg-gray-50 text-gray-500"
                      />
                    </div>
                  )}

                  {(profile?.role === 'faculty' || profile?.role === 'admin') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        value={profile?.employeeId || ''}
                        disabled
                        className="input-field bg-gray-50 text-gray-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    loading={updateProfile.isLoading}
                  >
                    Update Profile
                  </Button>
                </div>
              </form>

              {/* Account Information */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-4">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Joined: </span>
                    <span className="ml-1">{user.createdAt && !isNaN(new Date(user.createdAt)) ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Last login: </span>
                    <span className="ml-1">
                      {profile?.lastLogin ? format(new Date(profile.lastLogin), 'MMM dd, yyyy HH:mm') : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                <Key className="w-5 h-5 text-gray-400" />
              </div>

              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password *
                    </label>
                    <input
                      {...registerPassword('currentPassword', {
                        required: getValidationMessage.required
                      })}
                      type="password"
                      className={`input-field ${passwordErrors.currentPassword ? 'border-error-300' : ''}`}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-error-600">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password *
                    </label>
                    <input
                      {...registerPassword('newPassword', {
                        required: getValidationMessage.required,
                        validate: (value) => validators.password(value) || getValidationMessage.password
                      })}
                      type="password"
                      className={`input-field ${passwordErrors.newPassword ? 'border-error-300' : ''}`}
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-error-600">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password *
                    </label>
                    <input
                      {...registerPassword('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === newPassword || 'Passwords do not match'
                      })}
                      type="password"
                      className={`input-field ${passwordErrors.confirmPassword ? 'border-error-300' : ''}`}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-error-600">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 text-sm">Password Requirements:</h4>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains at least one number</li>
                    <li>• Contains at least one special character</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    loading={changePassword.isLoading}
                  >
                    Change Password
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Biometrics Tab (Students only) */}
          {activeTab === 'biometrics' && profile?.role === 'student' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Face Recognition</h3>
                <Camera className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-green-900 text-sm">Privacy & Security</h4>
                      <p className="text-sm text-green-800 mt-1">
                        Your facial data is encrypted and stored securely. It's only used for attendance verification and cannot be accessed by unauthorized persons.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Face Enrollment Status</h4>
                      <p className="text-sm text-gray-600">
                        {profile?.faceEmbeddingId ? 'Face is enrolled and ready for attendance' : 'Face not enrolled yet'}
                      </p>
                    </div>
                    <div className={`status-badge ${profile?.faceEmbeddingId ? 'success' : 'warning'}`}>
                      {profile?.faceEmbeddingId ? 'Enrolled' : 'Not Enrolled'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile?.faceConsent || false}
                        readOnly
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        I consent to use my facial features for attendance verification
                      </span>
                    </div>

                    <div>
                      <label className="block">
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary-400 transition-colors cursor-pointer">
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <span className="relative font-medium text-primary-600 hover:text-primary-500">
                                {profile?.faceEmbeddingId ? 'Re-enroll face' : 'Upload a photo to enroll face'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG up to 20MB</p>
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleFaceEnrollment}
                          className="sr-only"
                        />
                      </label>
                    </div>

                    {enrollFace.isLoading && (
                      <div className="flex items-center justify-center p-4">
                        <LoadingSpinner size="small" className="mr-2" />
                        <span className="text-sm text-gray-600">Processing face enrollment...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 text-sm">Tips for better face recognition:</h4>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• Use a clear, well-lit photo</li>
                    <li>• Face should be clearly visible and centered</li>
                    <li>• Avoid wearing glasses or masks in the enrollment photo</li>
                    <li>• Use a recent photo that looks like your current appearance</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;