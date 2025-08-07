import React from 'react'
import { BookOpen } from 'lucide-react'

export const CustomerKnowledge: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <BookOpen size={48} className="text-digital-blue mb-4" />
    <h1 className="text-h2 font-bold mb-2">Management von Customer Knowledge</h1>
    <p className="text-lg text-gray-600">Hier kannst du Kundenwissen verwalten und strukturieren.</p>
  </div>
) 