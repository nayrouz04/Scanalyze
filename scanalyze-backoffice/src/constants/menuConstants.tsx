// menuConstants.tsx — navigation sidebar du backoffice admin
import React from "react";
import DashboardIcon  from "@mui/icons-material/Dashboard";
import PeopleIcon     from "@mui/icons-material/People";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { ROUTES }     from "./routeConstants";

export interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

export const ADMIN_MENU: MenuItem[] = [
  { text: "Dashboard", icon: <DashboardIcon />,  path: ROUTES.HOME       },
  { text: "Documents", icon: <FolderOpenIcon />, path: ROUTES.HISTORIQUE },
  { text: "Users",     icon: <PeopleIcon />,     path: ROUTES.USERS      },
];