import React, { createContext, useState, useCallback, useEffect } from 'react'
import Cookies from 'js-cookie'
import { apiLogin, apiRegisterCitizen } from '../services/api'
import { TOKEN_COOKIE_KEY, USER_COOKIE_KEY } from '../services/axiosInstance'

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  // true while we are checking cookies on first load
  const [authLoading, setAuthLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ── Rehydrate session from cookies on first render ──────────────────────────
  useEffect(() => {
    const token = Cookies.get(TOKEN_COOKIE_KEY)
    const stored = Cookies.get(USER_COOKIE_KEY)
    if (token && stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
        setIsAuthenticated(true)
      } catch {
        // corrupt cookie – clear it
        Cookies.remove(TOKEN_COOKIE_KEY)
        Cookies.remove(USER_COOKIE_KEY)
      }
    }
    setAuthLoading(false)
  }, [])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const _persistSession = (token, userData, remember = false) => {
    const cookieOpts = remember ? { expires: 7 } : undefined   // 7 days or session
    Cookies.set(TOKEN_COOKIE_KEY, token, cookieOpts)
    Cookies.set(USER_COOKIE_KEY, JSON.stringify(userData), cookieOpts)
    setUser(userData)
    setIsAuthenticated(true)
  }

  // ── Login ────────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password, type = 'user', remember = false) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiLogin(email, password, type)
      if (response.success) {
        const { access_token, ...userData } = response.data
        _persistSession(access_token, userData, remember)
        return { success: true, user: userData }
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

  // ── Register ─────────────────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiRegisterCitizen(userData)
      if (response.success) {
        return { success: true, data: response.data }
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

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    Cookies.remove(TOKEN_COOKIE_KEY)
    Cookies.remove(USER_COOKIE_KEY)
    setUser(null)
    setIsAuthenticated(false)
    setError(null)
  }, [])

  // ── Clear error ───────────────────────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), [])

  // ── Update user profile ───────────────────────────────────────────────────────
  const updateUser = useCallback((updatedData) => {
    const newUser = { ...user, ...updatedData }
    setUser(newUser)
    // keep cookie in sync
    const stored = Cookies.get(USER_COOKIE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        Cookies.set(USER_COOKIE_KEY, JSON.stringify({ ...parsed, ...updatedData }))
      } catch { /* ignore */ }
    }
  }, [user])

  const value = {
    user,
    isAuthenticated,
    authLoading,   // expose so ProtectedRoute can wait before redirecting
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
