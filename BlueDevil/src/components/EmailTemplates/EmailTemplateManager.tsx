import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionGuard } from '../PermissionGuard';
import EmailWYSIWYGEditor from './EmailWYSIWYGEditor';
import { Mail, Edit, Trash2, Eye, Save, X, Plus, Settings, Send } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  process_name: string;
  subject: string;
  html_content?: string;
  text_content?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  source: 'project_config' | 'project_settings' | 'system_default';
}

interface EmailTemplateManagerProps {
  projectId: string;
}

const EmailTemplateManager: React.FC<EmailTemplateManagerProps> = ({ projectId }) => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    processName: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    description: '',
    isActive: true
  });

  // Available process types
  const availableProcesses = [
    { name: 'password_reset', label: 'Password Reset', description: 'Email sent when user requests password reset' },
    { name: 'registration_notification', label: 'Registration Notification', description: 'Email sent to new users after registration' },
    { name: '2fa_email', label: 'Two-Factor Authentication', description: 'Email sent for 2FA verification' }
  ];

  useEffect(() => {
    if (projectId) {
      fetchTemplates();
    }
  }, [projectId]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3002/api/projects/${projectId}/email-templates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch email templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      setError('Failed to load email templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      processName: template.process_name,
      subject: template.subject,
      htmlContent: template.html_content || '',
      textContent: template.text_content || '',
      description: template.description || '',
      isActive: template.is_active
    });
    setIsEditing(true);
  };

  const handleCreateFromDefault = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      processName: template.process_name,
      subject: template.subject,
      htmlContent: template.html_content || '',
      textContent: template.text_content || '',
      description: template.description || '',
      isActive: template.is_active
    });
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`http://localhost:3002/api/projects/${projectId}/email-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(templateForm)
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      const data = await response.json();
      console.log('Template saved successfully:', data);
      
      // Refresh templates
      await fetchTemplates();
      setIsEditing(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (processName: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3002/api/projects/${projectId}/email-templates/${processName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const handleToggleTemplate = async (processName: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:3002/api/projects/${projectId}/email-templates/${processName}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle template status');
      }

      await fetchTemplates();
    } catch (error) {
      console.error('Error toggling template status:', error);
      alert('Failed to toggle template status');
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail || !selectedTemplate) return;

    try {
      setIsSendingTest(true);
      const response = await fetch(`http://localhost:3002/api/projects/${projectId}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          processName: selectedTemplate.process_name,
          toEmail: testEmail,
          parameters: {
            USER_NAME: 'Test User',
            RESET_URL: 'https://example.com/reset?token=test123',
            EXPIRY_HOURS: '1',
            USER_EMAIL: testEmail,
            USERNAME: 'testuser',
            TEMP_PASSWORD: 'TempPass123!',
            LOGIN_URL: 'https://example.com/login',
            AUTH_CODE: '123456',
            EXPIRY_MINUTES: '10'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send test email');
      }

      const data = await response.json();
      alert(`Test email sent successfully! Message ID: ${data.messageId}`);
      setShowTestModal(false);
      setTestEmail('');
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  const getProcessLabel = (processName: string) => {
    const process = availableProcesses.find(p => p.name === processName);
    return process ? process.label : processName;
  };

  const getProcessDescription = (processName: string) => {
    const process = availableProcesses.find(p => p.name === processName);
    return process ? process.description : '';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Mail className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
        </div>
        <PermissionGuard permission="EmailManagement">
          <button
            onClick={() => {
              setSelectedTemplate(null);
              setTemplateForm({
                name: '',
                processName: '',
                subject: '',
                htmlContent: '',
                textContent: '',
                description: '',
                isActive: true
              });
              setIsEditing(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Template
          </button>
        </PermissionGuard>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Email Templates</h3>
          <p className="text-sm text-gray-500">Manage project-specific templates and create custom versions from system defaults</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {templates.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No email templates available</h3>
              <p className="text-gray-500 mb-4">No default templates are configured. Contact your system administrator.</p>
            </div>
          ) : (
            templates.map((template) => (
              <div key={template.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        template.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {template.source === 'project_config' ? 'Project' : 
                         template.source === 'project_settings' ? 'Settings' : 'System'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{getProcessDescription(template.process_name)}</p>
                    <p className="text-sm text-gray-600 mt-1">Subject: {template.subject}</p>
                    {template.description && (
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <PermissionGuard permission="EmailManagement">
                      {template.source === 'system_default' ? (
                        <button
                          onClick={() => handleCreateFromDefault(template)}
                          className="p-2 text-gray-400 hover:text-blue-600"
                          title="Create project template from default"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="p-2 text-gray-400 hover:text-blue-600"
                          title="Edit template"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowTestModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600"
                        title="Send test email"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      
                      {template.source !== 'system_default' && (
                        <button
                          onClick={() => handleToggleTemplate(template.process_name, template.is_active)}
                          className="p-2 text-gray-400 hover:text-yellow-600"
                          title={template.is_active ? 'Deactivate template' : 'Activate template'}
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      )}
                      
                      {template.source !== 'system_default' && (
                        <button
                          onClick={() => handleDeleteTemplate(template.process_name)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Delete template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </PermissionGuard>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Template Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedTemplate ? 'Edit Email Template' : 'Create Email Template'}
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Custom Password Reset"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Process Type
                    </label>
                    <select
                      value={templateForm.processName}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, processName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a process type</option>
                      {availableProcesses.map((process) => (
                        <option key={process.name} value={process.name}>
                          {process.label} - {process.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Password Reset Request - {{platform}}"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what this template is used for..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={templateForm.isActive}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Template is active
                    </label>
                  </div>
                </div>

                {/* WYSIWYG Editor */}
                <div className="space-y-4">
                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       HTML Content
                     </label>
                     <EmailWYSIWYGEditor
                       content={templateForm.htmlContent}
                       onChange={(content) => setTemplateForm(prev => ({ ...prev, htmlContent: content }))}
                       placeholder="Enter HTML content for the email template..."
                     />
                   </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Content (Plain Text Fallback)
                    </label>
                    <textarea
                      value={templateForm.textContent}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, textContent: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter plain text content for email clients that don't support HTML..."
                    />
                  </div>
                </div>
              </div>

              {/* Available Placeholders */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Available Placeholders</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <code className="bg-white px-2 py-1 rounded border">{"{{USER_NAME}}"}</code>
                  <code className="bg-white px-2 py-1 rounded border">{"{{USER_EMAIL}}"}</code>
                  <code className="bg-white px-2 py-1 rounded border">{"{{RESET_URL}}"}</code>
                  <code className="bg-white px-2 py-1 rounded border">{"{{TEMP_PASSWORD}}"}</code>
                  <code className="bg-white px-2 py-1 rounded border">{"{{AUTH_CODE}}"}</code>
                  <code className="bg-white px-2 py-1 rounded border">{"{{EXPIRY_HOURS}}"}</code>
                  <code className="bg-white px-2 py-1 rounded border">{"{{EXPIRY_MINUTES}}"}</code>
                  <code className="bg-white px-2 py-1 rounded border">{"{{LOGIN_URL}}"}</code>
                  <code className="bg-white px-2 py-1 rounded border">{"{{platform}}"}</code>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={isSaving || !templateForm.name || !templateForm.processName || !templateForm.subject}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Template
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {showTestModal && selectedTemplate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Send Test Email</h3>
                <button
                  onClick={() => setShowTestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Email Address
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address to send test to..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendTestEmail}
                  disabled={!testEmail || isSendingTest}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingTest ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Test
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateManager;
