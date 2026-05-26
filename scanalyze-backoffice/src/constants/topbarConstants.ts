// topbarConstants.ts — titres des pages affichés dans la Topbar du backoffice
import { ROUTES } from "./routeConstants";

// PAGE_TITLES — associe chaque route à son titre affiché dans la Topbar
export const PAGE_TITLES: Record<string, string> = {
  [ROUTES.HOME]:       "Dashboard",
  [ROUTES.HISTORIQUE]: "Historique",
  [ROUTES.USERS]:      "User Management",
};

// DEFAULT_TITLE — titre affiché si la route n'a pas de correspondance
export const DEFAULT_TITLE = "Dashboard";

// DEFAULT_USERNAME — nom affiché si aucun utilisateur n'est authentifié
export const DEFAULT_USERNAME = "Admin";
