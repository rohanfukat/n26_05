// ─────────────────────────────────────────────────────────────────────────────
//  Backend API base URL – override via VITE_API_BASE_URL in .env
// ─────────────────────────────────────────────────────────────────────────────
export const API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// ─────────────────────────────────────────────────────────────────────────────
//  Auth endpoints
// ─────────────────────────────────────────────────────────────────────────────
export const AUTH_URLS = {
    /** POST – Register a new citizen account */
    REGISTER: `${API_BASE_URL}/auth/register`,

    /** POST – Login (citizen or admin).  Body must include `type: "user" | "admin"` */
    LOGIN: `${API_BASE_URL}/auth/login`,
} as const

// ─────────────────────────────────────────────────────────────────────────────
//  Grievance endpoints
// ─────────────────────────────────────────────────────────────────────────────
export const GRIEVANCE_URLS = {
    /** POST   – Submit a new grievance (multipart/form-data, requires JWT) */
    CREATE: `${API_BASE_URL}/grievances`,

    /** GET    – List all grievances, optional query params (admin only) */
    LIST: `${API_BASE_URL}/grievances`,

    /** GET    – Get user complaint statistics (requires JWT) */
    USER_STATS: `${API_BASE_URL}/grievances/user/stats`,

    /** PATCH  – Update a grievance by id (admin only) */
    UPDATE: (id: string) => `${API_BASE_URL}/grievances/${id}`,

    /** GET    – All grievances with lat/lng for map rendering (admin only) */
    MAP_POINTS: `${API_BASE_URL}/grievances/map-points`,

    /** GET    – Get grievance logs (source = api | whatsapp) for admin dashboard */
    LOGS: `${API_BASE_URL}/grievances/logs`,

    /** GET    – Dashboard analytics computed from real data (admin only) */
    STATS: `${API_BASE_URL}/grievances/stats`,

    /** POST   – AI-cluster nearby grievances using DBSCAN (admin only) */
    CLUSTER: `${API_BASE_URL}/grievances/cluster`,

    /** POST   – AI-segregate grievances within a cluster (admin only) */
    SEGREGATE: `${API_BASE_URL}/grievances/segregate`,

    /** PATCH  – Bulk update status for a segregated parent group (admin only) */
    SEGREGATE_UPDATE_STATUS: `${API_BASE_URL}/grievances/segregate/update-status`,

    /** POST   – Unlink a child grievance from its parent group (admin only) */
    SEGREGATE_UNLINK: `${API_BASE_URL}/grievances/segregate/unlink`,

    /** GET    – Get nearby grievances by lat/lng (authenticated user) */
    NEARBY: `${API_BASE_URL}/grievances/nearby`,

    /** POST   – Upvote a grievance (authenticated user) */
    UPVOTE: (id: string) => `${API_BASE_URL}/grievances/${id}/upvote`,
} as const

// ─────────────────────────────────────────────────────────────────────────────
//  Webhook / WhatsApp endpoints
// ─────────────────────────────────────────────────────────────────────────────
export const WEBHOOK_URLS = {
    /** GET  – WhatsApp webhook verification */
    VERIFY: `${API_BASE_URL}/webhook`,

    /** POST – WhatsApp incoming message handler */
    RECEIVE: `${API_BASE_URL}/webhook`,
} as const

// ─────────────────────────────────────────────────────────────────────────────
//  Misc / health
// ─────────────────────────────────────────────────────────────────────────────
export const MISC_URLS = {
    /** GET – Server health check */
    HEALTH: `${API_BASE_URL}/`,
} as const
