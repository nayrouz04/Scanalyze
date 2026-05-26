// routeConstants.ts — chemins de routes du backoffice admin
// Seules les routes accessibles par l'administrateur sont définies ici
export const ROUTES = {
  // Auth
  LOGIN:      "/login",
  SIGNUP:     "/signup",

  // Pages admin
  HOME:       "/",
  HISTORIQUE: "/historique",
  USERS:      "/users",
} as const;