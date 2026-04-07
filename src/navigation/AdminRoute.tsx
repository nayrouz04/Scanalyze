// ─────────────────────────────────────────────
//  navigation/AdminRoute.tsx
//  Protège les pages réservées à l'Admin
//  → Vérifie connexion + rôle Admin
//  → Sinon redirige vers Dashboard
// ─────────────────────────────────────────────

import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectUserRole,
} from "../store/auth/authSelectors";
import { ROUTES } from "./routes";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole        = useSelector(selectUserRole);

  // Pas connecté → Login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Connecté mais pas Admin → Dashboard
  if (userRole !== "Admin") {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // Admin connecté → page autorisée
  return <>{children}</>;
}