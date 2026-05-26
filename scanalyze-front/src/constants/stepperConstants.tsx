
import React from "react";
import CloudUploadIcon  from "@mui/icons-material/CloudUpload";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EditIcon         from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { ROUTES }       from "./routeConstants";

export type StepId = "upload" | "editor" | "verification" | "export";

export const STEPS: StepId[] = ["upload", "editor", "verification", "export"];

export interface StepConfig {
  label: string;
  icon:  React.ReactElement;
  path:  string;
}

export const STEP_CONFIG: StepConfig[] = [
  { label: "Upload",       icon: <CloudUploadIcon  sx={{ fontSize: 16 }} />, path: ROUTES.UPLOAD       },
  { label: "Editor",       icon: <EditIcon         sx={{ fontSize: 16 }} />, path: ROUTES.EDITOR       },
  { label: "Verification", icon: <VerifiedUserIcon sx={{ fontSize: 16 }} />, path: ROUTES.VERIFICATION },
  { label: "Export",       icon: <FileDownloadIcon sx={{ fontSize: 16 }} />, path: ROUTES.EXPORT       },
];
