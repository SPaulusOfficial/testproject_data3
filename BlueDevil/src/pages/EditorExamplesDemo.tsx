import React, { useState } from 'react';
import VersionedTextEditor, { Version } from '@/components/VersionedTextEditor/VersionedTextEditor';
import { Download, Share, Settings, Maximize2, Minimize2 } from 'lucide-react';

// Sample data
const sampleVersions: Version[] = [
  {
    id: 'v1',
    content: '<h1>Sample Document</h1><p>This is a <strong>sample document</strong> with some <em>formatted text</em>.</p>',
    timestamp: new Date('2024-01-01'),
    version: 1,
    description: 'Initial version',
    author: 'Demo User'
  },
  {
    id: 'v2',
    content: '<h1>Updated Sample Document</h1><p>This is an <strong>updated sample document</strong> with more <em>formatted text</em> and some improvements.</p><ul><li>Added more content</li><li>Better formatting</li></ul>',
    timestamp: new Date('2024-01-15'),
    version: 2,
    description: 'Added more content and formatting',
    author: 'Demo User'
  }
];

const EditorExamplesDemo: React.FC = () => {
  const [versions, setVersions] = useState<Version[]>(sampleVersions);

  const handleSave = async (content: string, version: number, description?: string): Promise<void> => {
    console.log('Saving version:', version, 'with description:', description);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newVersion: Version = {
      id: `v${version}`,
      content,
      timestamp: new Date(),
      version,
      description: description || `Version ${version}`,
      author: 'Demo User'
    };
    
    setVersions(prev => [...prev, newVersion]);
  };

  const handleVersionSelect = (version: Version) => {
    console.log('Selected version:', version);
  };

  const handleContentChange = (content: string) => {
    console.log('Content changed, length:', content.length);
  };

  const CustomActions = () => (
    <div className="flex items-center gap-2">
      <button className="p-1 text-gray-500 hover:text-gray-700" title="Download">
        <Download className="w-4 h-4" />
      </button>
      <button className="p-1 text-gray-500 hover:text-gray-700" title="Share">
        <Share className="w-4 h-4" />
      </button>
      <button className="p-1 text-gray-500 hover:text-gray-700" title="Settings">
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Editor Examples - Different Sizes
          </h1>
          <p className="text-gray-600">
            VersionedTextEditor in verschiedenen Größen und Konfigurationen
          </p>
        </div>

        {/* Large Editor */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Maximize2 className="w-5 h-5" />
            Large Editor (Full Height)
          </h2>
          <div className="h-[800px] bg-white rounded-lg shadow-sm border overflow-hidden">
            <VersionedTextEditor
              versions={versions}
              onSave={handleSave}
              onVersionSelect={handleVersionSelect}
              onContentChange={handleContentChange}
              title="Large Document Editor"
              placeholder="Start writing your large document..."
              enableAutoSave={true}
              autoSaveInterval={10000}
              allowDeleteVersions={true}
              customActions={<CustomActions />}
              className="border-2 border-blue-200"
              headerClassName="bg-blue-50"
            />
          </div>
        </div>

        {/* Medium Editor */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Medium Editor</h2>
          <div className="h-[600px] bg-white rounded-lg shadow-sm border overflow-hidden">
            <VersionedTextEditor
              versions={versions}
              onSave={handleSave}
              onVersionSelect={handleVersionSelect}
              onContentChange={handleContentChange}
              title="Medium Document Editor"
              placeholder="Medium sized editor..."
              enableAutoSave={false}
              allowDeleteVersions={false}
              className="border-2 border-green-200"
              headerClassName="bg-green-50"
            />
          </div>
        </div>

        {/* Small Editor */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Small Editor</h2>
          <div className="h-[500px] bg-white rounded-lg shadow-sm border overflow-hidden">
            <VersionedTextEditor
              versions={versions}
              onSave={handleSave}
              onVersionSelect={handleVersionSelect}
              onContentChange={handleContentChange}
              title="Small Document Editor"
              placeholder="Small editor for quick notes..."
              showVersionHistory={false}
              showCompareButton={false}
              className="border-2 border-purple-200"
              headerClassName="bg-purple-50"
            />
          </div>
        </div>

        {/* Mini Editor */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Minimize2 className="w-5 h-5" />
            Mini Editor
          </h2>
          <div className="h-[400px] bg-white rounded-lg shadow-sm border overflow-hidden">
            <VersionedTextEditor
              versions={versions}
              onSave={handleSave}
              onVersionSelect={handleVersionSelect}
              onContentChange={handleContentChange}
              title="Mini Editor"
              placeholder="Mini editor..."
              showVersionHistory={false}
              showCompareButton={false}
              showSaveButton={false}
              className="border-2 border-orange-200"
              headerClassName="bg-orange-50"
            />
          </div>
        </div>

        {/* Side by Side Editors */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Side by Side Editors</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[600px] bg-white rounded-lg shadow-sm border overflow-hidden">
              <VersionedTextEditor
                versions={versions}
                onSave={handleSave}
                onVersionSelect={handleVersionSelect}
                onContentChange={handleContentChange}
                title="Left Editor"
                placeholder="Left side editor..."
                className="border-2 border-red-200"
                headerClassName="bg-red-50"
              />
            </div>
            <div className="h-[600px] bg-white rounded-lg shadow-sm border overflow-hidden">
              <VersionedTextEditor
                versions={versions}
                onSave={handleSave}
                onVersionSelect={handleVersionSelect}
                onContentChange={handleContentChange}
                title="Right Editor"
                placeholder="Right side editor..."
                className="border-2 border-indigo-200"
                headerClassName="bg-indigo-50"
              />
            </div>
          </div>
        </div>

        {/* Read-only Examples */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Read-only Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-[500px] bg-white rounded-lg shadow-sm border overflow-hidden">
              <VersionedTextEditor
                versions={versions}
                onVersionSelect={handleVersionSelect}
                title="Read-only Viewer"
                readOnly={true}
                showSaveButton={false}
                className="border-2 border-gray-200"
                headerClassName="bg-gray-50"
              />
            </div>
            <div className="h-[500px] bg-white rounded-lg shadow-sm border overflow-hidden">
              <VersionedTextEditor
                versions={versions}
                onVersionSelect={handleVersionSelect}
                title="Document Preview"
                readOnly={true}
                showSaveButton={false}
                showVersionHistory={false}
                className="border-2 border-gray-200"
                headerClassName="bg-gray-50"
              />
            </div>
            <div className="h-[500px] bg-white rounded-lg shadow-sm border overflow-hidden">
              <VersionedTextEditor
                versions={versions}
                onVersionSelect={handleVersionSelect}
                title="Version History"
                readOnly={true}
                showSaveButton={false}
                showCompareButton={false}
                className="border-2 border-gray-200"
                headerClassName="bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Minimal Examples */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Minimal Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-[450px] bg-white rounded-lg shadow-sm border overflow-hidden">
              <VersionedTextEditor
                initialContent="<p>Simple editor without version history.</p>"
                title="Simple Editor"
                showVersionHistory={false}
                showCompareButton={false}
                onSave={handleSave}
                className="border-2 border-green-200"
                headerClassName="bg-green-50"
              />
            </div>
            <div className="h-[450px] bg-white rounded-lg shadow-sm border overflow-hidden">
              <VersionedTextEditor
                initialContent="<p>Auto-save editor.</p>"
                title="Auto-save Editor"
                showVersionHistory={false}
                showCompareButton={false}
                onSave={handleSave}
                enableAutoSave={true}
                autoSaveInterval={5000}
                className="border-2 border-blue-200"
                headerClassName="bg-blue-50"
              />
            </div>
          </div>
        </div>

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Verwendung:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Größen:</strong> Setze einfach die gewünschte Höhe auf dem Container (h-32, h-48, h-64, h-96)</p>
            <p><strong>Features:</strong> Alle Features können einzeln aktiviert/deaktiviert werden</p>
            <p><strong>Styling:</strong> Jeder Editor kann individuell gestylt werden</p>
            <p><strong>Responsive:</strong> Funktioniert auf allen Bildschirmgrößen</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorExamplesDemo;
