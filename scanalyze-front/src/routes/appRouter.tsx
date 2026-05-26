import { Routes, Route }               from "react-router-dom";
import { PrivateRoute, ProtectedStep }  from "./index";

import DashboardLayout from "../components/layouts/DashboardLayout";
import { ROUTES }      from "../constants/routeConstants";

// ── Imports des pages utilisateur uniquement ─────────────────────────────────
import LoginPage      from "../pages/auth/LoginPage";
import SignUpPage     from "../pages/auth/SignUpPage";
import Dashboard      from "../pages/dashboard/Dashboard";
import Upload         from "../pages/upload/Upload";
import Editor         from "../pages/editor/Editor";
import Verification   from "../pages/verification/Verification";
import DataExport     from "../pages/dataExport/DataExport";
import HistoriquePage from "../pages/historique/HistoriquePage";
// UserManagement supprimé — réservé au backoffice

/**
 * AppRouter — routes du frontoffice utilisateur.
 *
 * Note : <BrowserRouter> se trouve dans App.tsx, pas ici.
 *
 * Protection des routes :
 *   - PrivateRoute  : vérifie l'authentification
 *   - ProtectedStep : vérifie que l'étape du stepper est débloquée
 */
export default function AppRouter() {
  return (
    <Routes>

      {/* ── Routes publiques ─────────────────────────────────────────────── */}
      <Route path={ROUTES.LOGIN}  element={<LoginPage />}  />
      <Route path={ROUTES.SIGNUP} element={<SignUpPage />} />

      {/* ── Routes protégées — authentification requise ──────────────────────
          DashboardLayout affiche Sidebar + Topbar + <Outlet />              */}
      <Route element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }>

        {/* Dashboard — accessible par l'utilisateur */}
        <Route path={ROUTES.HOME}       element={<Dashboard />}      />

        {/* Historique — accessible par l'utilisateur */}
        <Route path={ROUTES.HISTORIQUE} element={<HistoriquePage />} />

        {/* Upload — première étape du pipeline */}
        <Route path={ROUTES.UPLOAD} element={
          <PrivateRoute userOnly>
            <Upload />
          </PrivateRoute>
        } />

        {/* Editor — étape 2 du pipeline (avant verification) */}
<Route path={ROUTES.EDITOR} element={
  <PrivateRoute userOnly>
    <ProtectedStep stepId="editor">
      <Editor />
    </ProtectedStep>
  </PrivateRoute>
} />

{/* Verification — étape 3 du pipeline (après editor) */}
<Route path={ROUTES.VERIFICATION} element={
  <PrivateRoute userOnly>
    <ProtectedStep stepId="verification">
      <Verification />
    </ProtectedStep>
  </PrivateRoute>
} />

        {/* Export — étape finale du pipeline */}
        <Route path={ROUTES.EXPORT} element={
          <PrivateRoute userOnly>
            <ProtectedStep stepId="export">
              <DataExport />
            </ProtectedStep>
          </PrivateRoute>
        } />

        {/* UserManagement supprimé — réservé au backoffice */}

      </Route>
    </Routes>
  );
}