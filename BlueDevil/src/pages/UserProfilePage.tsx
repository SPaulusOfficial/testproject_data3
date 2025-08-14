import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, Mail, Phone, Key, Shield, Settings, Edit, Check, X } from 'lucide-react';
import userService from '../services/UserService';
import { User } from '../types/User';
import { ProfilePasswordChange } from '../components/ProfilePasswordChange';
import { AvatarUpload } from '../components/AvatarUpload';
import Avatar from '../components/Avatar';

const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Extract name parts from currentUser
  const nameParts = currentUser?.profile?.firstName && currentUser?.profile?.lastName 
    ? [currentUser.profile.firstName, currentUser.profile.lastName]
    : currentUser?.username?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  const [formData, setFormData] = useState({
    firstName: firstName,
    lastName: lastName,
    email: currentUser?.email || '',
    phone: currentUser?.profile?.phone || '',
    username: currentUser?.username || ''
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get full user data from backend
        const userData = await userService.getUserById(user.id);
        setCurrentUser(userData);
        
        // Update form data with user data
        const nameParts = userData.profile?.firstName && userData.profile?.lastName 
          ? [userData.profile.firstName, userData.profile.lastName]
          : userData.username?.split(' ') || [];
        
        setFormData({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: userData.email || '',
          phone: userData.profile?.phone || '',
          username: userData.username || ''
        });
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const updateData = {
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        },
        email: formData.email,
        username: formData.username
      };

      const updatedUser = await userService.updateUser(currentUser.id, updateData);
      setCurrentUser(updatedUser);
      
      // Update form data with the new values
      const nameParts = updatedUser.profile?.firstName && updatedUser.profile?.lastName 
        ? [updatedUser.profile.firstName, updatedUser.profile.lastName]
        : updatedUser.username?.split(' ') || [];
      
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: updatedUser.email || '',
        phone: updatedUser.profile?.phone || '',
        username: updatedUser.username || ''
      });
      
      setIsEditing(false);
      setSuccess('Profile updated successfully');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">User Not Found</h2>
          <p className="text-gray-500">Unable to load user profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {user && (
            <Avatar user={user} size="lg" className="border-2 border-gray-200" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentUser.profile?.firstName && currentUser.profile?.lastName 
                ? `${currentUser.profile.firstName} ${currentUser.profile.lastName}`
                : currentUser.username
              }
            </h1>
            <p className="text-gray-500">{currentUser.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            currentUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {currentUser.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
            {currentUser.globalRole}
          </span>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <X className="w-5 h-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <Check className="w-5 h-5 text-green-400" />
            <p className="ml-3 text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Avatar Upload */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Profile Picture</h2>
        </div>
        <div className="p-6">
          <AvatarUpload 
            userId={currentUser.id}
            currentAvatar={currentUser.profile?.avatar}
            onAvatarUpdate={(newAvatar) => {
              // Update local user state
              setCurrentUser(prev => prev ? {
                ...prev,
                profile: {
                  ...prev.profile,
                  avatar: newAvatar
                }
              } : null);
            }}
          />
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Profile Information
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <Edit className="w-4 h-4 mr-1" />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{currentUser.profile?.firstName || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{currentUser.profile?.lastName || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{currentUser.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{currentUser.profile?.phone || 'Not provided'}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Account Information
          </h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <p className="text-gray-900">{currentUser.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <p className="text-gray-900">{currentUser.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Global Role
              </label>
              <p className="text-gray-900 capitalize">{currentUser.globalRole}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <p className="text-gray-900">{currentUser.isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <p className="text-gray-900">{new Date(currentUser.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Updated
              </label>
              <p className="text-gray-900">{new Date(currentUser.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Information */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Security Information
          </h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Two-Factor Authentication
              </label>
              <p className="text-gray-900">{currentUser.security?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Login
              </label>
              <p className="text-gray-900">
                {currentUser.security?.lastLogin 
                  ? new Date(currentUser.security.lastLogin).toLocaleString() 
                  : 'Never'
                }
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Failed Login Attempts
              </label>
              <p className="text-gray-900">{currentUser.security?.failedLoginAttempts || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            User Settings
          </h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <p className="text-gray-900">{currentUser.settings?.language || 'en'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <p className="text-gray-900">{currentUser.settings?.timezone || 'UTC'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change */}
      <ProfilePasswordChange />
    </div>
  );
};

export default UserProfilePage;
