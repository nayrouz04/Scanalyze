// src/pages/upload/Upload.tsx
import { useState, useRef, DragEvent } from "react";
import {
  Box, Button, Typography, CircularProgress,
  Snackbar, Alert, IconButton, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Chip,
} from "@mui/material";
import UploadFileIcon           from "@mui/icons-material/UploadFile";
import CloseIcon                from "@mui/icons-material/Close";
import TaskAltIcon              from "@mui/icons-material/TaskAlt";
import InsertDriveFileIcon      from "@mui/icons-material/InsertDriveFile";
import ArrowForwardIcon         from "@mui/icons-material/ArrowForward";
import WarningAmberIcon         from "@mui/icons-material/WarningAmber";
import CheckCircleIcon          from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import VerifiedIcon             from "@mui/icons-material/Verified";
import ImageIcon                from "@mui/icons-material/Image";
import PictureAsPdfIcon         from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon          from "@mui/icons-material/Description";

// ── RTK Query hooks ───────────────────────────────────────────────────────────
import { useUploadDocumentMutation } from "@services/documentsApi";
import { useCreateJobMutation }      from "@services/jobsApi";

import { colors }        from "@theme";
import { useStepper }    from "@features/stepper";
import { useNavigate }   from "react-router-dom";
import { ROUTES }        from "@constants";
import PipelineStepper   from "@components/common/PipelineStepper";

const MAX_SIZE_MB    = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED       = ".pdf,.png,.jpg,.jpeg,.tiff";

// ── Upload steps ──────────────────────────────────────────────────────────────
const UPLOAD_STEPS = [
  { label: "Préparation du fichier",    threshold: 0   },
  { label: "Envoi vers le serveur",     threshold: 30  },
  { label: "Traitement en cours",       threshold: 60  },
  { label: "Finalisation",              threshold: 90  },
  { label: "Document reçu avec succès", threshold: 100 },
];

const getActiveStep = (progress: number): number => {
  let active = 0;
  for (let i = 0; i < UPLOAD_STEPS.length; i++) {
    if (progress >= UPLOAD_STEPS[i].threshold) active = i;
  }
  return active;
};

// ── FileTypeIcon ──────────────────────────────────────────────────────────────
const FileTypeIcon: React.FC<{ name: string }> = ({ name }) => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return <PictureAsPdfIcon sx={{ fontSize: 48, color: colors.red }} />;
  if (["png", "jpg", "jpeg", "tiff"].includes(ext)) return <ImageIcon sx={{ fontSize: 48, color: colors.blue }} />;
  return <DescriptionIcon sx={{ fontSize: 48, color: colors.textMuted }} />;
};

// ── UploadStepsBox ────────────────────────────────────────────────────────────
const UploadStepsBox: React.FC<{ progress: number }> = ({ progress }) => {
  const activeStep = getActiveStep(progress);
  return (
    <Box sx={{
      mt: 2.5, p: 2, borderRadius: 2,
      border: `1px solid ${colors.borderCard}`,
      background: `linear-gradient(135deg, ${colors.bgDark}cc 0%, ${colors.bgCard}cc 100%)`,
    }}>
      <Typography variant="caption" sx={{
        color: colors.textMuted, fontWeight: 700, letterSpacing: 1.2,
        textTransform: "uppercase", fontSize: "0.68rem", display: "block", mb: 1.5,
      }}>
        Étapes du traitement
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
        {UPLOAD_STEPS.map((step, index) => {
          const isDone    = index < activeStep || progress === 100;
          const isActive  = index === activeStep && progress < 100;
          const isPending = index > activeStep && progress < 100;
          return (
            <Box key={step.label} sx={{
              display: "flex", alignItems: "center", gap: 1.2,
              opacity: isPending ? 0.4 : 1, transition: "opacity 0.4s ease",
            }}>
              {isDone ? (
                <CheckCircleIcon sx={{ fontSize: 18, color: colors.green, flexShrink: 0 }} />
              ) : isActive ? (
                <CircularProgress size={16} thickness={5} sx={{ color: colors.blue, flexShrink: 0 }} />
              ) : (
                <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: colors.textMuted, flexShrink: 0 }} />
              )}
              <Typography variant="body2" sx={{
                fontSize: "0.82rem",
                fontWeight: isActive ? 700 : isDone ? 500 : 400,
                color: isDone ? colors.green : isActive ? colors.textWhite : colors.textMuted,
              }}>
                {step.label}
              </Typography>
              {isActive && (
                <Box sx={{ ml: "auto", px: 1, py: 0.2, borderRadius: 10, bgcolor: `${colors.blue}22` }}>
                  <Typography variant="caption" sx={{ color: colors.blue, fontSize: "0.68rem", fontWeight: 700 }}>En cours</Typography>
                </Box>
              )}
              {isDone && (
                <Box sx={{ ml: "auto", px: 1, py: 0.2, borderRadius: 10, bgcolor: `${colors.green}22` }}>
                  <Typography variant="caption" sx={{ color: colors.green, fontSize: "0.68rem", fontWeight: 700 }}>✓ Terminé</Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// ── VerifyModal ───────────────────────────────────────────────────────────────
const VerifyModal: React.FC<{ open: boolean; file: File | null; onClose: () => void }> = ({ open, file, onClose }) => {
  if (!file) return null;
  const ext        = file.name.split(".").pop()?.toLowerCase() ?? "";
  const isImage    = ["png", "jpg", "jpeg", "tiff"].includes(ext);
  const sizeKB     = (file.size / 1024).toFixed(1);
  const sizeMB     = (file.size / 1024 / 1024).toFixed(2);
  const previewUrl = isImage ? URL.createObjectURL(file) : null;

  const infoRows = [
    { label: "Nom du fichier", value: file.name },
    { label: "Type",           value: file.type || `application/${ext}` },
    { label: "Taille",         value: `${sizeMB} MB (${sizeKB} KB)` },
    { label: "Extension",      value: `.${ext.toUpperCase()}` },
    { label: "Dernière modif", value: new Date(file.lastModified).toLocaleString("fr-FR") },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: colors.bgDark, border: `1px solid ${colors.borderCard}`, borderRadius: 2.5 } }}>
      <DialogTitle sx={{
        bgcolor: colors.bgCard, borderBottom: `1px solid ${colors.borderCard}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        py: 1.8, px: 2.5,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <VerifiedIcon sx={{ color: colors.blue, fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={700} color={colors.textLight} fontSize={15}>
            Vérification du document
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: colors.textMuted }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: colors.bgDark, p: 0 }}>
        {isImage && previewUrl ? (
          <Box sx={{ bgcolor: colors.bgPage, borderBottom: `1px solid ${colors.borderCard}`, display: "flex", alignItems: "center", justifyContent: "center", p: 2, maxHeight: 280, overflow: "hidden" }}>
            <Box component="img" src={previewUrl} alt="Aperçu" sx={{ maxWidth: "100%", maxHeight: 250, borderRadius: 1.5, objectFit: "contain" }} />
          </Box>
        ) : (
          <Box sx={{ bgcolor: colors.bgPage, borderBottom: `1px solid ${colors.borderCard}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, py: 4 }}>
            <FileTypeIcon name={file.name} />
            <Typography variant="caption" color={colors.textMuted}>Aperçu non disponible</Typography>
          </Box>
        )}

        <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
          {infoRows.map((row, i) => (
            <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.2, borderBottom: i < infoRows.length - 1 ? `1px solid ${colors.border}44` : "none" }}>
              <Typography variant="caption" color={colors.textMuted} fontSize={12}>{row.label}</Typography>
              <Typography variant="caption" color={colors.textLight} fontSize={12} fontWeight={600} sx={{ fontFamily: "monospace", maxWidth: "55%", textAlign: "right", wordBreak: "break-all" }}>
                {row.value}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ px: 2.5, pb: 2.5, pt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip icon={<CheckCircleIcon sx={{ fontSize: 13 }} />} label="Format accepté" size="small" sx={{ bgcolor: `${colors.green}22`, color: colors.green, fontSize: 11 }} />
          <Chip icon={<CheckCircleIcon sx={{ fontSize: 13 }} />} label={`Taille OK (< ${MAX_SIZE_MB} MB)`} size="small" sx={{ bgcolor: `${colors.green}22`, color: colors.green, fontSize: 11 }} />
          <Chip label={`.${ext.toUpperCase()}`} size="small" sx={{ bgcolor: `${colors.blue}22`, color: colors.blue, fontSize: 11 }} />
        </Box>
      </DialogContent>

      <DialogActions sx={{ bgcolor: colors.bgCard, borderTop: `1px solid ${colors.borderCard}`, px: 2.5, py: 1.5 }}>
        <Typography variant="caption" color={colors.textMuted} fontSize={11} sx={{ flexGrow: 1 }}>
          Document prêt à être envoyé
        </Typography>
        <Button size="small" onClick={onClose} variant="contained" startIcon={<TaskAltIcon />}
          sx={{ bgcolor: colors.blue, color: colors.textWhite, fontWeight: 700, textTransform: "none", px: 2.5 }}>
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────
export default function Upload() {
  const [file,       setFile]       = useState<File | null>(null);
  const [dragging,   setDragging]   = useState(false);
  const [snackOpen,  setSnackOpen]  = useState(false);
  const [sizeError,  setSizeError]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [uploading,  setUploading]  = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  // ── RTK Query ───────────────────────────────────────────────────────────────
  const [uploadDocument, { reset }] = useUploadDocumentMutation();
  const [createJob]                 = useCreateJobMutation();

  const { completeStep } = useStepper();
  const navigate = useNavigate();

  const handleFile = (f: File) => {
    if (f.size > MAX_SIZE_BYTES) { setSizeError(true); setFile(null); setProgress(0); return; }
    setSizeError(false); setUploadError(""); setFile(f); setProgress(0); reset();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  };

  const simulateProgress = (): Promise<void> =>
    new Promise((resolve) => {
      setUploading(true); setProgress(0);
      let current = 0;
      const interval = setInterval(() => {
        const increment = current < 60 ? 8 : current < 85 ? 4 : current < 95 ? 1.5 : 0.5;
        current = Math.min(current + increment, 98);
        setProgress(current);
        if (current >= 98) {
          clearInterval(interval);
          setTimeout(() => { setProgress(100); setUploading(false); resolve(); }, 400);
        }
      }, 150);
    });

  const handleUpload = async () => {
    if (!file) return;
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Simuler la progression visuelle
      const progressPromise = simulateProgress();

      // 2. Upload du document
      const doc = await uploadDocument(formData).unwrap();

      await progressPromise;

      // 3. Créer le job OCR sur le document uploadé
      const job = await createJob({ document_id: doc.id }).unwrap();

      // 4. Marquer l'étape comme complète dans le stepper
      completeStep(0);

      setSnackOpen(true);

      // 5. Naviguer vers l'éditeur en passant le job_id et doc_id
      setTimeout(() => {
        setFile(null);
        setProgress(0);
        navigate(ROUTES.EDITOR, {
          state: { document_id: doc.id, job_id: job.id },
        });
      }, 1000);

    } catch (err: any) {
      console.error("Upload failed:", err);
      setProgress(0);
      setUploading(false);
      setUploadError(
        err?.data?.detail ?? "Erreur lors de l'upload. Vérifiez votre connexion."
      );
    }
  };

  // Skip avec fakedata — garde la compatibilité
  const handleFakeUpload = () => {
    completeStep(0);
    navigate(ROUTES.EDITOR);
  };

  const progressColor = progress === 100 ? colors.green : progress > 60 ? colors.blue : colors.blueMuted;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 760 }}>

        <Typography variant="caption" sx={{ color: colors.blueMuted, letterSpacing: 2, fontSize: 11, textTransform: "uppercase" }}>
          Home / Uploads
        </Typography>
        <Typography variant="h4" fontWeight={700} color={colors.textWhite} mt={0.5}
          sx={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}>
          Document{" "}
          <Box component="span" sx={{ color: colors.blue }}>Management</Box>
        </Typography>
        <Typography variant="body2" color={colors.textMuted} mb={4}>
          Centralized hub for file ingestion and processing status.
        </Typography>

        <Box sx={{
          background: `linear-gradient(135deg, ${colors.bgDark} 0%, ${colors.bgCard} 100%)`,
          border: `1px solid ${colors.borderCard}`, borderRadius: 3,
          p: { xs: 3, md: 5 },
        }}>

          {sizeError && (
            <Alert severity="error" icon={<WarningAmberIcon />} onClose={() => setSizeError(false)}
              sx={{ mb: 2, bgcolor: `${colors.red}18`, color: colors.textWhite, border: `1px solid ${colors.red}` }}>
              Fichier trop volumineux — taille maximale : <strong>{MAX_SIZE_MB} MB</strong>
            </Alert>
          )}

          {uploadError && (
            <Alert severity="error" onClose={() => setUploadError("")}
              sx={{ mb: 2, bgcolor: `${colors.red}18`, color: colors.textWhite, border: `1px solid ${colors.red}` }}>
              {uploadError}
            </Alert>
          )}

          {/* Drop Zone */}
          <Box
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            sx={{
              border:     `2px dashed ${sizeError ? colors.red : dragging ? colors.blue : colors.blueButton}`,
              borderRadius: 2, p: { xs: 4, md: 6 }, textAlign: "center",
              cursor:     uploading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              background: dragging ? `${colors.blueDeep}22` : "transparent",
              "&:hover":  uploading ? {} : { borderColor: colors.blue, background: `${colors.blueDeep}11` },
            }}
          >
            <input ref={inputRef} type="file" accept={ACCEPTED} style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

            <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: `${colors.blueButton}22`, border: `1px solid ${colors.blueButton}`, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
              <UploadFileIcon sx={{ color: colors.blue, fontSize: 30 }} />
            </Box>

            {file ? (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
                  <InsertDriveFileIcon sx={{ color: colors.blueMuted, fontSize: 20 }} />
                  <Typography color={colors.textWhite} fontWeight="medium">{file.name}</Typography>
                  {!uploading && (
                    <IconButton size="small"
                      onClick={(e) => { e.stopPropagation(); setFile(null); setSizeError(false); setProgress(0); reset(); }}
                      sx={{ color: colors.textMuted, ml: 0.5 }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="caption" color={colors.textMuted}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB / {MAX_SIZE_MB} MB max
                </Typography>
              </Box>
            ) : (
              <>
                <Typography color={colors.textWhite} fontWeight="medium" mb={0.5}>
                  Drag and drop files here
                </Typography>
                <Typography variant="caption" color={colors.textMuted} display="block" mb={1}>
                  Supports .pdf, .png, .jpg, .tiff — max {MAX_SIZE_MB} MB
                </Typography>
              </>
            )}
          </Box>

          {/* Progress */}
          {(uploading || progress > 0) && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" color={colors.textMuted}>
                  {progress < 100 ? "Envoi en cours..." : "Upload terminé !"}
                </Typography>
                <Typography variant="caption" sx={{ color: progressColor, fontWeight: 700 }}>
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{
                height: 8, borderRadius: 4, bgcolor: colors.border,
                "& .MuiLinearProgress-bar": { bgcolor: progressColor, borderRadius: 4 },
              }} />
              <UploadStepsBox progress={progress} />
            </Box>
          )}

          {!file && !uploading && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button variant="outlined" onClick={() => inputRef.current?.click()} startIcon={<UploadFileIcon />}
                sx={{ borderColor: colors.blueButton, color: colors.textWhite, bgcolor: colors.blueDeep, textTransform: "uppercase", letterSpacing: 1, fontSize: 13, px: 3 }}>
                Select Files From Computer
              </Button>
            </Box>
          )}

          {/* Actions */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3, alignItems: "center" }}>
            <Button variant="outlined" onClick={handleFakeUpload} disabled={uploading}
              sx={{ borderColor: colors.blueButton, color: colors.textMuted, fontSize: 12 }}>
              Skip with fake data
            </Button>

            {file && !uploading && (
              <Button variant="outlined" startIcon={<VerifiedIcon />} onClick={() => setVerifyOpen(true)}
                sx={{ borderColor: "#a78bfa55", color: "#a78bfa", fontWeight: 600, fontSize: 13, px: 2.5 }}>
                Verify
              </Button>
            )}

            <Button variant="contained"
              endIcon={uploading ? <CircularProgress size={16} sx={{ color: "white" }} /> : <ArrowForwardIcon />}
              onClick={handleUpload} disabled={!file || uploading}
              sx={{ px: 4, fontWeight: "bold", letterSpacing: 1 }}>
              {uploading ? `${Math.round(progress)}%` : "Next"}
            </Button>
          </Box>
        </Box>

        <PipelineStepper />
      </Box>

      <VerifyModal open={verifyOpen} file={file} onClose={() => setVerifyOpen(false)} />

      <Snackbar open={snackOpen} autoHideDuration={4000} onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert icon={<TaskAltIcon />} severity="success" onClose={() => setSnackOpen(false)}
          sx={{ bgcolor: colors.bgDark, color: colors.textWhite, border: `1px solid ${colors.green}` }}>
          <Typography fontWeight="bold" fontSize={14}>Upload Successful</Typography>
          <Typography fontSize={12} color={colors.textMuted}>Document queued for processing.</Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
}