import React, { useState, useEffect } from 'react';
import { 
  Save, 
  History, 
  GitCompare, 
  Plus, 
  FileText,
  Eye,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import VersionCompareModal from './VersionCompareModal';
import WYSIWYGEditor from './WYSIWYGEditor';

export interface Version {
  id: string;
  content: string;
  timestamp: Date;
  version: number;
  description?: string;
  author?: string;
  tags?: string[];
}

export interface VersionedTextEditorProps {
  // Content and versions
  initialContent?: string;
  versions?: Version[];
  currentVersionId?: string;
  
  // Configuration
  title?: string;
  placeholder?: string;
  readOnly?: boolean;
  showVersionHistory?: boolean;
  showCompareButton?: boolean;
  showSaveButton?: boolean;
  size?: 'xsmall' | 'small' | 'normal';
  
  // Callbacks
  onSave?: (content: string, version: number, description?: string) => Promise<void>;
  onVersionSelect?: (version: Version) => void;
  onContentChange?: (content: string) => void;
  onCompare?: (oldVersion: Version, newVersion: Version) => void;
  onMerge?: (mergedContent: string, oldVersion: Version, newVersion: Version) => Promise<void>;
  
  // Styling
  className?: string;
  headerClassName?: string;
  editorClassName?: string;
  sidebarClassName?: string;
  
  // Features
  enableAutoSave?: boolean;
  autoSaveInterval?: number; // in milliseconds
  maxVersions?: number;
  allowDeleteVersions?: boolean;
  
  // Custom actions
  customActions?: React.ReactNode;
}

const VersionedTextEditor: React.FC<VersionedTextEditorProps> = ({
  // Content and versions
  initialContent = '',
  versions = [],
  currentVersionId,
  
  // Configuration
  title = 'Document Editor',
  placeholder = 'Start writing...',
  readOnly = false,
  showVersionHistory = true,
  showCompareButton = true,
  showSaveButton = true,
  size = 'normal',
  
  // Callbacks
  onSave,
  onVersionSelect,
  onContentChange,
  onCompare,
  onMerge,
  
  // Styling
  className = '',
  headerClassName = '',
  editorClassName = '',
  sidebarClassName = '',
  
  // Features
  enableAutoSave = false,
  autoSaveInterval = 30000, // 30 seconds
  maxVersions = 50,
  allowDeleteVersions = false,
  
  // Custom actions
  customActions
}) => {
  // Size configuration
  const getSizeConfig = () => {
    switch (size) {
      case 'xsmall':
        return {
          headerPadding: 'p-2',
          headerIconSize: 'w-2.5 h-2.5',
          headerTextSize: 'text-xs',
          headerGap: 'gap-1',
          sidebarPadding: 'p-1',
          sidebarIconSize: 'w-2.5 h-2.5',
          sidebarTextSize: 'text-xs',
          versionItemPadding: 'p-1',
          versionItemGap: 'gap-0.5',
          versionItemIconSize: 'w-2.5 h-2.5',
          versionItemTextSize: 'text-xs',
          buttonPadding: 'p-1',
          buttonIconSize: 'w-2.5 h-2.5',
          versionListGap: 'space-y-1'
        };
      case 'small':
        return {
          headerPadding: 'p-2.5',
          headerIconSize: 'w-3 h-3',
          headerTextSize: 'text-sm',
          headerGap: 'gap-1.5',
          sidebarPadding: 'p-1.5',
          sidebarIconSize: 'w-3 h-3',
          sidebarTextSize: 'text-sm',
          versionItemPadding: 'p-1.5',
          versionItemGap: 'gap-1',
          versionItemIconSize: 'w-3 h-3',
          versionItemTextSize: 'text-sm',
          buttonPadding: 'p-1.5',
          buttonIconSize: 'w-3 h-3',
          versionListGap: 'space-y-1.5'
        };
      case 'normal':
      default:
        return {
          headerPadding: 'p-3',
          headerIconSize: 'w-3.5 h-3.5',
          headerTextSize: 'text-sm',
          headerGap: 'gap-2',
          sidebarPadding: 'p-2',
          sidebarIconSize: 'w-3.5 h-3.5',
          sidebarTextSize: 'text-sm',
          versionItemPadding: 'p-2',
          versionItemGap: 'gap-1.5',
          versionItemIconSize: 'w-3.5 h-3.5',
          versionItemTextSize: 'text-sm',
          buttonPadding: 'p-2',
          buttonIconSize: 'w-3.5 h-3.5',
          versionListGap: 'space-y-2'
        };
    }
  };

  const sizeConfig = getSizeConfig();

  // State management
  const [content, setContent] = useState(initialContent);
  const [localVersions, setLocalVersions] = useState<Version[]>(versions);
  const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [isVersionHistoryExpanded, setIsVersionHistoryExpanded] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date>(new Date());

  // Initialize current version
  useEffect(() => {
    if (currentVersionId) {
      const version = localVersions.find(v => v.id === currentVersionId);
      if (version) {
        setCurrentVersion(version);
        setContent(version.content);
      }
    } else if (localVersions.length > 0) {
      setCurrentVersion(localVersions[localVersions.length - 1]);
      setContent(localVersions[localVersions.length - 1].content);
    } else {
      // Create initial version if none exists
      const initialVersion: Version = {
        id: 'v1',
        content: initialContent,
        timestamp: new Date(),
        version: 1,
        description: 'Initial version'
      };
      setLocalVersions([initialVersion]);
      setCurrentVersion(initialVersion);
    }
  }, [currentVersionId, localVersions, initialContent]);

  // Auto-save functionality
  useEffect(() => {
    if (!enableAutoSave || !onSave || readOnly) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeSinceLastSave = now.getTime() - lastAutoSave.getTime();
      
      if (timeSinceLastSave >= autoSaveInterval && content !== currentVersion?.content) {
        handleAutoSave();
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [enableAutoSave, onSave, readOnly, content, currentVersion, lastAutoSave, autoSaveInterval]);

  // Update content when current version changes
  useEffect(() => {
    if (currentVersion) {
      setContent(currentVersion.content);
    }
  }, [currentVersion]);

  // Notify parent of content changes
  useEffect(() => {
    if (onContentChange) {
      onContentChange(content);
    }
  }, [content, onContentChange]);

  const handleAutoSave = async () => {
    if (!onSave || readOnly) return;
    
    try {
      setIsSaving(true);
      const newVersionNumber = localVersions.length + 1;
      await onSave(content, newVersionNumber, 'Auto-save');
      setLastAutoSave(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!onSave || readOnly) return;
    
    setIsSaving(true);
    
    try {
      const newVersionNumber = localVersions.length + 1;
      await onSave(content, newVersionNumber, `Version ${newVersionNumber}`);
      
      // Update local state if save was successful
      const newVersion: Version = {
        id: `v${newVersionNumber}`,
        content: content,
        timestamp: new Date(),
        version: newVersionNumber,
        description: `Version ${newVersionNumber}`
      };
      
      setLocalVersions(prev => {
        const updated = [...prev, newVersion];
        // Remove old versions if maxVersions is exceeded
        if (maxVersions && updated.length > maxVersions) {
          return updated.slice(-maxVersions);
        }
        return updated;
      });
      
      setCurrentVersion(newVersion);
      
      if (onVersionSelect) {
        onVersionSelect(newVersion);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVersionSelect = (version: Version) => {
    setContent(version.content);
    setCurrentVersion(version);
    
    if (onVersionSelect) {
      onVersionSelect(version);
    }
  };

  const handleDeleteVersion = (versionId: string) => {
    if (!allowDeleteVersions) return;
    
    setLocalVersions(prev => prev.filter(v => v.id !== versionId));
    
    // If we deleted the current version, switch to the latest
    if (currentVersion?.id === versionId) {
      const remainingVersions = localVersions.filter(v => v.id !== versionId);
      if (remainingVersions.length > 0) {
        const latestVersion = remainingVersions[remainingVersions.length - 1];
        handleVersionSelect(latestVersion);
      }
    }
  };

  const openCompareModal = (version: Version) => {
    setSelectedVersion(version);
    setShowCompareModal(true);
  };

  const handleCompare = (oldVersion: Version, newVersion: Version) => {
    if (onCompare) {
      onCompare(oldVersion, newVersion);
    }
  };

  const handleMerge = async (mergedContent: string, oldVersion: Version, newVersion: Version) => {
    if (onMerge) {
      await onMerge(mergedContent, oldVersion, newVersion);
    }
    setShowCompareModal(false);
  };

  return (
    <div className={`h-full flex flex-col bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
                              <div className={`flex items-center justify-between ${sizeConfig.headerPadding} border-b bg-gray-50 ${headerClassName}`}>
            <div className={`flex items-center ${sizeConfig.headerGap}`}>
              <FileText className={`${sizeConfig.headerIconSize} text-blue-600`} />
              <h2 className={`${sizeConfig.headerTextSize} font-medium text-gray-800`}>{title}</h2>
              <span className="text-xs text-gray-500">
              Version {currentVersion?.version}
            </span>
            {enableAutoSave && (
              <span className="text-xs text-green-600">Auto-save</span>
            )}
          </div>
        
        <div className="flex items-center gap-2">
          {customActions}
          <span className="text-xs text-gray-500">
            {isSaving ? 'Saving...' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex">
        {/* Main Editor */}
        <div className={`flex-1 flex flex-col ${editorClassName}`}>
          <WYSIWYGEditor
            content={content}
            onChange={setContent}
            placeholder={placeholder}
            size={size}
          />
        </div>

        {/* Version History Sidebar - Collapsible */}
        {showVersionHistory && (
                    <div className={`border-l bg-gray-50 flex flex-col items-center py-4 ${sidebarClassName}`}>
            {/* Version History Toggle */}
            <button
              onClick={() => setIsVersionHistoryExpanded(!isVersionHistoryExpanded)}
              className={`${sizeConfig.buttonPadding} rounded-lg hover:bg-gray-200 transition-colors mb-2`}
              title="Version History"
            >
              <History className={`${sizeConfig.buttonIconSize} text-gray-600`} />
            </button>
            
            {/* Save Version Button */}
            {showSaveButton && !readOnly && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`${sizeConfig.buttonPadding} rounded-lg hover:bg-gray-200 transition-colors mb-2`}
                title="Save Version"
              >
                <Save className={`${sizeConfig.buttonIconSize} text-gray-600`} />
            </button>
            )}
            
            {/* Compare Button */}
            {showCompareButton && localVersions.length > 1 && (
              <button
                onClick={() => setShowCompareModal(true)}
                className={`${sizeConfig.buttonPadding} rounded-lg hover:bg-gray-200 transition-colors`}
                title="Compare Versions"
              >
                <GitCompare className={`${sizeConfig.buttonIconSize} text-gray-600`} />
              </button>
            )}
          </div>
        )}

        {/* Expanded Version History */}
        {showVersionHistory && isVersionHistoryExpanded && (
          <div className={`w-64 border-l bg-gray-50 ${sizeConfig.sidebarPadding}`}>
            <div className={`flex items-center justify-between mb-2`}>
              <h3 className={`${sizeConfig.sidebarTextSize} font-medium text-gray-800`}>Version History</h3>
              <button
                onClick={() => setIsVersionHistoryExpanded(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className={`${sizeConfig.sidebarIconSize}`} />
              </button>
            </div>
            
            <div className={sizeConfig.versionListGap}>
              {localVersions.map((version) => (
                <div
                  key={version.id}
                  className={`${sizeConfig.versionItemPadding} rounded-lg border cursor-pointer transition-colors ${
                    currentVersion?.id === version.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`flex items-center justify-between mb-1`}>
                    <span className={`font-medium ${sizeConfig.versionItemTextSize}`}>Version {version.version}</span>
                                         <div className={`flex items-center ${sizeConfig.versionItemGap}`}>
                       {currentVersion?.id === version.id && (
                         <Check className={`${sizeConfig.versionItemIconSize} text-blue-600`} />
                       )}
                       {allowDeleteVersions && localVersions.length > 1 && (
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             handleDeleteVersion(version.id);
                           }}
                           className="text-red-500 hover:text-red-700"
                           title="Delete Version"
                         >
                           <X className="w-2 h-2" />
                         </button>
                       )}
                     </div>
                  </div>
                  
                  <div className={`${sizeConfig.versionItemTextSize} text-gray-500 mb-1`}>
                    {version.timestamp.toLocaleString()}
                    {version.author && ` • ${version.author}`}
                  </div>
                  
                  {version.description && (
                    <div className={`${sizeConfig.versionItemTextSize} text-gray-600 mb-1`}>
                      {version.description}
                    </div>
                  )}
                  
                  <div className={`${sizeConfig.versionItemTextSize} text-gray-600 line-clamp-2 mb-1`}>
                    {version.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </div>
                  
                  {version.tags && version.tags.length > 0 && (
                    <div className={`flex flex-wrap ${sizeConfig.versionItemGap} mt-1`}>
                      {version.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`${sizeConfig.versionItemTextSize} px-2 py-1 bg-gray-100 text-gray-600 rounded`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className={`flex ${sizeConfig.versionItemGap} mt-1`}>
                    <button
                      onClick={() => handleVersionSelect(version)}
                      className={`${sizeConfig.versionItemTextSize} px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200`}
                    >
                      Load
                    </button>
                    {showCompareButton && (
                      <button
                        onClick={() => openCompareModal(version)}
                        className={`${sizeConfig.versionItemTextSize} px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200`}
                      >
                        Compare
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compare Modal */}
      {showCompareModal && (
        <VersionCompareModal
          currentVersion={currentVersion}
          selectedVersion={selectedVersion}
          versions={localVersions}
          onClose={() => {
            setShowCompareModal(false);
            setSelectedVersion(null);
          }}
          onVersionSelect={setSelectedVersion}
          onCompare={handleCompare}
          onMerge={handleMerge}
        />
      )}
    </div>
  );
};

export default VersionedTextEditor;
