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

    /** PATCH  – Update a grievance by id (admin only) */
    UPDATE: (id: string) => `${API_BASE_URL}/grievances/${id}`,
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
