import React, { createContext, useState, useCallback, useEffect } from 'react'
import { apiGetNotifications } from '../services/api'

export const NotificationsContext = createContext()

export const NotificationsProvider = ({ children, userId }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const response = await apiGetNotifications(userId)
      if (response.success) {
        setNotifications(response.data)
        const unread = response.data.filter(n => !n.read).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Add notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: `N${Date.now()}`,
      timestamp: new Date(),
      read: false,
      ...notification,
    }
    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)

    // Auto-dismiss after 5 seconds for temporary notifications
    if (notification.temporary !== false) {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, 5000)
    }
  }, [])

  // Mark as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => {
      let wasUnread = false
      const next = prev.map(n => {
        if (n.id === notificationId && !n.read) {
          wasUnread = true
          return { ...n, read: true }
        }
        return n
      })
      if (wasUnread) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1))
      }
      return next
    })
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  // Remove notification
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const removed = prev.find(n => n.id === notificationId)
      if (removed && !removed.read) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1))
      }
      return prev.filter(n => n.id !== notificationId)
    })
  }, [])

  // Clear all
  const clearAllNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  // Fetch on mount
  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [userId, fetchNotifications])

  const value = {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  }

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

// Hook to use notifications
export const useNotifications = () => {
  const context = React.useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }
  return context
}
