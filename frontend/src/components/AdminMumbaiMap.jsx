import React, { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGetMapPoints, apiClusterGrievances } from '../services/api'
import { Sparkles, X, MapPin, AlertTriangle, Loader2 } from 'lucide-react'

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
function ClusterModal({ cluster, onClose }) {
  if (!cluster) return null

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
          <button
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Complaints list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cluster.complaints.map((c) => (
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
            <span>
              🔴 {cluster.complaints.filter(c => c.priority === 'critical' || c.priority === 'high').length} high priority
            </span>
            <span>
              🟡 {cluster.complaints.filter(c => c.status === 'pending').length} pending
            </span>
            <span>
              ✅ {cluster.complaints.filter(c => c.status === 'resolved').length} resolved
            </span>
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

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg relative">
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
            const color = dotColor(pt.priority)
            return (
              <CircleMarker
                key={pt.id}
                center={[pt.latitude, pt.longitude]}
                radius={6}
                pathOptions={{
                  color: color.stroke,
                  fillColor: color.fill,
                  fillOpacity: 0.85,
                  weight: 2,
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
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminMumbaiMap