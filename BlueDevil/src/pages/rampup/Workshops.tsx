import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WorkshopTable } from '@/components/WorkshopTable'
import { WorkshopCreateDialog } from '@/components/WorkshopCreateDialog'

export default function Workshops() {
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()

  // Navigiere zur Detailseite
  const handleView = (id: string) => {
    navigate(`/pre-sales/knowledge/workshops/${id}`)
  }

  // Handle workshop creation
  const handleCreateWorkshop = (workshop: any) => {
    console.log('New workshop created:', workshop)
    // TODO: Save to backend
    // For now, just show success message
    alert('Workshop erfolgreich erstellt!')
  }

  return (
    <div>
      <h1 className="text-h2 font-bold mb-6">Workshops</h1>
      <WorkshopTable
        onCreate={() => setShowCreate(true)}
        onView={handleView}
      />

      {/* Verbesserter Workshop-Erstellen Dialog */}
      <WorkshopCreateDialog
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={handleCreateWorkshop}
      />
    </div>
  )
} 