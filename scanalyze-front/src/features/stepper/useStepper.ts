// useStepper — hook to access the stepper context from any component
// Must be used inside a StepperProvider, otherwise throws an error
import { useContext } from "react";
import { StepperContext, type StepperCtx } from "./StepperContext";

export const useStepper = (): StepperCtx => {
  const c = useContext(StepperContext);
  if (!c) throw new Error("useStepper must be used inside a StepperProvider");
  return c;
};
