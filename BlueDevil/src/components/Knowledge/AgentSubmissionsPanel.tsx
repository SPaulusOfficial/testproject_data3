import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText,
  Calendar,
  User
} from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { PermissionGuard } from '@/components/PermissionGuard'

interface AgentSubmission {
  id: string
  agent_id: string
  agent_name: string
  submission_type: string
  title: string
  content: string
  file_name: string
  status: string
  created_at: string
  processed_at: string
  first_name: string
  last_name: string
  metadata: any
}

interface AgentSubmissionsPanelProps {
  projectId?: string
}

export default function AgentSubmissionsPanel({ projectId }: AgentSubmissionsPanelProps) {
  const [submissions, setSubmissions] = useState<AgentSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('pending')
  const { canAccessKnowledge } = usePermissions()

  useEffect(() => {
    if (projectId) {
      loadSubmissions()
    }
  }, [projectId, selectedStatus])

  const loadSubmissions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.append('project_id', projectId!)
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus)
      }

      const response = await fetch(`/api/knowledge/agent-submissions?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load agent submissions')
      }

      const data = await response.json()
      setSubmissions(data)
    } catch (error) {
      console.error('Error loading agent submissions:', error)
      setError('Failed to load agent submissions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcessSubmission = async (submissionId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/knowledge/agent-submissions/${submissionId}/process?project_id=${projectId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        loadSubmissions()
      } else {
        alert('Failed to process submission')
      }
    } catch (error) {
      console.error('Error processing submission:', error)
      alert('Failed to process submission')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processed':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
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
          onClick={loadSubmissions}
          className="text-digital-blue text-sm hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-digital-blue" />
          <h3 className="text-lg font-semibold text-black">Agent Submissions</h3>
        </div>
        
        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-transparent text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processed">Processed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Submissions List */}
      <div className="flex-1 overflow-y-auto p-4">
        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions</h3>
            <p className="text-gray-500">
              {selectedStatus === 'all' 
                ? 'No agent submissions yet'
                : `No ${selectedStatus} submissions`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map(submission => (
              <div
                key={submission.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(submission.status)}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(submission.created_at)}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {submission.title}
                </h4>

                {/* Agent Info */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <User size={14} />
                  <span>{submission.agent_name || submission.agent_id}</span>
                  <span>•</span>
                  <span className="capitalize">{submission.submission_type}</span>
                </div>

                {/* Content Preview */}
                {submission.content && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {submission.content}
                  </p>
                )}

                {/* File Info */}
                {submission.file_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <FileText size={14} />
                    <span>{submission.file_name}</span>
                  </div>
                )}

                {/* Actions */}
                {submission.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <PermissionGuard permission="Knowledge" action="process_agent_submissions">
                      <button
                        onClick={() => handleProcessSubmission(submission.id, 'approve')}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleProcessSubmission(submission.id, 'reject')}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                    </PermissionGuard>
                  </div>
                )}

                {/* Processed Info */}
                {submission.status !== 'pending' && submission.processed_at && (
                  <div className="text-xs text-gray-500 mt-2">
                    {submission.status === 'processed' ? 'Approved' : 'Rejected'} by{' '}
                    {submission.first_name} {submission.last_name} on{' '}
                    {formatDate(submission.processed_at)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
