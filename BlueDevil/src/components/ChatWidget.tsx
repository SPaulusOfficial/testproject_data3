import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '@/contexts/ChatContext'
import { VoiceRecorder } from './VoiceRecorder'
import { PermissionGuard } from './PermissionGuard'
import { createChat } from '@n8n/chat'
import '@n8n/chat/style.css'
import '../n8n-chat-overrides.css'

// TypeScript definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

// Debug: Check if n8n chat is available
console.log('🔍 n8n chat package loaded:', { createChat: typeof createChat })

interface ChatWidgetProps {
  className?: string
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ className = '' }) => {
  const { 
    messages, 
    isOpen, 
    isLoading, 
    currentContext, 
    sendMessage, 
    sendN8nMessage,
    toggleChat 
  } = useChat()
  
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [n8nChatError, setN8nChatError] = useState(false)
  const [useFallbackChat, setUseFallbackChat] = useState(false)
  const [chatSessionId, setChatSessionId] = useState<string>('')
  const [n8nSessionId, setN8nSessionId] = useState<string>('')
  const [recognition, setRecognition] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Generate new session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Generate new n8n session ID
  const generateN8nSessionId = () => {
    return `n8n_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Reset chat session
  const resetChatSession = () => {
    const newSessionId = generateSessionId()
    const newN8nSessionId = generateN8nSessionId()
    
    setChatSessionId(newSessionId)
    setN8nSessionId(newN8nSessionId)
    
    console.log('🔄 Chat session reset:', { sessionId: newSessionId, n8nSessionId: newN8nSessionId })
    
    // Clean up existing chat
    if (chatContainerRef.current) {
      const existingChat = chatContainerRef.current.querySelector('.n8n-chat')
      if (existingChat) {
        existingChat.remove()
      }
    }
    
    // Reinitialize chat with new session
    initializeN8nChat(newSessionId, newN8nSessionId)
  }

  // Initialize n8n chat
  const initializeN8nChat = (sessionId: string, n8nSessionId?: string) => {
    if (chatContainerRef.current && isOpen) {
      setTimeout(() => {
        try {
          console.log('🔄 Initializing n8n chat with session:', sessionId)
          
          // Clear container first
          if (chatContainerRef.current) {
            chatContainerRef.current.innerHTML = ''
          }
          
          console.log('🎯 Target element:', chatContainerRef.current)
          
          // Create chat with proper configuration - fullscreen mode to integrate with our wrapper
          const chatConfig = {
            webhookUrl: 'http://localhost:3002/api/n8n/chat',
            target: chatContainerRef.current!,
            mode: 'fullscreen' as const,
            showWelcomeScreen: false,
            loadPreviousSession: true,
            chatSessionKey: sessionId,
            initialMessages: [],
            metadata: {
              sessionId: n8nSessionId || sessionId,
              context: currentContext
            }
          }
          
          console.log('🔧 Chat config:', chatConfig)
          
          const chatInstance = createChat(chatConfig)
          console.log('✅ n8n chat created successfully:', chatInstance)
          
        } catch (error) {
          console.error('❌ Error initializing n8n chat:', error)
          setN8nChatError(true)
        }
      }, 100)
    }
  }

  // Load previous session messages
  const loadPreviousSession = async (sessionId: string) => {
    try {
      const response = await fetch('http://localhost:3002/api/n8n/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'loadPreviousSession',
          sessionId: sessionId
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Loaded previous session messages:', data);
        // Here you could set the messages if needed
        return data;
      }
    } catch (error) {
      console.error('❌ Error loading previous session:', error);
    }
  };

  // Initialize n8n chat when component mounts or session changes
  useEffect(() => {
    if (isOpen) {
      if (!chatSessionId) {
        const newSessionId = generateSessionId()
        const newN8nSessionId = generateN8nSessionId()
        setChatSessionId(newSessionId)
        setN8nSessionId(newN8nSessionId)
        initializeN8nChat(newSessionId, newN8nSessionId)
      } else {
        // Load previous session messages before initializing chat
        loadPreviousSession(n8nSessionId || chatSessionId)
        initializeN8nChat(chatSessionId, n8nSessionId)
      }
    }
  }, [isOpen, chatSessionId, n8nSessionId])

  // Get current page context display
  const getCurrentPageContextDisplay = () => {
    const context = currentContext
    if (context.action) {
      return `${context.page} > ${context.section} > ${context.action}`
    }
    if (context.section) {
      return `${context.page} > ${context.section}`
    }
    return context.page
  }





  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = 'de-DE'
        recognitionInstance.maxAlternatives = 1
        
        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = ''
          let interimTranscript = ''
          
          // Build the complete transcript
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }
          
          const fullTranscript = finalTranscript + interimTranscript
          console.log('🎤 Speech recognized:', fullTranscript)
          console.log('📏 Transcript length:', fullTranscript.length, 'characters')
          console.log('🔴 Final:', finalTranscript.length, 'Interim:', interimTranscript.length)
          
          setCurrentTranscript(fullTranscript)
          setIsSpeaking(interimTranscript.length > 0)
          
          // Update n8n input with current transcript
          setTimeout(() => {
            const n8nInput = document.querySelector('.n8n-chat input, .n8n-chat textarea, .n8n-chat [contenteditable]') as HTMLInputElement | HTMLTextAreaElement | HTMLElement
            if (n8nInput) {
              if (n8nInput instanceof HTMLInputElement || n8nInput instanceof HTMLTextAreaElement) {
                n8nInput.value = fullTranscript
                n8nInput.dispatchEvent(new Event('input', { bubbles: true }))
              } else if (n8nInput.contentEditable === 'true') {
                n8nInput.textContent = fullTranscript
                n8nInput.dispatchEvent(new Event('input', { bubbles: true }))
              }
            }
          }, 100)
        }
        
        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          setIsSpeaking(false)
        }
        
        recognitionInstance.onend = () => {
          console.log('🎤 Speech recognition ended')
          setIsListening(false)
          setIsSpeaking(false)
        }
        
        recognitionInstance.onstart = () => {
          console.log('🎤 Speech recognition started')
          setCurrentTranscript('')
        }
        
        setRecognition(recognitionInstance)
      }
    }
  }, [])

  const handleVoiceTranscription = (text: string) => {
    setInputText(text)
  }

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true)
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop()
      setIsListening(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage = inputText.trim()
    setInputText('')
    
    // Add user message to chat
    sendMessage(userMessage)
    
    try {
      // Send to n8n via our backend proxy
      const response = await fetch('http://localhost:3002/api/n8n/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: n8nSessionId || chatSessionId,
          metadata: {
            sessionId: n8nSessionId || chatSessionId,
            context: currentContext
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Add assistant response to chat
        sendN8nMessage(userMessage, data.response)
      } else {
        console.error('Failed to send message to n8n')
        sendN8nMessage(userMessage, 'Entschuldigung, ich konnte Ihre Nachricht nicht verarbeiten.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      sendN8nMessage(userMessage, 'Entschuldigung, ein Fehler ist aufgetreten.')
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }



    return (
    <PermissionGuard permission="Chat">
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        {/* n8n Chat Window */}
        {isOpen && (
          <div className="mb-4 w-80 sm:w-96 md:w-[420px] lg:w-[480px] h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Chat Header with Reset Button */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-digital-blue to-deep-blue-2 text-white">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-open-blue rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">KI-Assistent</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-1 transition-colors relative ${
                    isListening 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'text-white hover:text-open-blue'
                  }`}
                  title={isListening ? 'Spracherkennung stoppen' : 'Spracherkennung starten'}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  {isSpeaking && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </button>
                <button
                  onClick={resetChatSession}
                  className="p-1 text-white hover:text-open-blue transition-colors"
                  title="Neue Konversation starten"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={toggleChat}
                  className="p-1 text-white hover:text-open-blue transition-colors"
                  title="Chat schließen"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Chat Content - n8n Widget */}
            <div className="h-[calc(100%-60px)]">
              <div 
                ref={chatContainerRef} 
                className="w-full h-full relative overflow-hidden"
                style={{
                  '--chat--color-primary': '#3B82F6',
                  '--chat--color-primary-shade-50': '#2563EB',
                  '--chat--color-primary-shade-100': '#1D4ED8',
                  '--chat--color-secondary': '#10B981',
                  '--chat--color-secondary-shade-50': '#059669',
                  '--chat--color-white': '#ffffff',
                  '--chat--color-light': '#f8fafc',
                  '--chat--color-light-shade-50': '#f1f5f9',
                  '--chat--color-light-shade-100': '#e2e8f0',
                  '--chat--color-medium': '#cbd5e1',
                  '--chat--color-dark': '#1e293b',
                  '--chat--color-disabled': '#64748b',
                  '--chat--color-typing': '#475569',
                  '--chat--spacing': '0.75rem',
                  '--chat--border-radius': '0.5rem',
                  '--chat--transition-duration': '0.15s',
                  '--chat--window--width': '100%',
                  '--chat--window--height': '100%',
                  '--chat--header-height': 'auto',
                  '--chat--header--padding': '0.75rem',
                  '--chat--header--background': 'transparent',
                  '--chat--header--color': '#ffffff',
                  '--chat--header--border-top': 'none',
                  '--chat--header--border-bottom': 'none',
                  '--chat--heading--font-size': '1.125rem',
                  '--chat--subtitle--font-size': '0.875rem',
                  '--chat--subtitle--line-height': '1.25rem',
                  '--chat--textarea--height': '44px',
                  '--chat--message--font-size': '0.875rem',
                  '--chat--message--padding': '0.75rem',
                  '--chat--message--border-radius': '0.5rem',
                  '--chat--message-line-height': '1.25rem',
                  '--chat--message--bot--background': '#f8fafc',
                  '--chat--message--bot--color': '#1e293b',
                  '--chat--message--bot--border': '1px solid #e2e8f0',
                  '--chat--message--user--background': '#3B82F6',
                  '--chat--message--user--color': '#ffffff',
                  '--chat--message--user--border': 'none',
                  '--chat--message--pre--background': 'rgba(0, 0, 0, 0.05)',
                  '--chat--toggle--background': '#3B82F6',
                  '--chat--toggle--hover--background': '#2563EB',
                  '--chat--toggle--active--background': '#1D4ED8',
                  '--chat--toggle--color': '#ffffff',
                  '--chat--toggle--size': '56px',
                } as React.CSSProperties}
              />
            </div>
          </div>
        )}

        {/* Chat Toggle Button */}
        <button
          onClick={toggleChat}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-digital-blue text-white rounded-full shadow-lg hover:bg-deep-blue-2 transition-all duration-200 flex items-center justify-center hover:scale-105"
        >
          {isOpen ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </PermissionGuard>
  )
} 