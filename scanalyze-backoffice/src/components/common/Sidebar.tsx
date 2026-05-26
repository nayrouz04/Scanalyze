// Sidebar — navigation latérale du backoffice admin
import React from "react";
import {
  Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Box, Divider,
} from "@mui/material";
import LogoutIcon              from "@mui/icons-material/Logout";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@app/hooks";
import { logout }              from "@features/auth/authSlice";
import { colors }              from "@theme";
import logo                    from "@assets/logo.svg";
import { ADMIN_MENU }          from "@constants";
import { ROUTES }              from "@constants/routeConstants";

const drawerWidth = 260;

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useAppDispatch();
  const { user }  = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width:      drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width:       drawerWidth,
          boxSizing:   "border-box",
          bgcolor:     colors.bgDark,
          borderRight: `1px solid ${colors.border}`,
          display:     "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Zone logo */}
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img src={logo} alt="Scanalyze Backoffice" height={35} />
        </Box>
      </Toolbar>

      {/* Menu de navigation — prend tout l'espace disponible */}
      <List sx={{ px: 1, flexGrow: 1 }}>
        {ADMIN_MENU.map((item) => (
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

      {/* Bouton déconnexion — collé en bas */}
      <Box>
        <Divider sx={{ borderColor: colors.border }} />
        <List sx={{ px: 1, pb: 1 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              color: colors.textWhite,
              "&:hover": {
                bgcolor: "rgba(239, 68, 68, 0.12)",
                color:   "#ef4444",
                "& .MuiListItemIcon-root": { color: "#ef4444" },
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}