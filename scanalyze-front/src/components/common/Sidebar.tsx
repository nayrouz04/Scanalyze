// Sidebar — persistent left navigation drawer
// Shows different menu items based on user role (admin vs user)
// Non-admin users also see the DocumentStepper for pipeline navigation
import React from "react";
import {
  Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Box, Divider,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector }        from "@app/hooks";
import { DocumentStepper }       from "@features/stepper";
import { colors }                from "@theme";
import logo                      from "@assets/logo.svg";
import { ADMIN_MENU, USER_MENU } from "@constants";

// Fixed width of the sidebar — must match any layout that references it
const drawerWidth = 260;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user }  = useAppSelector((state) => state.auth);
  const isAdmin   = user?.role === "admin";
  const menuItems = isAdmin ? ADMIN_MENU : USER_MENU;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width:      drawerWidth,
        flexShrink: 0,
        // Paper inherits position:fixed from MUI by default for permanent drawers.
        // We only override visual styles here — NOT position or width on the wrapper,
        // so MUI can correctly reserve the space in the parent flex container.
        "& .MuiDrawer-paper": {
          width:       drawerWidth,
          boxSizing:   "border-box",
          bgcolor:     colors.bgDark,
          borderRight: `1px solid ${colors.border}`,
        },
      }}
    >
      {/* Logo area */}
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img src={logo} alt="Scanalyze" height={35} />
        </Box>
      </Toolbar>

      {/* Navigation menu items — highlights the active route */}
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon sx={{ color: colors.textWhite }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>

      {/* Document processing stepper — only visible for non-admin users */}
      {!isAdmin && (
        <>
          <Divider sx={{ borderColor: colors.border, mx: 2 }} />
          <DocumentStepper />
        </>
      )}
    </Drawer>
  );
}
