import { Box } from "@mui/material";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
//placeholder qui afficher la page enfant correspondant à la route activ, c'est le contenu qui change selon l'URL
import { Outlet } from "react-router-dom";
import { colors } from "../theme";
import PageLoader from "../components/common/PageLoader";
//hook qui gere le timer de chargement
import { usePageLoader } from "../hooks/usePageLoader";
//hook typé pour lire le store Redux
import { useAppSelector } from "../app/hooks";

const drawerWidth = 260;

export default function DashboardLayout() {
  const loading = usePageLoader(600);
  //rcupre l'utilisateur connecté depuis Redux
  const { user } = useAppSelector((state) => state.auth);

  if (loading) return <PageLoader />;  // ← affiche le loader plein écran

  return (
    <Box display="flex" minHeight="100vh" bgcolor={colors.bgPage}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          bgcolor: colors.bgPage,
        }}
      >
        <Topbar userName={user?.name} />
        <Box p={3}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}