import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

const dummyParticipants = {
  '2': { name: 'Bernd', email: 'bernd@kunde.com' },
  '3': { name: 'Clara', email: 'clara@kunde.com' },
}

export default function ConsentPage() {
  const { projectId, participantId } = useParams()
  const participant = dummyParticipants[participantId as keyof typeof dummyParticipants]
  const [status, setStatus] = useState<'pending' | 'granted' | 'revoked'>('pending')

  const handleGrant = () => setStatus('granted')
  const handleRevoke = () => setStatus('revoked')

  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Einwilligung zur Audio-Aufnahme</h1>
        {participant ? (
          <>
            <p className="mb-2 text-gray-700">
              Hallo <span className="font-semibold">{participant.name}</span> ({participant.email})<br />
              für das Projekt <span className="font-mono">{projectId}</span>
            </p>
            <div className="mb-4 text-sm text-gray-600">
              Für die Teilnahme an Workshops dieses Projekts benötigen wir Ihre Einwilligung zur Audio-Aufnahme und Transkription. Sie können Ihre Einwilligung jederzeit widerrufen.
            </div>
            {status === 'pending' && (
              <button className="btn-primary w-full mb-2" onClick={handleGrant}>
                Einwilligung erteilen
              </button>
            )}
            {status === 'granted' && (
              <div className="mb-2 text-green-700 bg-green-100 px-3 py-2 rounded text-center">
                🟢 Einwilligung erteilt. Sie können an allen künftigen Terminen teilnehmen.
              </div>
            )}
            {status === 'revoked' && (
              <div className="mb-2 text-red-700 bg-red-100 px-3 py-2 rounded text-center">
                🔴 Einwilligung widerrufen. Sie können nicht mehr an Audio-Workshops teilnehmen.
              </div>
            )}
            <button
              className="btn-ghost w-full mt-2"
              onClick={handleRevoke}
              disabled={status === 'revoked'}
            >
              Einwilligung widerrufen
            </button>
          </>
        ) : (
          <div className="text-red-500">Teilnehmer nicht gefunden.</div>
        )}
      </div>
    </div>
  )
} 