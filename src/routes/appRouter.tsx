import { Routes, Route }              from "react-router-dom";
import { PrivateRoute, ProtectedStep } from "./index";       // ← via routes/index.ts

import DashboardLayout from "../layouts/DashboardLayout";
import { ROUTES }      from "../constants/routeConstants";

// ── Page imports ──────────────────────────────────────────────────────────────
import LoginPage      from "../pages/auth/LoginPage";
import SignUpPage     from "../pages/auth/SignUpPage";
import Dashboard      from "../pages/dashboard/Dashboard";
import Upload         from "../pages/upload/Upload";
import Editor         from "../pages/editor/Editor";
import Verification   from "../pages/verification/Verification";
import UserManagement from "../pages/userManagement/UserManagement";
import DataExport     from "../pages/dataExport/DataExport";
import HistoriquePage from "../pages/historique/HistoriquePage";

/**
 * AppRouter — defines all application routes.
 *
 * Note: <BrowserRouter> lives in App.tsx — do NOT add it here.
 *
 * Route protection is handled by two guards:
 *   - PrivateRoute  : checks authentication + role (adminOnly / userOnly)
 *   - ProtectedStep : checks whether the stepper step is unlocked
 */
export default function AppRouter() {
  return (
    <Routes>

      {/* ── Public routes — no authentication required ──────────────────── */}
      <Route path={ROUTES.LOGIN}  element={<LoginPage />} />
      <Route path={ROUTES.SIGNUP} element={<SignUpPage />} />

      {/* ── Protected routes — authentication required ──────────────────────
          PrivateRoute redirects to /login if the user is not authenticated.
          DashboardLayout renders Sidebar + Topbar + <Outlet />.            */}
      <Route element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }>

        {/* Dashboard — accessible by both admin and regular users */}
        <Route path={ROUTES.HOME}       element={<Dashboard />} />

        {/* Historique — accessible by both admin and regular users */}
        <Route path={ROUTES.HISTORIQUE} element={<HistoriquePage />} />

        {/* Upload — regular users only
            First step of the document processing pipeline         */}
        <Route path={ROUTES.UPLOAD} element={
          <PrivateRoute userOnly>
            <Upload />
          </PrivateRoute>
        } />

        {/* Verification — regular users only + stepper step must be unlocked */}
        <Route path={ROUTES.VERIFICATION} element={
          <PrivateRoute userOnly>
            <ProtectedStep stepId="verification">
              <Verification />
            </ProtectedStep>
          </PrivateRoute>
        } />

        {/* Editor — regular users only + stepper step must be unlocked */}
        <Route path={ROUTES.EDITOR} element={
          <PrivateRoute userOnly>
            <ProtectedStep stepId="editor">
              <Editor />
            </ProtectedStep>
          </PrivateRoute>
        } />

        {/* Export — regular users only + stepper step must be unlocked */}
        <Route path={ROUTES.EXPORT} element={
          <PrivateRoute userOnly>
            <ProtectedStep stepId="export">
              <DataExport />
            </ProtectedStep>
          </PrivateRoute>
        } />

        {/* User Management — admin only
            Redirects to / if accessed by a regular user           */}
        <Route path={ROUTES.USERS} element={
          <PrivateRoute adminOnly>
            <UserManagement />
          </PrivateRoute>
        } />

      </Route>
    </Routes>
  );
}