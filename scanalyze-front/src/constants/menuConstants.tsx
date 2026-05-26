// menuConstants.tsx — navigation sidebar du frontoffice utilisateur
import React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon    from "@mui/icons-material/Folder";  // ✅ remplace HistoryIcon
import { ROUTES }    from "./routeConstants";

// MenuItem — structure d'un élément de navigation
export interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

// USER_MENU — pages accessibles par l'utilisateur
export const USER_MENU: MenuItem[] = [
  { text: "Dashboard", icon: <DashboardIcon />, path: ROUTES.HOME       },
  { text: "Documents", icon: <FolderIcon />,    path: ROUTES.HISTORIQUE }, // ✅ renommé
];