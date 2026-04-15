import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Share2, TrendingUp, AlertCircle, CheckCircle, Clock, Search, Filter, Eye } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { mockComplaints, mockSocialMediaPosts } from '../data/mockData'
import { getPriorityBadge } from '../utils/priorityCalculation'

export default function SocialMediaMonitoring() {
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Filter social media sourced complaints
  const socialComplaints = mockComplaints.filter(c => 
    ['twitter', 'facebook', 'instagram'].includes(c.source)
  ).filter(c => {
    if (selectedPlatform !== 'all' && c.source !== selectedPlatform) return false
    if (filterStatus !== 'all' && c.status !== filterStatus) return false
    if (searchTerm && !c.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !c.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const platformStats = {
    twitter: mockComplaints.filter(c => c.source === 'twitter').length,
    facebook: mockComplaints.filter(c => c.source === 'facebook').length,
    instagram: mockComplaints.filter(c => c.source === 'instagram').length,
  }

  const platforms = [
    { id: 'twitter', name: 'X (Twitter)', icon: '𝕏', color: '#000000', shortColor: 'from-slate-700 to-slate-800', count: platformStats.twitter },
    { id: 'facebook', name: 'Facebook', icon: 'f', color: '#1877F2', shortColor: 'from-blue-600 to-blue-700', count: platformStats.facebook },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F', shortColor: 'from-pink-500 to-orange-400', count: 0 },
  ]

  const sentimentStats = {
    negative: socialComplaints.filter(c => true).length, // All social media posts are typically complaints
    neutral: 0,
    positive: 0,
  }

  const statusBreakdown = {
    pending: socialComplaints.filter(c => c.status === 'pending').length,
    in_progress: socialComplaints.filter(c => c.status === 'in_progress').length,
    resolved: socialComplaints.filter(c => c.status === 'resolved').length,
  }

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
              Social Media Monitoring
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Track and manage complaints from social media platforms in real-time
            </p>
          </motion.div>

          {/* Platform Overview */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {platforms.map((platform) => (
              <motion.button
                key={platform.id}
                onClick={() => setSelectedPlatform(selectedPlatform === platform.id ? 'all' : platform.id)}
                className="relative group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className={`p-6 bg-gradient-to-br ${platform.shortColor} ${selectedPlatform === platform.id ? 'ring-2 ring-blue-500' : ''} transition-all cursor-pointer`}>
                  <div className="text-white">
                    <div className="text-4xl font-bold mb-2 opacity-90">{platform.icon}</div>
                    <h3 className="text-lg font-semibold">{platform.name}</h3>
                    <p className="text-3xl font-bold mt-2">{platform.count}</p>
                    <p className="text-sm opacity-75 mt-1">Complaints</p>
                  </div>
                </Card>
              </motion.button>
            ))}
          </motion.div>

          {/* Key Metrics */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-red-500 to-orange-500">
              <div className="flex items-start justify-between text-white">
                <div>
                  <p className="text-sm font-semibold opacity-80">Negative Sentiment</p>
                  <p className="text-4xl font-bold mt-2">{sentimentStats.negative}</p>
                  <p className="text-xs opacity-75 mt-1">Active complaints</p>
                </div>
                <AlertCircle className="h-10 w-10 opacity-30" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-500 to-cyan-500">
              <div className="flex items-start justify-between text-white">
                <div>
                  <p className="text-sm font-semibold opacity-80">Total Engagement</p>
                  <p className="text-4xl font-bold mt-2">{mockSocialMediaPosts.reduce((sum, p) => sum + (p.likes || 0) + (p.comments || 0) + (p.shares || 0), 0)}</p>
                  <p className="text-xs opacity-75 mt-1">Interactions</p>
                </div>
                <TrendingUp className="h-10 w-10 opacity-30" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-500">
              <div className="flex items-start justify-between text-white">
                <div>
                  <p className="text-sm font-semibold opacity-80">Resolution Rate</p>
                  <p className="text-4xl font-bold mt-2">
                    {socialComplaints.length > 0 ? Math.round((statusBreakdown.resolved / socialComplaints.length) * 100) : 0}%
                  </p>
                  <p className="text-xs opacity-75 mt-1">{statusBreakdown.resolved} resolved</p>
                </div>
                <CheckCircle className="h-10 w-10 opacity-30" />
              </div>
            </Card>
          </motion.div>

          {/* Status Breakdown */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  { status: 'pending', count: statusBreakdown.pending, color: 'bg-yellow-500', icon: '⏳' },
                  { status: 'in_progress', count: statusBreakdown.in_progress, color: 'bg-blue-500', icon: '⚙️' },
                  { status: 'resolved', count: statusBreakdown.resolved, color: 'bg-green-500', icon: '✅' },
                ].map((item) => (
                  <motion.div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      <span className="capitalize font-medium text-slate-900 dark:text-slate-100">
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-white font-semibold text-sm ${item.color}`}>
                        {item.count}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Recent Posts */}
            <Card className="col-span-1 lg:col-span-2 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Recent Social Posts
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {mockSocialMediaPosts.slice(0, 5).map((post, i) => (
                  <motion.div
                    key={post.id}
                    className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-lg font-bold opacity-60">{post.platform === 'twitter' ? '𝕏' : post.platform === 'facebook' ? 'f' : '📷'}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{post.author}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {new Date(post.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 line-clamp-2">{post.content}</p>
                    <div className="flex gap-3 text-xs text-slate-600 dark:text-slate-400">
                      {post.likes && <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes}</span>}
                      {post.comments && <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.comments}</span>}
                      {post.shares && <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /> {post.shares}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Search & Filter */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5" />
                <h3 className="text-lg font-bold">Filter Complaints</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={Search}
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <Button
                  type="button"
                  onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                  variant="secondary"
                  size="md"
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Complaints List */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {socialComplaints.length} Social Media Complaint{socialComplaints.length !== 1 ? 's' : ''}
            </h3>
            {socialComplaints.map((complaint) => {
              const platformInfo = platforms.find(p => p.id === complaint.source)
              return (
                <motion.div key={complaint.id} whileHover={{ scale: 1.01 }}>
                  <Card
                    className="p-6 cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => setSelectedComplaint(complaint)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getPriorityBadge(complaint.priority)}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700">
                                {platformInfo?.icon} {platformInfo?.name}
                              </span>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                              {complaint.title}
                            </h4>
                            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                              {complaint.id}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        complaint.status === 'resolved' ? 'bg-green-500' :
                        complaint.status === 'in_progress' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm line-clamp-2">
                      {complaint.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Sentiment</p>
                        <p className="font-semibold text-red-600 dark:text-red-400">Negative</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Mentions</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {mockSocialMediaPosts.filter(p => p.platform === complaint.source).length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Filed</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Assigned</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{complaint.assignedTo || 'Unassigned'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Location</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{complaint.pinCode || complaint.location}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          {socialComplaints.length === 0 && (
            <motion.div variants={itemVariants}>
              <Card className="p-12 text-center">
                <Eye className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  No Complaints Found
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  No social media complaints match your current filters
                </p>
              </Card>
            </motion.div>
          )}

          {/* Detail Modal */}
          {selectedComplaint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedComplaint(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto"
              >
                <div className="sticky top-0 p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedComplaint.title}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">
                        {selectedComplaint.id} • {selectedComplaint.source.toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedComplaint(null)}
                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Description</p>
                    <p className="text-slate-700 dark:text-slate-300">{selectedComplaint.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Priority</p>
                      <p className="text-2xl">{getPriorityBadge(selectedComplaint.priority)} {selectedComplaint.priority.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Status</p>
                      <p className="text-lg font-bold capitalize">{selectedComplaint.status.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Updates</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedComplaint.updates.map((update, i) => (
                        <div key={i} className="text-xs bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                          <p className="font-semibold text-slate-700 dark:text-slate-300">
                            {new Date(update.date).toLocaleDateString()}
                          </p>
                          <p className="text-slate-600 dark:text-slate-400">{update.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setSelectedComplaint(null)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageLayout>
  )
}
