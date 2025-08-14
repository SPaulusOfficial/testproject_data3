import React, { useState } from 'react';
import { Key, Mail, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

interface AdminPasswordSetProps {
  userId: string;
  userEmail: string;
  userName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminPasswordSet: React.FC<AdminPasswordSetProps> = ({
  userId,
  userEmail,
  userName,
  onSuccess,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSetPassword = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3002/api/admin/users/${userId}/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sendEmail })
      });

      const data = await response.json();

      if (response.ok) {
        if (!sendEmail && data.temporaryPassword) {
          setTemporaryPassword(data.temporaryPassword);
        }
        setMessage({ type: 'success', text: data.message });
        
        // Auto-close after 3 seconds if email was sent
        if (sendEmail) {
          setTimeout(() => {
            onSuccess();
          }, 3000);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to set password' });
      }
    } catch (error) {
      console.error('Error setting password:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-digital-blue rounded-full flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Set Password</h3>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Setting password for: <strong>{userName}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Email: <strong>{userEmail}</strong>
            </p>
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded border-gray-300 text-digital-blue focus:ring-digital-blue"
              />
              <span className="ml-2 text-sm text-gray-700">
                Send email with temporary password
              </span>
            </label>
          </div>

          {!sendEmail && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  You will need to manually provide the temporary password to the user.
                </span>
              </div>
            </div>
          )}

          {temporaryPassword && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">Temporary Password:</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-green-600 hover:text-green-800"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="mt-2">
                <code className={`text-sm font-mono ${showPassword ? 'text-green-800' : 'text-green-600'}`}>
                  {showPassword ? temporaryPassword : '••••••••••••'}
                </code>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Please provide this password to the user securely.
              </p>
            </div>
          )}

          {message && (
            <div className={`rounded-md p-3 mb-4 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
                <div className="ml-2">
                  <p className={`text-sm ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-digital-blue"
            >
              Cancel
            </button>
            <button
              onClick={handleSetPassword}
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-digital-blue hover:bg-deep-blue-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-digital-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Setting...' : 'Set Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
