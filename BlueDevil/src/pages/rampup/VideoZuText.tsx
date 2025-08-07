import React from 'react'
import { Video } from 'lucide-react'

export const VideoZuText: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <Video size={48} className="text-digital-blue mb-4" />
    <h1 className="text-h2 font-bold mb-2">Video zu Text</h1>
    <p className="text-lg text-gray-600">Hier kannst du Videos in Text umwandeln.</p>
  </div>
) 