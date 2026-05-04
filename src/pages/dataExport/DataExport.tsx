// DataExport — allows users to export all processed workspace data as a JSON file
// Tracks the last export timestamp and shows a loading state during export
import { useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import DownloadIcon   from "@mui/icons-material/Download";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { colors }     from "@theme";

export default function DataExport() {
  // Stores the formatted date string of the last successful export (null = never exported)
  const [lastExported, setLastExported] = useState<string | null>(null);
  // true while the export is in progress — disables the button and shows a spinner
  const [isExporting,  setIsExporting]  = useState<boolean>(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // TODO: replace with real RTK Query mutation when backend endpoint is ready
      await new Promise((res) => setTimeout(res, 1000));

      const now = new Date();

      // Create an in-memory JSON file using Blob and trigger a browser download
      const blob = new Blob(
        [JSON.stringify({ exported_at: now.toISOString() })],
        { type: "application/json" },
      );
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `scanalyze-export-${now.toISOString().slice(0, 10)}.json`;
      a.click();
      // Free the temporary object URL from memory after the download is triggered
      URL.revokeObjectURL(url);

      // Save and display the formatted export timestamp in French locale
      setLastExported(
        now.toLocaleDateString("fr-FR", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        }),
      );
    } finally {
      // Always re-enable the button whether the export succeeded or failed
      setIsExporting(false);
    }
  };

  return (
    <Box sx={{ p: "2rem 2.5rem" }}>

      {/* Page header */}
      <Box sx={{ mb: "2rem" }}>
        <Typography variant="h4" fontWeight={600} color={colors.textWhite} mb={0.5}>
          Data Export
        </Typography>
        <Typography variant="body2" color={colors.textSecondary}>
          Exportez les données de votre workspace au format JSON.
        </Typography>
      </Box>

      {/* Export card */}
      <Box sx={{
        bgcolor:      colors.bgExportCard,
        border:       `1px solid ${colors.borderExport}`,
        borderRadius: "10px",
        p:            "1.5rem",
        display:      "flex",
        alignItems:   "center",
        justifyContent: "space-between",
        gap:          "2rem",
        maxWidth:     760,
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

          {/* Export button — shows spinner while loading */}
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
              bgcolor: colors.blueButton,
              "&:hover":    { bgcolor: colors.blueButtonHover },
              "&:disabled": { opacity: 0.6 },
              fontSize: "0.875rem", fontWeight: 500, px: 2.5,
            }}
          >
            {isExporting ? "Export en cours..." : "Export JSON"}
          </Button>
        </Box>

        {/* Last export timestamp — only shown after at least one export */}
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
              <Typography variant="body2" color={colors.textLight}>
                {lastExported}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
