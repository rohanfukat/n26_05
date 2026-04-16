import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, CheckCircle2, Clock, Loader2, ChevronDown, ChevronRight, MapPin, FileText, Image as ImageIcon } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import { useUser } from '../context/UserContext'
import { apiGetDepartmentGrievances, apiResolveDeptGrievance } from '../services/api'
import toast from 'react-hot-toast'

const priorityBadge = (priority) => {
    const map = {
        critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    }
    return map[priority] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
}

const statusBadge = (status) => {
    const map = {
        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    }
    return map[status] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
}

export default function OfficerDashboard() {
    const { user } = useUser()
    const [grievances, setGrievances] = useState([])
    const [loading, setLoading] = useState(true)
    const [resolving, setResolving] = useState({})
    const [expanded, setExpanded] = useState({})

    useEffect(() => {
        fetchGrievances()
    }, [])

    const fetchGrievances = async () => {
        setLoading(true)
        try {
            const res = await apiGetDepartmentGrievances()
            if (res.success) {
                setGrievances(res.data)
            }
        } catch (err) {
            console.error('Failed to fetch department grievances:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleResolve = async (id) => {
        setResolving((prev) => ({ ...prev, [id]: true }))
        try {
            const res = await apiResolveDeptGrievance(id)
            if (res.success) {
                toast.success('Grievance resolved successfully')
                setGrievances((prev) =>
                    prev.map((g) => (g.id === id ? { ...g, status: 'resolved' } : g))
                )
            } else {
                toast.error(res.error || 'Failed to resolve')
            }
        } catch (err) {
            toast.error('Failed to resolve grievance')
        } finally {
            setResolving((prev) => ({ ...prev, [id]: false }))
        }
    }

    const toggleExpand = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    const pendingCount = grievances.filter((g) => g.status !== 'resolved').length
    const resolvedCount = grievances.filter((g) => g.status === 'resolved').length

    return (
        <PageLayout>
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <Building2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                Department Dashboard
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {user?.department || 'Department'} — Logged in as {user?.full_name || user?.email}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <Card className="p-4 text-center">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{grievances.length}</p>
                        <p className="text-xs text-slate-500">Total Assigned</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                        <p className="text-xs text-slate-500">Pending</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
                        <p className="text-xs text-slate-500">Resolved</p>
                    </Card>
                </div>

                {/* Grievance List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        <span className="ml-3 text-slate-500">Loading grievances…</span>
                    </div>
                ) : grievances.length === 0 ? (
                    <Card className="p-10 text-center">
                        <p className="text-slate-500">No grievances assigned to your department yet.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {grievances.map((g, idx) => (
                            <motion.div
                                key={g.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="overflow-hidden">
                                    {/* Parent row */}
                                    <div
                                        className="flex items-center justify-between gap-4 p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                                        onClick={() => toggleExpand(g.id)}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {expanded[g.id] ? (
                                                <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                                                    {g.parent_issue}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {g.category} • {g.child_grievance_ids?.length || 0} child grievance(s)
                                                    {g.created_at && ` • ${new Date(g.created_at).toLocaleDateString()}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <span className={`px-2 py-1 text-[10px] font-semibold uppercase rounded ${priorityBadge(g.priority)}`}>
                                                {g.priority}
                                            </span>
                                            <span className={`px-2 py-1 text-[10px] font-semibold uppercase rounded ${statusBadge(g.status)}`}>
                                                {(g.status || 'pending').replace('_', ' ')}
                                            </span>
                                            {g.status !== 'resolved' ? (
                                                <button
                                                    onClick={() => handleResolve(g.id)}
                                                    disabled={resolving[g.id]}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-green-600 hover:bg-green-500 text-white transition disabled:opacity-50 disabled:cursor-wait"
                                                >
                                                    {resolving[g.id] ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    )}
                                                    Resolve
                                                </button>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Resolved
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Child grievances — expanded */}
                                    {expanded[g.id] && g.children && g.children.length > 0 && (
                                        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                                            {g.children.map((child, cIdx) => (
                                                <div
                                                    key={child.id}
                                                    className="px-5 py-4 pl-12 border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <FileText className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                                    {child.issue || 'Untitled'}
                                                                </p>
                                                                {child.complaint_id && (
                                                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                                                        {child.complaint_id}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {child.description && (
                                                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-3">
                                                                    {child.description}
                                                                </p>
                                                            )}

                                                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                                                                {child.location && (
                                                                    <span className="flex items-center gap-1">
                                                                        <MapPin className="h-3 w-3" />
                                                                        {child.location}
                                                                    </span>
                                                                )}
                                                                {child.latitude && child.longitude && (
                                                                    <span className="font-mono">
                                                                        {Number(child.latitude).toFixed(4)}, {Number(child.longitude).toFixed(4)}
                                                                    </span>
                                                                )}
                                                                {child.category && (
                                                                    <span className="capitalize bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                                                        {child.category}
                                                                    </span>
                                                                )}
                                                                {child.priority && (
                                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${priorityBadge(child.priority)}`}>
                                                                        {child.priority}
                                                                    </span>
                                                                )}
                                                                {child.status && (
                                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${statusBadge(child.status)}`}>
                                                                        {(child.status || '').replace('_', ' ')}
                                                                    </span>
                                                                )}
                                                                {child.source && (
                                                                    <span className="capitalize">via {child.source}</span>
                                                                )}
                                                                {child.created_at && (
                                                                    <span>{new Date(child.created_at).toLocaleDateString()}</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Photo */}
                                                        {(child.before_photo || child.after_photo) && (
                                                            <div className="flex gap-2 flex-shrink-0">
                                                                {child.before_photo && (
                                                                    <a href={child.before_photo} target="_blank" rel="noopener noreferrer" className="block">
                                                                        <div className="relative group">
                                                                            <img
                                                                                src={child.before_photo}
                                                                                alt="Before"
                                                                                className="h-20 w-20 object-cover rounded-lg border border-slate-200 dark:border-slate-600 hover:opacity-80 transition"
                                                                            />
                                                                            <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-black/60 text-white px-1 rounded">Before</span>
                                                                        </div>
                                                                    </a>
                                                                )}
                                                                {child.after_photo && (
                                                                    <a href={child.after_photo} target="_blank" rel="noopener noreferrer" className="block">
                                                                        <div className="relative group">
                                                                            <img
                                                                                src={child.after_photo}
                                                                                alt="After"
                                                                                className="h-20 w-20 object-cover rounded-lg border border-slate-200 dark:border-slate-600 hover:opacity-80 transition"
                                                                            />
                                                                            <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-black/60 text-white px-1 rounded">After</span>
                                                                        </div>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </PageLayout>
    )
}
