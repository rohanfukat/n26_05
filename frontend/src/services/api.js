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

export const apiCreateComplaint = async (complaintData) => {
  const response = await request("/complaints", {
    method: "POST",
    body: JSON.stringify(complaintData),
  });
  if (!response.success) return response;

  return { success: true, data: normalizeComplaint(response.data) };
};

export const apiUpdateComplaint = async (id, updates) => {
  const response = await request(`/complaints/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  if (!response.success) return response;

  return { success: true, data: normalizeComplaint(response.data) };
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
