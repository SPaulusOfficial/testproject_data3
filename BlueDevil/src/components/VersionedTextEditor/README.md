# VersionedTextEditor Component

Eine vollwertige, wiederverwendbare WYSIWYG Editor Komponente mit intelligentem Versioning und semantischem Diffing.

## 🚀 Features

- **WYSIWYG Editor** mit TipTap (Bold, Italic, Listen, Überschriften, etc.)
- **Intelligentes Versioning** mit semantischem Diffing
- **Auto-Save** Funktionalität
- **Satz-für-Satz Merge** mit granularer Kontrolle
- **Vollständig konfigurierbar** - alle Features optional
- **TypeScript Support** mit vollständigen Typen
- **Responsive Design** für alle Bildschirmgrößen

## 📦 Installation

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-color @tiptap/extension-highlight
```

## 🎯 Grundlegende Verwendung

```tsx
import VersionedTextEditor, { Version } from '@/components/VersionedTextEditor/VersionedTextEditor';

const MyComponent = () => {
  const [versions, setVersions] = useState<Version[]>([
    {
      id: 'v1',
      content: '<h1>Initial Document</h1><p>Start content...</p>',
      timestamp: new Date(),
      version: 1,
      description: 'Initial version'
    }
  ]);

  const handleSave = async (content: string, version: number, description?: string) => {
    // Speichere in Backend/Database
    const newVersion = {
      id: `v${version}`,
      content,
      timestamp: new Date(),
      version,
      description
    };
    setVersions(prev => [...prev, newVersion]);
  };

  return (
    <VersionedTextEditor
      versions={versions}
      onSave={handleSave}
      title="My Document"
    />
  );
};
```

## 🔧 Alle Props

### Content und Versions
```tsx
interface VersionedTextEditorProps {
  // Content und Versions
  initialContent?: string;           // Initialer Inhalt (falls keine Versions existieren)
  versions?: Version[];              // Array aller Versionen
  currentVersionId?: string;         // ID der aktuell ausgewählten Version
  
  // Konfiguration
  title?: string;                    // Titel im Header
  placeholder?: string;              // Placeholder für leeren Editor
  readOnly?: boolean;                // Read-only Modus
  showVersionHistory?: boolean;      // Version History Sidebar anzeigen
  showCompareButton?: boolean;       // Compare Button anzeigen
  showSaveButton?: boolean;          // Save Button anzeigen
  
  // Callbacks
  onSave?: (content: string, version: number, description?: string) => Promise<void>;
  onVersionSelect?: (version: Version) => void;
  onContentChange?: (content: string) => void;
  onCompare?: (oldVersion: Version, newVersion: Version) => void;
  onMerge?: (mergedContent: string, oldVersion: Version, newVersion: Version) => Promise<void>;
  
  // Styling
  className?: string;                // CSS Klasse für Container
  headerClassName?: string;          // CSS Klasse für Header
  editorClassName?: string;          // CSS Klasse für Editor
  sidebarClassName?: string;         // CSS Klasse für Sidebar
  
  // Features
  enableAutoSave?: boolean;          // Auto-Save aktivieren
  autoSaveInterval?: number;         // Auto-Save Intervall (ms)
  maxVersions?: number;              // Maximale Anzahl Versionen
  allowDeleteVersions?: boolean;     // Versionen löschen erlauben
  
  // Custom Actions
  customActions?: React.ReactNode;   // Custom Buttons im Header
}
```

## 📝 Version Interface

```tsx
interface Version {
  id: string;                        // Eindeutige ID
  content: string;                   // HTML Content
  timestamp: Date;                   // Erstellungszeitpunkt
  version: number;                   // Versionsnummer
  description?: string;              // Beschreibung der Version
  author?: string;                   // Autor der Version
  tags?: string[];                   // Tags für Kategorisierung
}
```

## 🎨 Beispiele

### Minimaler Editor (ohne Versioning)
```tsx
<VersionedTextEditor
  initialContent="<p>Simple content</p>"
  showVersionHistory={false}
  showCompareButton={false}
  onSave={handleSave}
/>
```

### Read-only Viewer
```tsx
<VersionedTextEditor
  versions={versions}
  readOnly={true}
  showSaveButton={false}
  title="Document Viewer"
/>
```

### Auto-Save Editor
```tsx
<VersionedTextEditor
  versions={versions}
  onSave={handleSave}
  enableAutoSave={true}
  autoSaveInterval={30000} // 30 Sekunden
  title="Auto-saving Document"
/>
```

### Custom Actions
```tsx
const CustomActions = () => (
  <div className="flex gap-2">
    <button onClick={handleExport}>Export</button>
    <button onClick={handleShare}>Share</button>
  </div>
);

<VersionedTextEditor
  versions={versions}
  onSave={handleSave}
  customActions={<CustomActions />}
/>
```

### Styling
```tsx
<VersionedTextEditor
  versions={versions}
  onSave={handleSave}
  className="border-2 border-blue-200"
  headerClassName="bg-blue-50"
  editorClassName="bg-gray-50"
/>
```

## 🔄 Callback Beispiele

### Save Handler
```tsx
const handleSave = async (content: string, version: number, description?: string) => {
  try {
    // API Call
    await api.saveDocument({
      content,
      version,
      description,
      documentId: 'doc-123'
    });
    
    // Update local state
    const newVersion: Version = {
      id: `v${version}`,
      content,
      timestamp: new Date(),
      version,
      description
    };
    setVersions(prev => [...prev, newVersion]);
  } catch (error) {
    console.error('Save failed:', error);
    throw error; // Re-throw für Error Handling in Komponente
  }
};
```

### Version Select Handler
```tsx
const handleVersionSelect = (version: Version) => {
  console.log('Switched to version:', version.version);
  // Optional: Update URL, Analytics, etc.
};
```

### Content Change Handler
```tsx
const handleContentChange = (content: string) => {
  // Real-time updates, validation, etc.
  if (content.length > 10000) {
    console.warn('Document getting large');
  }
};
```

### Compare Handler
```tsx
const handleCompare = (oldVersion: Version, newVersion: Version) => {
  console.log(`Comparing v${oldVersion.version} vs v${newVersion.version}`);
  // Analytics, logging, etc.
};
```

### Merge Handler
```tsx
const handleMerge = async (mergedContent: string, oldVersion: Version, newVersion: Version) => {
  try {
    // Save merged version
    await api.saveDocument({
      content: mergedContent,
      version: versions.length + 1,
      description: `Merged from v${oldVersion.version} and v${newVersion.version}`,
      documentId: 'doc-123'
    });
    
    // Update local state
    const mergedVersion: Version = {
      id: `v${versions.length + 1}`,
      content: mergedContent,
      timestamp: new Date(),
      version: versions.length + 1,
      description: `Merged from v${oldVersion.version} and v${newVersion.version}`
    };
    setVersions(prev => [...prev, mergedVersion]);
  } catch (error) {
    console.error('Merge failed:', error);
    throw error;
  }
};
```

## 🎯 Best Practices

### 1. Error Handling
```tsx
const handleSave = async (content: string, version: number, description?: string) => {
  try {
    await api.saveDocument({ content, version, description });
    // Success handling
  } catch (error) {
    // Error handling - show toast, retry, etc.
    toast.error('Save failed. Please try again.');
    throw error; // Re-throw für Komponente
  }
};
```

### 2. Performance
```tsx
// Memoize handlers für bessere Performance
const handleSave = useCallback(async (content: string, version: number, description?: string) => {
  // Save logic
}, [api, documentId]);

const handleVersionSelect = useCallback((version: Version) => {
  // Version select logic
}, []);
```

### 3. State Management
```tsx
// Verwende React Query für Server State
const { data: versions, mutate: updateVersions } = useSWR('/api/documents/123/versions');

const handleSave = async (content: string, version: number, description?: string) => {
  await api.saveDocument({ content, version, description });
  updateVersions(); // Re-fetch versions
};
```

## 🔧 Customization

### Custom Styling
```css
/* Custom CSS für spezifische Anpassungen */
.my-editor .ProseMirror {
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
}

.my-editor .ProseMirror h1 {
  color: #1f2937;
  font-weight: 700;
}
```

### Custom Extensions
```tsx
// Erweitere WYSIWYGEditor.tsx für zusätzliche TipTap Extensions
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';

const editor = useEditor({
  extensions: [
    StarterKit,
    Table,
    TableRow,
    TableCell,
    // ... weitere Extensions
  ],
  // ...
});
```

## 🐛 Troubleshooting

### Problem: Editor zeigt nichts an
- Prüfe ob `versions` Array nicht leer ist
- Stelle sicher dass `initialContent` gesetzt ist
- Prüfe Browser Console für Fehler

### Problem: Auto-Save funktioniert nicht
- Stelle sicher dass `enableAutoSave={true}` gesetzt ist
- Prüfe ob `onSave` Callback definiert ist
- Prüfe `autoSaveInterval` (Standard: 30 Sekunden)

### Problem: Version History wird nicht angezeigt
- Stelle sicher dass `showVersionHistory={true}` gesetzt ist
- Prüfe ob `versions` Array Daten enthält
- Prüfe CSS für `overflow` Probleme

## 📚 Weitere Ressourcen

- [TipTap Documentation](https://tiptap.dev/)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

Füge neue Features hinzu oder melde Bugs über GitHub Issues.
