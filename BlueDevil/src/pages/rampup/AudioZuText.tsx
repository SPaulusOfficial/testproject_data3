import React from 'react'
import { Mic } from 'lucide-react'

export const AudioZuText: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <Mic size={48} className="text-digital-blue mb-4" />
    <h1 className="text-h2 font-bold mb-2">Audio zu Text</h1>
    <p className="text-lg text-gray-600">Hier kannst du Audiodateien in Text umwandeln.</p>
  </div>
) 