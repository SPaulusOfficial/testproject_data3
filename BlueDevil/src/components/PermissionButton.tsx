import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission: {
    resource: string;
    action: string;
    projectId?: string;
  };
  showWhenNoPermission?: boolean;
  disabledWhenNoPermission?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permission,
  showWhenNoPermission = false,
  disabledWhenNoPermission = true,
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...buttonProps
}) => {
  const { checkPermission } = usePermissions();
  const hasPermission = checkPermission(permission);

  // Don't render if no permission and not showing when no permission
  if (!hasPermission && !showWhenNoPermission) {
    return null;
  }

  // Get variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const isDisabled = !hasPermission && disabledWhenNoPermission;
  const baseClasses = 'font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();
  
  const finalClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className} ${
    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
  }`;

  return (
    <button
      {...buttonProps}
      className={finalClasses}
      disabled={isDisabled || buttonProps.disabled}
    >
      {children}
    </button>
  );
};

// Specialized permission buttons for common actions
export const ReadButton: React.FC<{
  resource: string;
  projectId?: string;
  children: React.ReactNode;
  showWhenNoPermission?: boolean;
  disabledWhenNoPermission?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  [key: string]: any;
}> = ({ resource, projectId, children, ...props }) => (
  <PermissionButton
    permission={{ resource, action: 'read', projectId }}
    {...props}
  >
    {children}
  </PermissionButton>
);

export const WriteButton: React.FC<{
  resource: string;
  projectId?: string;
  children: React.ReactNode;
  showWhenNoPermission?: boolean;
  disabledWhenNoPermission?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  [key: string]: any;
}> = ({ resource, projectId, children, ...props }) => (
  <PermissionButton
    permission={{ resource, action: 'write', projectId }}
    {...props}
  >
    {children}
  </PermissionButton>
);

export const DeleteButton: React.FC<{
  resource: string;
  projectId?: string;
  children: React.ReactNode;
  showWhenNoPermission?: boolean;
  disabledWhenNoPermission?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  [key: string]: any;
}> = ({ resource, projectId, children, ...props }) => (
  <PermissionButton
    permission={{ resource, action: 'delete', projectId }}
    variant="danger"
    {...props}
  >
    {children}
  </PermissionButton>
);

export const ExecuteButton: React.FC<{
  resource: string;
  projectId?: string;
  children: React.ReactNode;
  showWhenNoPermission?: boolean;
  disabledWhenNoPermission?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  [key: string]: any;
}> = ({ resource, projectId, children, ...props }) => (
  <PermissionButton
    permission={{ resource, action: 'execute', projectId }}
    variant="success"
    {...props}
  >
    {children}
  </PermissionButton>
);
