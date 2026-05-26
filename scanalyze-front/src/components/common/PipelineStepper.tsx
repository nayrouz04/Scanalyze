import { Box, Typography, Divider } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useStepper }  from "@features/stepper";
import { STEP_CONFIG } from "@constants";
import { colors }      from "@theme";
 
// ── helpers ──────────────────────────────────────────────────────────────────
 
const stepColor = (isCompleted: boolean, isActive: boolean) =>
  isCompleted ? colors.green : isActive ? colors.blue : colors.textMuted;
 
export default function PipelineStepper() {
  const { activeStep, completedSteps } = useStepper();
 
  return (
    <Box sx={{ mt: 1, mb: 0.5 }}>
      <Divider sx={{ borderColor: colors.border, mb: 1.5 }} />
 
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
        {STEP_CONFIG.map((step, i) => {
          const isCompleted = completedSteps.has(i);
          const isActive    = activeStep === i;
          const color       = stepColor(isCompleted, isActive);
 
          return (
            <Box key={step.label} sx={{ display: "flex", alignItems: "center" }}>
 
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: 70 }}>
 
                {/* Circle */}
                <Box sx={{
                  width:          28,
                  height:         28,
                  borderRadius:   "50%",
                  bgcolor:        `${color}18`,
                  border:         `2px solid ${color}`,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  transition:     "all 0.3s ease",
                  boxShadow:      isActive ? `0 0 8px ${colors.blue}44` : "none",
                }}>
                  {isCompleted ? (
                    <CheckIcon sx={{ fontSize: 13, color: colors.green }} />
                  ) : (
                    <Box sx={{ color, display: "flex", alignItems: "center", "& svg": { fontSize: "13px !important" } }}>
                      {step.icon}
                    </Box>
                  )}
                </Box>
 
                {/* Label */}
                <Typography variant="caption" sx={{
                  mt:            0.5,
                  color:         isActive ? colors.textWhite : isCompleted ? colors.green : colors.textMuted,
                  fontWeight:    isActive ? 700 : 400,
                  fontSize:      9,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  textAlign:     "center",
                }}>
                  {step.label}
                </Typography>
 
                {/* Status badge */}
                <Typography variant="caption" sx={{
                  fontSize: 8,
                  mt:       0.1,
                  color:    isCompleted ? colors.green : isActive ? colors.blue : "transparent",
                }}>
                  {isCompleted ? "✓ Done" : isActive ? "● En cours" : "·"}
                </Typography>
              </Box>
 
              {/* Connector line */}
              {i < STEP_CONFIG.length - 1 && (
                <Box sx={{
                  width:      35,
                  height:     2,
                  bgcolor:    completedSteps.has(i) ? colors.green : colors.border,
                  transition: "background 0.3s ease",
                  mb:         3,
                }} />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}