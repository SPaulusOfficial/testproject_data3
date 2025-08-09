# 🗨️ Chat System Documentation

## Overview

The chat system is a collapsible chat window that is available on all pages of the platform. It offers both text and voice input and knows the current context of the page where the user is located.

## Features

### 🎯 Context Awareness
- The chat system automatically recognizes the current page
- Context-specific responses based on user position
- Support for all Pre-Sales workflows and main pages

### 🎤 Voice Recording
- Integrated voice recording with browser API
- Automatic transcription (simulated, can be extended with real APIs)
- Visual feedback indicators during recording

### 💬 Text Chat
- Real-time message history
- Auto-scroll to new messages
- Enter key to send
- Loading indicators during AI processing

### 🎨 Design
- Consistent Salesfive design system
- Responsive design
- Smooth animations and transitions
- Fixed position bottom right

## Technical Architecture

### Components

#### ChatWidget.tsx
- Main component for chat interface
- Manages UI state and user interactions
- Integrates VoiceRecorder and text input

#### VoiceRecorder.tsx
- Specialized component for voice recording
- Browser API integration (MediaRecorder)
- Error handling for unsupported browsers

#### ChatContext.tsx
- React context for global chat state
- Manages messages and context
- Central logic for AI integration

### File Structure
```
src/
├── components/
│   ├── ChatWidget.tsx      # Main chat component
│   └── VoiceRecorder.tsx   # Voice recording component
├── contexts/
│   └── ChatContext.tsx     # Chat state management
└── App.tsx                 # ChatProvider integration
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
      {/* Sidebar and content */}
      <ChatWidget />
    </div>
  )
}
```

## Context Mapping

The system automatically recognizes the following pages:

### Main Pages
- `/` → Dashboard
- `/agents` → Agent management
- `/projects` → Project management
- `/workflows` → Workflow management
- `/settings` → Settings

### Pre-Sales Workflows
- `/pre-sales/knowledge/video-zu-text` → Video to text conversion
- `/pre-sales/knowledge/audio-zu-text` → Audio to text conversion
- `/pre-sales/knowledge/workshops` → Workshop management
- `/pre-sales/knowledge/dokumenten-upload` → Document upload
- `/pre-sales/project-designer/architektur-sketch` → Architecture sketch
- `/pre-sales/project-designer/stakeholder-rollendefinition` → Stakeholder role definition
- `/pre-sales/project-designer/use-case-mapping` → Use case mapping
- `/pre-sales/offer-otter/kostenkalkulation` → Cost calculation
- `/pre-sales/offer-otter/proposal-draft` → Proposal draft

## AI Integration

### Current Implementation
- Simulated AI responses based on context
- Context-specific assistance
- German localization

### Extension Possibilities
```tsx
// In ChatContext.tsx - replace simulateAIResponse function
const sendToAI = async (text: string, context: any) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: text,
      context: context,
      // Additional parameters for AI service
    })
  })
  return response.json()
}
```

## Voice Recording Integration

### Current Implementation
- Browser MediaRecorder API
- Simulated transcription
- Error handling for unsupported browsers

### Extension Possibilities
```tsx
// In VoiceRecorder.tsx - replace simulateTranscription
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

## Design System Integration

### Colors
- `digital-blue` (#0025D1) - Primary color for buttons
- `deep-blue-2` (#001394) - Hover states
- `open-blue` (#00D5DC) - Accent color
- `off-white` (#F7F7F9) - Background

### Components
- Consistent button styles
- Card design for chat window
- Custom scrollbar
- Smooth animations

## Browser Compatibility

### Supported
- Chrome/Edge (MediaRecorder API)
- Firefox (MediaRecorder API)
- Safari (MediaRecorder API)

### Fallback
- Unsupported browsers show disabled voice button
- Text chat works in all browsers

## Next Steps

### Short Term
1. Integration with real AI services
2. Implementation of Speech-to-Text APIs
3. Persistence of chat histories

### Long Term
1. Multi-user chat support
2. File upload in chat
3. Chat history and search
4. Advanced AI features (code generation, etc.)

## Troubleshooting

### Common Issues

#### Microphone access denied
- Check browser permissions
- HTTPS required for MediaRecorder
- Disable popup blocker

#### Chat doesn't open
- Check ChatProvider in App.tsx
- React Router correctly configured
- Check console errors

#### AI responses not working
- Check Network tab for API calls
- Check AI service configuration
- Fallback to simulated responses 