// src/routes/PrivateRoute.tsx  (frontoffice)
import type { ReactNode }                    from "react";
import { Navigate, Outlet, useLocation }     from "react-router-dom";
import { useAppSelector }                    from "../app/hooks";
import { useStepper }                        from "../features/stepper/useStepper";
import { STEPS, type StepId }               from "../features/stepper/StepperContext";
import { ROUTES }                            from "../constants/routeConstants";

// ─── PrivateRoute ─────────────────────────────────────────────────

type PrivateRouteProps = {
  children?:  ReactNode;
  adminOnly?: boolean;
  userOnly?:  boolean;
};

/**
 * Protects routes based on authentication and role.
 *   - Not authenticated       → /login
 *   - adminOnly + not admin   → /
 *   - userOnly  + is admin    → /
 *   - Otherwise               → children ou <Outlet />
 */
export default function PrivateRoute({
  children,
  adminOnly = false,
  userOnly  = false,
}: PrivateRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated)                    return <Navigate to={ROUTES.LOGIN} replace />;
  if (adminOnly && user?.role !== "admin") return <Navigate to={ROUTES.HOME}  replace />;
  if (userOnly  && user?.role === "admin") return <Navigate to={ROUTES.HOME}  replace />;

  return <>{children ?? <Outlet />}</>;
}

// ─── ProtectedStep ────────────────────────────────────────────────

type ProtectedStepProps = {
  stepId:   StepId;
  children: ReactNode;
};

/**
 * Protects stepper-dependent routes.
 * Exception : si navigation depuis l'historique (state.fromHistory === true)
 * → bypass du guard, accès direct sans compléter les étapes précédentes.
 */
export function ProtectedStep({ stepId, children }: ProtectedStepProps) {
  const { canAccessStep } = useStepper();
  const location          = useLocation();
  const stepIndex         = STEPS.indexOf(stepId);

  // Bypass si on vient de l'historique
  const fromHistory: boolean = location.state?.fromHistory === true;
  if (fromHistory) return <>{children}</>;

  if (!canAccessStep(stepIndex)) return <Navigate to={ROUTES.UPLOAD} replace />;

  return <>{children}</>;
}