// routeConstants.ts — centralized route paths for the entire application
// Always import from here instead of hardcoding path strings
export const ROUTES = {
  // Auth pages
  LOGIN:        "/login",
  SIGNUP:       "/signup",

  // Shared pages (accessible by both admin and regular users)
  HOME:         "/",
  HISTORIQUE:   "/historique",

  // Regular user pipeline pages
  UPLOAD:       "/upload",
  VERIFICATION: "/verification",
  EDITOR:       "/editor",
  EXPORT:       "/export",

  // Admin-only pages
  USERS:        "/users",
} as const;
