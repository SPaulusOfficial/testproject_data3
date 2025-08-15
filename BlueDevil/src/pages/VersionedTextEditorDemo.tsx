import React, { useState } from 'react';
import VersionedTextEditor, { Version } from '@/components/VersionedTextEditor/VersionedTextEditor';

const VersionedTextEditorDemo: React.FC = () => {
  const [versions, setVersions] = useState<Version[]>([
    {
      id: 'v1',
      content: `<h1>Kreditfreigabe Prozess</h1>

<p>Der <strong>Kunde</strong> reicht eine Kreditantrag ein. Die Bank prüft die <em>Bonität des Kunden</em> anhand verschiedener Kriterien wie:</p>

<ul>
<li>Einkommen</li>
<li>Schufa-Auskunft</li>
<li>Bestehende Verbindlichkeiten</li>
</ul>

<h2>Genehmigungsprozess</h2>

<p>Bei positiver Bonitätsprüfung wird der Kreditantrag zur Genehmigung an die <strong>Kreditabteilung</strong> weitergeleitet. Die Kreditabteilung führt eine detaillierte Risikobewertung durch und entscheidet über die Kreditvergabe.</p>

<blockquote>
<p>Wichtig: Alle Entscheidungen müssen dokumentiert werden.</p>
</blockquote>

<h2>Vertragsabschluss</h2>

<p>Nach Genehmigung wird der Kreditvertrag erstellt und dem Kunden zur Unterschrift vorgelegt. Nach Unterzeichnung wird das Kreditkonto eingerichtet und der Kreditbetrag wird auf das angegebene Konto überwiesen.</p>

<p>Der gesamte Prozess wird dokumentiert und archiviert.</p>`,
      timestamp: new Date('2024-01-01'),
      version: 1,
      description: 'Initial version',
      author: 'Process Analyst'
    }
  ]);

  const handleSave = async (content: string, version: number, description?: string): Promise<void> => {
    console.log(`Saving version ${version}:`, content);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newVersion: Version = {
      id: `v${version}`,
      content,
      timestamp: new Date(),
      version,
      description: description || `Version ${version}`,
      author: 'Current User'
    };
    
    setVersions(prev => [...prev, newVersion]);
  };

  const handleVersionSelect = (version: Version) => {
    console.log('Selected version:', version);
  };

  const handleContentChange = (content: string) => {
    console.log('Content changed, length:', content.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Versioned Text Editor Demo
          </h1>
          <p className="text-gray-600">
            WYSIWYG Editor mit semantischem Versioning und intelligentem Diff-Vergleich
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-800 mb-2">🎯 Rich Text Editor</h3>
            <p className="text-sm text-gray-600">
              Vollwertiger WYSIWYG Editor mit Formatierung, Listen, Überschriften und mehr
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-800 mb-2">🧠 Semantisches Diffing</h3>
            <p className="text-sm text-gray-600">
              Intelligenter Vergleich basierend auf Bedeutung, nicht nur exakten Wörtern
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-800 mb-2">🔀 Satz-für-Satz Merge</h3>
            <p className="text-sm text-gray-600">
              Granulare Auswahl einzelner Sätze für präzises Zusammenführen von Versionen
            </p>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <VersionedTextEditor
            versions={versions}
            onSave={handleSave}
            onVersionSelect={handleVersionSelect}
            onContentChange={handleContentChange}
            title="Kreditfreigabe Prozess Dokument"
            placeholder="Start writing your process document..."
            enableAutoSave={true}
            autoSaveInterval={15000} // 15 seconds
            allowDeleteVersions={true}
            maxVersions={10}
          />
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 So funktioniert's:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. <strong>Formatieren:</strong> Nutze die Toolbar für Bold, Italic, Listen, etc.</li>
            <li>2. <strong>Speichern:</strong> Klicke das Save-Icon für eine neue Version</li>
            <li>3. <strong>Vergleichen:</strong> Klicke das Compare-Icon um Versionen zu vergleichen</li>
            <li>4. <strong>Semantisch:</strong> Sieh intelligente Ähnlichkeitserkennung</li>
            <li>5. <strong>Klassisch:</strong> Wechsle zu traditionellem Diff-View</li>
            <li>6. <strong>Mergen:</strong> Wähle Sätze aus und erstelle neue Version</li>
          </ol>
        </div>

        {/* Technical Details */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">🔧 Technische Details:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Semantische Ähnlichkeit:</strong> Word-Overlap Algorithmus (erweiterbar mit OpenAI Embeddings)</p>
            <p><strong>Diff-View:</strong> react-diff-viewer-continued für professionelle Darstellung</p>
            <p><strong>Versioning:</strong> Lokale State-Verwaltung (erweiterbar mit Backend)</p>
            <p><strong>Merge-Logic:</strong> Intelligente Satz-für-Satz Auswahl mit Live-Preview</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionedTextEditorDemo;
