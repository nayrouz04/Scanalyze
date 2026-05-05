// topbarConstants.ts — page titles and default values for the Topbar component
import { ROUTES } from "./routeConstants";

// PAGE_TITLES — maps each route path to its display title shown in the Topbar
export const PAGE_TITLES: Record<string, string> = {
  [ROUTES.HOME]:         "Dashboard",
  [ROUTES.UPLOAD]:       "Upload",
  [ROUTES.EDITOR]:       "Editor",
  [ROUTES.VERIFICATION]: "Verification",
  [ROUTES.USERS]:        "User Management",
  [ROUTES.EXPORT]:       "Data Export",
  [ROUTES.HISTORIQUE]:   "Historique",
};

// DEFAULT_TITLE — fallback title when the current route has no match in PAGE_TITLES
export const DEFAULT_TITLE = "Dashboard";

// DEFAULT_USERNAME — fallback display name when no user is authenticated
export const DEFAULT_USERNAME = "Admin";
