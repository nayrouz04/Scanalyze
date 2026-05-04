// DocumentStepper — vertical stepper showing the document processing pipeline
// Displayed in the Sidebar for non-admin users
// Steps are locked until the previous one is completed
import { Box, Stepper, Step, StepButton, StepLabel, Tooltip, Typography } from "@mui/material";
import { useNavigate }                from "react-router-dom";
import { useStepper }                 from "./useStepper";
import { STEP_CONFIG }                from "@constants";
import { colors, stepperSx, stepperTokens } from "@theme";

export const DocumentStepper = () => {
  const navigate = useNavigate();
  const { activeStep, completedSteps, canAccessStep, goToStep } = useStepper();

  // Navigate to the step's route if it is accessible
  const handleClick = (i: number) => {
    if (!canAccessStep(i)) return;
    goToStep(i);
    navigate(STEP_CONFIG[i].path);
  };

  // Returns the background color for each step icon based on its state.
  // Uses stepperTokens (raw color values) — NOT sx props — to avoid DOM prop leakage.
  const iconBg = (i: number, completed: boolean): string => {
    if (completed)        return stepperTokens.icon.completed;
    if (i === activeStep) return stepperTokens.icon.active;
    if (canAccessStep(i)) return stepperTokens.icon.accessible;
    return stepperTokens.icon.locked;
  };

  return (
    <Box sx={{ px: 1, py: 1 }}>
      {/* Section label above the stepper */}
      <Typography variant="caption" sx={{
        color:         colors.textMuted,
        px:            1,
        mb:            1,
        display:       "block",
        textTransform: "uppercase",
        letterSpacing: 1,
        fontSize:      10,
      }}>
        Processing
      </Typography>

      {/*
       * stepperSx is a flat MUI sx object using CSS selectors.
       * MUI resolves these internally to CSS — minHeight never reaches the DOM as a prop.
       */}
      <Stepper
        activeStep={activeStep}
        orientation="vertical"
        nonLinear
        sx={stepperSx}
      >
        {STEP_CONFIG.map((step, i) => {
          const completed  = completedSteps.has(i);
          const accessible = canAccessStep(i);

          return (
            <Step key={step.label} completed={completed} disabled={!accessible}>
              {/* Tooltip shown only when the step is locked */}
              <Tooltip
                title={!accessible ? "Complete the previous step first" : ""}
                placement="right"
                arrow
              >
                <span>
                  <StepButton
                    onClick={() => handleClick(i)}
                    disabled={!accessible}
                    icon={
                      // Custom circular icon with dynamic background color
                      <Box sx={{
                        width:          28,
                        height:         28,
                        borderRadius:   "50%",
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                        bgcolor:        iconBg(i, completed),
                        color:          accessible ? colors.textWhite : colors.textMuted,
                        transition:     "all 0.2s",
                      }}>
                        {step.icon}
                      </Box>
                    }
                    sx={{
                      py:           0.5,
                      borderRadius: 1,
                      cursor:       accessible ? "pointer" : "not-allowed",
                      "&:hover":    { bgcolor: accessible ? colors.bgHover : "transparent" },
                    }}
                  >
                    <StepLabel>{step.label}</StepLabel>
                  </StepButton>
                </span>
              </Tooltip>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};
