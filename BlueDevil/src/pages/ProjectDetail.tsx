import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionGuard } from '../components/PermissionGuard';
import { ProjectWithMembers, ProjectMember } from '../types/Project';
import GitHubIntegrationModal from '../components/Knowledge/GitHubIntegrationModal';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [project, setProject] = useState<ProjectWithMembers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'integrations'>('overview');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [newMember, setNewMember] = useState({
    userId: '',
    role: 'member' as 'admin' | 'member' | 'viewer'
  });

  // Check permissions
  const canAccessProjects = hasPermission('ProjectManagement');

  useEffect(() => {
    if (id && canAccessProjects) {
      fetchProjectDetails();
      fetchAvailableUsers();
    }
  }, [id, canAccessProjects]);

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3002/api/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project details');
      }

      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error('Error fetching project details:', error);
      setError('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const users = await response.json();
        setAvailableUsers(users);
        setFilteredUsers(users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Filter users based on search term and exclude existing members
  useEffect(() => {
    if (project && availableUsers.length > 0) {
      const filtered = availableUsers.filter(user => {
        const isExistingMember = project.members?.some(member => member.userId === user.id);
        const matchesSearch = user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                             user.profile?.firstName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                             user.profile?.lastName?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                             user.username.toLowerCase().includes(userSearchTerm.toLowerCase());
        
        return !isExistingMember && matchesSearch;
      });
      setFilteredUsers(filtered);
    }
  }, [userSearchTerm, availableUsers, project]);

  const handleAddMember = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!canAccessProjects) {
      alert('You do not have permission to manage project members');
      return;
    }

    if (!newMember.userId) {
      alert('Please select a user to add');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3002/api/projects/${id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(newMember)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add member');
      }

      // Refresh project details
      await fetchProjectDetails();
      setShowAddMemberModal(false);
      setNewMember({ userId: '', role: 'member' });
      setUserSearchTerm('');
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!canAccessProjects) {
      alert('You do not have permission to manage project members');
      return;
    }

    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3002/api/projects/${id}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove member');
      }

      // Refresh project details
      await fetchProjectDetails();
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    }
  };

  if (!canAccessProjects) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Access Denied</h3>
          <p className="text-red-600">You don't have permission to access Project Details.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600">{error || 'Project not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/projects')}
              className="text-blue-600 hover:text-blue-800 mb-2"
            >
              ← Back to Projects
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <PermissionGuard permission="ProjectManagement">
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Member
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Slug</label>
            <p className="text-sm text-gray-900">{project.slug}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Owner</label>
            <p className="text-sm text-gray-900">{project.ownerName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Created</label>
            <p className="text-sm text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              project.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {project.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Members ({project.memberCount})
            </button>
            <PermissionGuard permission="ProjectManagement">
              <button
                onClick={() => setActiveTab('integrations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'integrations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Integrations
              </button>
            </PermissionGuard>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900">Members</h3>
              <p className="text-2xl font-bold text-blue-600">{project.memberCount}</p>
              <p className="text-sm text-blue-700">Active team members</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-900">Status</h3>
              <p className="text-2xl font-bold text-green-600">{project.isActive ? 'Active' : 'Inactive'}</p>
              <p className="text-sm text-green-700">Project status</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-purple-900">Created</h3>
              <p className="text-2xl font-bold text-purple-600">{new Date(project.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-purple-700">Project start date</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Project Members ({project.memberCount})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Accessed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {project.members?.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {member.user?.firstName?.charAt(0)}{member.user?.lastName?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.user?.firstName} {member.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{member.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      member.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                      member.role === 'admin' ? 'bg-red-100 text-red-800' :
                      member.role === 'member' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.lastAccessed ? new Date(member.lastAccessed).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {member.role !== 'owner' && (
                      <PermissionGuard permission="ProjectManagement">
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </PermissionGuard>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {activeTab === 'integrations' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Project Integrations</h2>
          </div>
          
          <div className="space-y-6">
            {/* GitHub Integration */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">GitHub Integration</h3>
                    <p className="text-sm text-gray-500">Connect your project documents to GitHub for version control and backup</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGitHubModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900"
                >
                  Setup Integration
                </button>
              </div>
              
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Benefits:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Full Git versioning for all project documents</li>
                  <li>• Automatic backup to GitHub</li>
                  <li>• Collaborative editing with pull requests</li>
                  <li>• Complete change history and audit trail</li>
                  <li>• Branch and merge capabilities</li>
                </ul>
              </div>
            </div>

            {/* Future Integrations */}
            <div className="border border-gray-200 rounded-lg p-6 opacity-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">?</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">More Integrations</h3>
                  <p className="text-sm text-gray-500">Additional integrations coming soon...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Member to Project</h3>
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search users by name, email, or username..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Users Table */}
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.profile?.firstName?.charAt(0)}{user.profile?.lastName?.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.profile?.firstName} {user.profile?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.globalRole}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <select
                              value={newMember.role}
                              onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as any }))}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                              <option value="viewer">Viewer</option>
                            </select>
                            <button
                              onClick={() => {
                                setNewMember(prev => ({ ...prev, userId: user.id }));
                                handleAddMember(new Event('submit') as any);
                              }}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Add
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {userSearchTerm ? 'No users found matching your search.' : 'No available users to add.'}
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Integration Modal */}
      <GitHubIntegrationModal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
        projectId={id || ''}
        onSuccess={(repoUrl) => {
          console.log('GitHub integration setup successfully:', repoUrl)
          // Optional: Show success message or refresh data
        }}
      />
    </div>
  );
};

export default ProjectDetail;
