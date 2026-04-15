import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, FileText, Home } from 'lucide-react'

const TABS = [
  { label: 'Add Complaint',    path: '/complaint',    icon: Plus },
  { label: 'My Complaints',    path: '/user-dashboard', icon: FileText },
  { label: 'My Neighborhood',  path: '/neighborhood', icon: Home },
]

export default function CitizenNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="flex items-center gap-1 flex-wrap mb-8 p-1 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 w-fit">
      {TABS.map(({ label, path, icon: Icon }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 ${
              active
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/80 dark:border-slate-700/60'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/60'
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
