// src/routes/PrivateRoute.tsx  (backoffice)
import type { ReactNode }  from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector }   from "../app/hooks";
import { ROUTES }           from "../constants/routeConstants";

type PrivateRouteProps = {
  children?:  ReactNode;
  adminOnly?: boolean;
};

/**
 * Protects routes based on authentication and role.
 *   - Not authenticated      → /login
 *   - adminOnly + not admin  → /
 *   - Otherwise              → children ou <Outlet />
 */
export default function PrivateRoute({
  children,
  adminOnly = false,
}: PrivateRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated)                    return <Navigate to={ROUTES.LOGIN} replace />;
  if (adminOnly && user?.role !== "admin") return <Navigate to={ROUTES.HOME}  replace />;

  return <>{children ?? <Outlet />}</>;
}