import {
  Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Box, Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon    from "@mui/icons-material/People";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector }    from "../../app/hooks";
import { DocumentStepper }   from "../../features/stepper/DocumentStepper";
import { colors }            from "../../theme";
import logo                  from "../../assets/logo.svg";

const drawerWidth = 260;

const ADMIN_MENU = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/"      },
  { text: "Users",     icon: <PeopleIcon />,    path: "/users" },
];

const USER_MENU = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
];

export default function Sidebar() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const { user }        = useAppSelector((state) => state.auth);
  const isAdmin         = user?.role === "admin";
  const menuItems       = isAdmin ? ADMIN_MENU : USER_MENU;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img src={logo} alt="Scanalyze" height={35} />
        </Box>
      </Toolbar>

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

      {/* Stepper uniquement pour les utilisateurs normaux */}
      {!isAdmin && (
        <>
          <Divider sx={{ borderColor: colors.border, mx: 2 }} />
          <DocumentStepper />
        </>
      )}
    </Drawer>
  );
}