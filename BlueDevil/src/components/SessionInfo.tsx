import React, { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { Clock, User, FolderOpen, Bell, Shield, Settings, Activity, AlertTriangle, Copy, Download } from 'lucide-react';

const SessionInfo: React.FC = () => {
  const { getSessionInfo, session, exportSession } = useSession();
  const [sessionInfo, setSessionInfo] = useState(getSessionInfo());
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const updateSessionInfo = () => {
      setSessionInfo(getSessionInfo());
    };

    // Update every 10 seconds
    const interval = setInterval(updateSessionInfo, 10000);
    return () => clearInterval(interval);
  }, [getSessionInfo]);

  const handleCopySession = () => {
    const sessionData = exportSession();
    navigator.clipboard.writeText(sessionData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSession = () => {
    const sessionData = exportSession();
    const blob = new Blob([sessionData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const getStatusColor = (isValid: boolean, sessionAge: number): string => {
    if (!isValid) return 'text-red-500';
    if (sessionAge > 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = (isValid: boolean, sessionAge: number) => {
    if (!isValid) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (sessionAge > 30) return <Clock className="w-4 h-4 text-yellow-500" />;
    return <Activity className="w-4 h-4 text-green-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Session Info</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopySession}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Copy session data"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownloadSession}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Download session data"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          {getStatusIcon(sessionInfo.userLoggedIn, sessionInfo.sessionAge)}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {sessionInfo.userLoggedIn ? 'Active' : 'Inactive'}
            </p>
            <p className="text-xs text-gray-500">
              {formatDuration(sessionInfo.sessionAge)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">User</p>
            <p className="text-xs text-gray-500">
              {session.user?.username || 'Not logged in'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <FolderOpen className="w-4 h-4 text-green-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">Project</p>
            <p className="text-xs text-gray-500">
              {sessionInfo.currentProject || 'None selected'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-purple-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">Notifications</p>
            <p className="text-xs text-gray-500">
              {sessionInfo.unreadNotifications} unread
            </p>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          {/* User Details */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              User Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">ID:</span>
                <span className="ml-1 font-mono">{session.user?.id || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-1">{session.user?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Role:</span>
                <span className="ml-1 capitalize">{session.user?.globalRole || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-1">{session.user?.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FolderOpen className="w-4 h-4 mr-2" />
              Project Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Current:</span>
                <span className="ml-1">{session.currentProject?.name || 'None'}</span>
              </div>
              <div>
                <span className="text-gray-500">Available:</span>
                <span className="ml-1">{session.availableProjects.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Theme:</span>
                <span className="ml-1 capitalize">{session.theme}</span>
              </div>
              <div>
                <span className="text-gray-500">Language:</span>
                <span className="ml-1">{session.language}</span>
              </div>
            </div>
          </div>

          {/* Security Details */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Security & Permissions
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Security Level:</span>
                <span className="ml-1 capitalize">{session.securityLevel}</span>
              </div>
              <div>
                <span className="text-gray-500">2FA:</span>
                <span className="ml-1">{session.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div>
                <span className="text-gray-500">Permissions:</span>
                <span className="ml-1">{Object.keys(session.permissions).length}</span>
              </div>
              <div>
                <span className="text-gray-500">Errors:</span>
                <span className="ml-1">{session.errorCount}</span>
              </div>
            </div>
          </div>

          {/* Navigation History */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Recent Pages
            </h4>
            <div className="space-y-1">
              {session.lastVisitedPages.slice(0, 5).map((page, index) => (
                <div key={index} className="text-xs text-gray-600 flex items-center">
                  <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs mr-2">
                    {index + 1}
                  </span>
                  {page}
                </div>
              ))}
              {session.lastVisitedPages.length === 0 && (
                <p className="text-xs text-gray-400">No recent pages</p>
              )}
            </div>
          </div>

          {/* Session Timestamps */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Timestamps
            </h4>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div>
                <span className="text-gray-500">Last Activity:</span>
                <span className="ml-1">{new Date(session.lastActivity).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Session Age:</span>
                <span className="ml-1">{formatDuration(sessionInfo.sessionAge)}</span>
              </div>
              <div>
                <span className="text-gray-500">Last Error:</span>
                <span className="ml-1">{session.lastError || 'None'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for chevron icon
const ChevronDown: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// Helper component for check icon
const Check: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default SessionInfo;
