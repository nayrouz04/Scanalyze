// stepperConstants.tsx — configuration for the document processing pipeline stepper
import React from "react";
import CloudUploadIcon  from "@mui/icons-material/CloudUpload";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EditIcon         from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { ROUTES }       from "./routeConstants";

// StepId — union type of all step identifiers
// Must stay in sync with the STEPS array order below
export type StepId = "upload" | "verification" | "editor" | "export";

// STEPS — ordered array of step IDs
// Used to convert a StepId to its numeric index (e.g. STEPS.indexOf("editor") → 2)
export const STEPS: StepId[] = ["upload", "verification", "editor", "export"];

// StepConfig — shape of each step's display configuration
export interface StepConfig {
  label: string;
  icon:  React.ReactElement;
  path:  string;
}

// STEP_CONFIG — display data for each pipeline step
// Used by DocumentStepper to render labels, icons, and handle navigation on click
export const STEP_CONFIG: StepConfig[] = [
  { label: "Upload",       icon: <CloudUploadIcon  sx={{ fontSize: 16 }} />, path: ROUTES.UPLOAD       },
  { label: "Verification", icon: <VerifiedUserIcon sx={{ fontSize: 16 }} />, path: ROUTES.VERIFICATION },
  { label: "Editor",       icon: <EditIcon         sx={{ fontSize: 16 }} />, path: ROUTES.EDITOR       },
  { label: "Export",       icon: <FileDownloadIcon sx={{ fontSize: 16 }} />, path: ROUTES.EXPORT       },
];
