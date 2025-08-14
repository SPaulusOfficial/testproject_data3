import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string; // This is the URL from the backend, not the raw data
  role?: string;
}

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ 
  user, 
  size = 'md', 
  className = '', 
  showFallback = true 
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  useEffect(() => {
    const loadAvatar = async () => {
      console.log('🖼️ Avatar component mounted with user:', user);
      console.log('🖼️ User ID:', user?.id);
      console.log('🖼️ User name:', user?.name);
      console.log('🖼️ User email:', user?.email);
      
      if (!user?.id) {
        console.log('🖼️ No user ID provided:', user);
        return;
      }
      
      setIsLoading(true);
      setError(false);
      
      try {
        console.log('🖼️ Loading avatar for user:', user.id);
        const response = await fetch(`http://localhost:3002/api/users/${user.id}/avatar`);
        
        console.log('🖼️ Avatar response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🖼️ Avatar response data:', data);
          
          if (data.success && data.avatar) {
            console.log('🖼️ Avatar data structure:', data.avatar);
            
            // Handle different data formats
            let imageData;
            if (data.avatar.data) {
              // Direct base64 data
              imageData = data.avatar.data;
            } else if (data.avatar.src) {
              // URL or Data URL format
              imageData = data.avatar.src;
            } else {
              console.log('🖼️ No image data found in avatar response');
              setError(true);
              return;
            }
            
            try {
              if (imageData.startsWith('data:')) {
                // Data URL format - use directly
                setAvatarUrl(imageData);
              } else if (imageData.startsWith('/') || imageData.startsWith('http')) {
                // URL format - construct full URL
                const fullUrl = imageData.startsWith('http') 
                  ? imageData 
                  : `http://localhost:3002${imageData}`;
                console.log('🖼️ Using URL format:', fullUrl);
                setAvatarUrl(fullUrl);
              } else {
                // Base64 data - decode and create blob
                const byteCharacters = atob(imageData);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: data.avatar.mimeType });
                const url = URL.createObjectURL(blob);
                setAvatarUrl(url);
              }
            } catch (decodeError) {
              console.error('🖼️ Error decoding avatar data:', decodeError);
              console.log('🖼️ Image data preview:', imageData.substring(0, 100));
              setError(true);
            }
          } else {
            console.log('🖼️ Avatar response not successful');
            setError(true);
          }
        } else {
          console.log('🖼️ Avatar response not ok, status:', response.status);
          setError(true);
        }
      } catch (err) {
        console.error('🖼️ Error loading avatar:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadAvatar();
  }, [user?.id, user]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  const getInitials = () => {
    if (!user) return '?';
    const firstName = user.firstName || user.name?.split(' ')[0] || '';
    const lastName = user.lastName || user.name?.split(' ')[1] || '';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    console.log('🖼️ Generated initials:', initials, 'for user:', user.name);
    return initials;
  };

  const getFallbackColor = () => {
    if (!user?.id) return 'bg-gray-400';
    // Generate consistent color based on user ID
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = user.id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-200 animate-pulse rounded-full flex items-center justify-center`}>
        <div className="w-1/2 h-1/2 bg-gray-300 rounded-full"></div>
      </div>
    );
  }

  if (avatarUrl && !error) {
    console.log('🖼️ Displaying avatar image for user:', user?.name);
    return (
      <img
        src={avatarUrl}
        alt={`${user?.name || 'User'} avatar`}
        className={`${sizeClasses[size]} ${className} rounded-full object-cover`}
        onError={() => setError(true)}
      />
    );
  }

  if (showFallback) {
    console.log('🖼️ Showing fallback avatar for user:', user?.name, 'with ID:', user?.id);
    return (
      <div className={`${sizeClasses[size]} ${className} ${getFallbackColor()} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
        {getInitials()}
      </div>
    );
  }

  return null;
};

export default Avatar;
