import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, MapPin, AlertCircle, Activity, BarChart3, PieChart, Calendar } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import Map from '../components/Map'
import { mockComplaints, mockDepartments } from '../data/mockData'
import { getPriorityColor } from '../utils/priorityCalculation'

export default function AnalyticsHotspots() {
  const [selectedMetric, setSelectedMetric] = useState('locations')
  const [timeRange, setTimeRange] = useState('month') // week, month, year
  const [hotspots, setHotspots] = useState([])

  useEffect(() => {
    // Group complaints by location
    const locationMap = {}
    mockComplaints.forEach(complaint => {
      const key = complaint.pinCode || complaint.location
      if (!locationMap[key]) {
        locationMap[key] = {
          location: complaint.location,
          pinCode: complaint.pinCode,
          count: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          categories: {},
        }
      }
      locationMap[key].count += 1
      locationMap[key][complaint.priority] += 1
      locationMap[key].categories[complaint.category] = (locationMap[key].categories[complaint.category] || 0) + 1
    })

    const spotsArray = Object.values(locationMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)

    setHotspots(spotsArray)
  }, [])

  // Calculate trends
  const getCategoryStats = () => {
    const stats = {}
    mockComplaints.forEach(c => {
      stats[c.category] = (stats[c.category] || 0) + 1
    })
    return Object.entries(stats)
      .map(([cat, count]) => ({ category: cat, count }))
      .sort((a, b) => b.count - a.count)
  }

  const getPriorityStats = () => {
    const stats = { critical: 0, high: 0, medium: 0, low: 0 }
    mockComplaints.forEach(c => {
      stats[c.priority] += 1
    })
    return stats
  }

  const getStatusStats = () => {
    const stats = { resolved: 0, in_progress: 0, pending: 0 }
    mockComplaints.forEach(c => {
      stats[c.status] += 1
    })
    return stats
  }

  const getDepartmentStats = () => {
    const stats = {}
    mockDepartments.forEach(d => {
      const count = mockComplaints.filter(c => c.department === d.id).length
      stats[d.id] = { name: d.name, count, icon: d.icon }
    })
    return Object.entries(stats)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
  }

  const categoryStats = getCategoryStats()
  const priorityStats = getPriorityStats()
  const statusStats = getStatusStats()
  const departmentStats = getDepartmentStats()

  // Calculate growth metrics
  const today = new Date()
  const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
  const complaintsThisMonth = mockComplaints.filter(c => new Date(c.createdAt) > monthAgo).length
  const complaintsLastMonth = mockComplaints.filter(c => {
    const d = new Date(c.createdAt)
    return d <= monthAgo && d > new Date(today.getFullYear(), today.getMonth() - 2, today.getDate())
  }).length

  const monthlyGrowth = complaintsLastMonth ? Math.round(((complaintsThisMonth - complaintsLastMonth) / complaintsLastMonth) * 100) : 0
  const resolvedThisMonth = mockComplaints.filter(c => c.status === 'resolved' && new Date(c.updatedAt) > monthAgo).length
  const avgResolutionTime = mockComplaints.filter(c => c.status === 'resolved').length > 0
    ? Math.ceil(mockComplaints
      .filter(c => c.status === 'resolved')
      .reduce((sum, c) => sum + (new Date(c.updatedAt) - new Date(c.createdAt)), 0) / mockComplaints.filter(c => c.status === 'resolved').length / (1000 * 60 * 60 * 24))
    : 0

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-80px)] px-4 py-8 bg-slate-50 dark:bg-slate-900">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Analytics & Insights
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Real-time data on complaints, hotspots, and resolution metrics
            </p>
          </motion.div>

          {/* Key Metrics */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600">
              <div className="flex items-start justify-between">
                <div className="text-white">
                  <p className="text-sm font-semibold opacity-80">Total Complaints</p>
                  <p className="text-4xl font-bold mt-2">{mockComplaints.length}</p>
                </div>
                <Activity className="h-8 w-8 text-white/30" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600">
              <div className="flex items-start justify-between">
                <div className="text-white">
                  <p className="text-sm font-semibold opacity-80">Resolved This Month</p>
                  <p className="text-4xl font-bold mt-2">{resolvedThisMonth}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-white/30" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600">
              <div className="flex items-start justify-between">
                <div className="text-white">
                  <p className="text-sm font-semibold opacity-80">Avg Resolution Time</p>
                  <p className="text-4xl font-bold mt-2">{avgResolutionTime} <span className="text-lg">days</span></p>
                </div>
                <Calendar className="h-8 w-8 text-white/30" />
              </div>
            </Card>

            <Card className={`p-6 bg-gradient-to-br ${monthlyGrowth >= 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'}`}>
              <div className="flex items-start justify-between">
                <div className="text-white">
                  <p className="text-sm font-semibold opacity-80">Monthly Growth</p>
                  <p className="text-4xl font-bold mt-2">{monthlyGrowth > 0 ? '+' : ''}{monthlyGrowth}%</p>
                </div>
                {monthlyGrowth >= 0 ? (
                  <TrendingDown className="h-8 w-8 text-white/30" />
                ) : (
                  <TrendingUp className="h-8 w-8 text-white/30" />
                )}
              </div>
            </Card>
          </motion.div>

          {/* Charts Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Status Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Complaints by Status
              </h3>
              <div className="space-y-4">
                {Object.entries(statusStats).map(([status, count]) => {
                  const statusColors = {
                    resolved: '#10b981',
                    in_progress: '#3b82f6',
                    pending: '#f59e0b',
                  }
                  const percentage = (count / mockComplaints.length) * 100
                  return (
                    <motion.div key={status} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium capitalize text-slate-900 dark:text-slate-100">{status.replace('_', ' ')}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: statusColors[status] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </Card>

            {/* Priority Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Complaints by Priority
              </h3>
              <div className="space-y-4">
                {Object.entries(priorityStats).map(([priority, count]) => {
                  const percentage = (count / mockComplaints.length) * 100
                  return (
                    <motion.div key={priority} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium capitalize text-slate-900 dark:text-slate-100">{priority}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: getPriorityColor(priority) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </Card>
          </motion.div>

          {/* Category & Department Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Categories */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Complaint Categories
              </h3>
              <div className="space-y-3">
                {categoryStats.map((item, i) => (
                  <motion.div
                    key={item.category}
                    className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="font-medium capitalize text-slate-900 dark:text-slate-100">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{item.count}</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {((item.count / mockComplaints.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Department Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Department Complaint Load
              </h3>
              <div className="space-y-3">
                {departmentStats.map((item, i) => (
                  <motion.div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{item.count}</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {((item.count / mockComplaints.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Hotspots */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Complaint Hotspots (Top 15 Locations)
              </h3>
              <Map hotspots={hotspots} />
              <div className="space-y-3 mt-6">
                {hotspots.map((hotspot, i) => {
                  const percentage = (hotspot.count / mockComplaints.length) * 100
                  return (
                    <motion.div
                      key={hotspot.pinCode || hotspot.location}
                      className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {hotspot.pinCode && `${hotspot.pinCode}`}
                            {hotspot.location && (hotspot.pinCode ? ` - ${hotspot.location}` : hotspot.location)}
                          </p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {Object.entries(hotspot.categories)
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 3)
                              .map(([cat, count]) => (
                                <span key={cat} className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded capitalize">
                                  {cat} ({count})
                                </span>
                              ))}
                          </div>
                        </div>
                        <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">{hotspot.count}</span>
                      </div>

                      {/* Priority breakdown */}
                      <div className="flex gap-2 items-center text-xs">
                        {hotspot.critical > 0 && (
                          <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold">
                            🔴 {hotspot.critical} Critical
                          </span>
                        )}
                        {hotspot.high > 0 && (
                          <span className="px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-semibold">
                            🟠 {hotspot.high} High
                          </span>
                        )}
                        {hotspot.medium > 0 && (
                          <span className="px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 font-semibold">
                            🟡 {hotspot.medium} Medium
                          </span>
                        )}
                        {hotspot.low > 0 && (
                          <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold">
                            🟢 {hotspot.low} Low
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 h-2 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                      <div className="text-right mt-1 text-xs text-slate-600 dark:text-slate-400">
                        {percentage.toFixed(1)}% of all complaints
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </PageLayout>
  )
}
