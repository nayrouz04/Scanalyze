// DataExport — allows users to export all processed workspace data as a JSON file
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Alert, Box, Typography, Button, CircularProgress } from "@mui/material";
import DownloadIcon   from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { colors, btnPrimarySx } from "@theme";
import PipelineStepper from "@components/common/PipelineStepper";
import { useExportJobResultsMutation, useExportJobResultsPdfMutation } from "@services";
 
export default function DataExport() {
  const location = useLocation();
  const routeState = location.state as { job_id?: string; jobId?: string } | null;
  const jobId = routeState?.job_id ?? routeState?.jobId ?? null;
  const [lastExported, setLastExported] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportJobResults, { isLoading: isExporting }] = useExportJobResultsMutation();
  const [exportJobResultsPdf, { isLoading: isExportingPdf }] = useExportJobResultsPdfMutation();
 
  const handleExport = async () => {
    if (!jobId) {
      setExportError("Aucun job a exporter. Lancez l'export depuis l'etape Verification.");
      return;
    }

    setExportError(null);
    try {
      const exportedJson = await exportJobResults(jobId).unwrap();
      const now = new Date();
      const blob = new Blob(
        [exportedJson],
        { type: "application/json" },
      );
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `scanalyze-export-${jobId}-${now.toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setLastExported(
        now.toLocaleDateString("fr-FR", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        }),
      );
    } catch {
      setExportError("Impossible d'exporter les resultats. Verifiez que le job est termine et approuve.");
    }
  };

  const handleExportPdf = async () => {
    if (!jobId) {
      setExportError("Aucun job a exporter. Lancez l'export depuis l'etape Verification.");
      return;
    }

    setExportError(null);
    try {
      const pdfBlob = await exportJobResultsPdf(jobId).unwrap();
      const now = new Date();
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scanalyze-export-${jobId}-${now.toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setLastExported(
        now.toLocaleDateString("fr-FR", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        }),
      );
    } catch {
      setExportError("Impossible d'exporter le PDF. Verifiez que le job est termine et approuve.");
    }
  };
 
  return (
    <Box sx={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: "100%", p: "2rem 2.5rem", gap: "2.5rem",
    }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h4" fontWeight={600} color={colors.textWhite} mb={0.5}>
          Data Export
        </Typography>
        <Typography variant="body2" color={colors.textSecondary}>
          Exportez les données de votre workspace au format JSON.
        </Typography>
      </Box>
 
      <Box sx={{
        bgcolor: colors.bgExportCard, border: `1px solid ${colors.borderExport}`,
        borderRadius: "10px", p: "1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "2rem", width: "100%", maxWidth: 760,
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{
            fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.07em", color: colors.textSecondary,
            display: "block", mb: 0.5,
          }}>
            Quick Export
          </Typography>
          <Typography variant="body2" color={colors.textLight} sx={{ mb: "1.25rem" }}>
            Téléchargez immédiatement toutes les données traitées de votre workspace.
          </Typography>
          {!jobId && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Aucun job selectionne. Retournez a la verification puis cliquez sur Approve.
            </Alert>
          )}
          {exportError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {exportError}
            </Alert>
          )}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={
                isExporting
                  ? <CircularProgress size={14} sx={{ color: "white" }} />
                  : <DownloadIcon sx={{ fontSize: 16 }} />
              }
              onClick={handleExport}
              disabled={isExporting || isExportingPdf || !jobId}
              sx={{
                ...btnPrimarySx,
                "&:disabled": { opacity: 0.6 },
                fontSize: "0.875rem",
                px: 2.5,
              }}
            >
              {isExporting ? "Export en cours..." : "Export JSON"}
            </Button>
            <Button
              variant="outlined"
              startIcon={
                isExportingPdf
                  ? <CircularProgress size={14} sx={{ color: colors.textLight }} />
                  : <PictureAsPdfIcon sx={{ fontSize: 16 }} />
              }
              onClick={handleExportPdf}
              disabled={isExporting || isExportingPdf || !jobId}
              sx={{
                color: colors.textLight,
                borderColor: colors.borderExport,
                textTransform: "none",
                fontWeight: 700,
                "&:hover": { borderColor: colors.blue, bgcolor: `${colors.blue}18` },
                "&:disabled": { opacity: 0.6 },
              }}
            >
              {isExportingPdf ? "PDF en cours..." : "Export PDF"}
            </Button>
          </Box>
        </Box>
 
        {lastExported && (
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
            <Box>
              <Typography variant="caption" sx={{
                display: "block", letterSpacing: "0.1em",
                color: colors.textSecondary, textTransform: "uppercase",
                fontSize: "0.65rem", mb: "2px",
              }}>
                Last Exported
              </Typography>
              <Typography variant="body2" color={colors.textLight}>{lastExported}</Typography>
            </Box>
          </Box>
        )}
      </Box>
 
      <PipelineStepper />
    </Box>
  );
}
