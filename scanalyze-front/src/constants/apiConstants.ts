// src/constants/apiConstants.ts
 
export const API_BASE_URL = 'http://localhost:8000/api/v1';

// ── Endpoints ─────────────────────────────────────────────────────────────────
export const API_ENDPOINTS = {
  // Auth
  LOGIN:           "/auth/token",
  REGISTER:        "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  CHANGE_PASSWORD: "/auth/change-password",
 
  // Documents
  DOCUMENTS:        "/documents/",
  MY_DOCUMENTS:     "/documents/me",
  DOCUMENT_BY_ID:   (id: string) => `/documents/${id}`,
  UPLOAD_DOCUMENT:  "/documents/upload",
 
  // Jobs
  JOBS:      "/jobs/",
  JOB_BY_ID: (id: string) => `/jobs/${id}`,
 
  // Admin
  ADMIN_USERS:      "/admin/users",
  ADMIN_USER_BY_ID: (id: string) => `/admin/users/${id}`,
  ADMIN_ENABLE:     (id: string) => `/admin/users/${id}/enable`,
  ADMIN_DISABLE:    (id: string) => `/admin/users/${id}/disable`,
  ADMIN_DASHBOARD:  "/admin/dashboard",
} as const;
 
// ── Cache Tags (RTK Query) ─────────────────────────────────────────────────────
export const API_TAGS = {
  DOCUMENT:  "Document",
  USER:      "User",
  JOB:       "Job",
  DASHBOARD: "Dashboard",
} as const;
 
export type ApiTag = (typeof API_TAGS)[keyof typeof API_TAGS];