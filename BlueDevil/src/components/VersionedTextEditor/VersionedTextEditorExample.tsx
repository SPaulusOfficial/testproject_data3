import React, { useState } from 'react';
import VersionedTextEditor, { Version, VersionedTextEditorProps } from './VersionedTextEditor';
import { Download, Share, Settings } from 'lucide-react';

// Example data
const sampleVersions: Version[] = [
  {
    id: 'v1',
    content: '<h1>Initial Document</h1><p>This is the first version of the document.</p>',
    timestamp: new Date('2024-01-01'),
    version: 1,
    description: 'Initial version',
    author: 'John Doe',
    tags: ['draft', 'initial']
  },
  {
    id: 'v2',
    content: '<h1>Updated Document</h1><p>This is the <strong>second</strong> version with some improvements.</p><ul><li>Added formatting</li><li>Better structure</li></ul>',
    timestamp: new Date('2024-01-15'),
    version: 2,
    description: 'Added formatting and structure',
    author: 'Jane Smith',
    tags: ['reviewed', 'formatted']
  },
  {
    id: 'v3',
    content: '<h1>Final Document</h1><p>This is the <strong>final</strong> version with all improvements.</p><ul><li>Added formatting</li><li>Better structure</li><li>Final review completed</li></ul><blockquote><p>Important note: This version has been approved.</p></blockquote>',
    timestamp: new Date('2024-02-01'),
    version: 3,
    description: 'Final approved version',
    author: 'Admin User',
    tags: ['approved', 'final']
  }
];

const VersionedTextEditorExample: React.FC = () => {
  const [versions, setVersions] = useState<Version[]>(sampleVersions);
  const [currentVersionId, setCurrentVersionId] = useState<string>('v3');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

  // Example save handler
  const handleSave = async (content: string, version: number, description?: string): Promise<void> => {
    console.log('Saving version:', version, 'with description:', description);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newVersion: Version = {
      id: `v${version}`,
      content,
      timestamp: new Date(),
      version,
      description: description || `Version ${version}`,
      author: 'Current User',
      tags: ['auto-saved']
    };
    
    setVersions(prev => [...prev, newVersion]);
    setCurrentVersionId(newVersion.id);
  };

  // Example version select handler
  const handleVersionSelect = (version: Version) => {
    console.log('Selected version:', version);
    setCurrentVersionId(version.id);
  };

  // Example content change handler
  const handleContentChange = (content: string) => {
    console.log('Content changed, length:', content.length);
  };

  // Example compare handler
  const handleCompare = (oldVersion: Version, newVersion: Version) => {
    console.log('Comparing versions:', oldVersion.version, 'vs', newVersion.version);
  };

  // Example merge handler
  const handleMerge = async (mergedContent: string, oldVersion: Version, newVersion: Version): Promise<void> => {
    console.log('Merging versions:', oldVersion.version, 'and', newVersion.version);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mergedVersion: Version = {
      id: `v${versions.length + 1}`,
      content: mergedContent,
      timestamp: new Date(),
      version: versions.length + 1,
      description: `Merged from v${oldVersion.version} and v${newVersion.version}`,
      author: 'Current User',
      tags: ['merged']
    };
    
    setVersions(prev => [...prev, mergedVersion]);
    setCurrentVersionId(mergedVersion.id);
  };

  // Custom actions component
  const CustomActions = () => (
    <div className="flex items-center gap-2">
      <button
        className="p-1 text-gray-500 hover:text-gray-700"
        title="Download"
      >
        <Download className="w-4 h-4" />
      </button>
      <button
        className="p-1 text-gray-500 hover:text-gray-700"
        title="Share"
      >
        <Share className="w-4 h-4" />
      </button>
      <button
        className="p-1 text-gray-500 hover:text-gray-700"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-semibold mb-3">Configuration</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Enable Auto-save</span>
          </label>
          <span className="text-sm text-gray-500">
            Current Version: {currentVersionId}
          </span>
          <span className="text-sm text-gray-500">
            Total Versions: {versions.length}
          </span>
        </div>
      </div>

      {/* Main Editor - Normal Size */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Main Editor (Normal Size)</h3>
        <div className="h-96 border rounded-lg">
          <VersionedTextEditor
            // Content and versions
            initialContent="<h1>Start writing...</h1>"
            versions={versions}
            currentVersionId={currentVersionId}
            
            // Configuration
            title="Document Editor Example"
            placeholder="Start writing your document..."
            readOnly={false}
            showVersionHistory={true}
            showCompareButton={true}
            showSaveButton={true}
            size="normal"
            
            // Callbacks
            onSave={handleSave}
            onVersionSelect={handleVersionSelect}
            onContentChange={handleContentChange}
            onCompare={handleCompare}
            onMerge={handleMerge}
            
            // Features
            enableAutoSave={autoSaveEnabled}
            autoSaveInterval={10000} // 10 seconds
            maxVersions={20}
            allowDeleteVersions={true}
            
            // Custom actions
            customActions={<CustomActions />}
            
            // Styling
            className="border-2 border-blue-200"
            headerClassName="bg-blue-50"
          />
        </div>
      </div>

      {/* Small Editor */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Small Editor</h3>
        <div className="h-80 border rounded-lg">
          <VersionedTextEditor
            // Content and versions
            initialContent="<h1>Start writing...</h1>"
            versions={versions}
            currentVersionId={currentVersionId}
            
            // Configuration
            title="Small Document Editor"
            placeholder="Start writing your document..."
            readOnly={false}
            showVersionHistory={true}
            showCompareButton={true}
            showSaveButton={true}
            size="small"
            
            // Callbacks
            onSave={handleSave}
            onVersionSelect={handleVersionSelect}
            onContentChange={handleContentChange}
            onCompare={handleCompare}
            onMerge={handleMerge}
            
            // Features
            enableAutoSave={autoSaveEnabled}
            autoSaveInterval={10000}
            maxVersions={20}
            allowDeleteVersions={true}
            
            // Styling
            className="border-2 border-green-200"
            headerClassName="bg-green-50"
          />
        </div>
      </div>

      {/* XSmall Editor */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Extra Small Editor</h3>
        <div className="h-64 border rounded-lg">
          <VersionedTextEditor
            // Content and versions
            initialContent="<h1>Start writing...</h1>"
            versions={versions}
            currentVersionId={currentVersionId}
            
            // Configuration
            title="Compact Document Editor"
            placeholder="Start writing your document..."
            readOnly={false}
            showVersionHistory={true}
            showCompareButton={true}
            showSaveButton={true}
            size="xsmall"
            
            // Callbacks
            onSave={handleSave}
            onVersionSelect={handleVersionSelect}
            onContentChange={handleContentChange}
            onCompare={handleCompare}
            onMerge={handleMerge}
            
            // Features
            enableAutoSave={autoSaveEnabled}
            autoSaveInterval={10000}
            maxVersions={20}
            allowDeleteVersions={true}
            
            // Styling
            className="border-2 border-purple-200"
            headerClassName="bg-purple-50"
          />
        </div>
      </div>

      {/* Read-only Example */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-semibold mb-3">Read-only Example</h3>
        <div className="h-64">
          <VersionedTextEditor
            versions={versions}
            currentVersionId="v3"
            title="Read-only Document"
            size="normal"
            readOnly={true}
            showSaveButton={false}
            showCompareButton={true}
            onVersionSelect={handleVersionSelect}
            className="border-2 border-gray-200"
            headerClassName="bg-gray-50"
          />
        </div>
      </div>

      {/* Minimal Example */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-semibold mb-3">Minimal Example (No Version History)</h3>
        <div className="h-64">
          <VersionedTextEditor
            initialContent="<p>Simple editor without version history.</p>"
            title="Simple Editor"
            size="normal"
            showVersionHistory={false}
            showCompareButton={false}
            onSave={handleSave}
            className="border-2 border-green-200"
            headerClassName="bg-green-50"
          />
        </div>
      </div>
    </div>
  );
};

export default VersionedTextEditorExample;
