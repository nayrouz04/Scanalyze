// Topbar — top navigation bar
// Displays the current page title and the logged-in user's avatar with initials
import { AppBar, Toolbar, Typography, Box, Avatar } from "@mui/material";
import { useLocation } from "react-router-dom";
import { PAGE_TITLES, DEFAULT_TITLE, DEFAULT_USERNAME } from "@constants";

type Props = { userName?: string };

export default function Topbar({ userName = DEFAULT_USERNAME }: Props) {
  const location = useLocation();

  // Resolve the page title from the current route, fall back to default
  const title = PAGE_TITLES[location.pathname] || DEFAULT_TITLE;

  // Generate initials from the username (e.g. "John Doe" → "JD")
  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "A";

  return (
    // position="static" — scrolls with the page, contained within the main Box
    // position="fixed" would escape the flex flow and overlap the sidebar
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

        {/* Current page title */}
        <Typography variant="h6">{title}</Typography>

        {/* Right side: username and avatar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2">{userName}</Typography>
          <Avatar sx={{ width: 35, height: 35, bgcolor: "primary.dark" }}>
            {initials}
          </Avatar>
        </Box>

      </Toolbar>
    </AppBar>
  );
}
