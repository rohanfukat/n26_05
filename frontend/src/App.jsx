import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { UserProvider } from './context/UserContext'
import { NavigationProvider } from './context/NavigationContext'
import ProtectedRoute from './components/ProtectedRoute'
import Welcome from './pages/Welcome'
import RoleSelection from './pages/RoleSelection'
import UserAuth from './pages/UserAuth'
import AdminAuth from './pages/AdminAuth'
import ComplaintForm from './pages/ComplaintForm'
import CitizenDashboard from './pages/CitizenDashboard'
import AdminDashboard from './pages/AdminDashboard'
import DepartmentDashboard from './pages/DepartmentDashboard'
import OfficerAuth from './pages/OfficerAuth'
import OfficerDashboard from './pages/OfficerDashboard'
import AnalyticsHotspots from './pages/AnalyticsHotspots'
import SocialMediaMonitoring from './pages/SocialMediaMonitoring'
import ComplaintTracking from './pages/ComplaintTracking'
import NeighborhoodComplaints from './pages/NeighborhoodComplaints'

export default function App() {
  return (
    <ThemeProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '10px', fontWeight: '500' },
        }}
      />
      <UserProvider>
        <NotificationsProvider userId="demo_user">
          <Router>
            <NavigationProvider>
              <Routes>
                {/* ── Public Routes ─────────────────────────────────────── */}
                <Route path="/" element={<Welcome />} />
                <Route path="/role-selection" element={<RoleSelection />} />
                <Route path="/user-auth" element={<UserAuth />} />
                <Route path="/admin-auth" element={<AdminAuth />} />
                <Route path="/officer-auth" element={<OfficerAuth />} />

                {/* ── Citizen Protected Routes ───────────────────────────── */}
                <Route
                  path="/complaint"
                  element={
                    <ProtectedRoute allowedRoles={['user']} redirectTo="/user-auth">
                      <ComplaintForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['user']} redirectTo="/user-auth">
                      <CitizenDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/complaint/:complaintId"
                  element={
                    <ProtectedRoute allowedRoles={['user']} redirectTo="/user-auth">
                      <ComplaintTracking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/neighborhood"
                  element={
                    <ProtectedRoute allowedRoles={['user']} redirectTo="/user-auth">
                      <NeighborhoodComplaints />
                    </ProtectedRoute>
                  }
                />

                {/* ── Admin Protected Routes ─────────────────────────────── */}
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin-auth">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/department-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin-auth">
                      <DepartmentDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* ── Officer Protected Routes ───────────────────────────── */}
                <Route
                  path="/officer-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['officer']} redirectTo="/officer-auth">
                      <OfficerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* ── Analytics & Monitoring (admin only) ───────────────── */}
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin-auth">
                      <AnalyticsHotspots />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/social-media"
                  element={
                    <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin-auth">
                      <SocialMediaMonitoring />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </NavigationProvider>
          </Router>
        </NotificationsProvider>
      </UserProvider>
    </ThemeProvider>
  )
}
