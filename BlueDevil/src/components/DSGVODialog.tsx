import React, { useState } from 'react'

interface DSGVODialogProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
}

export const DSGVODialog: React.FC<DSGVODialogProps> = ({ isOpen, onClose, onAccept }) => {
  const [accepted, setAccepted] = useState(false)

  if (!isOpen) return null

  const handleAccept = () => {
    if (accepted) {
      onAccept()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-lg">🔒</span>
          </div>
          <h2 className="text-xl font-bold">GDPR Consent</h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            For recording audio/video during the workshop, we need your consent according to GDPR.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">What will be recorded?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Audio recording of the workshop</li>
              <li>• Automatic transcription (Speech-to-Text)</li>
              <li>• Notes and highlights</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Data Protection & Deletion</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Data is stored encrypted</li>
              <li>• Automatic deletion after 30 days</li>
              <li>• You can request deletion at any time</li>
              <li>• Data is only used for workshop purposes</li>
            </ul>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="dsgvo-accept"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="dsgvo-accept" className="text-sm text-gray-700">
              I agree to the recording and processing of my audio data according to the{' '}
              <a href="#" className="text-digital-blue underline">Privacy Policy</a>{' '}
              . I can revoke this consent at any time.
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button className="btn-ghost" onClick={onClose}>
            Decline
          </button>
          <button 
            className={`btn-primary ${!accepted ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleAccept}
            disabled={!accepted}
          >
            Grant Consent
          </button>
        </div>
      </div>
    </div>
  )
} 