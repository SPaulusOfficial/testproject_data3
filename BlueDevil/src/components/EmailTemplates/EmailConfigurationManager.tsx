import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionGuard } from '../PermissionGuard';
import { Mail, Save, TestTube, Eye, EyeOff, Settings } from 'lucide-react';

interface EmailConfig {
  id?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  smtp_secure: boolean;
  from_email: string;
  from_name: string;
  is_active: boolean;
}

interface EmailConfigurationManagerProps {
  projectId: string;
}

const EmailConfigurationManager: React.FC<EmailConfigurationManagerProps> = ({ projectId }) => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [config, setConfig] = useState<EmailConfig>({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: false,
    from_email: '',
    from_name: '',
    is_active: true
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchConfiguration();
    }
  }, [projectId]);

  const fetchConfiguration = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3002/api/projects/${projectId}/email-config`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig(data.config);
        }
      } else {
        console.log('No email configuration found, using defaults');
      }
    } catch (error) {
      console.error('Error fetching email configuration:', error);
      setError('Failed to load email configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`http://localhost:3002/api/projects/${projectId}/email-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Failed to save email configuration');
      }

      const data = await response.json();
      setConfig(data.config);
      setSuccess('Email configuration saved successfully!');
    } catch (error) {
      console.error('Error saving email configuration:', error);
      setError('Failed to save email configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      setError('Please enter a test email address');
      return;
    }

    try {
      setIsTesting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`http://localhost:3002/api/projects/${projectId}/email-config/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ toEmail: testEmail })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to test email configuration');
      }

      const data = await response.json();
      setSuccess(`Test email sent successfully! Message ID: ${data.messageId}`);
      setTestEmail('');
    } catch (error) {
      console.error('Error testing email configuration:', error);
      setError(error instanceof Error ? error.message : 'Failed to test email configuration');
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Email Server Configuration</h2>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">SMTP Settings</h3>
          <p className="text-sm text-gray-500">Configure your email server settings for sending emails</p>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SMTP Host */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Host *
              </label>
              <input
                type="text"
                value={config.smtp_host}
                onChange={(e) => setConfig({ ...config, smtp_host: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* SMTP Port */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Port *
              </label>
              <input
                type="number"
                value={config.smtp_port}
                onChange={(e) => setConfig({ ...config, smtp_port: parseInt(e.target.value) || 587 })}
                placeholder="587"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* SMTP Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Username *
              </label>
              <input
                type="text"
                value={config.smtp_user}
                onChange={(e) => setConfig({ ...config, smtp_user: e.target.value })}
                placeholder="your-email@gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* SMTP Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={config.smtp_pass}
                  onChange={(e) => setConfig({ ...config, smtp_pass: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* From Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Email *
              </label>
              <input
                type="email"
                value={config.from_email}
                onChange={(e) => setConfig({ ...config, from_email: e.target.value })}
                placeholder="noreply@yourcompany.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* From Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Name *
              </label>
              <input
                type="text"
                value={config.from_name}
                onChange={(e) => setConfig({ ...config, from_name: e.target.value })}
                placeholder="Your Company Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Secure Connection */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="smtp_secure"
              checked={config.smtp_secure}
              onChange={(e) => setConfig({ ...config, smtp_secure: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="smtp_secure" className="ml-2 block text-sm text-gray-900">
              Use secure connection (TLS/SSL)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 pt-4">
            <PermissionGuard permission="EmailManagement">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Test Configuration */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Test Configuration</h3>
          <p className="text-sm text-gray-500">Send a test email to verify your configuration</p>
        </div>
        
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <PermissionGuard permission="EmailManagement">
              <button
                onClick={handleTest}
                disabled={isTesting || !testEmail}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                <TestTube className="w-4 h-4 mr-2" />
                {isTesting ? 'Sending...' : 'Send Test Email'}
              </button>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Common SMTP Providers */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Common SMTP Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Gmail</h4>
            <p className="text-sm text-gray-600 mb-2">Host: smtp.gmail.com</p>
            <p className="text-sm text-gray-600 mb-2">Port: 587</p>
            <p className="text-sm text-gray-600">Secure: Yes</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Outlook/Hotmail</h4>
            <p className="text-sm text-gray-600 mb-2">Host: smtp-mail.outlook.com</p>
            <p className="text-sm text-gray-600 mb-2">Port: 587</p>
            <p className="text-sm text-gray-600">Secure: Yes</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Yahoo</h4>
            <p className="text-sm text-gray-600 mb-2">Host: smtp.mail.yahoo.com</p>
            <p className="text-sm text-gray-600 mb-2">Port: 587</p>
            <p className="text-sm text-gray-600">Secure: Yes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfigurationManager;
