import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, ChevronDown, Search, Calendar, MapPin, Users, Tag } from 'lucide-react'
import Card from './ui/Card'
import Input from './ui/Input'
import Button from './ui/Button'

export default function AdvancedFilters({
  onFiltersChange,
  categories = [],
  departments = [],
  showDateRange = true,
  showLocation = true,
  showAssignee = true,
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    department: 'all',
    dateFrom: '',
    dateTo: '',
    location: '',
    assignedTo: 'all',
    source: 'all',
  })

  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value }
    setFilters(updatedFilters)

    // Count active filters
    const activeCount = Object.entries(updatedFilters).filter(([key, value]) => {
      if (key === 'search') return value.trim() !== ''
      if (key === 'dateFrom' || key === 'dateTo') return value !== ''
      return value !== 'all'
    }).length
    setActiveFiltersCount(activeCount)

    // Notify parent component
    onFiltersChange(updatedFilters)
  }

  const resetFilters = () => {
    const resetFilters = {
      search: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      department: 'all',
      dateFrom: '',
      dateTo: '',
      location: '',
      assignedTo: 'all',
      source: 'all',
    }
    setFilters(resetFilters)
    setActiveFiltersCount(0)
    onFiltersChange(resetFilters)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-blue-900 dark:text-blue-100">Advanced Filters</span>
          {activeFiltersCount > 0 && (
            <motion.span
              className="px-2 py-1 text-xs font-bold bg-blue-600 text-white rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              {activeFiltersCount} active
            </motion.span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </motion.div>
      </motion.button>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 space-y-6">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* Search Input */}
                <motion.div variants={itemVariants}>
                  <Input
                    label="Search"
                    placeholder="Search by title, description, or ID..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    icon={Search}
                  />
                </motion.div>

                {/* Status, Priority, Category, Department Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={filters.priority}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    >
                      <option value="all">All Priority</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Department
                    </label>
                    <select
                      value={filters.department}
                      onChange={(e) => handleFilterChange('department', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    >
                      <option value="all">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>

                {/* Additional Filters */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Source */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Source
                    </label>
                    <select
                      value={filters.source}
                      onChange={(e) => handleFilterChange('source', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    >
                      <option value="all">All Sources</option>
                      <option value="web">Web Portal</option>
                      <option value="mobile">Mobile App</option>
                      <option value="twitter">Twitter/X</option>
                      <option value="facebook">Facebook</option>
                    </select>
                  </div>

                  {/* Location */}
                  {showLocation && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location (PIN/Area)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter PIN code or area"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      />
                    </div>
                  )}

                  {/* Assigned To */}
                  {showAssignee && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Assigned To
                      </label>
                      <select
                        value={filters.assignedTo}
                        onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      >
                        <option value="all">All</option>
                        <option value="assigned">Assigned</option>
                        <option value="unassigned">Unassigned</option>
                      </select>
                    </div>
                  )}
                </motion.div>

                {/* Date Range */}
                {showDateRange && (
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Date Range
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">From</label>
                        <input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">To</label>
                        <input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div variants={itemVariants} className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    type="button"
                    onClick={resetFilters}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear All Filters
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="ml-auto"
                  >
                    Apply Filters
                  </Button>
                </motion.div>
              </motion.div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Filter Tags */}
      {activeFiltersCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {Object.entries(filters).map(([key, value]) => {
            if ((key === 'search' && value.trim() === '') ||
                (value === 'all') ||
                (value === '')) {
              return null
            }

            return (
              <motion.button
                key={key}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => handleFilterChange(key, key === 'search' ? '' : 'all')}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Tag className="h-3 w-3" />
                {`${key}: ${value}`}
                <X className="h-3 w-3" />
              </motion.button>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
