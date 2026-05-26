import { Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute }            from "./index";

import DashboardLayout from "../components/layouts/DashboardLayout";
import { ROUTES }      from "../constants/routeConstants";

import LoginPage      from "../pages/auth/LoginPage";
import SignUpPage     from "../pages/auth/SignUpPage";
import Dashboard      from "../pages/dashboard/Dashboard";
import HistoriquePage from "../pages/historique/HistoriquePage";
import UserManagement from "../pages/userManagement/UserManagement";

export default function AppRouter() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path={ROUTES.LOGIN}  element={<LoginPage />}  />
      <Route path={ROUTES.SIGNUP} element={<SignUpPage />} />

      {/* Routes protégées admin */}
      <Route element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }>
        <Route path={ROUTES.HOME}       element={<Dashboard />}      />
        <Route path={ROUTES.HISTORIQUE} element={<HistoriquePage />} />
        <Route path={ROUTES.USERS}      element={<UserManagement />} />
      </Route>

      {/* Toute URL inconnue → login */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}