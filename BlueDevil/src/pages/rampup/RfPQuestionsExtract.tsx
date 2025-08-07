import React, { useState } from 'react'
import { FileQuestion, Upload, Search, Download, Copy } from 'lucide-react'

interface ExtractedQuestion {
  id: string
  question: string
  category: string
  priority: 'high' | 'medium' | 'low'
  source: string
  page?: number
  context?: string
}

export const RfPQuestionsExtract: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Demo-Daten
  const demoQuestions: ExtractedQuestion[] = [
    {
      id: '1',
      question: 'Welche Integrationen mit bestehenden Systemen sind erforderlich?',
      category: 'Technische Anforderungen',
      priority: 'high',
      source: 'RfP_Acme_GmbH.pdf',
      page: 15,
      context: 'Abschnitt 3.2 - Systemintegration'
    },
    {
      id: '2',
      question: 'Wie wird die DSGVO-Compliance sichergestellt?',
      category: 'Compliance & Sicherheit',
      priority: 'high',
      source: 'RfP_Acme_GmbH.pdf',
      page: 8,
      context: 'Abschnitt 2.1 - Datenschutz'
    },
    {
      id: '3',
      question: 'Welche Schulungsmaßnahmen sind im Angebot enthalten?',
      category: 'Change Management',
      priority: 'medium',
      source: 'RfP_Acme_GmbH.pdf',
      page: 22,
      context: 'Abschnitt 4.3 - Schulung & Support'
    },
    {
      id: '4',
      question: 'Wie sieht der Rollout-Plan aus?',
      category: 'Projektmanagement',
      priority: 'medium',
      source: 'RfP_Acme_GmbH.pdf',
      page: 18,
      context: 'Abschnitt 3.5 - Implementierung'
    }
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
    if (files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const extractQuestions = async () => {
    if (!selectedFile) return
    
    setIsProcessing(true)
    
    // Simuliere KI-Verarbeitung
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setExtractedQuestions(demoQuestions)
    setIsProcessing(false)
  }

  const exportQuestions = (format: 'csv' | 'json' | 'pdf') => {
    console.log(`Exporting questions in ${format} format`)
    // TODO: Implement export logic
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Show success notification
  }

  const categories = ['Technische Anforderungen', 'Compliance & Sicherheit', 'Change Management', 'Projektmanagement', 'Budget & Kosten', 'Support & Wartung']

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileQuestion size={32} className="text-digital-blue" />
        <h1 className="text-h2 font-bold">Fragen aus RfPs extrahieren</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Datei-Upload */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">RfP-Dokumente hochladen</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              Ziehen Sie RfP-Dokumente hierher oder klicken Sie zum Auswählen
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="btn-primary cursor-pointer">
              Dateien auswählen
            </label>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Hochgeladene Dateien:</h3>
              <ul className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedFile && (
            <button
              onClick={extractQuestions}
              disabled={isProcessing}
              className="btn-primary w-full mt-4"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Fragen extrahieren...
                </>
              ) : (
                <>
                  <Search size={16} className="mr-2" />
                  Fragen mit KI extrahieren
                </>
              )}
            </button>
          )}
        </div>

        {/* Extraktions-Einstellungen */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Extraktions-Einstellungen</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fragen-Kategorien</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(category => (
                  <label key={category} className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prioritäts-Filter</label>
              <select className="w-full border rounded px-3 py-2">
                <option>Alle Prioritäten</option>
                <option>Nur High Priority</option>
                <option>High & Medium</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">KI-Modell</label>
              <select className="w-full border rounded px-3 py-2">
                <option>GPT-4 (Standard)</option>
                <option>Claude-3 (Für komplexe Dokumente)</option>
                <option>Gemini Pro (Für technische Inhalte)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Extrahierte Fragen */}
      {extractedQuestions.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                Extrahierte Fragen ({extractedQuestions.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => exportQuestions('csv')}
                  className="btn-ghost flex items-center gap-2"
                >
                  <Download size={16} />
                  CSV Export
                </button>
                <button
                  onClick={() => exportQuestions('json')}
                  className="btn-ghost flex items-center gap-2"
                >
                  <Download size={16} />
                  JSON Export
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {extractedQuestions.map(question => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          question.priority === 'high' ? 'bg-red-100 text-red-800' :
                          question.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {question.priority.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {question.category}
                        </span>
                      </div>
                      <p className="font-medium mb-2">{question.question}</p>
                      <div className="text-sm text-gray-600">
                        <p>Quelle: {question.source}</p>
                        {question.page && <p>Seite: {question.page}</p>}
                        {question.context && <p>Kontext: {question.context}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(question.question)}
                      className="btn-ghost p-2"
                      title="Frage kopieren"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 