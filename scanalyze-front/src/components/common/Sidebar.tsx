// Sidebar — navigation latérale du frontoffice utilisateur
import React from "react";
import {
  Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Box, Divider,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@app/hooks";
import { DocumentStepper }  from "@features/stepper";
import { logout }           from "@features/auth/authSlice";
import { colors }           from "@theme";
import logo                 from "@assets/logo.svg";
import { USER_MENU, ROUTES } from "@constants";
import LogoutIcon           from "@mui/icons-material/Logout";
 
const DRAWER_WIDTH = 260;
 
const logoutItemSx = {
  borderRadius: 1,
  color: colors.red,
  "&:hover": { bgcolor: `${colors.red}18` },
} as const;
 
export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
 
  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };
 
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width:         DRAWER_WIDTH,
          boxSizing:     "border-box",
          display:       "flex",
          flexDirection: "column",
          // bgcolor, borderRight, color — already handled by muiTheme MuiDrawer override
        },
      }}
    >
      {/* Logo */}
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img src={logo} alt="Scanalyze" height={35} />
        </Box>
      </Toolbar>
 
      {/* Navigation */}
      <List sx={{ px: 1 }}>
        {USER_MENU.map((item) => (
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
 
      {/* Pipeline stepper */}
      <Divider sx={{ borderColor: colors.border, mx: 2 }} />
      <DocumentStepper />
 
      {/* Spacer */}
      <Box sx={{ flexGrow: 1 }} />
 
      {/* Logout — pinned to bottom */}
      <Divider sx={{ borderColor: colors.border, mx: 2 }} />
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={handleLogout} sx={logoutItemSx}>
          <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Déconnexion"
            primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 500 }}
          />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}