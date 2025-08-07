# 🗨️ Chat-System Dokumentation

## Übersicht

Das Chat-System ist ein ausklappbares Chatfenster, das auf allen Seiten der BlueDevil-Plattform verfügbar ist. Es bietet sowohl Text- als auch Spracheingabe und kennt den aktuellen Kontext der Seite, auf der sich der Benutzer befindet.

## Features

### 🎯 Kontextbewusstsein
- Das Chat-System erkennt automatisch die aktuelle Seite
- Kontext-spezifische Antworten basierend auf der Benutzerposition
- Unterstützung für alle Pre-Sales Workflows und Hauptseiten

### 🎤 Sprachaufnahme
- Integrierte Sprachaufnahme mit Browser-API
- Automatische Transkription (simuliert, kann mit echten APIs erweitert werden)
- Visuelle Feedback-Indikatoren während der Aufnahme

### 💬 Text-Chat
- Echtzeit-Nachrichtenverlauf
- Auto-Scroll zu neuen Nachrichten
- Enter-Taste zum Senden
- Lade-Indikatoren während AI-Verarbeitung

### 🎨 Design
- Konsistentes Salesfive Design-System
- Responsive Design
- Smooth Animationen und Übergänge
- Fixed Position unten rechts

## Technische Architektur

### Komponenten

#### ChatWidget.tsx
- Hauptkomponente für das Chat-Interface
- Verwaltet UI-Zustand und Benutzerinteraktionen
- Integriert VoiceRecorder und Text-Eingabe

#### VoiceRecorder.tsx
- Spezialisierte Komponente für Sprachaufnahme
- Browser-API Integration (MediaRecorder)
- Fehlerbehandlung für nicht unterstützte Browser

#### ChatContext.tsx
- React Context für globalen Chat-Zustand
- Verwaltet Nachrichten und Kontext
- Zentrale Logik für AI-Integration

### Dateistruktur
```
src/
├── components/
│   ├── ChatWidget.tsx      # Haupt-Chat-Komponente
│   └── VoiceRecorder.tsx   # Sprachaufnahme-Komponente
├── contexts/
│   └── ChatContext.tsx     # Chat-Zustand-Management
└── App.tsx                 # ChatProvider Integration
```

## Integration

### App.tsx
```tsx
import { ChatProvider } from '@/contexts/ChatContext'

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Layout>
          {/* Routes */}
        </Layout>
      </ChatProvider>
    </AuthProvider>
  )
}
```

### Layout.tsx
```tsx
import { ChatWidget } from './ChatWidget'

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-off-white">
      {/* Sidebar und Content */}
      <ChatWidget />
    </div>
  )
}
```

## Kontext-Mapping

Das System erkennt automatisch die folgenden Seiten:

### Hauptseiten
- `/` → Dashboard
- `/agents` → Agenten-Verwaltung
- `/projects` → Projekt-Verwaltung
- `/workflows` → Workflow-Verwaltung
- `/settings` → Einstellungen

### Pre-Sales Workflows
- `/pre-sales/knowledge/video-zu-text` → Video zu Text Konvertierung
- `/pre-sales/knowledge/audio-zu-text` → Audio zu Text Konvertierung
- `/pre-sales/knowledge/workshops` → Workshop-Management
- `/pre-sales/knowledge/dokumenten-upload` → Dokumenten-Upload
- `/pre-sales/project-designer/architektur-sketch` → Architektur-Sketch
- `/pre-sales/project-designer/stakeholder-rollendefinition` → Stakeholder-Rollendefinition
- `/pre-sales/project-designer/use-case-mapping` → Use-Case-Mapping
- `/pre-sales/offer-otter/kostenkalkulation` → Kostenkalkulation
- `/pre-sales/offer-otter/proposal-draft` → Proposal-Draft

## AI-Integration

### Aktuelle Implementierung
- Simulierte AI-Antworten basierend auf Kontext
- Kontext-spezifische Hilfestellungen
- Deutsche Lokalisierung

### Erweiterungsmöglichkeiten
```tsx
// In ChatContext.tsx - simulateAIResponse Funktion ersetzen
const sendToAI = async (text: string, context: any) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: text,
      context: context,
      // Weitere Parameter für AI-Service
    })
  })
  return response.json()
}
```

## Sprachaufnahme-Integration

### Aktuelle Implementierung
- Browser MediaRecorder API
- Simulierte Transkription
- Fehlerbehandlung für nicht unterstützte Browser

### Erweiterungsmöglichkeiten
```tsx
// In VoiceRecorder.tsx - simulateTranscription ersetzen
const sendToSpeechToText = async (audioBlob: Blob) => {
  const formData = new FormData()
  formData.append('audio', audioBlob)
  
  const response = await fetch('/api/speech-to-text', {
    method: 'POST',
    body: formData
  })
  
  const { transcription } = await response.json()
  onTranscription(transcription)
}
```

## Design-System Integration

### Farben
- `digital-blue` (#0025D1) - Primärfarbe für Buttons
- `deep-blue-2` (#001394) - Hover-Zustände
- `open-blue` (#00D5DC) - Akzentfarbe
- `off-white` (#F7F7F9) - Hintergrund

### Komponenten
- Konsistente Button-Styles
- Card-Design für Chat-Fenster
- Custom Scrollbar
- Smooth Animationen

## Browser-Kompatibilität

### Unterstützt
- Chrome/Edge (MediaRecorder API)
- Firefox (MediaRecorder API)
- Safari (MediaRecorder API)

### Fallback
- Nicht unterstützte Browser zeigen deaktivierten Voice-Button
- Text-Chat funktioniert in allen Browsern

## Nächste Schritte

### Kurzfristig
1. Integration mit echten AI-Services
2. Implementierung von Speech-to-Text APIs
3. Persistierung von Chat-Verläufen

### Langfristig
1. Multi-User Chat-Support
2. Datei-Upload im Chat
3. Chat-Historie und Suche
4. Erweiterte AI-Features (Code-Generierung, etc.)

## Troubleshooting

### Häufige Probleme

#### Mikrofon-Zugriff verweigert
- Browser-Berechtigungen prüfen
- HTTPS erforderlich für MediaRecorder
- Popup-Blocker deaktivieren

#### Chat öffnet sich nicht
- ChatProvider in App.tsx prüfen
- React Router korrekt konfiguriert
- Console-Fehler prüfen

#### AI-Antworten funktionieren nicht
- Network-Tab für API-Calls prüfen
- AI-Service-Konfiguration prüfen
- Fallback zu simulierten Antworten 