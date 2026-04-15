import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, CheckCircle, AlertCircle, Info, MessageSquare } from 'lucide-react'
import { useNotifications } from '../context/NotificationsContext'
import Card from './ui/Card'
import Button from './ui/Button'

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, removeNotification, clearAllNotifications, markAllAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
      case 'status_update':
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case 'priority_alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-slate-500" />
    }
  }

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20'
      case 'status_update':
        return 'bg-blue-50 dark:bg-blue-900/20'
      case 'priority_alert':
        return 'bg-red-50 dark:bg-red-900/20'
      default:
        return 'bg-slate-50 dark:bg-slate-800'
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="h-6 w-6 text-slate-700 dark:text-slate-300" />
        {unreadCount > 0 && (
          <motion.span
            className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notifications Panel */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 z-50 drop-shadow-xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Notifications</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {unreadCount > 0 && (
                  <p className="text-sm opacity-90 mt-1">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700">
                {notifications.length > 0 ? (
                  notifications.map((notification, i) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.05 }}
                      role="button"
                      tabIndex={0}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id)
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold text-slate-900 dark:text-slate-100 ${!notification.read ? 'font-bold' : ''}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                            {new Date(notification.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeNotification(notification.id)
                          }}
                          className="flex-shrink-0 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4 text-slate-500" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      No notifications yet
                    </p>
                  </div>
                )}
              </div>

              {/* Footer with Actions */}
              {notifications.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2 bg-slate-50 dark:bg-slate-800/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="flex-1 text-xs"
                  >
                    Mark All Read
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="flex-1 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
