import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { useStepper, STEPS, type StepId } from "../features/stepper/StepperContext";

// ─── PrivateRoute ───────────────────────────────────────────────
type Props = {
  children?:  ReactNode;
  adminOnly?: boolean;
  userOnly?:  boolean;
};

export default function PrivateRoute({
  children,
  adminOnly = false,
  userOnly  = false,
}: Props) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated)                        return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== "admin")     return <Navigate to="/"     replace />;
  if (userOnly  && user?.role === "admin")     return <Navigate to="/"     replace />;

  return <>{children ?? <Outlet />}</>;
}

// ─── ProtectedStep ──────────────────────────────────────────────
export function ProtectedStep({
  stepId,
  children,
}: {
  stepId:   StepId;
  children: ReactNode;
}) {
  const { canAccessStep } = useStepper();
  const stepIndex = STEPS.indexOf(stepId);

  if (!canAccessStep(stepIndex)) return <Navigate to="/upload" replace />;

  return <>{children}</>;
}