const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = data?.detail || data?.error || 'Request failed'
    return { success: false, error }
  }

  return { success: true, ...data }
}

const normalizeComplaint = (complaint) => ({
  ...complaint,
  createdAt: complaint.createdAt ? new Date(complaint.createdAt) : null,
  updatedAt: complaint.updatedAt ? new Date(complaint.updatedAt) : null,
  resolutionDeadline: complaint.resolutionDeadline ? new Date(complaint.resolutionDeadline) : null,
  estimatedResolution: complaint.estimatedResolution ? new Date(complaint.estimatedResolution) : null,
  updates: complaint.updates?.map((update) => ({
    ...update,
    date: update.date ? new Date(update.date) : null,
  })) || [],
})

export const apiGetComplaints = async (filters = {}) => {
  const query = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value))
    }
  })

  const response = await request(`/complaints?${query.toString()}`)
  if (!response.success) return response

  return {
    success: true,
    data: response.data.map(normalizeComplaint),
    total: response.total,
  }
}

export const apiGetComplaintById = async (id) => {
  const response = await request(`/complaints/${encodeURIComponent(id)}`)
  if (!response.success) return response

  return { success: true, data: normalizeComplaint(response.data) }
}

export const apiCreateComplaint = async (complaintData) => {
  const response = await request('/complaints', {
    method: 'POST',
    body: JSON.stringify(complaintData),
  })
  if (!response.success) return response

  return { success: true, data: normalizeComplaint(response.data) }
}

export const apiUpdateComplaint = async (id, updates) => {
  const response = await request(`/complaints/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  if (!response.success) return response

  return { success: true, data: normalizeComplaint(response.data) }
}

export const apiAddUpdate = async (id, message) => {
  const response = await request(`/complaints/${encodeURIComponent(id)}/updates`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
  if (!response.success) return response

  return { success: true, data: normalizeComplaint(response.data) }
}

export const apiGetStatistics = async () => {
  const response = await request('/stats')
  if (!response.success) return response

  return { success: true, data: response.data }
}

export const apiGetHotspots = async () => {
  const response = await request('/hotspots')
  if (!response.success) return response

  return { success: true, data: response.data }
}

export const apiGetDepartments = async () => {
  const response = await request('/departments')
  if (!response.success) return response

  return { success: true, data: response.data }
}

export const apiGetCitizenComplaints = async (citizenEmail) => {
  const query = new URLSearchParams({ citizenEmail })
  const response = await request(`/complaints?${query.toString()}`)
  if (!response.success) return response

  return { success: true, data: response.data.map(normalizeComplaint) }
}

// Fetch all complaints for a given pin code / neighborhood
// Backend should accept GET /api/complaints?pinCode=<pinCode>
export const apiGetNeighborhoodComplaints = async (pinCode) => {
  const query = new URLSearchParams()
  if (pinCode) query.append('pinCode', pinCode)
  const response = await request(`/complaints?${query.toString()}`)
  if (!response.success) return response

  return { success: true, data: response.data.map(normalizeComplaint) }
}

export const apiGetComplaintTimeline = async (complaintId) => {
  const response = await request(`/complaints/${encodeURIComponent(complaintId)}/timeline`)
  if (!response.success) return response

  return { success: true, data: response.data.map((entry) => ({
    ...entry,
    date: entry.date ? new Date(entry.date) : null,
  })) }
}

export const apiLogin = async (identifier, password) => {
  const response = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  })
  if (!response.success) return response

  return { success: true, data: response.data, token: response.token }
}

export const apiRegisterCitizen = async (userData) => {
  const response = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
  if (!response.success) return response

  return { success: true, data: response.data, message: response.message }
}

export const apiGetNotifications = async (userId) => {
  return { success: true, data: [] }
}
