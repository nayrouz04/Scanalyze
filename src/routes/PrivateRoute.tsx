import type { ReactNode }        from "react";
import { Navigate, Outlet }      from "react-router-dom";
import { useAppSelector }        from "../app/hooks";
import { useStepper }            from "../features/stepper/useStepper";
import { STEPS, type StepId }    from "../features/stepper/StepperContext";
import { ROUTES }                from "../constants/routeConstants";

// ─── PrivateRoute ────────────────────────────────────────────────────────────

type PrivateRouteProps = {
  children?:  ReactNode;
  adminOnly?: boolean;
  userOnly?:  boolean;
};

/**
 * PrivateRoute — protects routes based on authentication and role.
 *
 * Behaviour:
 *   - Not authenticated          → redirects to /login
 *   - adminOnly + not admin      → redirects to /
 *   - userOnly  + is admin       → redirects to /
 *   - Otherwise                  → renders children or <Outlet />
 */
export default function PrivateRoute({
  children,
  adminOnly = false,
  userOnly  = false,
}: PrivateRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Redirect unauthenticated users to the login page
  if (!isAuthenticated)                    return <Navigate to={ROUTES.LOGIN} replace />;

  // Redirect non-admins away from admin-only routes
  if (adminOnly && user?.role !== "admin") return <Navigate to={ROUTES.HOME}  replace />;

  // Redirect admins away from user-only routes
  if (userOnly  && user?.role === "admin") return <Navigate to={ROUTES.HOME}  replace />;

  // Render children if provided, otherwise render the nested route outlet
  return <>{children ?? <Outlet />}</>;
}

// ─── ProtectedStep ───────────────────────────────────────────────────────────

type ProtectedStepProps = {
  stepId:   StepId;
  children: ReactNode;
};

/**
 * ProtectedStep — protects stepper-dependent routes.
 *
 * Checks if the required pipeline step is unlocked.
 * If the step is locked → redirects to /upload (first step of the pipeline).
 */
export function ProtectedStep({ stepId, children }: ProtectedStepProps) {
  const { canAccessStep } = useStepper();
  const stepIndex = STEPS.indexOf(stepId);

  // Redirect to upload if the step has not been unlocked yet
  if (!canAccessStep(stepIndex)) return <Navigate to={ROUTES.UPLOAD} replace />;

  return <>{children}</>;
}