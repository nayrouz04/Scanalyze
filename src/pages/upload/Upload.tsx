import { useState, useRef, DragEvent } from "react";
import { Box, Button, Typography, CircularProgress, Snackbar, Alert, IconButton } from "@mui/material";
import UploadFileIcon     from "@mui/icons-material/UploadFile";
import CloseIcon          from "@mui/icons-material/Close";
import TaskAltIcon        from "@mui/icons-material/TaskAlt";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ArrowForwardIcon   from "@mui/icons-material/ArrowForward";
import { useUploadDocumentMutation } from "../../services/api";
import { colors } from "../../theme";


export default function Upload() {
  const [file,      setFile]      = useState<File | null>(null);
  const [dragging,  setDragging]  = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadDocument, { isLoading, reset }] = useUploadDocumentMutation();
  
  const handleFile = (f: File) => { setFile(f); reset(); };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await uploadDocument(formData).unwrap();
      setSnackOpen(true); setFile(null);
    } catch (err) { console.error("Upload failed", err); }
  };




  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 760 }}>
        {/* Breadcrumb */}
        <Typography
          variant="caption"
          sx={{
            color: colors.blueMuted,
            letterSpacing: 2,
            fontSize: 11,
            textTransform: "uppercase",
          }}
        >
          Home / Uploads
        </Typography>

        {/* Titre stylisé */}
        <Typography
          variant="h4"
          fontWeight={700}
          color={colors.textWhite}
          mt={0.5}
          sx={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}
        >
          Document{" "}
          <Box component="span" sx={{ color: colors.blue }}>
            Management
          </Box>
        </Typography>

        <Typography variant="body2" color={colors.textMuted} mb={4}>
          Centralized hub for file ingestion and processing status.
        </Typography>

        {/* Card principale */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${colors.bgDark} 0%, ${colors.bgCard} 100%)`,
            border: `1px solid ${colors.borderCard}`,
            borderRadius: 3,
            p: { xs: 3, md: 5 },
          }}
        >
          {/* Drop Zone */}
          <Box
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            sx={{
              border: `2px dashed ${dragging ? colors.blue : colors.blueButton}`,
              borderRadius: 2,
              p: { xs: 4, md: 6 },
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              background: dragging ? "#1e3a5f22" : "transparent",
              "&:hover": { borderColor: colors.blue, background: "#1e3a5f11" },
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.xlsx,.csv"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />

            <Box
              sx={{
                width: 64, height: 64, borderRadius: "50%",
                background: "#1e3a8a22",
                border: `1px solid ${colors.blueButton}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                mx: "auto", mb: 2,
              }}
            >
              <UploadFileIcon sx={{ color: colors.blue, fontSize: 30 }} />
            </Box>

            {file ? (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
                  <InsertDriveFileIcon sx={{ color: colors.blueMuted, fontSize: 20 }} />
                  <Typography color={colors.textWhite} fontWeight="medium">{file.name}</Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); setFile(null); reset(); }}
                    sx={{ color: colors.textMuted, ml: 0.5 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="caption" color={colors.textMuted}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            ) : (
              <>
                <Typography color={colors.textWhite} fontWeight="medium" mb={0.5}>
                  Drag and drop files here
                </Typography>
                <Typography variant="caption" color={colors.textMuted} display="block" mb={2}>
                  Supports PDF, XLSX, and CSV files up to 20MB.
                </Typography>
              </>
            )}
          </Box>

          {/* Bouton select */}
          {!file && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => inputRef.current?.click()}
                startIcon={<UploadFileIcon />}
                sx={{
                  borderColor: colors.blueButton,
                  color: colors.textWhite,
                  bgcolor: colors.blueDeep,
                  "&:hover": { bgcolor: colors.blueButton, borderColor: colors.blue },
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  fontSize: 13,
                  px: 3,
                }}
              >
                Select Files From Computer
              </Button>
            </Box>
          )}

          {/* Bouton Next */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              variant="contained"
              endIcon={
                isLoading
                  ? <CircularProgress size={16} sx={{ color: "white" }} />
                  : <ArrowForwardIcon />
              }
              onClick={handleUpload}
              disabled={!file || isLoading}
              sx={{
                px: 4,
                fontWeight: "bold",
                letterSpacing: 1,
                "&:disabled": { bgcolor: colors.bgHover, color: "#475569" },
              }}
            >
              {isLoading ? "Processing..." : "Next"}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Snackbar succès */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          icon={<TaskAltIcon />}
          severity="success"
          onClose={() => setSnackOpen(false)}
          sx={{ bgcolor: colors.bgDark, color: colors.textWhite, border: `1px solid ${colors.green}` }}
        >
          <Typography fontWeight="bold" fontSize={14}>Upload Successful</Typography>
          <Typography fontSize={12} color={colors.textMuted}>Document has been queued.</Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
}