// DashboardLayout — root layout for all authenticated pages
// Renders the Sidebar, Topbar, and the current page via <Outlet />
// Shows a full-screen PageLoader on every route transition
import { Box }           from "@mui/material";
import { Outlet }        from "react-router-dom";
import Sidebar           from "@components/common/Sidebar";
import Topbar            from "@components/common/Topbar";
import PageLoader        from "@components/common/PageLoader";
import { usePageLoader } from "@hooks/usePageLoader";
import { useAppSelector} from "@app/hooks";
import { colors }        from "@theme";

export default function DashboardLayout() {
  const loading = usePageLoader(600);
  const { user } = useAppSelector((state) => state.auth);

  if (loading) return <PageLoader />;

  return (
    // MUI permanent Drawer creates a flex wrapper that reserves drawerWidth
    // automatically — no ml needed on the main box.
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: colors.bgPage }}>

      <Sidebar />

      {/*
       * flexGrow:1 fills whatever space remains after the Drawer wrapper.
       * NO ml here — the Drawer's own wrapper div already pushes us right.
       * Adding ml on top of that was causing the double-offset bug.
       */}
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
        <Topbar userName={user?.name} />
        <Box sx={{ p: 3, flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
