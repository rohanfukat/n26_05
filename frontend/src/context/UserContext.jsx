import React, { createContext, useState, useCallback, useEffect } from 'react'
import { apiLogin, apiRegisterCitizen } from '../services/api'

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Login function
  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiLogin(email, password)
      if (response.success) {
        setUser(response.data)
        setIsAuthenticated(true)
        return { success: true, user: response.data }
      } else {
        setError(response.error || 'Login failed')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMsg = 'An error occurred during login'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  // Register function
  const register = useCallback(async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiRegisterCitizen(userData)
      if (response.success) {
        return { success: true, user: response.data }
      } else {
        setError(response.error || 'Registration failed')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMsg = 'An error occurred during registration'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    setError(null)
    localStorage.removeItem('grievanceflow_user')
    localStorage.removeItem('grievanceflow_token')
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Update user profile
  const updateUser = useCallback((updatedData) => {
    const newUser = { ...user, ...updatedData }
    setUser(newUser)
  }, [user])

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    updateUser,
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

// Hook to use user context
export const useUser = () => {
  const context = React.useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
