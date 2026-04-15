import React, { createContext, useContext, useRef, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const NavigationContext = createContext(null)

export const NavigationProvider = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  // stack of visited locations (pathname + search)
  const stackRef = useRef([])
  const indexRef = useRef(-1)
  const [, setTick] = useState(0) // force update when stack changes

  // when location changes, push to stack if it's a new navigation
  useEffect(() => {
    const current = location.pathname + (location.search || '')
    const stack = stackRef.current
    const idx = indexRef.current

    // If stack is empty, push
    if (stack.length === 0) {
      stack.push(current)
      indexRef.current = 0
      setTick(t => t + 1)
      return
    }

    // If current equals current stack entry, do nothing
    if (stack[idx] === current) return

    // If navigation moved forward/backwards via our controls, it will match existing entries -- handle elsewhere
    // If new navigation (e.g., link), truncate forward history and push
    const existingIndex = stack.indexOf(current)
    if (existingIndex === -1) {
      // new entry, remove any forward entries
      stack.splice(idx + 1)
      stack.push(current)
      indexRef.current = stack.length - 1
      setTick(t => t + 1)
    } else {
      // visited before; set index to that entry (user used browser nav or history.replace)
      indexRef.current = existingIndex
      setTick(t => t + 1)
    }
  }, [location])

  const canGoBack = () => indexRef.current > 0
  const canGoForward = () => indexRef.current < stackRef.current.length - 1

  const goBack = () => {
    if (!canGoBack()) return false
    indexRef.current -= 1
    const target = stackRef.current[indexRef.current]
    navigate(target)
    setTick(t => t + 1)
    return true
  }

  const goForward = () => {
    if (!canGoForward()) return false
    indexRef.current += 1
    const target = stackRef.current[indexRef.current]
    navigate(target)
    setTick(t => t + 1)
    return true
  }

  // expose the stack for debugging if needed
  const value = {
    canGoBack: () => canGoBack(),
    canGoForward: () => canGoForward(),
    goBack,
    goForward,
    _stack: stackRef.current,
    _index: () => indexRef.current,
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider')
  return ctx
}

export default NavigationContext
