// StepperContext.tsx — React context and provider for the document pipeline stepper
// Manages which step is active and which steps have been completed
import { createContext, useState, type ReactNode } from "react";
import { STEPS, type StepId } from "@constants";

// Re-export so consumers can import StepId and STEPS from this module
export type { StepId };
export { STEPS };

// StepperCtx — shape of the context value exposed to consumers
export interface StepperCtx {
  // Index of the currently active step
  activeStep:     number;
  // Set of step indices that have been completed
  completedSteps: Set<number>;
  // Returns true if step i is unlocked (step 0 is always accessible)
  canAccessStep:  (i: number) => boolean;
  // Marks step i as complete and advances to the next step
  completeStep:   (i: number) => void;
  // Navigates to step i if it is accessible
  goToStep:       (i: number) => void;
  // Resets the stepper back to its initial state
  resetStepper:   () => void;
}

// Internal context — null when accessed outside the provider
export const StepperContext = createContext<StepperCtx | null>(null);

// StepperProvider — wraps the app (or a subtree) to provide stepper state
export const StepperProvider = ({ children }: { children: ReactNode }) => {
  const [activeStep,     setActiveStep] = useState<number>(0);
  const [completedSteps, setCompleted ] = useState<Set<number>>(new Set<number>());

  // A step is accessible if it is the first step or the previous step is done
  const canAccessStep = (i: number): boolean => i === 0 || completedSteps.has(i - 1);

  // Mark a step as complete and move to the next one
  const completeStep = (i: number): void => {
    setCompleted((prev: Set<number>) => new Set<number>(prev).add(i));
    setActiveStep(i + 1);
  };

  // Jump to a specific step only if it is accessible
  const goToStep = (i: number): void => {
    if (canAccessStep(i)) setActiveStep(i);
  };

  // Reset everything back to the first step with no completed steps
  const resetStepper = (): void => {
    setActiveStep(0);
    setCompleted(new Set<number>());
  };

  return (
    <StepperContext.Provider value={{
      activeStep, completedSteps,
      canAccessStep, completeStep, goToStep, resetStepper,
    }}>
      {children}
    </StepperContext.Provider>
  );
};
