import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface Message {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
  context?: {
    page: string
    section?: string
    action?: string
  }
}

interface ChatContextType {
  messages: Message[]
  isOpen: boolean
  isLoading: boolean
  currentContext: {
    page: string
    section?: string
    action?: string
  }
  sendMessage: (text: string) => Promise<void>
  sendN8nMessage: (userText: string, assistantText: string) => void
  toggleChat: () => void
  clearMessages: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

interface ChatProviderProps {
  children: ReactNode
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()

  // Page context mapping
  const getPageContext = () => {
    const path = location.pathname
    const pageMap: Record<string, { page: string; section?: string; action?: string }> = {
      '/': { page: 'Dashboard', section: 'Übersicht' },
      '/agents': { page: 'Agenten-Verwaltung', section: 'KI-Agenten' },
      '/projects': { page: 'Projekt-Verwaltung', section: 'Projekte' },
      '/workflows': { page: 'Workflow-Verwaltung', section: 'Prozesse' },
      '/settings': { page: 'Einstellungen', section: 'Konfiguration' },
      '/pre-sales/knowledge/video-zu-text': { 
        page: 'Pre-Sales', 
        section: 'Knowledge Management', 
        action: 'Video zu Text Konvertierung' 
      },
      '/pre-sales/knowledge/audio-zu-text': { 
        page: 'Pre-Sales', 
        section: 'Knowledge Management', 
        action: 'Audio zu Text Konvertierung' 
      },
      '/pre-sales/knowledge/workshops': { 
        page: 'Pre-Sales', 
        section: 'Knowledge Management', 
        action: 'Workshop-Management' 
      },

      '/pre-sales/rfp-questions/extract': { 
        page: 'Pre-Sales', 
        section: 'RfP-Fragen-Extraktion', 
        action: 'Fragen aus RfPs extrahieren' 
      },
      '/pre-sales/rfp-questions/ai-answers': { 
        page: 'Pre-Sales', 
        section: 'RfP-Fragen-Extraktion', 
        action: 'KI-gestützte Antworten' 
      },
      '/pre-sales/project-designer/architektur-sketch': { 
        page: 'Pre-Sales', 
        section: 'Project Designer', 
        action: 'Architektur-Sketch' 
      },
      '/pre-sales/project-designer/projektplan-sketch': { 
        page: 'Pre-Sales', 
        section: 'Project Designer', 
        action: 'Projektplan-Sketch' 
      },
      '/pre-sales/project-designer/stakeholder-rollendefinition': { 
        page: 'Pre-Sales', 
        section: 'Project Designer', 
        action: 'Stakeholder-Rollendefinition' 
      },
      '/pre-sales/project-designer/use-case-mapping': { 
        page: 'Pre-Sales', 
        section: 'Project Designer', 
        action: 'Use-Case-Mapping' 
      },
      '/pre-sales/offer-otter/kostenkalkulation': { 
        page: 'Pre-Sales', 
        section: 'Offer Otter', 
        action: 'Kostenkalkulation' 
      },
      '/pre-sales/offer-otter/proposal-draft': { 
        page: 'Pre-Sales', 
        section: 'Offer Otter', 
        action: 'Proposal-Draft-Generator' 
      },
      // Build-Seiten
      '/build/data-model-setup': { 
        page: 'Build', 
        section: 'Data Model Setup', 
        action: 'Datenmodell Einrichtung' 
      }
    }
    return pageMap[path] || { page: 'Unbekannte Seite' }
  }

  const currentContext = getPageContext()

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      context: currentContext
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // TODO: Replace with actual AI API call
      // This is where you would integrate with your AI backend
      const response = await simulateAIResponse(text, currentContext)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date(),
        context: currentContext
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Nachricht.',
        sender: 'assistant',
        timestamp: new Date(),
        context: currentContext
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const simulateAIResponse = async (text: string, context: any): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const contextInfo = context.action 
      ? `${context.page} > ${context.section} > ${context.action}`
      : context.section 
        ? `${context.page} > ${context.section}`
        : context.page

    // Simple response logic based on context
    if (text.toLowerCase().includes('hilfe') || text.toLowerCase().includes('help')) {
      return `Ich helfe Ihnen gerne auf der Seite "${contextInfo}". Was möchten Sie wissen?`
    }

    if (text.toLowerCase().includes('wie') || text.toLowerCase().includes('how')) {
      return `Auf der Seite "${contextInfo}" können Sie folgende Aktionen durchführen:\n\n• Daten anzeigen und bearbeiten\n• Neue Einträge erstellen\n• Berichte generieren\n• Einstellungen anpassen`
    }

    if (context.page === 'Pre-Sales' && context.section === 'Knowledge Management') {
      return `Sie befinden sich im Knowledge Management Bereich. Hier können Sie:\n\n• Video- und Audio-Dateien zu Text konvertieren\n• Workshop-Materialien verwalten\n• Dokumente hochladen und strukturieren\n\nWie kann ich Ihnen dabei helfen?`
    }

    if (context.page === 'Pre-Sales' && context.section === 'Project Designer') {
      return `Im Project Designer können Sie:\n\n• Architektur-Sketches erstellen\n• Stakeholder-Rollen definieren\n• Use-Cases mappen\n\nWas möchten Sie als nächstes tun?`
    }

    return `Ich verstehe Ihre Anfrage bezüglich "${text}" im Kontext von "${contextInfo}". Wie kann ich Ihnen dabei helfen?`
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const clearMessages = () => {
    setMessages([])
  }

  const sendN8nMessage = (userText: string, assistantText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date(),
      context: currentContext
    }
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: assistantText,
      sender: 'assistant',
      timestamp: new Date(),
      context: currentContext
    }
    
    setMessages(prev => [...prev, userMessage, assistantMessage])
  }

  const value: ChatContextType = {
    messages,
    isOpen,
    isLoading,
    currentContext,
    sendMessage,
    sendN8nMessage,
    toggleChat,
    clearMessages
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
} 