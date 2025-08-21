import React, { useState, useRef } from 'react'
import { X, Upload, FileText, Folder, AlertCircle, CheckCircle } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { PermissionGuard } from '@/components/PermissionGuard'

interface KnowledgeUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  folderId?: string | null
  projectId?: string
}

interface UploadFile {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function KnowledgeUploadModal({
  isOpen,
  onClose,
  onSuccess,
  folderId,
  projectId
}: KnowledgeUploadModalProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string>(folderId || '')
  const [folders, setFolders] = useState<any[]>([])
  const [isLoadingFolders, setIsLoadingFolders] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { canAccessKnowledge } = usePermissions()

  // Load folders when modal opens
  React.useEffect(() => {
    if (isOpen && projectId) {
      loadFolders()
    }
  }, [isOpen, projectId])

  const loadFolders = async () => {
    try {
      setIsLoadingFolders(true)
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token')
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_BASE}/knowledge/folders?project_id=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFolders(data)
      }
    } catch (error) {
      console.error('Error loading folders:', error)
    } finally {
      setIsLoadingFolders(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    
    const newFiles: UploadFile[] = selectedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }))
    
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const validateFiles = () => {
    const allowedTypes = [
      'text/markdown',
      'application/pdf',
      'text/plain',
      'text/html',
      'application/json'
    ]
    
    const maxSize = 50 * 1024 * 1024 // 50MB
    
    for (const uploadFile of files) {
      const file = uploadFile.file
      
      // Check file type
      const isValidType = allowedTypes.includes(file.type) || 
        file.name.endsWith('.md') || 
        file.name.endsWith('.pdf') || 
        file.name.endsWith('.txt')
      
      if (!isValidType) {
        return `Invalid file type: ${file.name}. Only markdown, PDF, and text files are allowed.`
      }
      
      // Check file size
      if (file.size > maxSize) {
        return `File too large: ${file.name}. Maximum size is 50MB.`
      }
    }
    
    return null
  }

  const uploadFiles = async () => {
    console.log('🔍 Upload button clicked in KnowledgeUploadModal');
    console.log('🔍 Files to upload:', files.length);
    console.log('🔍 Selected folder:', selectedFolder);
    console.log('🔍 Project ID:', projectId);
    console.log('🔍 Current upload state:', isUploading);
    
    // Prevent double-clicking
    if (isUploading) {
      console.log('🔍 Upload already in progress, ignoring click');
      return
    }
    
    const validationError = validateFiles()
    if (validationError) {
      alert(validationError)
      return
    }

    if (files.length === 0) {
      alert('Please select at least one file to upload.')
      return
    }

    if (!selectedFolder) {
      alert('Please select a folder to upload to.')
      return
    }

    console.log('🔍 Starting upload process...');
    setIsUploading(true)
    setUploadProgress(0)

    const totalFiles = files.length
    let completedFiles = 0
    let successCount = 0

    for (let i = 0; i < files.length; i++) {
      const uploadFile = files[i]
      
      try {
        // Update file status to uploading
        setFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, status: 'uploading' } : f
        ))

        const formData = new FormData()
        formData.append('file', uploadFile.file)
        formData.append('folder_id', selectedFolder)
        formData.append('title', title || uploadFile.file.name)
        formData.append('description', description)
        formData.append('tags', tags)

        const authToken = localStorage.getItem('authToken') || localStorage.getItem('token')
        const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api'
        
        console.log(`🔍 Sending request to: ${API_BASE}/knowledge/documents?project_id=${projectId}`);
        console.log(`🔍 FormData contents:`, {
          file: uploadFile.file.name,
          folder_id: selectedFolder,
          title: title || uploadFile.file.name,
          description: description,
          tags: tags
        });
        
        const response = await fetch(`${API_BASE}/knowledge/documents?project_id=${projectId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: formData
        })

        console.log(`🔍 Response status: ${response.status}`);
        
        if (response.ok) {
          console.log(`🔍 File ${uploadFile.file.name} uploaded successfully`);
          // Update file status to success
          setFiles(prev => prev.map((f, index) => 
            index === i ? { ...f, status: 'success', progress: 100 } : f
          ))
          successCount++
        } else {
          const errorData = await response.json()
          console.error(`🔍 Upload failed for ${uploadFile.file.name}:`, errorData);
          throw new Error(errorData.error || 'Upload failed')
        }

        completedFiles++
        setUploadProgress((completedFiles / totalFiles) * 100)

      } catch (error) {
        console.error('Upload error:', error)
        
        // Update file status to error
        setFiles(prev => prev.map((f, index) => 
          index === i ? { 
            ...f, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Upload failed'
          } : f
        ))
      }
    }

    console.log('🔍 Upload process completed');
    console.log('🔍 Success count:', successCount, 'Total files:', totalFiles);
    
    setIsUploading(false)
    
    // Check if all files uploaded successfully
    const allSuccess = successCount === totalFiles
    console.log('🔍 All files successful:', allSuccess);
    
    if (allSuccess) {
      console.log('🔍 Closing modal and calling onSuccess');
      onSuccess()
      handleClose()
    } else {
      console.log('🔍 Some files failed, keeping modal open');
    }
  }

  const handleClose = () => {
    setFiles([])
    setTitle('')
    setDescription('')
    setTags('')
    setSelectedFolder(folderId || '')
    setUploadProgress(0)
    setIsUploading(false)
    onClose()
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.md')) return <FileText className="w-4 h-4 text-blue-500" />
    if (fileName.endsWith('.pdf')) return <FileText className="w-4 h-4 text-red-500" />
    return <FileText className="w-4 h-4 text-gray-500" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-digital-blue border-t-transparent rounded-full animate-spin" />
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-digital-blue" />
            <h2 className="text-xl font-semibold text-black">Upload Documents</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Folder Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload to Folder
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-transparent"
              disabled={isLoadingFolders}
            >
              <option value="">Select a folder...</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.path}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Files
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-digital-blue transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Click to select files or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                Supports: Markdown (.md), PDF (.pdf), Text (.txt) - Max 50MB per file
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".md,.pdf,.txt,.html,.json,text/markdown,application/pdf,text/plain,text/html,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Selected Files ({files.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((uploadFile, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {getFileIcon(uploadFile.file.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                      {uploadFile.error && (
                        <p className="text-xs text-red-500 mt-1">
                          {uploadFile.error}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(uploadFile.status)}
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-gray-200 rounded"
                        disabled={uploadFile.status === 'uploading'}
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Metadata */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (optional - will use filename if empty)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Document description"
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated, optional)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="workshop, documentation, draft"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-transparent"
              />
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Upload Progress</span>
                <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-digital-blue h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={uploadFiles}
            disabled={isUploading || files.length === 0 || !selectedFolder}
            className="px-6 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload {files.length} File{files.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
