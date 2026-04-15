import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, FileText, Home } from 'lucide-react'

const TABS = [
  { label: 'Add Complaint',  path: '/complaint',      icon: Plus },
  { label: 'My Complaints',  path: '/user-dashboard', icon: FileText },
  { label: 'Neighborhood',   path: '/neighborhood',   icon: Home },
]

export default function CitizenNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div
      style={{ borderRadius: '0.4rem' }}
      className="flex items-center gap-0.5 flex-wrap p-1 bg-zinc-900 border border-zinc-700/50 w-fit"
    >
      {TABS.map(({ label, path, icon: Icon }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{ borderRadius: '0.4rem' }}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-150 ${
              active
                ? 'bg-zinc-700 text-white border border-zinc-500/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
