import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'

/**
 * Wraps any route that requires authentication.
 *
 * Props:
 *   - allowedRoles: string[]  – if provided, user.role must be in this list
 *   - redirectTo:   string    – where to send unauthenticated users (default: '/role-selection')
 */
export default function ProtectedRoute({
    children,
    allowedRoles = [],
    redirectTo = '/role-selection',
}) {
    const { isAuthenticated, authLoading, user } = useUser()
    const location = useLocation()

    // Wait until cookie rehydration finishes before deciding
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
            </div>
        )
    }

    // Not logged in → redirect to role selection, preserving intended path
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />
    }

    // Logged in but wrong role → redirect to their correct dashboard
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        const fallback = user?.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
        return <Navigate to={fallback} replace />
    }

    return children
}
