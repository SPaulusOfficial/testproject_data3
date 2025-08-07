import React, { useState } from 'react'

// Dummy data model for workshops
export interface Workshop {
  id: string
  title: string
  date: string
  phase: string
  status: 'planned' | 'running' | 'completed'
  customer: string
  participants: string[]
}

const dummyWorkshops: Workshop[] = [
  {
    id: '1',
    title: 'Kickoff Workshop',
    date: '2024-07-01',
    phase: 'PreSales',
    status: 'completed',
    customer: 'Acme GmbH',
    participants: ['Anna', 'Bernd', 'Clara']
  },
  {
    id: '2',
    title: 'Process Analysis',
    date: '2024-07-10',
    phase: 'Solution',
    status: 'running',
    customer: 'Beta AG',
    participants: ['David', 'Eva']
  },
  {
    id: '3',
    title: 'User Story Mapping',
    date: '2024-07-15',
    phase: 'Build',
    status: 'planned',
    customer: 'Gamma SE',
    participants: ['Frank', 'Gina', 'Heidi']
  }
]

interface WorkshopTableProps {
  onCreate: () => void
  onView: (id: string) => void
}

export const WorkshopTable: React.FC<WorkshopTableProps> = ({ onCreate, onView }) => {
  const [filterPhase, setFilterPhase] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  const filtered = dummyWorkshops.filter(w =>
    (filterPhase ? w.phase === filterPhase : true) &&
    (filterStatus ? w.status === filterStatus : true)
  )

  return (
    <div className="card p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <div className="flex gap-2">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={filterPhase}
            onChange={e => setFilterPhase(e.target.value)}
          >
            <option value="">All Phases</option>
            <option value="PreSales">PreSales</option>
            <option value="Solution">Solution</option>
            <option value="Build">Build</option>
            <option value="Rollout">Rollout</option>
            <option value="Hypercare">Hypercare</option>
          </select>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="planned">Planned</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button
          className="btn-primary"
          onClick={onCreate}
        >
          + Create Workshop
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-off-white">
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Phase</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Participants</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">No workshops found.</td>
              </tr>
            ) : (
              filtered.map(w => (
                <tr key={w.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-semibold">{w.title}</td>
                  <td className="px-4 py-2">{w.date}</td>
                  <td className="px-4 py-2">{w.phase}</td>
                  <td className="px-4 py-2 capitalize">{w.status}</td>
                  <td className="px-4 py-2">{w.customer}</td>
                  <td className="px-4 py-2">{w.participants.join(', ')}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      className="btn-ghost text-digital-blue"
                      onClick={() => onView(w.id)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
} 