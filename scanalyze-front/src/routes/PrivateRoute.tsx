import type { ReactNode }        from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";  // ✅ useLocation ajouté
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

  if (!isAuthenticated)                    return <Navigate to={ROUTES.LOGIN} replace />;
  if (adminOnly && user?.role !== "admin") return <Navigate to={ROUTES.HOME}  replace />;
  if (userOnly  && user?.role === "admin") return <Navigate to={ROUTES.HOME}  replace />;

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
 * Exception : si la navigation vient de l'historique (state.fromHistory === true),
 * le guard est bypassé — l'utilisateur accède directement à la page de vérification
 * sans avoir à compléter les étapes précédentes du pipeline.
 *
 * If the step is locked → redirects to /upload (first step of the pipeline).
 */
export function ProtectedStep({ stepId, children }: ProtectedStepProps) {
  const { canAccessStep } = useStepper();
  const location          = useLocation(); // ✅ NOUVEAU
  const stepIndex         = STEPS.indexOf(stepId);

  // ✅ NOUVEAU : bypass du guard si on vient de l'historique
  const fromHistory: boolean = location.state?.fromHistory === true;
  if (fromHistory) return <>{children}</>;

  if (!canAccessStep(stepIndex)) return <Navigate to={ROUTES.UPLOAD} replace />;

  return <>{children}</>;
}
