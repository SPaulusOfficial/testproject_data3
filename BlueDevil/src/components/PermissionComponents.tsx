import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

// Simple permission check component
export const If: React.FC<{
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permission, children, fallback }) => {
  const { hasPermission } = usePermissions();
  
  if (hasPermission(permission)) {
    return <>{children}</>;
  }
  
  return fallback ? <>{fallback}</> : null;
};

// Permission-based button
export const Button: React.FC<{
  permission: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  fallback?: React.ReactNode;
}> = ({ permission, onClick, children, className, disabled, fallback }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return fallback ? <>{fallback}</> : null;
  }
  
  return (
    <button 
      onClick={onClick} 
      className={className} 
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Permission-based link
export const Link: React.FC<{
  permission: string;
  to: string;
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}> = ({ permission, to, children, className, fallback }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return fallback ? <>{fallback}</> : null;
  }
  
  return (
    <a href={to} className={className}>
      {children}
    </a>
  );
};

// Permission-based div
export const Div: React.FC<{
  permission: string;
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}> = ({ permission, children, className, fallback }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }
  
  return <div className={className}>{children}</div>;
};

// Permission-based section
export const Section: React.FC<{
  permission: string;
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}> = ({ permission, children, className, fallback }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return fallback ? <section className={className}>{fallback}</section> : null;
  }
  
  return <section className={className}>{children}</section>;
};

// Permission-based form
export const Form: React.FC<{
  permission: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}> = ({ permission, onSubmit, children, className, fallback }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }
  
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
    </form>
  );
};

// Permission-based table
export const Table: React.FC<{
  permission: string;
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}> = ({ permission, children, className, fallback }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }
  
  return <table className={className}>{children}</table>;
};

// Permission-based modal
export const Modal: React.FC<{
  permission: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}> = ({ permission, isOpen, onClose, children, className, fallback }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return fallback ? <>{fallback}</> : null;
  }
  
  if (!isOpen) return null;
  
  return (
    <div className={`modal ${className || ''}`}>
      <div className="modal-content">
        <button onClick={onClose} className="modal-close">×</button>
        {children}
      </div>
    </div>
  );
};
