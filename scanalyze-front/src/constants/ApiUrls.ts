/**
 * ApiUrls — central configuration
 * for all backend endpoints.
 */

export const ApiUrls = {

  // Base backend URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL as string,

  // ─────────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────────

  LOGIN: "/auth/token",

  REGISTER: "/auth/register",

  CHANGE_PASSWORD: "/auth/change-password",

  FORGOT_PASSWORD: "/auth/forgot-password",

  // ─────────────────────────────────────────────
  // DOCUMENTS
  // ─────────────────────────────────────────────

  UPLOAD: "/documents/upload",

  MY_DOCUMENTS: "/documents/me",

  DOCUMENTS: "/documents",

  DOCUMENT_BY_ID: (id: string) =>
    `/documents/${id}`,

  // ─────────────────────────────────────────────
  // JOBS
  // ─────────────────────────────────────────────

  JOBS: "/jobs",

  JOB_BY_ID: (id: string) =>
    `/jobs/${id}`,

  // ─────────────────────────────────────────────
  // ADMIN
  // ─────────────────────────────────────────────

  USERS: "/admin/users",

  USER_BY_ID: (id: string) =>
    `/admin/users/${id}`,

  DISABLE_USER: (id: string) =>
    `/admin/users/${id}/disable`,

  ENABLE_USER: (id: string) =>
    `/admin/users/${id}/enable`,

  DASHBOARD: "/admin/dashboard",

} as const;