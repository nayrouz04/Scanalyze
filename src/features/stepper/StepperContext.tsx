import { createContext, useContext, useState, type ReactNode } from "react";

export type StepId = "upload" | "verification" | "editor" | "export";
export const STEPS: StepId[] = ["upload", "verification", "editor", "export"];

interface StepperCtx {
  activeStep:     number;
  completedSteps: Set<number>;
  canAccessStep:  (i: number) => boolean;
  completeStep:   (i: number) => void;
  goToStep:       (i: number) => void;
  resetStepper:   () => void;
}

const Ctx = createContext<StepperCtx | null>(null);

export const useStepper = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStepper must be inside StepperProvider");
  return c;
};

export const StepperProvider = ({ children }: { children: ReactNode }) => {
  const [activeStep,     setActiveStep] = useState(0);
  const [completedSteps, setCompleted ] = useState<Set<number>>(new Set());

  const canAccessStep = (i: number) => i === 0 || completedSteps.has(i - 1);

  const completeStep = (i: number) => {
    setCompleted(prev => new Set(prev).add(i));
    setActiveStep(i + 1);
  };

  const goToStep = (i: number) => {
    if (canAccessStep(i)) setActiveStep(i);
  };

  const resetStepper = () => {
    setActiveStep(0);
    setCompleted(new Set());
  };

  return (
    <Ctx.Provider value={{ activeStep, completedSteps, canAccessStep, completeStep, goToStep, resetStepper }}>
      {children}
    </Ctx.Provider>
  );
};