import React, { useState, useEffect } from 'react';
import { X, Download, Edit, History, GitBranch, Save, FileText, FileImage, AlertCircle } from 'lucide-react';
import VersionedTextEditor from '../VersionedTextEditor/VersionedTextEditor';

interface Document {
  id: string;
  title: string;
  description: string;
  file_name: string;
  file_type: string;
  file_path: string;
  mime_type: string;
  version: number;
  is_latest: boolean;
  created_at: string;
  updated_at: string;
  metadata: any;
}

interface KnowledgeDocumentViewerProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (documentId: string, content: string, version: number, description?: string) => Promise<void>;
  onVersionSelect?: (documentId: string, version: number) => Promise<void>;
  projectId: string;
}

const KnowledgeDocumentViewer: React.FC<KnowledgeDocumentViewerProps> = ({
  document,
  isOpen,
  onClose,
  onSave,
  onVersionSelect,
  projectId
}) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    if (document && isOpen) {
      loadDocumentContent();
      loadDocumentVersions();
    }
  }, [document, isOpen]);

  const loadDocumentContent = async () => {
    if (!document) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api';
      
      const response = await fetch(`${API_BASE}/knowledge/documents/${document.id}/content`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContent(data.content || '');
      } else {
        throw new Error('Failed to load document content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentVersions = async () => {
    if (!document) return;
    
    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api';
      
      const response = await fetch(`${API_BASE}/knowledge/documents/${document.id}/versions`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVersions(data);
      }
    } catch (err) {
      console.error('Failed to load versions:', err);
    }
  };

  const handleSave = async (content: string, version: number, description?: string) => {
    if (!document || !onSave) return;
    
    try {
      await onSave(document.id, content, version, description);
      setIsEditing(false);
      await loadDocumentContent();
      await loadDocumentVersions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document');
    }
  };

  const handleDownload = () => {
    if (!document) return;
    
    const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
    const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api';
    
    fetch(`${API_BASE}/knowledge/documents/${document.id}/download`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(err => {
      setError('Failed to download document');
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-digital-blue"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64 text-red-500">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </div>
      );
    }

    if (document?.file_type === 'markdown') {
      return (
        <VersionedTextEditor
          initialContent={content}
          versions={versions.map(v => ({
            id: v.id,
            content: v.content || '',
            timestamp: new Date(v.created_at),
            version: v.version_number,
            description: v.change_summary,
            author: v.first_name && v.last_name ? `${v.first_name} ${v.last_name}` : 'Unknown'
          }))}
          title={document.title}
          readOnly={!isEditing}
          showVersionHistory={true}
          showCompareButton={true}
          showSaveButton={isEditing}
          onSave={isEditing ? handleSave : undefined}
          onVersionSelect={async (version) => {
            if (onVersionSelect) {
              await onVersionSelect(document.id, version.version);
              await loadDocumentContent();
            }
          }}
          className="h-full"
          editorClassName="min-h-[500px]"
        />
      );
    }

    if (document?.file_type === 'pdf') {
      return (
        <div className="h-full">
          <iframe
            src={`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api'}/knowledge/documents/${document.id}/view`}
            className="w-full h-full border-0"
            title={document.title}
          />
        </div>
      );
    }

    // Default text viewer
    return (
      <div className="h-full overflow-auto p-4">
        <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
      </div>
    );
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {document.file_type === 'markdown' && <FileText className="w-5 h-5 text-blue-500" />}
            {document.file_type === 'pdf' && <FileImage className="w-5 h-5 text-red-500" />}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{document.title}</h2>
              <p className="text-sm text-gray-500">{document.file_name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {document.file_type === 'markdown' && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-digital-blue text-white rounded hover:bg-blue-600 transition-colors"
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                <span>{isEditing ? 'Save' : 'Edit'}</span>
              </button>
            )}
            
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeDocumentViewer;
