import { useState, useCallback } from 'react'
import {
  apiGetComplaints,
  apiGetComplaintById,
  apiCreateComplaint,
  apiUpdateComplaint,
  apiAddUpdate,
} from '../services/api'

export const useComplaints = () => {
  const [complaints, setComplaints] = useState([])
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchComplaints = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiGetComplaints(filters)

      if (response.success) {
        setComplaints(response.data)
      } else {
        setError(response.error || 'Failed to fetch complaints')
      }

    } catch (err) {
      setError(err.message || 'Failed to fetch complaints')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchComplaintById = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiGetComplaintById(id)

      if (response.success) {
        setSelectedComplaint(response.data)
        return response.data
      }

      setError(response.error)
      return null

    } catch (err) {
      setError(err.message || 'Failed to fetch complaint')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const createComplaint = useCallback(async (complaintData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiCreateComplaint(complaintData)

      if (response.success) {
        setComplaints(prev => [...prev, response.data])
        return response.data
      }

      setError(response.error || 'Failed to create complaint')
      return null

    } catch (err) {
      setError(err.message || 'Failed to create complaint')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateComplaint = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiUpdateComplaint(id, updates)

      if (response.success) {
        setComplaints(prev =>
          prev.map(c => (c.id === id ? response.data : c))
        )

        if (selectedComplaint?.id === id) {
          setSelectedComplaint(response.data)
        }

        return response.data
      }

      setError(response.error)
      return null

    } catch (err) {
      setError(err.message || 'Failed to update complaint')
      return null
    } finally {
      setLoading(false)
    }
  }, [selectedComplaint])

  const addUpdate = useCallback(async (complaintId, message) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiAddUpdate(complaintId, message)

      if (response.success) {
        setComplaints(prev =>
          prev.map(c => (c.id === complaintId ? response.data : c))
        )

        if (selectedComplaint?.id === complaintId) {
          setSelectedComplaint(response.data)
        }

        return response.data
      }

      setError(response.error)
      return null

    } catch (err) {
      setError(err.message || 'Failed to add update')
      return null
    } finally {
      setLoading(false)
    }
  }, [selectedComplaint])

  return {
    complaints,
    selectedComplaint,
    loading,
    error,
    fetchComplaints,
    fetchComplaintById,
    createComplaint,
    updateComplaint,
    addUpdate,
  }
}