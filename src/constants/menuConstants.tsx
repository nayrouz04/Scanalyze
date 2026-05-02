// menuConstants.tsx — sidebar navigation items grouped by user role
// Import the correct menu in Sidebar based on user.role
import React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon    from "@mui/icons-material/People";
import HistoryIcon   from "@mui/icons-material/History";
import { ROUTES }    from "./routeConstants";

// MenuItem — shape of a single navigation entry
export interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

// Admin menu — includes user management in addition to shared pages
export const ADMIN_MENU: MenuItem[] = [
  { text: "Dashboard",  icon: <DashboardIcon />, path: ROUTES.HOME       },
  { text: "Historique", icon: <HistoryIcon />,   path: ROUTES.HISTORIQUE },
  { text: "Users",      icon: <PeopleIcon />,    path: ROUTES.USERS      },
];

// User menu — access to shared pages only (no admin sections)
export const USER_MENU: MenuItem[] = [
  { text: "Dashboard",  icon: <DashboardIcon />, path: ROUTES.HOME       },
  { text: "Historique", icon: <HistoryIcon />,   path: ROUTES.HISTORIQUE },
];
