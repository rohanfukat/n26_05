import axiosInstance from "./axiosInstance";
import { AUTH_URLS, GRIEVANCE_URLS } from "../apiurls.ts";

// ─────────────────────────────────────────────────────────────────────────────
//  Generic helper – wraps every axios call in a { success, data, error } shape
// ─────────────────────────────────────────────────────────────────────────────
const request = async (axiosCall) => {
  try {
    const response = await axiosCall();
    return { success: true, data: response.data };
  } catch (error) {
    // Prefer the backend's structured error detail over the generic axios message
    const detail =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      "An unexpected error occurred.";
    return { success: false, error: detail };
  }
};

const normalizeComplaint = (complaint) => ({
  ...complaint,
  createdAt: complaint.createdAt ? new Date(complaint.createdAt) : null,
  updatedAt: complaint.updatedAt ? new Date(complaint.updatedAt) : null,
  resolutionDeadline: complaint.resolutionDeadline
    ? new Date(complaint.resolutionDeadline)
    : null,
  estimatedResolution: complaint.estimatedResolution
    ? new Date(complaint.estimatedResolution)
    : null,
  updates:
    complaint.updates?.map((update) => ({
      ...update,
      date: update.date ? new Date(update.date) : null,
    })) || [],
});

export const apiGetComplaints = async (filters = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  const response = await request(`/complaints?${query.toString()}`);
  if (!response.success) return response;

  return {
    success: true,
    data: response.data.map(normalizeComplaint),
    total: response.total,
  };
};

export const apiGetComplaintById = async (id) => {
  const response = await request(`/complaints/${encodeURIComponent(id)}`);
  if (!response.success) return response;

  return { success: true, data: normalizeComplaint(response.data) };
};

/**
 * Create a new grievance via the backend /grievances endpoint
 * Expects FormData with: issue, description, location, latitude, longitude, before_photo (optional)
 */
export const apiCreateComplaint = async (grievanceData) => {
  return request(() =>
    axiosInstance.post(GRIEVANCE_URLS.CREATE, grievanceData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  );
};

/**
 * Get user complaint statistics
 * Returns: { total_complaints, resolved, in_progress, pending, complaints: [] }
 */
export const apiGetUserStats = async () => {
  return request(() => axiosInstance.get(GRIEVANCE_URLS.USER_STATS));
};

/**
 * Get all grievances with lat/lng for map rendering (admin only)
 * Returns: MapPointResponse[]
 */
export const apiGetMapPoints = async () => {
  return request(() => axiosInstance.get(GRIEVANCE_URLS.MAP_POINTS));
};

/**
 * AI-cluster nearby grievances using DBSCAN (admin only)
 * @param {number} epsKm - radius in km for neighbourhood (default 1.5)
 * @param {number} minSamples - minimum points to form cluster (default 2)
 * Returns: { clusters: ClusterItem[], noise: MapPointResponse[] }
 */
export const apiClusterGrievances = async (epsKm = 1.5, minSamples = 2) => {
  return request(() =>
    axiosInstance.post(GRIEVANCE_URLS.CLUSTER, {
      eps_km: epsKm,
      min_samples: minSamples,
    }),
  );
};

/**
 * Get grievance logs — grievances with source = api | whatsapp (admin only)
 */
export const apiGetGrievanceLogs = async () => {
  return request(() => axiosInstance.get(GRIEVANCE_URLS.LOGS));
};

/**
 * Get dashboard analytics — computed from real grievance data (admin only)
 * Returns: { totalComplaints, resolvedComplaints, inProgressComplaints, pendingComplaints,
 *            criticalComplaints, byStatus, monthlyData, categoryData, avgResolutionDays,
 *            sourceBreakdown, priorityBreakdown }
 */
export const apiGetDashboardStats = async () => {
  return request(() => axiosInstance.get(GRIEVANCE_URLS.STATS));
};

/**
 * Update a grievance (admin only) via PATCH /grievances/{id}
 */
export const apiUpdateComplaint = async (id, updates) => {
  return request(() => axiosInstance.patch(GRIEVANCE_URLS.UPDATE(id), updates));
};

export const apiAddUpdate = async (id, message) => {
  const response = await request(
    `/complaints/${encodeURIComponent(id)}/updates`,
    {
      method: "POST",
      body: JSON.stringify({ message }),
    },
  );
  if (!response.success) return response;

  return { success: true, data: normalizeComplaint(response.data) };
};

export const apiGetStatistics = async () => {
  const response = await request("/stats");
  if (!response.success) return response;

  return { success: true, data: response.data };
};

export const apiGetHotspots = async () => {
  const response = await request("/hotspots");
  if (!response.success) return response;

  return { success: true, data: response.data };
};

export const apiGetDepartments = async () => {
  const response = await request("/departments");
  if (!response.success) return response;

  return { success: true, data: response.data };
};

export const apiGetCitizenComplaints = async (citizenEmail) => {
  const query = new URLSearchParams({ citizenEmail });
  const response = await request(`/complaints?${query.toString()}`);
  if (!response.success) return response;

  return { success: true, data: response.data.map(normalizeComplaint) };
};

// Fetch all complaints for a given pin code / neighborhood
// Backend should accept GET /api/complaints?pinCode=<pinCode>
export const apiGetNeighborhoodComplaints = async (pinCode) => {
  const query = new URLSearchParams();
  if (pinCode) query.append("pinCode", pinCode);
  const response = await request(`/complaints?${query.toString()}`);
  if (!response.success) return response;

  return { success: true, data: response.data.map(normalizeComplaint) };
};

export const apiGetComplaintTimeline = async (complaintId) => {
  const response = await request(
    `/complaints/${encodeURIComponent(complaintId)}/timeline`,
  );
  if (!response.success) return response;

  return {
    success: true,
    data: response.data.map((entry) => ({
      ...entry,
      date: entry.date ? new Date(entry.date) : null,
    })),
  };
};

export const apiLogin = async (email, password, type = "user") => {
  return request(() =>
    axiosInstance.post(AUTH_URLS.LOGIN, { email, password, type }),
  );
};

export const apiRegisterCitizen = async (userData) => {
  const password = userData.password;
  const confirmPassword =
    userData.confirmPassword || userData.confirm_password || password;
  return request(() =>
    axiosInstance.post(AUTH_URLS.REGISTER, {
      full_name: userData.name || userData.full_name,
      email: userData.email,
      mobile_number: (userData.phone || userData.mobile_number || "")
        .replace(/\D/g, "")
        .slice(-10),
      password,
      confirm_password: confirmPassword,
      city: userData.city || "",
    }),
  );
};

export const apiGetNotifications = async () => {
  return { success: true, data: [] };
};
