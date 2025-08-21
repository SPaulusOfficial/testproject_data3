import React, { useState } from 'react';
import { X, Github, CheckCircle, AlertCircle, GitBranch } from 'lucide-react';

interface GitHubIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess?: (repoUrl: string) => void;
}

const GitHubIntegrationModal: React.FC<GitHubIntegrationModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onSuccess
}) => {
  const [githubToken, setGithubToken] = useState('');
  const [repoName, setRepoName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [integrationType, setIntegrationType] = useState<'create' | 'existing'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!githubToken) {
      setError('GitHub token is required');
      return;
    }

    if (integrationType === 'create' && !repoName) {
      setError('Repository name is required for new repositories');
      return;
    }

    if (integrationType === 'existing' && !repoUrl) {
      setError('Repository URL is required for existing repositories');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api';
      
      const requestBody = {
        github_token: githubToken,
        ...(integrationType === 'create' && { repo_name: repoName }),
        ...(integrationType === 'existing' && { repo_url: repoUrl }),
        integration_type: integrationType
      };
      
      console.log('Sending GitHub integration request:', requestBody);
      
      const response = await fetch(`${API_BASE}/knowledge/projects/${projectId}/github`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess('GitHub integration setup successfully!');
        if (onSuccess) {
          onSuccess(result.repoUrl);
        }
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to setup GitHub integration');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup GitHub integration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setGithubToken('');
    setRepoName('');
    setRepoUrl('');
    setIntegrationType('create');
    setError(null);
    setSuccess(null);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Github className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">GitHub Integration</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="github-token" className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              id="github-token"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-transparent"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              required
            />
            <div className="text-sm text-gray-500 mt-1 space-y-1">
              <p>Create a Personal Access Token (PAT) with these permissions:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li><code className="bg-gray-100 px-1 rounded">repo</code> - Full control of private repositories</li>
                <li><code className="bg-gray-100 px-1 rounded">workflow</code> - Update GitHub Action workflows</li>
              </ul>
              <p className="mt-2">
                <a 
                  href="https://github.com/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-digital-blue hover:underline"
                >
                  Create token at github.com/settings/tokens →
                </a>
              </p>
            </div>
          </div>

          {/* Integration Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repository Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="integrationType"
                  value="create"
                  checked={integrationType === 'create'}
                  onChange={(e) => setIntegrationType(e.target.value as 'create' | 'existing')}
                  className="mr-2"
                />
                <span className="text-sm">Create new repository</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="integrationType"
                  value="existing"
                  checked={integrationType === 'existing'}
                  onChange={(e) => setIntegrationType(e.target.value as 'create' | 'existing')}
                  className="mr-2"
                />
                <span className="text-sm">Use existing repository</span>
              </label>
            </div>
          </div>

          {integrationType === 'create' && (
            <div>
              <label htmlFor="repo-name" className="block text-sm font-medium text-gray-700 mb-2">
                Repository Name
              </label>
              <input
                type="text"
                id="repo-name"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-transparent"
                placeholder="project-documents"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will create a private repository for your project documents
              </p>
            </div>
          )}

          {integrationType === 'existing' && (
            <div>
              <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 mb-2">
                Repository URL
              </label>
              <input
                type="url"
                id="repo-url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-transparent"
                placeholder="https://github.com/username/repository-name"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the full URL of your existing GitHub repository
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Benefits */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Benefits of GitHub Integration:</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Full Git versioning for all documents</li>
              <li>• Branch and merge capabilities</li>
              <li>• Collaborative editing with pull requests</li>
              <li>• Complete change history and audit trail</li>
              <li>• Backup and disaster recovery</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-white bg-digital-blue rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Setting up...</span>
                </>
              ) : (
                <>
                  <GitBranch className="w-4 h-4" />
                  <span>Setup Integration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GitHubIntegrationModal;
