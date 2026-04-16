import React, { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGetMapPoints, apiClusterGrievances, apiSegregateGrievances, apiSegregateUpdateStatus, apiSegregateUnlink, apiForwardToDepartment, apiGetAllocatedIds } from '../services/api'
import { Sparkles, X, MapPin, AlertTriangle, Loader2, Search, ChevronDown, ChevronRight, Unlink, CheckCircle2, Clock, Hourglass, Send } from 'lucide-react'

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// ── Priority / status colour helpers ──────────────────────────────────────────
const PRIORITY_COLORS = {
  critical: { fill: '#ef4444', stroke: '#dc2626' },
  high: { fill: '#f97316', stroke: '#ea580c' },
  medium: { fill: '#eab308', stroke: '#ca8a04' },
  low: { fill: '#22c55e', stroke: '#16a34a' },
}

const CLUSTER_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f59e0b', '#ef4444', '#3b82f6', '#10b981',
]

function dotColor(priority) {
  return PRIORITY_COLORS[priority] || { fill: '#a1a1aa', stroke: '#71717a' }
}

// ── Map controller to fly to a region ─────────────────────────────────────────
function MapController({ flyTo }) {
  const map = useMap()
  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom || 13, { duration: 0.8 })
    }
  }, [flyTo, map])
  return null
}

// ── Cluster modal ─────────────────────────────────────────────────────────────
function ClusterModal({ cluster, onClose, segregationCache, setSegregationCache }) {
  if (!cluster) return null

  const clusterId = cluster.cluster_id
  const cached = segregationCache[clusterId]
  const [segregated, setSegregated] = useState(!!cached)
  const [segregating, setSegregating] = useState(false)
  const [groups, setGroups] = useState(cached?.groups || [])
  const [expandedGroups, setExpandedGroups] = useState(cached?.expandedGroups || {})
  const [updatingStatus, setUpdatingStatus] = useState({})
  const [unlinking, setUnlinking] = useState({})
  const [forwarding, setForwarding] = useState({})
  const [selectedDepts, setSelectedDepts] = useState({})
  const [forwardedGroups, setForwardedGroups] = useState({})

  const DEPARTMENTS = [
    "BMC - Water Supply Department",
    "BMC - Roads & Infrastructure (PWD)",
    "BMC - Solid Waste Management",
    "BMC - Storm Water Drains",
    "BMC - Public Health Department",
    "Mumbai Police",
    "Maharashtra State Electricity Distribution Company (MSEDCL)",
    "Mumbai Fire Brigade",
    "Mumbai Metropolitan Region Development Authority (MMRDA)",
    "Slum Rehabilitation Authority (SRA)",
    "Maharashtra Pollution Control Board (MPCB)",
    "General Administration (BMC)",
  ]

  // Persist to cache whenever groups change
  useEffect(() => {
    if (segregated && groups.length > 0) {
      setSegregationCache((prev) => ({
        ...prev,
        [clusterId]: { groups, expandedGroups },
      }))
    }
  }, [groups, expandedGroups, segregated, clusterId, setSegregationCache])

  const statusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
    }
    return map[status] || 'bg-zinc-700 text-zinc-300 border-zinc-600'
  }

  const priorityBadge = (priority) => {
    const map = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
    }
    return map[priority] || 'bg-zinc-700 text-zinc-300 border-zinc-600'
  }

  const handleSegregate = async () => {
    setSegregating(true)
    try {
      const ids = cluster.complaints.map((c) => c.id)
      const res = await apiSegregateGrievances(ids)
      if (res.success && res.data.groups) {
        setGroups(res.data.groups)
        setSegregated(true)
        // Auto-expand all groups
        const expanded = {}
        res.data.groups.forEach((_, idx) => { expanded[idx] = true })
        setExpandedGroups(expanded)
      }
    } catch (err) {
      console.error('Segregation failed:', err)
    } finally {
      setSegregating(false)
    }
  }

  const toggleGroup = (idx) => {
    setExpandedGroups((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  const handleStatusChange = async (groupIdx, newStatus) => {
    const group = groups[groupIdx]
    setUpdatingStatus((prev) => ({ ...prev, [groupIdx]: true }))
    try {
      const res = await apiSegregateUpdateStatus(group.child_ids, newStatus)
      if (res.success) {
        setGroups((prev) => prev.map((g, i) => {
          if (i !== groupIdx) return g
          return {
            ...g,
            status: newStatus,
            children: g.children.map((c) => ({ ...c, status: newStatus })),
          }
        }))
      }
    } catch (err) {
      console.error('Status update failed:', err)
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [groupIdx]: false }))
    }
  }

  const handleUnlink = async (groupIdx, childId) => {
    setUnlinking((prev) => ({ ...prev, [childId]: true }))
    try {
      const res = await apiSegregateUnlink(childId)
      if (res.success) {
        setGroups((prev) => {
          const updated = prev.map((g, i) => {
            if (i !== groupIdx) return g
            return {
              ...g,
              children: g.children.filter((c) => c.id !== childId),
              child_ids: g.child_ids.filter((id) => id !== childId),
            }
          })
          // Remove empty groups
          return updated.filter((g) => g.children.length > 0)
        })
      }
    } catch (err) {
      console.error('Unlink failed:', err)
    } finally {
      setUnlinking((prev) => ({ ...prev, [childId]: false }))
    }
  }

  const statusIcon = (s) => {
    if (s === 'resolved') return <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
    if (s === 'in_progress') return <Hourglass className="h-3.5 w-3.5 text-blue-400" />
    return <Clock className="h-3.5 w-3.5 text-yellow-400" />
  }

  const handleForwardToDept = async (groupIdx) => {
    const group = groups[groupIdx]
    const dept = selectedDepts[groupIdx]
    if (!dept) return
    setForwarding((prev) => ({ ...prev, [groupIdx]: true }))
    try {
      const res = await apiForwardToDepartment({
        parent_issue: group.parent_issue,
        category: group.category,
        priority: group.priority,
        dept_allocated: dept,
        child_grievance_ids: group.child_ids,
      })
      if (res.success) {
        setForwardedGroups((prev) => ({ ...prev, [groupIdx]: dept }))
      }
    } catch (err) {
      console.error('Forward to dept failed:', err)
    } finally {
      setForwarding((prev) => ({ ...prev, [groupIdx]: false }))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[10000]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        style={{ borderRadius: '0.6rem' }}
        className="w-full max-w-3xl max-h-[85vh] overflow-hidden bg-zinc-900 border border-zinc-700/60 shadow-[0_24px_80px_rgba(0,0,0,0.8)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <MapPin className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Cluster #{cluster.cluster_id + 1}
              </h2>
              <p className="text-xs text-zinc-500">
                {cluster.count} complaint{cluster.count !== 1 ? 's' : ''} within {(cluster.radius_m / 1000).toFixed(1)} km radius
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle between segregated and flat view */}
            {cached && (
              <button
                onClick={() => setSegregated(!segregated)}
                style={{ borderRadius: '0.4rem' }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700 transition"
              >
                {segregated ? 'Show All' : 'Show Segregated'}
              </button>
            )}
            {!cached && (
              <button
                onClick={handleSegregate}
                disabled={segregating}
                style={{ borderRadius: '0.4rem' }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 ${segregating
                  ? 'bg-purple-500/80 text-white cursor-wait'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
              >
                {segregating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Segregating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    AI Segregate
                  </>
                )}
              </button>
            )}
            <button
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* ── Segregated View: Parent-Child Accordion ── */}
          {segregated && groups.length > 0 && (
            <div className="space-y-3">
              {groups.map((group, gIdx) => (
                <div
                  key={gIdx}
                  style={{ borderRadius: '0.5rem' }}
                  className="bg-zinc-800/50 border border-zinc-700/50 overflow-hidden"
                >
                  {/* Parent Row */}
                  <div
                    className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-800/80 transition"
                    onClick={() => toggleGroup(gIdx)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {expandedGroups[gIdx] ? (
                        <ChevronDown className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          📁 {group.parent_issue}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {group.children.length} grievance{group.children.length !== 1 ? 's' : ''} grouped • {group.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <span
                        style={{ borderRadius: '0.3rem' }}
                        className={`px-2 py-0.5 text-[10px] font-semibold uppercase border ${priorityBadge(group.priority)}`}
                      >
                        {group.priority}
                      </span>
                      {/* Status dropdown */}
                      <div className="relative">
                        <select
                          value={group.status}
                          onChange={(e) => handleStatusChange(gIdx, e.target.value)}
                          disabled={updatingStatus[gIdx] || !!forwardedGroups[gIdx]}
                          style={{ borderRadius: '0.3rem' }}
                          className="appearance-none bg-zinc-700 text-xs text-zinc-200 pl-6 pr-6 py-1 border border-zinc-600 cursor-pointer hover:border-zinc-500 transition disabled:opacity-50 disabled:cursor-wait"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          {updatingStatus[gIdx] ? (
                            <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
                          ) : (
                            statusIcon(group.status)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Children — expanded */}
                  {expandedGroups[gIdx] && (
                    <div className="border-t border-zinc-700/40">
                      {group.children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center justify-between gap-3 px-4 py-2.5 pl-11 border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/40 transition"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-zinc-300 truncate">
                              {child.issue || 'Untitled'}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5 text-[10px] text-zinc-500">
                              <span className="font-mono">{child.complaint_id || child.id}</span>
                              {child.location && <span>📍 {child.location}</span>}
                              {child.source && <span className="capitalize">via {child.source}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              style={{ borderRadius: '0.3rem' }}
                              className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase border ${statusBadge(child.status)}`}
                            >
                              {(child.status || 'pending').replace('_', ' ')}
                            </span>
                            <button
                              onClick={() => handleUnlink(gIdx, child.id)}
                              disabled={unlinking[child.id] || group.children.length <= 1}
                              title={group.children.length <= 1 ? "Can't unlink the last grievance" : "Remove from group"}
                              className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              {unlinking[child.id] ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Unlink className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Forward to Department */}
                  {expandedGroups[gIdx] && (
                    <div className="border-t border-zinc-700/40 px-4 py-3 flex items-center gap-2">
                      {forwardedGroups[gIdx] ? (
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle2 className="h-4 w-4" />
                          Forwarded to {forwardedGroups[gIdx]}
                        </div>
                      ) : (
                        <>
                          <select
                            value={selectedDepts[gIdx] || ''}
                            onChange={(e) => setSelectedDepts((prev) => ({ ...prev, [gIdx]: e.target.value }))}
                            style={{ borderRadius: '0.3rem' }}
                            className="flex-1 appearance-none bg-zinc-700 text-xs text-zinc-200 px-3 py-2 border border-zinc-600 cursor-pointer hover:border-zinc-500 transition"
                          >
                            <option value="">Select Department…</option>
                            {DEPARTMENTS.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleForwardToDept(gIdx)}
                            disabled={!selectedDepts[gIdx] || forwarding[gIdx]}
                            style={{ borderRadius: '0.3rem' }}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {forwarding[gIdx] ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                            Forward
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Flat View: Original complaint list (when not segregated) ── */}
          {!segregated && cluster.complaints.map((c) => (
            <div
              key={c.id}
              style={{ borderRadius: '0.5rem' }}
              className="bg-zinc-800/70 border border-zinc-700/50 p-4 hover:border-zinc-600/60 transition"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {c.issue || 'Untitled complaint'}
                  </p>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    {c.complaint_id || c.id}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    style={{ borderRadius: '0.3rem' }}
                    className={`px-2 py-0.5 text-[10px] font-semibold uppercase border ${priorityBadge(c.priority)}`}
                  >
                    {c.priority || 'N/A'}
                  </span>
                  <span
                    style={{ borderRadius: '0.3rem' }}
                    className={`px-2 py-0.5 text-[10px] font-semibold uppercase border ${statusBadge(c.status)}`}
                  >
                    {(c.status || 'unknown').replace('_', ' ')}
                  </span>
                </div>
              </div>

              {c.description && (
                <p className="text-xs text-zinc-400 line-clamp-2 mb-2">{c.description}</p>
              )}

              <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                {c.category && (
                  <span className="capitalize">📁 {c.category}</span>
                )}
                {c.location && (
                  <span className="truncate max-w-[180px]">📍 {c.location}</span>
                )}
                {c.source && (
                  <span className="capitalize">via {c.source}</span>
                )}
                {c.created_at && (
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer summary */}
        <div className="border-t border-zinc-800 px-6 py-3 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            {segregated ? (
              <>
                <span>📁 {groups.length} unique group{groups.length !== 1 ? 's' : ''}</span>
                <span>📋 {groups.reduce((sum, g) => sum + g.children.length, 0)} total grievances</span>
              </>
            ) : (
              <>
                <span>
                  🔴 {cluster.complaints.filter(c => c.priority === 'critical' || c.priority === 'high').length} high priority
                </span>
                <span>
                  🟡 {cluster.complaints.filter(c => c.status === 'pending').length} pending
                </span>
                <span>
                  ✅ {cluster.complaints.filter(c => c.status === 'resolved').length} resolved
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ borderRadius: '0.4rem' }}
            className="px-4 py-1.5 text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700 transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Map Component ────────────────────────────────────────────────────────
const AdminMumbaiMap = () => {
  const [points, setPoints] = useState([])
  const [clusters, setClusters] = useState([])
  const [noisePoints, setNoisePoints] = useState([])
  const [isClustered, setIsClustered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clustering, setClustering] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCluster, setSelectedCluster] = useState(null)
  const [flyTo, setFlyTo] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [highlightedPointId, setHighlightedPointId] = useState(null)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [segregationCache, setSegregationCache] = useState({}) // cluster_id -> { groups, expandedGroups }

  // Fetch all map points on mount
  const fetchPoints = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGetMapPoints()
      if (res.success) {
        setPoints(res.data)
      } else {
        setError(res.error || 'Failed to load map points')
      }
    } catch (err) {
      setError(err.message || 'Failed to load map points')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPoints()
  }, [fetchPoints])

  // AI Analyze – cluster the points
  const handleCluster = async () => {
    setClustering(true)
    setError(null)
    try {
      const res = await apiClusterGrievances(1.5, 2)
      if (res.success) {
        setClusters(res.data.clusters || [])
        setNoisePoints(res.data.noise || [])
        setIsClustered(true)
      } else {
        setError(res.error || 'Clustering failed')
      }
    } catch (err) {
      setError(err.message || 'Clustering failed')
    } finally {
      setClustering(false)
    }
  }

  // Reset back to individual dots
  const handleReset = () => {
    setClusters([])
    setNoisePoints([])
    setIsClustered(false)
  }

  // Search complaints by title/issue
  const handleSearchChange = (value) => {
    setSearchQuery(value)
    if (value.trim().length === 0) {
      setSearchResults([])
      setShowSearchDropdown(false)
      return
    }
    const q = value.toLowerCase()
    const matches = points.filter(
      (pt) =>
        (pt.issue && pt.issue.toLowerCase().includes(q)) ||
        (pt.complaint_id && pt.complaint_id.toLowerCase().includes(q)) ||
        (pt.location && pt.location.toLowerCase().includes(q))
    ).slice(0, 8)
    setSearchResults(matches)
    setShowSearchDropdown(matches.length > 0)
  }

  const handleSelectSearchResult = (pt) => {
    setHighlightedPointId(pt.id)
    setFlyTo({ lat: pt.latitude, lng: pt.longitude, zoom: 16 })
    setSearchQuery(pt.issue || pt.complaint_id || '')
    setShowSearchDropdown(false)
    // Reset to unclustered view so the individual point is visible
    if (isClustered) handleReset()
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg relative">
      {/* Overlay: Search bar */}
      <div className="absolute top-4 left-4 z-[1000] w-80">
        <div className="relative">
          <div className="flex items-center bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/60 shadow-lg"
            style={{ borderRadius: '0.5rem' }}>
            <Search className="h-4 w-4 text-zinc-400 ml-3 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
              placeholder="Search by title, ID, or location…"
              className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-500 px-3 py-2.5 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchDropdown(false); setHighlightedPointId(null) }}
                className="p-1.5 mr-1.5 text-zinc-500 hover:text-white transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {showSearchDropdown && (
            <div className="absolute top-full mt-1 w-full bg-zinc-900/95 backdrop-blur-sm border border-zinc-700/60 shadow-xl overflow-hidden"
              style={{ borderRadius: '0.5rem' }}>
              {searchResults.map((pt) => (
                <button
                  key={pt.id}
                  onClick={() => handleSelectSearchResult(pt)}
                  className="w-full text-left px-3 py-2.5 hover:bg-zinc-800 transition flex items-start gap-2 border-b border-zinc-800 last:border-0"
                >
                  <MapPin className="h-3.5 w-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200 truncate">{pt.issue || 'Untitled'}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{pt.complaint_id || pt.id} {pt.location ? `· ${pt.location}` : ''}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay: AI Analyze button */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        {isClustered && (
          <button
            onClick={handleReset}
            style={{ borderRadius: '0.5rem' }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold
                       bg-zinc-900/90 backdrop-blur-sm text-zinc-300
                       border border-zinc-700/60 hover:bg-zinc-800 hover:text-white
                       shadow-lg transition-all duration-200"
          >
            <MapPin className="h-4 w-4" />
            Show All Points
          </button>
        )}
        <button
          onClick={handleCluster}
          disabled={clustering || points.length === 0}
          style={{ borderRadius: '0.5rem' }}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold
                     shadow-lg transition-all duration-200
                     ${clustering
              ? 'bg-indigo-500/80 text-white cursor-wait'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }
                     disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {clustering ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              AI Analyze
            </>
          )}
        </button>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-[999] bg-zinc-900/70 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-3 text-zinc-300">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm font-medium">Loading map data…</span>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium rounded-lg backdrop-blur-sm">
          <AlertTriangle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}

      {/* Point count badge */}
      <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-2">
        <span
          style={{ borderRadius: '0.4rem' }}
          className="px-3 py-1.5 text-xs font-semibold bg-zinc-900/90 backdrop-blur-sm text-zinc-300 border border-zinc-700/60 shadow"
        >
          {isClustered
            ? `${clusters.length} cluster${clusters.length !== 1 ? 's' : ''} • ${noisePoints.length} unclustered`
            : `${points.length} complaint${points.length !== 1 ? 's' : ''} on map`
          }
        </span>
      </div>

      {/* The Map */}
      <MapContainer
        center={[19.0760, 72.8777]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />
        <MapController flyTo={flyTo} />

        {/* ── Unclustered view: individual dots ────────────────────────────── */}
        {!isClustered &&
          points.map((pt) => {
            const isHighlighted = pt.id === highlightedPointId
            const color = dotColor(pt.priority)
            return (
              <CircleMarker
                key={pt.id}
                center={[pt.latitude, pt.longitude]}
                radius={isHighlighted ? 12 : 6}
                pathOptions={{
                  color: isHighlighted ? '#facc15' : color.stroke,
                  fillColor: isHighlighted ? '#facc15' : color.fill,
                  fillOpacity: isHighlighted ? 1 : 0.85,
                  weight: isHighlighted ? 3 : 2,
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <p className="font-bold text-sm">{pt.issue || 'Untitled'}</p>
                    <p className="text-xs text-gray-500 font-mono">{pt.complaint_id || pt.id}</p>
                    {pt.description && (
                      <p className="text-xs mt-1 text-gray-600 line-clamp-2">{pt.description}</p>
                    )}
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {pt.category && (
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded capitalize">{pt.category}</span>
                      )}
                      {pt.priority && (
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded capitalize">{pt.priority}</span>
                      )}
                      {pt.status && (
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded capitalize">{pt.status.replace('_', ' ')}</span>
                      )}
                    </div>
                    {pt.location && (
                      <p className="text-[10px] text-gray-400 mt-1">📍 {pt.location}</p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}

        {/* ── Clustered view: circles + inner dots ─────────────────────────── */}
        {isClustered && (
          <>
            {/* Cluster circles */}
            {clusters.map((cluster, idx) => {
              const clusterColor = CLUSTER_COLORS[idx % CLUSTER_COLORS.length]
              return (
                <React.Fragment key={`cluster-${cluster.cluster_id}`}>
                  {/* The cluster circle */}
                  <Circle
                    center={[cluster.center_lat, cluster.center_lng]}
                    radius={cluster.radius_m}
                    pathOptions={{
                      color: clusterColor,
                      fillColor: clusterColor,
                      fillOpacity: 0.12,
                      weight: 2,
                      dashArray: '6, 4',
                    }}
                    eventHandlers={{
                      click: () => setSelectedCluster(cluster),
                    }}
                  >
                    <Popup>
                      <div className="text-center min-w-[140px]">
                        <p className="font-bold text-base">Cluster #{cluster.cluster_id + 1}</p>
                        <p className="text-sm text-gray-600">{cluster.count} complaints</p>
                        <p className="text-xs text-gray-400 mt-1">Click to view details</p>
                      </div>
                    </Popup>
                  </Circle>

                  {/* Individual dots inside the cluster */}
                  {cluster.complaints.map((pt) => {
                    const color = dotColor(pt.priority)
                    return (
                      <CircleMarker
                        key={pt.id}
                        center={[pt.latitude, pt.longitude]}
                        radius={5}
                        pathOptions={{
                          color: color.stroke,
                          fillColor: color.fill,
                          fillOpacity: 0.9,
                          weight: 1.5,
                        }}
                      >
                        <Popup>
                          <div className="min-w-[180px]">
                            <p className="font-bold text-sm">{pt.issue || 'Untitled'}</p>
                            <p className="text-xs text-gray-500 font-mono">{pt.complaint_id}</p>
                            {pt.category && (
                              <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded capitalize">{pt.category}</span>
                            )}
                          </div>
                        </Popup>
                      </CircleMarker>
                    )
                  })}
                </React.Fragment>
              )
            })}

            {/* Noise points (unclustered) – dimmer dots */}
            {noisePoints.map((pt) => {
              const color = dotColor(pt.priority)
              return (
                <CircleMarker
                  key={pt.id}
                  center={[pt.latitude, pt.longitude]}
                  radius={4}
                  pathOptions={{
                    color: color.stroke,
                    fillColor: color.fill,
                    fillOpacity: 0.5,
                    weight: 1,
                  }}
                >
                  <Popup>
                    <div className="min-w-[180px]">
                      <p className="font-bold text-sm">{pt.issue || 'Untitled'}</p>
                      <p className="text-xs text-gray-500 font-mono">{pt.complaint_id}</p>
                      <p className="text-[10px] text-gray-400 mt-1 italic">Not part of any cluster</p>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </>
        )}
      </MapContainer>

      {/* Cluster detail modal */}
      <AnimatePresence>
        {selectedCluster && (
          <ClusterModal
            cluster={selectedCluster}
            onClose={() => setSelectedCluster(null)}
            segregationCache={segregationCache}
            setSegregationCache={setSegregationCache}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminMumbaiMap