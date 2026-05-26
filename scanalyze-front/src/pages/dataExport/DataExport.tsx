// DataExport — allows users to export all processed workspace data as a JSON file
import { useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import DownloadIcon   from "@mui/icons-material/Download";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { colors, btnPrimarySx } from "@theme";
import PipelineStepper from "@components/common/PipelineStepper";
 
export default function DataExport() {
  const [lastExported, setLastExported] = useState<string | null>(null);
  const [isExporting,  setIsExporting]  = useState(false);
 
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // TODO: replace with real RTK Query mutation when backend endpoint is ready
      await new Promise((res) => setTimeout(res, 1000));
      const now = new Date();
      const blob = new Blob(
        [JSON.stringify({ exported_at: now.toISOString() })],
        { type: "application/json" },
      );
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `scanalyze-export-${now.toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setLastExported(
        now.toLocaleDateString("fr-FR", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        }),
      );
    } finally {
      setIsExporting(false);
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
          <Button
            variant="contained"
            startIcon={
              isExporting
                ? <CircularProgress size={14} sx={{ color: "white" }} />
                : <DownloadIcon sx={{ fontSize: 16 }} />
            }
            onClick={handleExport}
            disabled={isExporting}
            sx={{
              ...btnPrimarySx,
              "&:disabled": { opacity: 0.6 },
              fontSize: "0.875rem",
              px: 2.5,
            }}
          >
            {isExporting ? "Export en cours..." : "Export JSON"}
          </Button>
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