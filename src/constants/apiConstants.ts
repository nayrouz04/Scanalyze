/**
 * apiConstants.ts — centralized API configuration and endpoint paths.
 *
 * API_BASE_URL is read from the environment variable VITE_API_BASE_URL.
 * Never hardcode the URL here — change it in .env instead.
 */

// ── Base URL — loaded from environment variable ───────────────────
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL as string;

// ── Cache tag types (RTK Query invalidation) ─────────────────────
export const API_TAGS = {
  DOCUMENTS: "Documents",
  USERS:     "Users",
} as const;

// ── Endpoint paths ────────────────────────────────────────────────
export const API_ENDPOINTS = {
  // Documents
  UPLOAD:   "upload",
  RESULTS:  "results",
  STATS:    "stats",
  ACTIVITY: "activity",

  // Users
  USERS:         "users",
  USER_BY_ID:    (id: string): string => `users/${id}`,
  USER_ACTIVATE: (id: string): string => `users/${id}/activate`,
} as const;