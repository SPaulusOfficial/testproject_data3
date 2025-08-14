import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AvatarUploadProps {
  userId: string;
  currentAvatar?: string;
  onAvatarUpdate?: (avatarSrc: string) => void;
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  userId,
  currentAvatar,
  onAvatarUpdate,
  className = ''
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = user?.id === userId;

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please select a PNG, JPEG, GIF, or WebP image.');
      return;
    }

          // Validate file size (5MB max before optimization)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('File too large. Maximum size is 5MB.');
        return;
      }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const uploadAvatar = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const token = localStorage.getItem('authToken');
      console.log('🔑 Using token:', token ? 'Token exists' : 'No token found');
      console.log('🔑 Token value:', token ? token.substring(0, 20) + '...' : 'No token');
      
      // Use direct backend URL for file uploads
      const uploadUrl = `http://localhost:3002/api/users/${userId}/avatar?v=${Date.now()}`;
      console.log('🌐 Upload URL:', uploadUrl);
      console.log('📁 FormData entries:', Array.from(formData.entries()).map(([key, value]) => `${key}: ${value instanceof File ? value.name + ' (' + value.size + ' bytes)' : value}`));
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - browser will set it automatically with boundary
        },
        body: formData
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadProgress(100);

      // Update avatar display
      if (onAvatarUpdate && preview) {
        onAvatarUpdate(preview);
      }

      console.log('✅ Avatar uploaded successfully:', result.avatarInfo);
      
      // Show optimization info if available
      if (result.avatarInfo?.optimization) {
        const opt = result.avatarInfo.optimization;
        console.log(`📊 Optimization: ${opt.reduction}% size reduction (${opt.originalSize} → ${opt.optimizedSize} bytes)`);
      }

      // Reset after success
      setTimeout(() => {
        setPreview(null);
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);

    } catch (error) {
      console.error('❌ Avatar upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleUpload = () => {
    if (fileInputRef.current?.files?.[0]) {
      uploadAvatar(fileInputRef.current.files[0]);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Avatar Display */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={preview || currentAvatar || '/avatar.png'}
            alt="User avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="text-white text-sm font-medium">
                {uploadProgress}%
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
          <p className="text-sm text-gray-600">
            {isOwnProfile 
              ? 'Update your profile picture' 
              : 'Update user profile picture'
            }
          </p>
        </div>
      </div>

      {/* Upload Area */}
      {!isUploading && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <button
                type="button"
                onClick={triggerFileSelect}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Click to upload
              </button>
              {' '}or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPEG, GIF, WebP up to 5MB
            </p>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Uploading...</span>
            <span className="text-gray-900 font-medium">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Preview and Actions */}
      {preview && !isUploading && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Image selected and ready to upload</span>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload Avatar
            </button>
            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Storage Info */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium mb-1">Automatic Optimization:</p>
        <ul className="space-y-1">
          <li>• Images automatically resized to 512x512 pixels</li>
          <li>• Converted to WebP format for better compression</li>
          <li>• High quality optimization (85% quality)</li>
          <li>• Original color space preservation (no brightness changes)</li>
          <li>• No chroma subsampling for maximum detail preservation</li>
          <li>• Optimized images stored in database (≤100KB) or as files (≤500KB)</li>
          <li>• Maximum upload size: 5MB (will be optimized automatically)</li>
          <li>• Supported formats: PNG, JPEG, GIF, WebP</li>
        </ul>
      </div>
    </div>
  );
};
