// Verification — side-by-side document verification editor
// Shows a document preview on the left and editable extracted fields on the right
// Supports Skip, Correct, and Approve actions with batch progress tracking
import { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, CircularProgress,
  Alert, Chip, Divider, Tooltip,
} from "@mui/material";
import SkipNextIcon     from "@mui/icons-material/SkipNext";
import BuildIcon        from "@mui/icons-material/Build";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TaskAltIcon      from "@mui/icons-material/TaskAlt";
import { useGetResultsQuery } from "@services";
import { colors }             from "@theme";

export default function Verification() {
  const { data, isLoading, isError } = useGetResultsQuery(undefined);

  // Index of the document currently being verified
  const [docIndex,  setDocIndex]  = useState<number>(0);
  // Local editable copy of the current document's extracted fields
  const [fields,    setFields]    = useState<Record<string, any>>({});
  // Tracks which fields have been manually edited (key → true)
  const [corrected, setCorrected] = useState<Record<string, boolean>>({});
  // true for 800ms after clicking Approve — shows the green badge before advancing
  const [approved,  setApproved]  = useState<boolean>(false);

  const documents  = data ?? [];
  const currentDoc = documents[docIndex];
  const totalDocs  = documents.length;

  // Reload fields whenever the current document changes
  useEffect(() => {
    if (currentDoc?.extracted_data) {
      setFields(currentDoc.extracted_data);
      setCorrected({});
      setApproved(false);
    }
  }, [docIndex, data]);

  // Update a single field and mark it as corrected
  const handleChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setCorrected((prev) => ({ ...prev, [key]: true }));
  };

  // Skip to the next document without saving
  const handleSkip = () => {
    if (docIndex < totalDocs - 1) setDocIndex((i) => i + 1);
  };

  // Approve the current document and auto-advance after 800ms
  const handleApprove = () => {
    setApproved(true);
    setTimeout(() => {
      if (docIndex < totalDocs - 1) setDocIndex((i) => i + 1);
      else setApproved(false);
    }, 800);
  };

  // Save corrections — TODO: replace with RTK Query mutation
  const handleCorrect = () => { console.log("Corrected fields:", fields); };

  // Number of fields that have been manually edited
  const issueCount = Object.values(corrected).filter(Boolean).length;

  // Render the document preview: iframe for PDFs, img for images, placeholder otherwise
  const renderPreview = () => {
    const fileUrl  = currentDoc?.file_url ?? currentDoc?.url ?? null;
    const fileName: string = currentDoc?.name ?? currentDoc?.filename ?? "";
    const isPdf    = fileName.toLowerCase().endsWith(".pdf");

    if (!fileUrl) return (
      <Box sx={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        bgcolor: "#f8fafc", borderRadius: 2, gap: 2,
      }}>
        <Typography sx={{ fontSize: 28 }}>📄</Typography>
        <Typography color="gray" variant="body2">Aperçu non disponible</Typography>
        <Typography color="#94a3b8" variant="caption">{fileName}</Typography>
      </Box>
    );

    // Render PDF directly in an iframe
    if (isPdf) return (
      <Box sx={{ flex: 1, borderRadius: 2, overflow: "hidden", bgcolor: "#f8fafc" }}>
        <iframe src={fileUrl} width="100%" height="100%"
          style={{ border: "none", minHeight: 480 }} title="Document Preview" />
      </Box>
    );

    // Render image files (JPG, PNG, etc.)
    return (
      <Box sx={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        bgcolor: "#f8fafc", borderRadius: 2, overflow: "hidden",
      }}>
        <img src={fileUrl} alt="Document Preview"
          style={{ maxWidth: "100%", maxHeight: 480, objectFit: "contain" }} />
      </Box>
    );
  };

  // Loading / error / empty states
  if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;
  if (isError)   return <Alert severity="error">Erreur lors du chargement des documents.</Alert>;
  if (!currentDoc) return <Alert severity="info">Aucun document à vérifier.</Alert>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>

      {/* ── Top bar: breadcrumb + page counter ── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 3, py: 1.5, bgcolor: colors.bgDark, borderBottom: `1px solid ${colors.borderCard}`,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" color={colors.textMuted}>Home / Verification</Typography>
          <Typography variant="caption" color={colors.textMuted}> › </Typography>
          <Typography variant="caption" color={colors.blueMuted} fontWeight="bold">
            Doc #{currentDoc?.id ?? docIndex + 1}
          </Typography>
        </Box>
        <Typography variant="caption" color={colors.textMuted}>
          Page {docIndex + 1} of {totalDocs}
        </Typography>
      </Box>

      {/* ── Main: preview (left) + editor (right) ── */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Left — Document Preview */}
        <Box sx={{
          flex: 1, display: "flex", flexDirection: "column",
          p: 3, gap: 2, borderRight: `1px solid ${colors.borderCard}`,
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="caption" color={colors.textMuted}>Page 1 of 1</Typography>
            <Button size="small" variant="outlined"
              sx={{ color: colors.blueMuted, borderColor: colors.blueButton, fontSize: 11 }}>
              Raw OCR View
            </Button>
          </Box>
          {renderPreview()}
        </Box>

        {/* Right — Verification Editor */}
        <Box sx={{
          width: 380, flexShrink: 0, display: "flex",
          flexDirection: "column", bgcolor: colors.bgCard, overflow: "auto",
        }}>
          {/* Editor header */}
          <Box sx={{
            px: 3, py: 2, borderBottom: `1px solid ${colors.borderCard}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <Typography variant="h6" color={colors.textWhite} fontWeight="bold" fontSize={15}>
              Verification Editor
            </Typography>
            {/* Corrected fields badge */}
            {issueCount > 0 && (
              <Chip label={`${issueCount} CORRECTED`} size="small"
                sx={{ bgcolor: "#78350f", color: colors.amber, fontSize: 10 }} />
            )}
            {/* Approved badge — shown briefly after clicking Approve */}
            {approved && (
              <Chip
                icon={<TaskAltIcon sx={{ fontSize: 14 }} />}
                label="APPROVED" size="small"
                sx={{ bgcolor: "#14532d", color: colors.green, fontSize: 10 }}
              />
            )}
          </Box>

          {/* Editable extracted fields */}
          <Box sx={{ flex: 1, px: 3, py: 2, overflow: "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Box sx={{ width: 3, height: 14, bgcolor: colors.blue, borderRadius: 1 }} />
              <Typography variant="caption" color={colors.blueMuted} letterSpacing={1.5} fontWeight={700} fontSize={11}>
                HEADER INFORMATION
              </Typography>
            </Box>

            {Object.entries(fields).map(([key, value]) => {
              const label        = key.toUpperCase().replace(/_/g, " ");
              const isCorrected  = corrected[key];
              const isMultiline  = typeof value === "object" || String(value ?? "").length > 60;
              const displayValue = typeof value === "object"
                ? JSON.stringify(value, null, 2)
                : String(value ?? "");

              return (
                <Box key={key} mb={2.5}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                    <Typography variant="caption" color={colors.textMuted} letterSpacing={1} fontSize={11}>
                      {label}
                    </Typography>
                    {/* Corrected indicator vs clean check */}
                    {isCorrected ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <WarningAmberIcon sx={{ fontSize: 12, color: colors.amber }} />
                        <Typography variant="caption" color={colors.amber} fontSize={10}>Corrected</Typography>
                      </Box>
                    ) : (
                      <CheckCircleIcon sx={{ fontSize: 14, color: colors.green }} />
                    )}
                  </Box>
                  <TextField
                    fullWidth multiline={isMultiline} minRows={isMultiline ? 3 : 1}
                    value={displayValue}
                    onChange={(e) => handleChange(key, e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: colors.textWhite, bgcolor: colors.bgDark, fontSize: 13,
                        "& fieldset":            { borderColor: isCorrected ? colors.amber : colors.borderCard },
                        "&:hover fieldset":       { borderColor: colors.blue },
                        "&.Mui-focused fieldset": { borderColor: colors.blue },
                      },
                    }}
                  />
                </Box>
              );
            })}

            {Object.keys(fields).length === 0 && (
              <Typography color={colors.textMuted} variant="body2">Aucun champ extrait.</Typography>
            )}
          </Box>

          {/* Batch progress bar */}
          <Box sx={{ px: 3, py: 1.5, borderTop: `1px solid ${colors.borderCard}`, bgcolor: colors.bgDark }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Typography variant="caption" color={colors.textMuted} fontSize={11}>Batch Progress:</Typography>
              <Typography variant="caption" color={colors.blueMuted} fontWeight="bold" fontSize={11}>
                {docIndex + 1}/{totalDocs}
              </Typography>
              <Box sx={{ flex: 1, height: 4, bgcolor: colors.borderCard, borderRadius: 2, ml: 1 }}>
                <Box sx={{
                  height: "100%", borderRadius: 2, bgcolor: colors.blue,
                  width: `${((docIndex + 1) / totalDocs) * 100}%`,
                  transition: "width 0.3s ease",
                }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Bottom action bar ── */}
      <Box sx={{
        display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2,
        px: 3, py: 2, bgcolor: colors.bgDark, borderTop: `1px solid ${colors.borderCard}`,
      }}>
        {/* Skip — moves to the next document without saving */}
        <Tooltip title="ALT+S">
          <Button
            startIcon={<SkipNextIcon />}
            onClick={handleSkip}
            disabled={docIndex >= totalDocs - 1}
            sx={{
              color: colors.textMuted, border: `1px solid ${colors.borderCard}`,
              "&:hover":    { bgcolor: colors.borderCard, color: colors.textWhite },
              "&:disabled": { color: "#334155" },
            }}
          >
            Skip
          </Button>
        </Tooltip>

        {/* Correct — logs edits (TODO: send to API) */}
        <Tooltip title="ALT+C">
          <Button
            startIcon={<BuildIcon />}
            onClick={handleCorrect}
            sx={{ color: colors.amber, border: `1px solid #78350f`, "&:hover": { bgcolor: "#78350f22" } }}
          >
            Correct
          </Button>
        </Tooltip>

        {/* Approve — confirms the document and auto-advances */}
        <Tooltip title="ALT+A">
          <Button variant="contained" startIcon={<TaskAltIcon />} onClick={handleApprove}
            sx={{ fontWeight: "bold" }}>
            Approve
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
}
