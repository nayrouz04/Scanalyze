import { Box, Stepper, Step, StepButton, StepLabel, Tooltip, Typography } from "@mui/material";
import CloudUploadIcon  from "@mui/icons-material/CloudUpload";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EditIcon         from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useNavigate }  from "react-router-dom";
import { useStepper }   from "./StepperContext";
import { colors }       from "../../theme";

const STEP_CONFIG = [
  { label: "Upload",       icon: <CloudUploadIcon  sx={{ fontSize: 16 }} />, path: "/upload"       },
  { label: "Verification", icon: <VerifiedUserIcon sx={{ fontSize: 16 }} />, path: "/verification" },
  { label: "Editor",       icon: <EditIcon         sx={{ fontSize: 16 }} />, path: "/editor"       },
  { label: "Export",       icon: <FileDownloadIcon sx={{ fontSize: 16 }} />, path: "/export"       },
];

export const DocumentStepper = () => {
  const navigate = useNavigate();
  const { activeStep, completedSteps, canAccessStep, goToStep } = useStepper();

  const handleClick = (i: number) => {
    if (!canAccessStep(i)) return;
    goToStep(i);
    navigate(STEP_CONFIG[i].path);
  };

  const iconBg = (i: number, completed: boolean) => {
    if (completed)      return colors.green;
    if (i === activeStep) return colors.blue;
    if (canAccessStep(i)) return colors.bgHover;
    return colors.bgCard;
  };

  return (
    <Box sx={{ px: 1, py: 1 }}>
      <Typography variant="caption" sx={{
        color: colors.textMuted,
        px: 1, mb: 1,
        display: "block",
        textTransform: "uppercase",
        letterSpacing: 1,
        fontSize: 10,
      }}>
        Processing
      </Typography>

      <Stepper
        activeStep={activeStep}
        orientation="vertical"
        nonLinear
        sx={{
          "& .MuiStepConnector-line":              { borderColor: colors.border, minHeight: 16 },
          "& .MuiStepLabel-label":                 { color: colors.textMuted,    fontSize: "0.875rem" },
          "& .MuiStepLabel-label.Mui-active":      { color: colors.textWhite,    fontWeight: 600 },
          "& .MuiStepLabel-label.Mui-completed":   { color: colors.textSecondary },
          "& .MuiStepLabel-label.Mui-disabled":    { color: colors.border },
        }}
      >
        {STEP_CONFIG.map((step, i) => {
          const completed  = completedSteps.has(i);
          const accessible = canAccessStep(i);

          return (
            <Step key={step.label} completed={completed} disabled={!accessible}>
              <Tooltip
                title={!accessible ? "Complétez l'étape précédente d'abord" : ""}
                placement="right"
                arrow
              >
                <span>
                  <StepButton
                    onClick={() => handleClick(i)}
                    disabled={!accessible}
                    icon={
                      <Box sx={{
                        width: 28, height: 28,
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        bgcolor: iconBg(i, completed),
                        color:   accessible ? colors.textWhite : colors.textMuted,
                        transition: "all 0.2s",
                      }}>
                        {step.icon}
                      </Box>
                    }
                    sx={{
                      py: 0.5,
                      borderRadius: 1,
                      cursor: accessible ? "pointer" : "not-allowed",
                      "&:hover": { bgcolor: accessible ? colors.bgHover : "transparent" },
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