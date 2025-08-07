import React, { useState } from 'react'

// Dummy data for participants
const initialParticipants = [
  { id: '1', name: 'Anna', email: 'anna@firma.de', type: 'intern' },
  { id: '2', name: 'Bernd', email: 'bernd@kunde.com', type: 'extern' },
  { id: '3', name: 'Clara', email: 'clara@kunde.com', type: 'extern' },
  { id: '4', name: 'David', email: 'david@firma.de', type: 'intern' },
]

// Dummy consent status
const initialConsent: Record<string, Record<string, { status: string; date: string | null }>> = {
  // projectId: { participantId: { status, date } }
  'project-123': {
    '2': { status: 'granted', date: '2024-07-01' },
    '3': { status: 'pending', date: null },
  }
}

export default function ProjectParticipants() {
  const projectId = 'project-123' // Dummy
  const [participants, setParticipants] = useState(initialParticipants)
  const [consent, setConsent] = useState(initialConsent)
  const [showQR, setShowQR] = useState<string | null>(null)

  // Consent link (Dummy)
  const getConsentLink = (participantId: string) => {
    return `${window.location.origin}/consent/${projectId}/${participantId}`
  }

  // Revoke consent
  const revokeConsent = (participantId: string) => {
    setConsent(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [participantId]: { status: 'revoked', date: new Date().toISOString().slice(0, 10) }
      }
    }))
  }

  // Dummy: Set consent to "granted" (e.g. after external opt-in)
  const grantConsent = (participantId: string) => {
    setConsent(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [participantId]: { status: 'granted', date: new Date().toISOString().slice(0, 10) }
      }
    }))
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-h2 font-bold mb-6">Manage Project Participants</h1>
      <table className="min-w-full text-sm mb-8">
        <thead>
          <tr className="bg-off-white">
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Consent (Project)</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {participants.map(p => {
            const c = consent[projectId]?.[p.id]
            return (
              <tr key={p.id} className="border-b">
                <td className="px-4 py-2 font-semibold">{p.name}</td>
                <td className="px-4 py-2">{p.email}</td>
                <td className="px-4 py-2">{p.type === 'intern' ? 'Internal' : 'External'}</td>
                <td className="px-4 py-2">
                  {p.type === 'intern' ? (
                    <span className="text-xs text-gray-400">not required</span>
                  ) : c?.status === 'granted' ? (
                    <span className="inline-flex items-center text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs">
                      🟢 Granted <span className="ml-2 text-gray-500">({c.date})</span>
                    </span>
                  ) : c?.status === 'revoked' ? (
                    <span className="inline-flex items-center text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs">
                      🔴 Revoked <span className="ml-2 text-gray-500">({c.date})</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs">
                      🟡 Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {p.type === 'extern' && (
                    <div className="flex gap-2 items-center justify-end">
                      <button
                        className="btn-ghost text-digital-blue"
                        onClick={() => setShowQR(p.id)}
                        title="Show consent link/QR"
                      >
                        Link/QR
                      </button>
                      {c?.status === 'granted' && (
                        <button
                          className="btn-ghost text-red-500"
                          onClick={() => revokeConsent(p.id)}
                          title="Revoke consent"
                        >
                          Revoke
                        </button>
                      )}
                      {c?.status !== 'granted' && (
                        <button
                          className="btn-ghost text-green-600"
                          onClick={() => grantConsent(p.id)}
                          title="Simulate consent (Demo)"
                        >
                          Simulate Consent
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* QR/Link Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Consent Link/QR for External Participant</h2>
            <div className="mb-4">
              <input
                className="w-full border rounded px-3 py-2 mb-2"
                value={getConsentLink(showQR)}
                readOnly
                onFocus={e => e.target.select()}
              />
              <button
                className="btn-ghost text-digital-blue"
                onClick={() => navigator.clipboard.writeText(getConsentLink(showQR))}
              >
                Copy Link
              </button>
            </div>
            {/* QR Code Dummy */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-100 rounded p-4 text-xs text-gray-400">[QR Code Placeholder]</div>
            </div>
            <div className="flex justify-end">
              <button className="btn-primary" onClick={() => setShowQR(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 