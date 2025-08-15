import React from 'react';
import VersionedTextEditorExample from '@/components/VersionedTextEditor/VersionedTextEditorExample';

const EditorExamplesFullDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            VersionedTextEditor - Full Examples
          </h1>
          <p className="text-gray-600">
            Vollständige Beispiele mit allen Features und Konfigurationen
          </p>
        </div>

        {/* Full Examples Component */}
        <VersionedTextEditorExample />

        {/* Additional Information */}
        <div className="mt-8 bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📚 Komponenten-Dokumentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Verfügbare Props:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>versions</code> - Array aller Versionen</li>
                <li>• <code>onSave</code> - Save Callback</li>
                <li>• <code>enableAutoSave</code> - Auto-Save aktivieren</li>
                <li>• <code>readOnly</code> - Read-only Modus</li>
                <li>• <code>showVersionHistory</code> - Version History anzeigen</li>
                <li>• <code>customActions</code> - Eigene Buttons</li>
                <li>• <code>className</code> - Custom Styling</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Features:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• WYSIWYG Editor mit TipTap</li>
                <li>• Semantisches Versioning</li>
                <li>• Auto-Save Funktionalität</li>
                <li>• Satz-für-Satz Merge</li>
                <li>• Responsive Design</li>
                <li>• TypeScript Support</li>
                <li>• Vollständig konfigurierbar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorExamplesFullDemo;
