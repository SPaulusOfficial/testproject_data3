import React, { useState, useRef, useEffect } from 'react'

interface VoiceRecorderProps {
  onTranscription: (text: string) => void
  isRecording: boolean
  onRecordingChange: (recording: boolean) => void
  disabled?: boolean
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscription,
  isRecording,
  onRecordingChange,
  disabled = false
}) => {
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    // Check if browser supports MediaRecorder
    if (typeof window !== 'undefined' && window.MediaRecorder) {
      setIsSupported(true)
    } else {
      setError('Voice recording is not supported in this browser')
    }
  }, [])

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        
        // TODO: Send audio to speech-to-text API
        // For now, simulate transcription
        simulateTranscription(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      onRecordingChange(true)
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Microphone access denied or not available')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      onRecordingChange(false)
    }
  }

  const simulateTranscription = async (audioBlob: Blob) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // TODO: Replace with actual speech-to-text API
    // Example: OpenAI Whisper, Google Speech-to-Text, etc.
    const mockTranscriptions = [
      "Hello, how can I help you?",
      "I need support with this project",
      "Can you explain the next steps to me?",
      "How does this function work?",
      "I have a question about the configuration"
    ]
    
    const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)]
    onTranscription(randomTranscription)
  }

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  if (!isSupported) {
    return (
      <button
        disabled
        className="p-2 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed"
        title="Voice recording not supported"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
        </svg>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggleRecording}
        disabled={disabled}
        className={`p-2 rounded-full transition-colors ${
          isRecording
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isRecording ? 'Stop recording' : 'Start voice recording'}
      >
        {isRecording ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      
      {error && (
        <div className="absolute bottom-full right-0 mb-2 p-2 bg-red-100 text-red-700 text-xs rounded-lg shadow-lg max-w-xs">
          {error}
        </div>
      )}
      
      {isRecording && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
      )}
    </div>
  )
} 