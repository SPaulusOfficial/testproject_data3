import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Folder, 
  FileText, 
  Upload, 
  Search, 
  Plus, 
  Grid, 
  List,
  Filter,
  Download,
  Eye,
  Edit3,
  Trash2,
  Tag,
  History,
  Users,
  Calendar,
  FolderPlus,
  FilePlus,
  Archive,
  Settings,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Star,
  Bookmark,
  Share2,
  Copy,
  Move,
  RefreshCw
} from 'lucide-react'
import { useProject } from '@/contexts/ProjectContext'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { PermissionGuard } from '@/components/PermissionGuard'
import KnowledgeFolderTree from '@/components/Knowledge/KnowledgeFolderTree'
import KnowledgeDocumentList from '@/components/Knowledge/KnowledgeDocumentList'
import KnowledgeUploadModal from '@/components/Knowledge/KnowledgeUploadModal'
import KnowledgeCreateFolderModal from '@/components/Knowledge/KnowledgeCreateFolderModal'
import KnowledgeSearch from '@/components/Knowledge/KnowledgeSearch'
import KnowledgeStats from '@/components/Knowledge/KnowledgeStats'
import AgentSubmissionsPanel from '@/components/Knowledge/AgentSubmissionsPanel'

interface KnowledgeStats {
  totalDocuments: number
  totalFolders: number
  totalSize: number
  recentUploads: number
  pendingSubmissions: number
}

export default function Knowledge() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentProject } = useProject()
  const { user } = useAuth()
  const { canAccessKnowledge } = usePermissions()
  
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('')
  const [showAgentSubmissions, setShowAgentSubmissions] = useState(false)
  const [stats, setStats] = useState<KnowledgeStats>({
    totalDocuments: 0,
    totalFolders: 0,
    totalSize: 0,
    recentUploads: 0,
    pendingSubmissions: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load stats on component mount
  useEffect(() => {
    if (currentProject?.id) {
      loadStats()
    }
  }, [currentProject?.id])

  const loadStats = async () => {
    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token')
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_BASE}/knowledge/statistics?project_id=${currentProject?.id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading knowledge stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId)
    // Update URL without navigation
    const newPath = folderId ? `/knowledge/folder/${folderId}` : '/knowledge'
    window.history.replaceState(null, '', newPath)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFileTypeFilter = (type: string) => {
    setFileTypeFilter(type)
  }

  const handleUploadSuccess = () => {
    setShowUploadModal(false)
    loadStats()
    // Refresh document list
    window.dispatchEvent(new CustomEvent('knowledge-refresh'))
  }

  const handleCreateFolderSuccess = () => {
    setShowCreateFolderModal(false)
    loadStats()
    // Refresh folder tree
    window.dispatchEvent(new CustomEvent('knowledge-refresh'))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!canAccessKnowledge()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to access the Knowledge Base.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-digital-blue" />
              <h1 className="text-2xl font-bold text-black">Knowledge Base</h1>
            </div>
            {currentProject && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>•</span>
                <span>{currentProject.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-digital-blue shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-digital-blue shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List size={16} />
              </button>
            </div>

            {/* Agent Submissions Toggle */}
            <PermissionGuard permission="Knowledge" action="process_agent_submissions">
              <button
                onClick={() => setShowAgentSubmissions(!showAgentSubmissions)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showAgentSubmissions
                    ? 'bg-open-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users size={16} className="inline mr-2" />
                Agent Submissions
                {stats.pendingSubmissions > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {stats.pendingSubmissions}
                  </span>
                )}
              </button>
            </PermissionGuard>

            {/* Upload Button */}
            <PermissionGuard permission="Knowledge" action="upload">
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-2 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Upload size={16} />
                Upload
              </button>
            </PermissionGuard>

            {/* Create Folder Button */}
            <PermissionGuard permission="Knowledge" action="create">
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <FolderPlus size={16} />
                New Folder
              </button>
            </PermissionGuard>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-4 grid grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-digital-blue" />
              <span className="text-sm font-medium text-gray-700">Documents</span>
            </div>
            <div className="text-lg font-bold text-black">{stats.totalDocuments}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-digital-blue" />
              <span className="text-sm font-medium text-gray-700">Folders</span>
            </div>
            <div className="text-lg font-bold text-black">{stats.totalFolders}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-digital-blue" />
              <span className="text-sm font-medium text-gray-700">Total Size</span>
            </div>
            <div className="text-lg font-bold text-black">{formatFileSize(stats.totalSize)}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-digital-blue" />
              <span className="text-sm font-medium text-gray-700">Recent</span>
            </div>
            <div className="text-lg font-bold text-black">{stats.recentUploads}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-digital-blue" />
              <span className="text-sm font-medium text-gray-700">Pending</span>
            </div>
            <div className="text-lg font-bold text-black">{stats.pendingSubmissions}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* Sidebar - Folder Tree */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Folders</h3>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('knowledge-refresh'))}
                className="p-1 hover:bg-gray-100 rounded"
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
            </div>
            <KnowledgeSearch onSearch={handleSearch} />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <KnowledgeFolderTree
              selectedFolderId={selectedFolderId}
              onFolderSelect={handleFolderSelect}
              projectId={currentProject?.id}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-black">
                  {selectedFolderId ? 'Folder Contents' : 'All Documents'}
                </h2>
                
                {/* File Type Filter */}
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-gray-500" />
                  <select
                    value={fileTypeFilter}
                    onChange={(e) => handleFileTypeFilter(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-digital-blue"
                  >
                    <option value="">All Types</option>
                    <option value="markdown">Markdown</option>
                    <option value="pdf">PDF</option>
                    <option value="text">Text</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Showing results for</span>
                <span className="font-medium">
                  {searchQuery ? `"${searchQuery}"` : 'all documents'}
                </span>
              </div>
            </div>
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto">
            <KnowledgeDocumentList
              folderId={selectedFolderId}
              viewMode={viewMode}
              searchQuery={searchQuery}
              fileTypeFilter={fileTypeFilter}
              projectId={currentProject?.id}
            />
          </div>
        </div>

        {/* Agent Submissions Panel */}
        {showAgentSubmissions && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <AgentSubmissionsPanel projectId={currentProject?.id} />
          </div>
        )}
      </div>

      {/* Modals */}
      <KnowledgeUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
        folderId={selectedFolderId}
        projectId={currentProject?.id}
      />

      <KnowledgeCreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onSuccess={handleCreateFolderSuccess}
        parentFolderId={selectedFolderId}
        projectId={currentProject?.id}
      />
    </div>
  )
}
