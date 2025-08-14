import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '@/contexts/ChatContext'
import { VoiceRecorder } from './VoiceRecorder'
import { PermissionGuard } from './PermissionGuard'

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
    toggleChat 
  } = useChat()
  
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

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

  const handleSendMessage = async () => {
    if (!inputText.trim()) return
    
    await sendMessage(inputText)
    setInputText('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleVoiceTranscription = (text: string) => {
    setInputText(text)
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
        {/* Chat Window */}
        {isOpen && (
        <div className="mb-4 w-96 h-96 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-digital-blue to-deep-blue-2 text-white rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-open-blue rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm">KI-Assistent</h3>
                <p className="text-xs opacity-80">{getCurrentPageContextDisplay()}</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-open-blue transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <p>Wie kann ich Ihnen helfen?</p>
                <p className="text-xs mt-1">Aktuelle Seite: {getCurrentPageContextDisplay()}</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                    message.sender === 'user'
                      ? 'bg-digital-blue text-white'
                      : 'bg-gray-100 text-black'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-black max-w-xs px-4 py-2 rounded-2xl text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">Schreibt...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nachricht eingeben..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-open-blue focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              
              {/* Voice Recorder */}
              <VoiceRecorder
                onTranscription={handleVoiceTranscription}
                isRecording={isRecording}
                onRecordingChange={setIsRecording}
                disabled={isLoading}
              />
              
              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="p-2 bg-digital-blue text-white rounded-full hover:bg-deep-blue-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className="w-14 h-14 bg-digital-blue text-white rounded-full shadow-lg hover:bg-deep-blue-2 transition-all duration-200 flex items-center justify-center hover:scale-105"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      </div>
    </PermissionGuard>
  )
} 