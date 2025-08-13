import React, { useState, useEffect } from 'react';
import { User, UserCreateRequest, UserUpdateRequest, Permission } from '../../types/User';
import { SimplePermissionManager } from './SimplePermissionManager';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionGuard } from '../PermissionGuard';

interface UserFormProps {
  user?: User;
  onSubmit: (userData: UserCreateRequest | UserUpdateRequest) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
  existingEmails?: string[]; // For email uniqueness validation
}

export const UserForm: React.FC<UserFormProps> = ({ 
  user, 
  onSubmit, 
  onCancel, 
  mode,
  existingEmails = []
}) => {
  const { hasPermission } = usePermissions();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: user?.username || '',
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    globalRole: user?.globalRole || 'user',
    isActive: user?.isActive ?? true,
    password: '', // Only for create mode
    confirmPassword: '' // Only for create mode
  });

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        username: user.username || '',
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        globalRole: user.globalRole || 'user',
        isActive: user.isActive ?? true,
        password: '', // Keep empty for edit mode
        confirmPassword: '' // Keep empty for edit mode
      });
    }
  }, [user]);

  const [showPermissions, setShowPermissions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    } else if (mode === 'create' && existingEmails.includes(formData.email)) {
      newErrors.email = 'Email already exists in the system';
    } else if (mode === 'edit' && existingEmails.includes(formData.email) && formData.email !== user?.email) {
      newErrors.email = 'Email already exists in the system';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (mode === 'create') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔄 Form submission started');
    console.log('🔄 Mode:', mode);
    console.log('🔄 Form data:', formData);
    
    // In view mode, just close the form
    if (mode === 'view') {
      console.log('🔄 View mode - closing form');
      onCancel();
      return;
    }
    
    if (!hasPermission('UserManagement')) {
      console.log('❌ No permission to manage users');
      alert('You do not have permission to manage users');
      return;
    }
    
    console.log('🔄 Validating form...');
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }
    
    console.log('✅ Form validation passed');

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        console.log('🔄 Creating new user...');
        const createData: UserCreateRequest = {
          email: formData.email,
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          globalRole: formData.globalRole as 'admin' | 'user' | 'guest',
          password: formData.password
        };
        console.log('🔄 Create data:', createData);
        await onSubmit(createData);
      } else {
        console.log('🔄 Updating existing user...');
        const updateData: UserUpdateRequest = {
          // Don't include email in update - it should not be changed
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          globalRole: formData.globalRole as 'admin' | 'user' | 'guest',
          isActive: formData.isActive
        };
        console.log('🔄 Update data:', updateData);
        await onSubmit(updateData);
      }
      console.log('✅ Form submission completed successfully');
    } catch (error) {
      console.error('❌ Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };



  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? 'Create New User' : 'Edit User'}
        </h2>
        <p className="text-gray-600 mt-1">
          {mode === 'create' 
            ? 'Add a new user to the system' 
            : 'Update user information'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email * {mode === 'edit' && '(cannot be changed)'} {mode === 'create' && '(unique)'}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              readOnly={mode === 'view' || mode === 'edit'}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : (mode === 'view' || mode === 'edit') ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
              }`}
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              readOnly={mode === 'view'}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.username ? 'border-red-500' : mode === 'view' ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
              }`}
              placeholder="username"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              readOnly={mode === 'view'}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? 'border-red-500' : mode === 'view' ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              readOnly={mode === 'view'}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? 'border-red-500' : mode === 'view' ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
              }`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>

          

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Global Role *
            </label>
            <select
              value={formData.globalRole}
              onChange={(e) => handleInputChange('globalRole', e.target.value)}
              disabled={mode === 'view'}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                mode === 'view' ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
              }`}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="guest">Guest</option>
            </select>
          </div>
        </div>

        {/* Password Fields (Create Mode Only) */}
        {mode === 'create' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        )}

        {/* Status (Edit Mode Only) */}
        {(mode === 'edit' || mode === 'view') && (
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked.toString())}
                disabled={mode === 'view'}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Active User</span>
            </label>
          </div>
        )}



        {/* Global Permissions Section */}
        {mode !== 'view' && (
          <PermissionGuard permission="UserManagement">
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Global Permissions</h3>
                <button
                  type="button"
                  onClick={() => {
                    console.log('Toggle permissions visibility, current state:', showPermissions);
                    setShowPermissions(!showPermissions);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {showPermissions ? 'Hide' : 'Show'} Permissions
                </button>
              </div>
              
              {showPermissions && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <SimplePermissionManager
                    key={user?.id || 'new'} // Force re-render when user changes
                    userId={user?.id || 'new'}
                    onPermissionsUpdate={(permissions) => {
                      // Handle permission updates
                      console.log('Permissions updated:', permissions);
                    }}
                  />
                </div>
              )}
            </div>
          </PermissionGuard>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {mode === 'view' ? 'Close' : 'Cancel'}
          </button>
          {mode !== 'view' && (
            <PermissionGuard permission="UserManagement">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting 
                  ? (mode === 'create' ? 'Creating...' : 'Saving...')
                  : (mode === 'create' ? 'Create User' : 'Save Changes')
                }
              </button>
            </PermissionGuard>
          )}
        </div>
      </form>
    </div>
  );
};
