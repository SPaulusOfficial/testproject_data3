import React, { useState } from 'react'
import { X, Folder } from 'lucide-react'
import { PermissionGuard } from '@/components/PermissionGuard'

interface KnowledgeCreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  parentFolderId?: string | null
  projectId?: string
}

export default function KnowledgeCreateFolderModal({
  isOpen,
  onClose,
  onSuccess,
  parentFolderId,
  projectId
}: KnowledgeCreateFolderModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert('Please enter a folder name')
      return
    }

    setIsCreating(true)

    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token')
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_BASE}/knowledge/folders?project_id=${projectId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parent_folder_id: parentFolderId,
          name: name.trim(),
          description: description.trim()
        })
      })

      if (response.ok) {
        onSuccess()
        handleClose()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to create folder')
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      alert('Failed to create folder')
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setIsCreating(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Folder className="w-6 h-6 text-digital-blue" />
            <h2 className="text-xl font-semibold text-black">Create New Folder</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Folder Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter folder description"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            <PermissionGuard permission="Knowledge" action="create">
              <button
                type="submit"
                disabled={isCreating || !name.trim()}
                className="px-6 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Folder className="w-4 h-4" />
                    Create Folder
                  </>
                )}
              </button>
            </PermissionGuard>
          </div>
        </form>
      </div>
    </div>
  )
}
