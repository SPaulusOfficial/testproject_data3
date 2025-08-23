import React, { useState, useEffect } from 'react';
import { X, Download, Edit, History, GitBranch, Save, FileText, FileImage, AlertCircle, GitCommit, GitCompare, Sparkles } from 'lucide-react';
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentVersionId, setCurrentVersionId] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (document && isOpen) {
      console.log('🔄 KnowledgeDocumentViewer - Document opened, loading data...');
      
      // Always load versions when document opens
      console.log('🔄 KnowledgeDocumentViewer - About to load versions');
      loadDocumentVersions();
      
      // Only load content on initial load and when not editing
      if (isInitialLoad && !isEditing && !hasUnsavedChanges) {
        console.log('🔄 KnowledgeDocumentViewer - Loading content on initial load');
        loadDocumentContent();
        setIsInitialLoad(false);
      }
      
      // Load PDF if it's a PDF document
      if (document.file_type === 'pdf') {
        loadPdfDocument();
      }
    }
    
    // Reset initial load when document changes
    return () => {
      if (document) {
        setIsInitialLoad(true);
      }
    };
    
    // Cleanup function to revoke blob URL
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [document, isOpen]);

  const loadDocumentContent = async () => {
    if (!document) return;
    
    const timestamp = new Date().toISOString();
    console.log(`🔐 [${timestamp}] loadDocumentContent - START - documentId: ${document.id}`);
    
    setLoading(true);
    setError(null);
    
    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api';
      
      console.log(`🔐 [${timestamp}] loadDocumentContent - authToken:`, authToken ? 'present' : 'missing');
      console.log(`🔐 [${timestamp}] loadDocumentContent - projectId:`, projectId);
      console.log(`🔐 [${timestamp}] loadDocumentContent - documentId:`, document.id);
      
      const response = await fetch(`${API_BASE}/knowledge/documents/${document.id}/content?project_id=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`🔐 [${timestamp}] loadDocumentContent - response status:`, response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`🔐 [${timestamp}] loadDocumentContent - Content from server:`, data.content?.substring(0, 200));
        console.log(`🔐 [${timestamp}] loadDocumentContent - Content contains HTML:`, data.content?.includes('<'));
        console.log(`🔐 [${timestamp}] loadDocumentContent - Content contains markdown:`, data.content?.includes('#'));
        console.log(`🔐 [${timestamp}] loadDocumentContent - Content length:`, data.content?.length || 0);
        setContent(data.content || '');
        console.log(`🔐 [${timestamp}] loadDocumentContent - Content set successfully`);
      } else {
        const errorData = await response.json();
        console.error(`🔐 [${timestamp}] loadDocumentContent - error response:`, errorData);
        throw new Error(errorData.error || 'Failed to load document content');
      }
    } catch (err) {
      console.error('🔐 loadDocumentContent - catch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentVersions = async () => {
    if (!document) return;
    
    const timestamp = new Date().toISOString();
    console.log(`🔐 [${timestamp}] loadDocumentVersions - START - documentId: ${document.id}`);
    
    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api';
      
      console.log(`🔐 [${timestamp}] loadDocumentVersions - authToken:`, authToken ? 'present' : 'missing');
      console.log(`🔐 [${timestamp}] loadDocumentVersions - projectId:`, projectId);
      console.log(`🔐 [${timestamp}] loadDocumentVersions - documentId:`, document.id);
      
      const response = await fetch(`${API_BASE}/knowledge/documents/${document.id}/versions?project_id=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`🔐 [${timestamp}] loadDocumentVersions - response status:`, response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`🔐 [${timestamp}] loadDocumentVersions - raw data:`, data);
        
        // Transform versions to match VersionedTextEditor format
        const transformedVersions = data.map((v: any, index: number) => ({
          id: v.commit_hash || v.id || `v${index + 1}`, // Use commit hash as ID
          commitHash: v.commit_hash || v.id, // Store the real Git commit hash
          version: v.version_number || index + 1,
          timestamp: new Date(v.created_at),
          author: v.first_name && v.last_name ? `${v.first_name} ${v.last_name}` : v.author || v.email || 'Unknown',
          description: v.change_summary || `Version ${v.version_number || index + 1}`,
          tags: v.tags ? v.tags.split(',').map((t: string) => t.trim()) : [],
          content: v.content || '',
          diffStats: { added: 0, removed: 0, changed: 0 }
        })).sort((a, b) => b.version - a.version); // Sort by version number descending (latest first)
        
        console.log(`🔐 [${timestamp}] loadDocumentVersions - transformed versions:`, transformedVersions);
        setVersions(transformedVersions);
        
        // Set current version to the latest version
        if (transformedVersions.length > 0) {
          setCurrentVersionId(transformedVersions[0].id);
        }
        
        console.log(`🔐 [${timestamp}] loadDocumentVersions - versions set successfully`);
        
        // Update current version display
        if (transformedVersions.length > 0) {
          const latestVersion = transformedVersions[0]; // First one is the latest
          console.log(`🔐 [${timestamp}] loadDocumentVersions - latest version:`, latestVersion);
          
          // Set current version to the latest version
          setCurrentVersionId(latestVersion.id);
        }
      } else {
        const errorData = await response.json();
        console.error('🔐 loadDocumentVersions - error response:', errorData);
      }
    } catch (err) {
      console.error('🔐 loadDocumentVersions - catch error:', err);
    }
  };

  const handleSave = async (content: string, version: number, description?: string) => {
    if (!document) return;
    
    // Use the content from the parameter, not the state
    const contentToSave = content || '';
    
    setIsSaving(true);
    
    try {
      console.log('💾 handleSave - Starting save process...');
      console.log('💾 handleSave - documentId:', document.id);
      console.log('💾 handleSave - projectId:', projectId);
      console.log('💾 handleSave - content length:', contentToSave.length);
      console.log('💾 handleSave - content preview:', contentToSave.substring(0, 100));
      console.log('💾 handleSave - description:', description);
      
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api';
      
      // Create new version
      const response = await fetch(`${API_BASE}/knowledge/documents/${document.id}/versions?project_id=${projectId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: contentToSave,
          change_summary: description || `Version ${version} - Updated content`,
          version_number: version
        })
      });
      
      console.log('💾 handleSave - response status:', response.status);
      
      if (response.ok) {
        const savedVersion = await response.json();
        console.log('💾 handleSave - Version saved successfully:', savedVersion);
        
        // Update local state
        setIsEditing(false);
        setHasUnsavedChanges(false);
        
        // Update content with the saved content
        setContent(contentToSave);
        
        // Reset initial load flag to allow future loads
        setIsInitialLoad(true);
        
        // Reload versions to get the new version
        await loadDocumentVersions();
        
        // Force re-render of VersionedTextEditor with new versions
        setVersions(prevVersions => [...prevVersions]);
        
        console.log('💾 handleSave - Save process completed successfully');
      } else {
        const errorData = await response.json();
        console.error('💾 handleSave - error response:', errorData);
        throw new Error(errorData.message || 'Failed to save document');
      }
    } catch (err) {
      console.error('💾 handleSave - catch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    console.log('🔄 handleContentChange - Content changed, length:', newContent.length);
    setContent(newContent);
    setHasUnsavedChanges(true);
    // Prevent auto-reload when user is editing
    setIsInitialLoad(false);
  };

  const loadPdfDocument = async () => {
    if (!document) return;
    
    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api';
      
      console.log('📄 loadPdfDocument - Loading PDF...');
      
      const response = await fetch(`${API_BASE}/knowledge/documents/${document.id}/view?project_id=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/pdf'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        console.log('📄 loadPdfDocument - PDF loaded successfully');
      } else {
        console.error('📄 loadPdfDocument - Failed to load PDF:', response.status);
        setPdfUrl(null);
      }
    } catch (err) {
      console.error('📄 loadPdfDocument - Error:', err);
      setPdfUrl(null);
    }
  };

  const handleDownload = () => {
    if (!document) return;
    
    const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
    const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api';
    
    console.log('📥 handleDownload - Starting download...');
    console.log('📥 handleDownload - documentId:', document.id);
    console.log('📥 handleDownload - projectId:', projectId);
    console.log('📥 handleDownload - fileName:', document.file_name);
    
    fetch(`${API_BASE}/knowledge/documents/${document.id}/download?project_id=${projectId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    .then(response => {
      console.log('📥 handleDownload - response status:', response.status);
      console.log('📥 handleDownload - response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.blob();
    })
    .then(blob => {
      console.log('📥 handleDownload - blob size:', blob.size);
      console.log('📥 handleDownload - blob type:', blob.type);
      
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name || 'document.pdf';
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      
      console.log('📥 handleDownload - Download completed successfully');
    })
    .catch(err => {
      console.error('📥 handleDownload - Error:', err);
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
        <div className="h-full flex flex-col">
          {/* VersionedTextEditor Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <GitCommit className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Version Control</span>
              </div>
              <div className="flex items-center space-x-2">
                <GitCompare className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">{versions.length} versions (Latest: {versions.length > 0 ? versions[0].version : 'N/A'})</span>
              </div>
              {hasUnsavedChanges && (
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span className="text-sm text-orange-600">Unsaved changes</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={async () => {
                  if (isEditing) {
                    // Save the current content
                    await handleSave(content, (versions.length > 0 ? versions[0].version : 0) + 1, 'Manual save');
                  } else {
                    // Switch to edit mode
                    setIsEditing(true);
                  }
                }}
                disabled={isSaving}
                className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded transition-colors ${
                  isEditing 
                    ? 'bg-green-500 text-white hover:bg-green-600 disabled:bg-green-400' 
                    : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isEditing && isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    <span>{isEditing ? 'Save' : 'Edit'}</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setIsEditing(false)}
                className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded transition-colors ${
                  !isEditing 
                    ? 'bg-gray-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Read</span>
              </button>
            </div>
          </div>
          
          {/* VersionedTextEditor Content */}
          <div className="flex-1 overflow-hidden">
            <VersionedTextEditor
              initialContent={content}
              versions={versions}
              title={document.title}
              readOnly={!isEditing}
              showVersionHistory={true}
              showCompareButton={true}
              showSaveButton={isEditing}
              onSave={isEditing ? handleSave : undefined}
              onContentChange={handleContentChange}
              documentId={document.id}
              projectId={projectId}
              onVersionSelect={async (version) => {
                const timestamp = new Date().toISOString();
                console.log(`🔄 [${timestamp}] onVersionSelect - START - version:`, version);
                
                // Load content for specific Git commit
                try {
                  const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
                  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api';
                  
                  // Use the real Git commit hash, not the frontend ID
                  const commitHash = (version as any).commitHash || version.id;
                  console.log(`🔄 [${timestamp}] onVersionSelect - Loading content for commit:`, commitHash);
                  
                  const response = await fetch(
                    `${API_BASE}/knowledge/documents/${document.id}/content?project_id=${projectId}&version=${commitHash}`,
                    {
                      headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                      }
                    }
                  );
                  
                  if (response.ok) {
                    const data = await response.json();
                    setContent(data.content || '');
                    setCurrentVersionId(version.id); // Set the current version ID
                    console.log('🔄 onVersionSelect - Content loaded successfully, length:', data.content?.length || 0);
                  } else {
                    console.error('🔄 onVersionSelect - Failed to load version content:', response.status);
                    // Fallback to version content if API fails
                    setContent(version.content || '');
                    setCurrentVersionId(version.id); // Set the current version ID even on fallback
                  }
                } catch (error) {
                  console.error('🔄 onVersionSelect - Error loading version content:', error);
                  // Fallback to version content if API fails
                  setContent(version.content || '');
                  setCurrentVersionId(version.id); // Set the current version ID even on error
                }
              }}
              currentVersionId={currentVersionId}
              className="h-full"
              editorClassName="h-full overflow-y-auto"
            />
          </div>
        </div>
      );
    }

    if (document?.file_type === 'pdf') {
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <FileImage className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-gray-700">PDF Viewer</span>
            </div>
          </div>
          <div className="flex-1 bg-gray-100">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={document.title}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">PDF wird geladen...</p>
                  <button
                    onClick={loadPdfDocument}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    PDF erneut laden
                  </button>
                </div>
              </div>
            )}
          </div>
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
