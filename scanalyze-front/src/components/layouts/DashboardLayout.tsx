// DashboardLayout — root layout for all authenticated pages
// Renders the Sidebar, Topbar, and the current page via <Outlet />
// Shows a full-screen PageLoader on every route transition
import { Box }           from "@mui/material";
import { Outlet }        from "react-router-dom";
import Sidebar           from "@components/common/Sidebar";
import Topbar            from "@components/common/Topbar";
import PageLoader        from "@components/common/PageLoader";
import { usePageLoader } from "@hooks/usePageLoader";
import { colors }        from "@theme";

export default function DashboardLayout() {
  const loading = usePageLoader(600);

  if (loading) return <PageLoader />;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: colors.bgPage }}>

      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow:      1,
          minWidth:      0,
          display:       "flex",
          flexDirection: "column",
          bgcolor:       colors.bgPage,
        }}
      >
        {/* ✅ Topbar sans prop — lit le user depuis Redux lui-même */}
        <Topbar />
        <Box sx={{ p: 3, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
