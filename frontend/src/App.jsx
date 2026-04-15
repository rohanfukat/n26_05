import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { UserProvider } from './context/UserContext'
import { NavigationProvider } from './context/NavigationContext'
import Welcome from './pages/Welcome'
import RoleSelection from './pages/RoleSelection'
import UserAuth from './pages/UserAuth'
import AdminAuth from './pages/AdminAuth'
import ComplaintForm from './pages/ComplaintForm'
import CitizenDashboard from './pages/CitizenDashboard'
import AdminDashboard from './pages/AdminDashboard'
import DepartmentDashboard from './pages/DepartmentDashboard'
import AnalyticsHotspots from './pages/AnalyticsHotspots'
import SocialMediaMonitoring from './pages/SocialMediaMonitoring'
import ComplaintTracking from './pages/ComplaintTracking'

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <NotificationsProvider userId="demo_user">
          <Router>
            <NavigationProvider>
              <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/user-auth" element={<UserAuth />} />
            <Route path="/admin-auth" element={<AdminAuth />} />

            {/* Complaint Filing */}
            <Route path="/complaint" element={<ComplaintForm />} />

            {/* Citizen Routes */}
            <Route path="/user-dashboard" element={<CitizenDashboard />} />
            <Route path="/complaint/:complaintId" element={<ComplaintTracking />} />

            {/* Admin Routes */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/department-dashboard" element={<DepartmentDashboard />} />

            {/* Analytics & Monitoring */}
            <Route path="/analytics" element={<AnalyticsHotspots />} />
            <Route path="/social-media" element={<SocialMediaMonitoring />} />
              </Routes>
            </NavigationProvider>
          </Router>
        </NotificationsProvider>
      </UserProvider>
    </ThemeProvider>
  )
}
