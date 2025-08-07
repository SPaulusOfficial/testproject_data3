import React, { useState } from 'react'
import { Info } from 'lucide-react'

interface PageInfoButtonProps {
  title: string
  content: string
  className?: string
}

export const PageInfoButton: React.FC<PageInfoButtonProps> = ({ title, content, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2 rounded-full bg-digital-blue/10 hover:bg-digital-blue/20 transition-colors ${className}`}
        title={title}
      >
        <Info size={16} className="text-digital-blue" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-gray-700 leading-relaxed overflow-y-auto flex-1 p-6">
              {content}
            </div>
            <div className="mt-6 flex justify-end p-6 pt-0">
                              <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition-colors"
                >
                  Got it
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 