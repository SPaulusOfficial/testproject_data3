import React from 'react'
import { Map } from 'lucide-react'

export const UseCaseMapping: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <Map size={48} className="text-digital-blue mb-4" />
    <h1 className="text-h2 font-bold mb-2">Use-Case-Mapping</h1>
    <p className="text-lg text-gray-600">Hier kannst du Use Cases erfassen und zuordnen.</p>
  </div>
) 