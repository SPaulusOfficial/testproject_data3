import React, { useState, useEffect } from 'react'
import { 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  MoreHorizontal,
  FolderPlus,
  Edit3,
  Trash2,
  FileText
} from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { PermissionGuard } from '@/components/PermissionGuard'

interface Folder {
  id: string
  name: string
  description: string
  path: string
  parent_folder_id: string | null
  created_by: string
  created_at: string
  first_name: string
  last_name: string
  document_count: number
  subfolder_count: number
}

interface KnowledgeFolderTreeProps {
  selectedFolderId: string | null
  onFolderSelect: (folderId: string | null) => void
  projectId?: string
}

export default function KnowledgeFolderTree({ 
  selectedFolderId, 
  onFolderSelect, 
  projectId 
}: KnowledgeFolderTreeProps) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { canAccessKnowledge } = usePermissions()

  useEffect(() => {
    if (projectId) {
      loadFolders()
    }
  }, [projectId])

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      if (projectId) {
        loadFolders()
      }
    }

    window.addEventListener('knowledge-refresh', handleRefresh)
    return () => window.removeEventListener('knowledge-refresh', handleRefresh)
  }, [projectId])

  const loadFolders = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token')
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_BASE}/knowledge/folders?project_id=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load folders')
      }

      const data = await response.json()
      setFolders(data)
    } catch (error) {
      console.error('Error loading folders:', error)
      setError('Failed to load folders')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const buildFolderTree = (folders: Folder[], parentId: string | null = null): Folder[] => {
    return folders
      .filter(folder => folder.parent_folder_id === parentId)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  const renderFolder = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolderId === folder.id
    const hasChildren = folder.subfolder_count > 0
    const childFolders = buildFolderTree(folders, folder.id)

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
            isSelected ? 'bg-digital-blue/5 border-r-2 border-digital-blue' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => onFolderSelect(folder.id)}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(folder.id)
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown size={14} className="text-gray-500" />
              ) : (
                <ChevronRight size={14} className="text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Folder Icon */}
          <Folder 
            size={16} 
            className={`${
              isSelected ? 'text-digital-blue' : 'text-gray-500'
            }`} 
          />

          {/* Folder Name */}
          <span className={`flex-1 text-sm truncate ${
            isSelected ? 'font-medium text-digital-blue' : 'text-gray-700'
          }`}>
            {folder.name}
          </span>

          {/* Document Count */}
          {folder.document_count > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              {folder.document_count}
            </span>
          )}

          {/* Actions Menu */}
          <PermissionGuard permission="Knowledge" action="create">
            <button
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Show folder actions menu
              }}
              className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal size={14} className="text-gray-500" />
            </button>
          </PermissionGuard>
        </div>

        {/* Child Folders */}
        {isExpanded && childFolders.map(childFolder => 
          renderFolder(childFolder, level + 1)
        )}
      </div>
    )
  }

  const rootFolders = buildFolderTree(folders, null)

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 text-sm mb-2">{error}</div>
        <button
          onClick={loadFolders}
          className="text-digital-blue text-sm hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (rootFolders.length === 0) {
    return (
      <div className="p-4 text-center">
        <Folder className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 mb-3">No folders yet</p>
        <PermissionGuard permission="Knowledge" action="create">
          <button
            onClick={() => {
              // TODO: Show create folder modal
            }}
            className="text-digital-blue text-sm hover:underline"
          >
            Create your first folder
          </button>
        </PermissionGuard>
      </div>
    )
  }

  return (
    <div className="py-2">
      {/* Root Level */}
      <div
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
          selectedFolderId === null ? 'bg-digital-blue/5 border-r-2 border-digital-blue' : ''
        }`}
        onClick={() => onFolderSelect(null)}
      >
        <FileText 
          size={16} 
          className={`${
            selectedFolderId === null ? 'text-digital-blue' : 'text-gray-500'
          }`} 
        />
        <span className={`flex-1 text-sm font-medium ${
          selectedFolderId === null ? 'text-digital-blue' : 'text-gray-700'
        }`}>
          All Documents
        </span>
        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
          {folders.reduce((total, folder) => total + folder.document_count, 0)}
        </span>
      </div>

      {/* Folder Tree */}
      {rootFolders.map(folder => renderFolder(folder))}
    </div>
  )
}
