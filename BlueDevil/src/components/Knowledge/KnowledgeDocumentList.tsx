import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  User,
  Tag,
  History,
  Grid,
  List
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePermissions } from '@/hooks/usePermissions'
import { PermissionGuard } from '@/components/PermissionGuard'
import KnowledgeDocumentViewer from './KnowledgeDocumentViewer'

interface Document {
  id: string
  title: string
  description: string
  file_name: string
  file_size: number
  mime_type: string
  file_type: string
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  folder_name: string
  folder_path: string
  version_count: number
  latest_version: number
}

interface KnowledgeDocumentListProps {
  folderId?: string | null
  viewMode: 'grid' | 'list'
  searchQuery: string
  fileTypeFilter: string
  projectId?: string
}

export default function KnowledgeDocumentList({
  folderId,
  viewMode,
  searchQuery,
  fileTypeFilter,
  projectId
}: KnowledgeDocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const navigate = useNavigate()
  const { canAccessKnowledge } = usePermissions()

  useEffect(() => {
    if (projectId) {
      loadDocuments()
    }
  }, [projectId, folderId, searchQuery, fileTypeFilter])

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      if (projectId) {
        loadDocuments()
      }
    }

    window.addEventListener('knowledge-refresh', handleRefresh)
    return () => window.removeEventListener('knowledge-refresh', handleRefresh)
  }, [projectId])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.append('project_id', projectId!)
      if (folderId) params.append('folder_id', folderId)
      if (searchQuery) params.append('search', searchQuery)
      if (fileTypeFilter) params.append('file_type', fileTypeFilter)

      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token')
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_BASE}/knowledge/documents?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load documents')
      }

      const data = await response.json()
      setDocuments(data)
    } catch (error) {
      console.error('Error loading documents:', error)
      setError('Failed to load documents')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDocument = (document: Document) => {
    navigate(`/knowledge/document/${document.id}`)
  }

  const handleEditDocument = (document: Document) => {
    if (document.file_type === 'markdown') {
      navigate(`/knowledge/document/${document.id}/edit`)
    } else {
      alert('Only markdown documents can be edited')
    }
  }

  const handleDownloadDocument = async (document: Document) => {
    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token')
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_BASE}/knowledge/documents/${document.id}/download?project_id=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = document.file_name
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to download document')
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Failed to download document')
    }
  }

  const handleSaveDocument = async (documentId: string, content: string, version: number, description?: string) => {
    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token')
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_BASE}/knowledge/documents/${documentId}/content`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          description: description || `Version ${version} update`
        })
      })

      if (response.ok) {
        loadDocuments()
        return Promise.resolve()
      } else {
        throw new Error('Failed to save document')
      }
    } catch (error) {
      console.error('Error saving document:', error)
      return Promise.reject(error)
    }
  }

  const handleVersionSelect = async (documentId: string, version: number) => {
    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token')
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_BASE}/knowledge/documents/${documentId}/content?version=${version}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        return Promise.resolve()
      } else {
        throw new Error('Failed to load version')
      }
    } catch (error) {
      console.error('Error loading version:', error)
      return Promise.reject(error)
    }
  }

  const handleDeleteDocument = async (document: Document) => {
    if (!confirm(`Möchten Sie das Dokument "${document.title}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`)) {
      return
    }

    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token')
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_BASE}/knowledge/documents/${document.id}?project_id=${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        // Trigger refresh event for other components
        window.dispatchEvent(new CustomEvent('knowledge-refresh'))
        loadDocuments()
      } else {
        const errorData = await response.json()
        alert(`Fehler beim Löschen: ${errorData.error || 'Unbekannter Fehler'}`)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Fehler beim Löschen des Dokuments')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'markdown':
        return <FileText className="w-5 h-5 text-blue-500" />
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />
      case 'text':
        return <FileText className="w-5 h-5 text-green-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 text-sm mb-2">{error}</div>
        <button
          onClick={loadDocuments}
          className="text-digital-blue text-sm hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="p-6 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
        <p className="text-gray-500">
          {searchQuery 
            ? `No documents match "${searchQuery}"`
            : 'No documents in this folder yet'
          }
        </p>
      </div>
    )
  }

  const renderGridView = () => {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map(document => (
            <div
              key={document.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDocument(document)}
            >
              <div className="flex items-start justify-between mb-3">
                {getFileIcon(document.file_type)}
                <div className="flex items-center gap-1">
                  <PermissionGuard permission="Knowledge" action="edit">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditDocument(document)
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit3 size={14} className="text-gray-500" />
                    </button>
                  </PermissionGuard>
                  <PermissionGuard permission="Knowledge" action="delete">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteDocument(document)
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Delete"
                    >
                      <Trash2 size={14} className="text-gray-500" />
                    </button>
                  </PermissionGuard>
                </div>
              </div>

              <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                {document.title}
              </h3>
              
              {document.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {document.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatFileSize(document.file_size)}</span>
                <span>{formatDate(document.created_at)}</span>
              </div>

              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <User size={12} />
                <span>{document.first_name} {document.last_name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderListView = () => {
    return (
    <div className="p-6">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Versions
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map(document => (
              <tr key={document.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(document.file_type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {document.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {document.folder_path}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatFileSize(document.file_size)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(document.created_at)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {document.first_name} {document.last_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  v{document.latest_version}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleViewDocument(document)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="View"
                    >
                      <Eye size={14} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(document)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Download"
                    >
                      <Download size={14} className="text-gray-500" />
                    </button>
                    <PermissionGuard permission="Knowledge" action="edit">
                      <button
                        onClick={() => handleEditDocument(document)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Edit3 size={14} className="text-gray-500" />
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission="Knowledge" action="delete">
                      <button
                        onClick={() => handleDeleteDocument(document)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <Trash2 size={14} className="text-gray-500" />
                      </button>
                    </PermissionGuard>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

  return (
    <>
      {viewMode === 'grid' ? renderGridView() : renderListView()}
      
      <KnowledgeDocumentViewer
        document={selectedDocument}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false)
          setSelectedDocument(null)
        }}
        onSave={handleSaveDocument}
        onVersionSelect={handleVersionSelect}
        projectId={projectId || ''}
      />
    </>
  )
}
