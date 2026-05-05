/**
 * ApiUrls — single source of truth for all API URLs.
 *
 * BASE_URL is read from the environment variable VITE_API_BASE_URL.
 * All endpoint paths are defined here and built relative to BASE_URL.
 *
 * Usage:
 *   import { ApiUrls } from "@constants/ApiUrls";
 *   fetch(ApiUrls.BASE_URL + ApiUrls.RESULTS)
 *   // or via RTK Query: baseUrl: ApiUrls.BASE_URL, url: ApiUrls.RESULTS
 */
export const ApiUrls = {
  // Base URL — loaded from the environment variable, never hardcoded
  BASE_URL: import.meta.env.VITE_API_BASE_URL as string,

  // ─── Document endpoints ───────────────────────────────────────
  UPLOAD:   "upload",
  RESULTS:  "results",
  STATS:    "stats",
  ACTIVITY: "activity",

  // ─── User endpoints ───────────────────────────────────────────
  USERS:         "users",
  USER_BY_ID:    (id: string) => `users/${id}`,
  USER_ACTIVATE: (id: string) => `users/${id}/activate`,
} as const;
