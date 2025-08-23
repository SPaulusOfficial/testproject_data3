import React, { useState, useEffect } from 'react';
import { Settings, Mail, Eye, EyeOff, Save, Send, History } from 'lucide-react';
import { PermissionGuard } from '../PermissionGuard';

interface EmailConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  smtp_secure: boolean;
  from_email: string;
  from_name: string;
}

interface EmailConfigHistory {
  id: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_secure: boolean;
  from_email: string;
  from_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const GlobalEmailConfiguration: React.FC = () => {
  const [config, setConfig] = useState<EmailConfig>({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: false,
    from_email: '',
    from_name: ''
  });
  
  const [testEmail, setTestEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<EmailConfigHistory[]>([]);

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3002/api/settings/email-config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch email configuration');
      }

      const data = await response.json();
      if (data.success && data.config) {
        setConfig({
          ...data.config,
          smtp_pass: '' // Password is not returned from server
        });
      }
    } catch (error) {
      console.error('Error fetching email configuration:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/settings/email-config/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch configuration history');
      }

      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSave = async () => {
    if (!config.smtp_host || !config.smtp_port || !config.smtp_user || !config.smtp_pass || !config.from_email || !config.from_name) {
      setError('All fields are required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('http://localhost:3002/api/settings/email-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save email configuration');
      }

      const data = await response.json();
      setSuccess('Email configuration saved successfully!');
      setConfig({
        ...data.config,
        smtp_pass: config.smtp_pass // Keep the password in state
      });
    } catch (error) {
      console.error('Error saving email configuration:', error);
      setError(error instanceof Error ? error.message : 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      setError('Please enter a valid email address for testing');
      return;
    }

    try {
      setIsTesting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('http://localhost:3002/api/settings/email-config/test', {
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

  const handleShowHistory = async () => {
    if (!showHistory) {
      await fetchHistory();
    }
    setShowHistory(!showHistory);
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
          <Mail className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Global Email Server Configuration</h2>
        </div>
        <button
          onClick={handleShowHistory}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          <History className="w-4 h-4" />
          <span>{showHistory ? 'Hide' : 'Show'} History</span>
        </button>
      </div>

      {/* Configuration History */}
      {showHistory && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Configuration History</h3>
            <p className="text-sm text-gray-500">Previous email server configurations</p>
          </div>
          <div className="px-6 py-4">
            {history.length === 0 ? (
              <p className="text-gray-500">No configuration history available</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.smtp_host}:{item.smtp_port}</p>
                        <p className="text-sm text-gray-500">{item.from_email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">SMTP Settings</h3>
          <p className="text-sm text-gray-500">Configure the global email server settings for the platform</p>
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
                  placeholder="Your password or app password"
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
              Use secure connection (SSL/TLS)
            </label>
          </div>

          {/* Common SMTP Providers */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Common SMTP Providers</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setConfig({
                  ...config,
                  smtp_host: 'smtp.gmail.com',
                  smtp_port: 587,
                  smtp_secure: false
                })}
                className="text-left p-3 bg-white rounded border hover:border-blue-300 transition-colors"
              >
                <div className="font-medium text-sm">Gmail</div>
                <div className="text-xs text-gray-500">smtp.gmail.com:587</div>
              </button>
              <button
                onClick={() => setConfig({
                  ...config,
                  smtp_host: 'smtp-mail.outlook.com',
                  smtp_port: 587,
                  smtp_secure: false
                })}
                className="text-left p-3 bg-white rounded border hover:border-blue-300 transition-colors"
              >
                <div className="font-medium text-sm">Outlook</div>
                <div className="text-xs text-gray-500">smtp-mail.outlook.com:587</div>
              </button>
              <button
                onClick={() => setConfig({
                  ...config,
                  smtp_host: 'smtp.mail.yahoo.com',
                  smtp_port: 587,
                  smtp_secure: false
                })}
                className="text-left p-3 bg-white rounded border hover:border-blue-300 transition-colors"
              >
                <div className="font-medium text-sm">Yahoo</div>
                <div className="text-xs text-gray-500">smtp.mail.yahoo.com:587</div>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
          <PermissionGuard permission="EmailConfiguration">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </PermissionGuard>

          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter email to test configuration"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <PermissionGuard permission="EmailConfiguration">
              <button
                onClick={handleTest}
                disabled={isTesting || !testEmail}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isTesting ? 'Sending...' : 'Test Email'}</span>
              </button>
            </PermissionGuard>
          </div>
        </div>
      </div>
    </div>
  );
};
