import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Typography, TextField, Button, CircularProgress,
  Alert, Chip, Tooltip, Popover, List, ListItem,
  ListItemButton, Divider, IconButton,
} from "@mui/material";
import SkipNextIcon     from "@mui/icons-material/SkipNext";
import EditIcon         from "@mui/icons-material/Edit";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TaskAltIcon      from "@mui/icons-material/TaskAlt";
import LockIcon         from "@mui/icons-material/Lock";
import LockOpenIcon     from "@mui/icons-material/LockOpen";
import AutoFixHighIcon  from "@mui/icons-material/AutoFixHigh";
import CloseIcon        from "@mui/icons-material/Close";
import ArrowBackIcon    from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetMyDocumentsQuery } from "@services";

import { colors }             from "@theme";
import { useStepper }         from "@features/stepper";
import { ROUTES }             from "@constants";
import PipelineStepper        from "@components/common/PipelineStepper";
 
import fakeVerifRaw from "@assets/fakeData/verification-results.json";
import cvImage      from "@assets/fakeData/cv_emilie_michaud.png";
 
// ── Types ────────────────────────────────────────────────────────────────────
interface BBox        { x: number; y: number; w: number; h: number; }
interface OverlayRect { top: number; left: number; width: number; height: number; }
interface AISuggestion { value: string; reason: string; }
 
// ── Couleurs locales hors palette globale ────────────────────────────────────
// Ces teintes (violet IA, amber dark, green dark) sont spécifiques à ce composant.
const AI_COLOR      = "#a78bfa";  // violet — suggestions IA
const AMBER_DARK    = "#78350f";  // fond chip "mode édition" / bouton Correct
const GREEN_DARK    = "#14532d";  // fond chip "APPROVED"
const DISABLED_TEXT = "#334155";  // texte bouton disabled (plus sombre que textMuted)
 
// ── Helpers ──────────────────────────────────────────────────────────────────
const getVal  = (entry: any): string      => entry?.value !== undefined ? String(entry.value) : String(entry ?? "");
const getBbox = (entry: any): BBox | null => entry?.bbox ?? null;
 
const USE_FAKE_DATA = true;
 
const fakeResults = (fakeVerifRaw as any[]).map((doc) =>
  doc.original_filename === "cv_emilie_michaud.png"
    ? { ...doc, file_url: cvImage }
    : doc
);
 
// ── AI suggestions API call ──────────────────────────────────────────────────
async function fetchAISuggestions(
  fieldKey: string,
  currentValue: string,
  docType: string,
  allFields: Record<string, any>
): Promise<AISuggestion[]> {
  const contextFields = Object.entries(allFields)
    .filter(([k]) => k !== fieldKey)
    .map(([k, v]) => `${k}: ${getVal(v)}`)
    .join("\n");
 
  const prompt = `Tu es un assistant expert en traitement de documents OCR.
Un document de type "${docType}" a été scanné et analysé automatiquement.
 
Voici tous les champs extraits pour contexte :
${contextFields}
 
Le champ "${fieldKey}" contient actuellement la valeur : "${currentValue}"
 
Cette valeur peut contenir des erreurs OCR (lettres confondues, espaces mal placés, majuscules incorrectes, caractères spéciaux erronés, etc.).
 
Génère exactement 3 suggestions de correction pour ce champ.
Réponds UNIQUEMENT avec un JSON valide, sans aucun texte avant ou après, sans balises markdown :
[
  {"value": "suggestion 1", "reason": "explication courte en français"},
  {"value": "suggestion 2", "reason": "explication courte en français"},
  {"value": "suggestion 3", "reason": "explication courte en français"}
]`;
 
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
 
  const data  = await response.json();
  const text  = data.content?.map((b: any) => b.text ?? "").join("") ?? "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as AISuggestion[];
}
 
// ── SuggestionPopover ────────────────────────────────────────────────────────
interface SuggestionPopoverProps {
  anchorEl:   HTMLElement | null;
  fieldKey:   string;
  fieldValue: string;
  docType:    string;
  allFields:  Record<string, any>;
  onApply:    (key: string, value: string) => void;
  onClose:    () => void;
}
 
function SuggestionPopover({
  anchorEl, fieldKey, fieldValue, docType, allFields, onApply, onClose,
}: SuggestionPopoverProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
 
  useEffect(() => {
    if (!anchorEl) return;
    setLoading(true); setError(null); setSuggestions([]);
    fetchAISuggestions(fieldKey, fieldValue, docType, allFields)
      .then(setSuggestions)
      .catch(() => setError("Impossible de charger les suggestions."))
      .finally(() => setLoading(false));
  }, [anchorEl, fieldKey]);
 
  return (
    <Popover
      open={!!anchorEl} anchorEl={anchorEl} onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top",    horizontal: "right" }}
      PaperProps={{ sx: { bgcolor: colors.bgDark, border: `1px solid ${colors.borderCard}`, borderRadius: 2, boxShadow: "0 8px 32px rgba(0,0,0,0.6)", width: 340, overflow: "hidden" } }}
    >
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: colors.bgCard, borderBottom: `1px solid ${colors.borderCard}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoFixHighIcon sx={{ fontSize: 16, color: AI_COLOR }} />
          <Typography variant="caption" fontWeight={700} fontSize={12} color={colors.textLight}>Suggestions IA</Typography>
          <Chip label={fieldKey.replace(/_/g, " ").toUpperCase()} size="small" sx={{ bgcolor: `${colors.blue}22`, color: colors.blue, fontSize: 9, height: 18 }} />
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: colors.textMuted, p: 0.3 }}>
          <CloseIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>
 
      {/* Current value */}
      <Box sx={{ px: 2, py: 1.2, bgcolor: colors.bgPage, borderBottom: `1px solid ${colors.borderCard}` }}>
        <Typography variant="caption" color={colors.textMuted} fontSize={10} display="block" mb={0.3}>Valeur actuelle</Typography>
        <Typography variant="caption" color={colors.textSecondary} fontSize={12} sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>"{fieldValue}"</Typography>
      </Box>
 
      {/* Suggestions list */}
      <Box sx={{ minHeight: 80 }}>
        {loading && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5, py: 3 }}>
            <CircularProgress size={22} sx={{ color: AI_COLOR }} />
            <Typography variant="caption" color={colors.textMuted} fontSize={11}>Analyse en cours…</Typography>
          </Box>
        )}
        {error && <Box sx={{ px: 2, py: 2 }}><Alert severity="error" sx={{ fontSize: 11 }}>{error}</Alert></Box>}
        {!loading && !error && suggestions.length > 0 && (
          <List dense disablePadding>
            {suggestions.map((s, i) => (
              <Box key={i}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => { onApply(fieldKey, s.value); onClose(); }}
                    sx={{ px: 2, py: 1.2, "&:hover": { bgcolor: `${AI_COLOR}15` }, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.3 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                      <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: `${AI_COLOR}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Typography sx={{ fontSize: 10, color: AI_COLOR, fontWeight: 700 }}>{i + 1}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600} fontSize={13} color={colors.textLight} sx={{ fontFamily: "monospace", flex: 1, wordBreak: "break-all" }}>
                        {s.value}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color={colors.textMuted} fontSize={11} sx={{ pl: "26px", lineHeight: 1.4 }}>
                      {s.reason}
                    </Typography>
                  </ListItemButton>
                </ListItem>
                {i < suggestions.length - 1 && <Divider sx={{ borderColor: colors.borderCard }} />}
              </Box>
            ))}
          </List>
        )}
      </Box>
 
      {/* Footer */}
      <Box sx={{ px: 2, py: 1, bgcolor: colors.bgCard, borderTop: `1px solid ${colors.borderCard}`, display: "flex", alignItems: "center", gap: 0.8 }}>
        <AutoFixHighIcon sx={{ fontSize: 12, color: colors.textMuted }} />
        <Typography variant="caption" color={colors.textMuted} fontSize={10}>Powered by Claude · Cliquez pour appliquer</Typography>
      </Box>
    </Popover>
  );
}
 
// ── Composant principal ───────────────────────────────────────────────────────
export default function Verification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeStep } = useStepper();
 
  const historyState = location.state as {
    fromHistory?: boolean;
    documentId?: string;
    sourceDocument?: string;
    docType?: string;
  } | null;
 
  const { data, isLoading } = useGetMyDocumentsQuery(undefined, { skip: USE_FAKE_DATA });

  const documents = USE_FAKE_DATA ? fakeResults : (data ?? []);
 
  const initialIndex = (() => {
    if (!historyState?.fromHistory || !historyState.documentId) return 0;
    const idxById = documents.findIndex((d: any) => d.id === historyState.documentId);
    if (idxById !== -1) return idxById;
    const idxByName = documents.findIndex((d: any) =>
      (d.original_filename ?? d.filename ?? "") === historyState.sourceDocument
    );
    return idxByName !== -1 ? idxByName : 0;
  })();
 
  const [docIndex,    setDocIndex]    = useState(initialIndex);
  const [fields,      setFields]      = useState<Record<string, any>>({});
  const [corrected,   setCorrected]   = useState<Record<string, boolean>>({});
  const [approved,    setApproved]    = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [editMode,    setEditMode]    = useState(false);
  const [aiAnchorEl,  setAiAnchorEl]  = useState<HTMLElement | null>(null);
  const [aiFieldKey,  setAiFieldKey]  = useState("");
  const [overlayRect, setOverlayRect] = useState<OverlayRect | null>(null);
 
  const imgRef     = useRef<HTMLImageElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
 
  const computeOverlay = useCallback((bbox: BBox): OverlayRect | null => {
    const img = imgRef.current;
    if (!img) return null;
    return {
      top:    bbox.y * img.clientHeight,
      left:   bbox.x * img.clientWidth,
      width:  bbox.w * img.clientWidth,
      height: bbox.h * img.clientHeight,
    };
  }, []);
 
  useEffect(() => {
    if (!activeField) return;
    const bbox = getBbox(fields[activeField]);
    if (!bbox) return;
    const onResize = () => setOverlayRect(computeOverlay(bbox));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeField, fields, computeOverlay]);
 
  useEffect(() => {
    const doc = documents[docIndex];
    if (doc?.extracted_data) {
      setFields(doc.extracted_data);
      setCorrected({}); setApproved(false); setEditMode(false);
      setActiveField(null); setOverlayRect(null); setAiAnchorEl(null);
    }
  }, [docIndex, data]);
 
  const currentDoc = documents[docIndex];
  const totalDocs  = documents.length;
  const docType    = currentDoc?.doc_type ?? "document";
 
  const handleChange = (key: string, newVal: string) => {
    setFields((prev) => ({ ...prev, [key]: { ...prev[key], value: newVal } }));
    setCorrected((prev) => ({ ...prev, [key]: true }));
  };
 
  const handleFieldClick = (key: string, hasBbox: boolean) => {
    if (!hasBbox) return;
    if (activeField === key) { setActiveField(null); setOverlayRect(null); return; }
    setActiveField(key);
    const bbox = getBbox(fields[key]);
    if (!bbox) return;
    requestAnimationFrame(() => setOverlayRect(computeOverlay(bbox)));
  };
 
  const handleSkip    = () => { if (docIndex < totalDocs - 1) setDocIndex((i) => i + 1); };
  const handleCorrect = () => setEditMode(true);
 
  const handleApprove = () => {
    setEditMode(false); setApproved(true);
    setTimeout(() => {
      if (historyState?.fromHistory) { navigate(ROUTES.HISTORY ?? (-1 as any)); return; }
      if (docIndex < totalDocs - 1) { setDocIndex((i) => i + 1); setApproved(false); }
      else { completeStep(2); navigate(ROUTES.EXPORT); }
    }, 800);
  };
 
  const handleOpenAI = (e: React.MouseEvent<HTMLElement>, key: string) => {
    e.stopPropagation();
    setAiFieldKey(key);
    setAiAnchorEl(e.currentTarget);
  };
 
  const issueCount = Object.values(corrected).filter(Boolean).length;
 
  // ── Document preview ───────────────────────────────────────────────────────
  const renderPreview = () => {
    const fileUrl  = currentDoc?.file_url ?? null;
    const fileName: string = currentDoc?.original_filename ?? currentDoc?.filename ?? "";
    const isPdf    = fileName.toLowerCase().endsWith(".pdf");
 
    if (!fileUrl) return (
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: colors.bgPage, gap: 2 }}>
        <Typography sx={{ fontSize: 48 }}>📄</Typography>
        <Typography color={colors.textMuted} variant="body2">Aperçu non disponible</Typography>
      </Box>
    );
 
    if (isPdf) return (
      <Box sx={{ flex: 1, overflow: "hidden", bgcolor: colors.bgPage, p: 3 }}>
        <iframe src={fileUrl} width="100%" height="100%" style={{ border: "none", minHeight: 480, borderRadius: 8 }} title="Document Preview" />
      </Box>
    );
 
    return (
      <Box sx={{ flex: 1, overflow: "auto", bgcolor: colors.bgPage, display: "flex", alignItems: "flex-start", justifyContent: "center", pt: 4, pb: 4, perspective: "1200px" }}>
        <Box sx={{ width: "85%", maxWidth: 700, flexShrink: 0, position: "relative" }}>
          {/* Paper edge shadows */}
          <Box sx={{ position: "absolute", left: -6, top: 4, bottom: -4, width: 6, bgcolor: colors.textSecondary, borderRadius: "2px 0 0 2px", opacity: 0.4 }} />
          <Box sx={{ position: "absolute", bottom: -6, left: 4, right: -4, height: 6, bgcolor: colors.textSecondary, borderRadius: "0 0 2px 2px", opacity: 0.3 }} />
 
          <Box ref={imgWrapRef} sx={{
            position: "relative", borderRadius: "4px", overflow: "hidden",
            boxShadow: [
              "0 30px 40px rgba(0,0,0,0.7)",
              "0 8px 16px rgba(0,0,0,0.5)",
              "inset 0 0 0 1px rgba(255,255,255,0.1)",
            ].join(", "),
            transition: "box-shadow 0.3s ease",
            "&:hover": {
              boxShadow: [
                "0 36px 48px rgba(0,0,0,0.75)",
                "0 10px 20px rgba(0,0,0,0.55)",
                "inset 0 0 0 1px rgba(255,255,255,0.15)",
              ].join(", "),
            },
          }}>
            <img
              ref={imgRef}
              src={fileUrl}
              alt="Document Preview"
              onLoad={() => {
                if (activeField) {
                  const bbox = getBbox(fields[activeField]);
                  if (bbox) requestAnimationFrame(() => setOverlayRect(computeOverlay(bbox)));
                }
              }}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            {overlayRect && (
              <Box sx={{
                position: "absolute", pointerEvents: "none",
                top:    `${overlayRect.top}px`,
                left:   `${overlayRect.left}px`,
                width:  `${overlayRect.width}px`,
                height: `${overlayRect.height}px`,
                border:  `3px solid ${colors.blue}`,
                borderRadius: "4px",
                bgcolor: `${colors.blue}2e`,
                boxShadow: `0 0 0 4px ${colors.blue}33, inset 0 0 8px ${colors.blue}1a`,
                transition: "top 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease",
                zIndex: 10,
              }} />
            )}
          </Box>
        </Box>
      </Box>
    );
  };
 
  if (isLoading && !USE_FAKE_DATA) return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>
  );
 
  if (!currentDoc) return <Alert severity="info">Aucun document à vérifier.</Alert>;
 
  const goToHistory = () => navigate(ROUTES.HISTORY ?? (-1 as any));
 
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", pb: "110px" }}>
 
      {/* ── Top bar ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 1.5, bgcolor: colors.bgDark, borderBottom: `1px solid ${colors.borderCard}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {historyState?.fromHistory && (
            <Tooltip title="Retour à l'historique" placement="bottom">
              <IconButton size="small" onClick={goToHistory} sx={{ color: colors.textMuted, border: `1px solid ${colors.borderCard}`, borderRadius: 1, p: "4px", mr: 0.5, "&:hover": { bgcolor: colors.borderCard, color: colors.textWhite } }}>
                <ArrowBackIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          <Typography variant="caption" color={colors.textMuted}>
            {historyState?.fromHistory ? "Historique" : "Home"} / Verification
          </Typography>
          <Typography variant="caption" color={colors.textMuted}> › </Typography>
          <Typography variant="caption" color={colors.blueMuted} fontWeight="bold">
            {currentDoc?.original_filename ?? `Doc #${docIndex + 1}`}
          </Typography>
          {historyState?.fromHistory && (
            <Chip label="Depuis l'historique" size="small" sx={{ bgcolor: `${AI_COLOR}22`, color: AI_COLOR, fontSize: 10, height: 18, ml: 1 }} />
          )}
        </Box>
        <Typography variant="caption" color={colors.textMuted}>
          Page {docIndex + 1} of {totalDocs}
        </Typography>
      </Box>
 
      {/* ── Main ── */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
 
        {/* Left — Document Preview */}
        <Box sx={{ flex: 1.4, display: "flex", flexDirection: "column", borderRight: `1px solid ${colors.borderCard}`, overflow: "hidden", position: "relative" }}>
          {renderPreview()}
        </Box>
 
        {/* Right — Verification Editor */}
        <Box sx={{ width: 460, flexShrink: 0, display: "flex", flexDirection: "column", bgcolor: colors.bgCard }}>
 
          {/* Header */}
          <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${colors.borderCard}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" color={colors.textWhite} fontWeight="bold" fontSize={15}>Verification Editor</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!editMode
                ? <Chip icon={<LockIcon sx={{ fontSize: 12 }} />} label="Lecture seule" size="small" sx={{ bgcolor: colors.bgHover, color: colors.textMuted, fontSize: 10 }} />
                : <Chip icon={<LockOpenIcon sx={{ fontSize: 12 }} />} label="Mode édition" size="small" sx={{ bgcolor: AMBER_DARK, color: colors.amber, fontSize: 10 }} />
              }
              {issueCount > 0 && (
                <Chip label={`${issueCount} CORRECTED`} size="small" sx={{ bgcolor: AMBER_DARK, color: colors.amber, fontSize: 10 }} />
              )}
              {approved && (
                <Chip icon={<TaskAltIcon sx={{ fontSize: 14 }} />} label="APPROVED" size="small" sx={{ bgcolor: GREEN_DARK, color: colors.green, fontSize: 10 }} />
              )}
            </Box>
          </Box>
 
          {/* Read-only banner */}
          {!editMode && (
            <Box sx={{ mx: 2, mt: 2, px: 2, py: 1.2, bgcolor: colors.bgHover, border: `1px solid ${colors.borderCard}`, borderRadius: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
              <LockIcon sx={{ fontSize: 16, color: colors.textMuted }} />
              <Typography variant="caption" color={colors.textMuted} fontSize={12}>
                Les champs sont en lecture seule. Cliquez sur{" "}
                <Box component="span" sx={{ color: colors.amber, fontWeight: 700 }}>Correct</Box>
                {" "}pour activer l'édition.
              </Typography>
            </Box>
          )}
 
          {/* Fields list */}
          <Box sx={{ flex: 1, px: 3, py: 2.5, overflow: "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
              <Box sx={{ width: 3, height: 14, bgcolor: colors.blue, borderRadius: 1 }} />
              <Typography variant="caption" color={colors.blueMuted} letterSpacing={1.5} fontWeight={700} fontSize={11}>EXTRACTED FIELDS</Typography>
              <Typography variant="caption" color={colors.textMuted} fontSize={10} ml="auto">📍 Cliquez pour localiser</Typography>
            </Box>
 
            {Object.entries(fields).map(([key, entry]) => {
              const label       = key.toUpperCase().replace(/_/g, " ");
              const value       = getVal(entry);
              const bbox        = getBbox(entry);
              const hasBbox     = !!bbox;
              const isCorrected = corrected[key];
              const isActive    = activeField === key;
              const isMultiline = value.length > 60;
 
              const aiActive = aiFieldKey === key && !!aiAnchorEl;
 
              return (
                <Box
                  key={key}
                  mb={3}
                  onClick={() => handleFieldClick(key, hasBbox)}
                  sx={{
                    cursor:     hasBbox ? "pointer" : "default",
                    borderRadius: 1.5,
                    border:     isActive ? `1.5px solid ${colors.blue}` : "1.5px solid transparent",
                    p:          1.5,
                    transition: "all 0.15s",
                    bgcolor:    isActive ? `${colors.blue}12` : `${colors.textWhite}05`,
                    boxShadow:  isActive ? `0 0 0 1px ${colors.blue}4d` : `0 1px 0 0 ${colors.textWhite}0a`,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="caption" letterSpacing={1} fontSize={11}
                        color={isActive ? colors.blue : colors.textMuted}
                        fontWeight={isActive ? 700 : 400}>
                        {label}
                      </Typography>
                      {hasBbox && <Typography sx={{ fontSize: 11, opacity: isActive ? 1 : 0.45 }}>📍</Typography>}
                    </Box>
 
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      {editMode && (
                        <Tooltip title="Suggestions IA pour ce champ" placement="top">
                          <IconButton size="small" onClick={(e) => handleOpenAI(e, key)} sx={{
                            p: "3px",
                            color:       aiActive ? AI_COLOR : colors.textMuted,
                            bgcolor:     aiActive ? `${AI_COLOR}15` : "transparent",
                            border:      "1px solid",
                            borderColor: aiActive ? `${AI_COLOR}44` : colors.borderCard,
                            borderRadius: 1,
                            transition:  "all 0.15s",
                            "&:hover": { bgcolor: `${AI_COLOR}15`, borderColor: `${AI_COLOR}44`, color: AI_COLOR },
                          }}>
                            <AutoFixHighIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {isCorrected ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <WarningAmberIcon sx={{ fontSize: 12, color: colors.amber }} />
                          <Typography variant="caption" color={colors.amber} fontSize={10}>Corrected</Typography>
                        </Box>
                      ) : (
                        <CheckCircleIcon sx={{ fontSize: 14, color: colors.green }} />
                      )}
                    </Box>
                  </Box>
 
                  <TextField
                    fullWidth multiline={isMultiline} minRows={isMultiline ? 2 : 1}
                    value={value} disabled={!editMode}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleChange(key, e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color:   colors.textWhite,
                        bgcolor: editMode ? colors.bgDark : colors.bgPage,
                        fontSize: 13,
                        cursor:  editMode ? "text" : "not-allowed",
                        "& fieldset":             { borderColor: isCorrected ? colors.amber : isActive ? colors.blue : colors.borderCard },
                        "&:hover fieldset":       { borderColor: editMode ? colors.blue : colors.borderCard },
                        "&.Mui-focused fieldset": { borderColor: colors.blue },
                      },
                      "& .MuiOutlinedInput-input.Mui-disabled":       { WebkitTextFillColor: colors.textMuted, cursor: "not-allowed" },
                      "& .MuiOutlinedInput-root.Mui-disabled fieldset": { borderColor: colors.bgHover },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
 
          {/* Batch progress */}
          <Box sx={{ px: 3, py: 1.5, borderTop: `1px solid ${colors.borderCard}`, bgcolor: colors.bgDark }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Typography variant="caption" color={colors.textMuted} fontSize={11}>Batch Progress:</Typography>
              <Typography variant="caption" color={colors.blueMuted} fontWeight="bold" fontSize={11}>{docIndex + 1}/{totalDocs}</Typography>
              <Box sx={{ flex: 1, height: 4, bgcolor: colors.borderCard, borderRadius: 2, ml: 1 }}>
                <Box sx={{ height: "100%", borderRadius: 2, bgcolor: colors.blue, width: `${((docIndex + 1) / totalDocs) * 100}%`, transition: "width 0.3s ease" }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
 
      {/* ── Bottom bar ── */}
      <Box sx={{ position: "fixed", bottom: 0, left: 260, right: 0, bgcolor: colors.bgDark, borderTop: `1px solid ${colors.borderCard}`, px: 3, pt: 1, pb: 1.5, zIndex: 100 }}>
        {!historyState?.fromHistory && <PipelineStepper />}
 
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2, mt: historyState?.fromHistory ? 0 : 1 }}>
 
          {historyState?.fromHistory && (
            <Button startIcon={<ArrowBackIcon />} onClick={goToHistory} size="small"
              sx={{ color: AI_COLOR, border: `1px solid ${AI_COLOR}44`, mr: "auto", "&:hover": { bgcolor: `${AI_COLOR}15` } }}>
              Retour à l'historique
            </Button>
          )}
 
          <Tooltip title="ALT+S">
            <Button startIcon={<SkipNextIcon />} onClick={handleSkip} size="small"
              disabled={docIndex >= totalDocs - 1}
              sx={{ color: colors.textMuted, border: `1px solid ${colors.borderCard}`, "&:hover": { bgcolor: colors.borderCard, color: colors.textWhite }, "&:disabled": { color: DISABLED_TEXT } }}>
              Skip
            </Button>
          </Tooltip>
 
          <Tooltip title={editMode ? "Mode édition déjà actif" : "ALT+C — Activer la correction"}>
            <span>
              <Button startIcon={editMode ? <LockOpenIcon /> : <EditIcon />} onClick={handleCorrect} size="small" disabled={editMode}
                sx={{
                  color:       editMode ? colors.textMuted : colors.amber,
                  border:      editMode ? `1px solid ${colors.borderCard}` : `1px solid ${AMBER_DARK}`,
                  "&:hover":   { bgcolor: editMode ? "transparent" : `${AMBER_DARK}22` },
                  "&:disabled": { color: colors.textMuted, borderColor: colors.borderCard },
                }}>
                Correct
              </Button>
            </span>
          </Tooltip>
 
          <Tooltip title="ALT+A">
            <Button variant="contained" startIcon={<TaskAltIcon />} onClick={handleApprove} size="small" sx={{ fontWeight: "bold" }}>
              {historyState?.fromHistory ? "Approuver & retour" : "Approve"}
            </Button>
          </Tooltip>
 
        </Box>
      </Box>
 
      {/* Popover IA */}
      <SuggestionPopover
        anchorEl={aiAnchorEl}
        fieldKey={aiFieldKey}
        fieldValue={aiFieldKey ? getVal(fields[aiFieldKey]) : ""}
        docType={docType}
        allFields={fields}
        onApply={handleChange}
        onClose={() => { setAiAnchorEl(null); setAiFieldKey(""); }}
      />
    </Box>
  );
}