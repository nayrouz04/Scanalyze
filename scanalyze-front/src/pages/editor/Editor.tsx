// Editor — side-by-side document editor with live JSON preview
import { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button,
  CircularProgress, Alert, Paper, Divider,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CircleIcon       from "@mui/icons-material/Circle";
import { useNavigate }  from "react-router-dom";
import { useGetMyDocumentsQuery } from "@services";

import { colors }             from "@theme";
import { ROUTES }             from "@constants";
import { useStepper }         from "@features/stepper";
import PipelineStepper        from "@components/common/PipelineStepper";
import fakeDoc from "../../assets/fakeData/editor-document.json";
 
const USE_FAKE_DATA = true;
 
// ── JSON syntax highlight palette ───────────────────────────────────────────
const JSON_COLORS = {
  string:    "#86efac",
  number:    "#fb923c",
  boolean:   "#f472b6",
  null:      "#94a3b8",
  bracket:   "#e2e8f0",
  key:       colors.blueMuted,
} as const;
 
// ── Read-only TextField sx ───────────────────────────────────────────────────
const readonlyFieldSx = {
  flex: 1,
  "& .MuiOutlinedInput-root": {
    cursor: "default",
    "& fieldset":             { borderColor: colors.border },
    "&:hover fieldset":       { borderColor: colors.border },
    "&.Mui-focused fieldset": { borderColor: colors.border },
  },
  "& .MuiInputBase-input": {
    cursor: "default", color: colors.textMuted,
    fontSize: "0.88rem", py: "7px",
  },
} as const;
 
function renderJsonSyntax(obj: any): JSX.Element {
  if (typeof obj === "string")  return <span style={{ color: JSON_COLORS.string  }}>"{obj}"</span>;
  if (typeof obj === "number")  return <span style={{ color: JSON_COLORS.number  }}>{obj}</span>;
  if (typeof obj === "boolean") return <span style={{ color: JSON_COLORS.boolean }}>{String(obj)}</span>;
  if (obj === null)             return <span style={{ color: JSON_COLORS.null    }}>null</span>;
 
  if (Array.isArray(obj)) {
    return (
      <>
        <span style={{ color: JSON_COLORS.bracket }}>{"["}</span>
        {obj.map((item, i) => (
          <div key={i} style={{ paddingLeft: 16 }}>
            {renderJsonSyntax(item)}
            {i < obj.length - 1 && <span style={{ color: JSON_COLORS.bracket }}>,</span>}
          </div>
        ))}
        <span style={{ color: JSON_COLORS.bracket }}>{"]"}</span>
      </>
    );
  }
 
  const entries = Object.entries(obj);
  return (
    <>
      <span style={{ color: JSON_COLORS.bracket }}>{"{"}</span>
      {entries.map(([key, value], i) => (
        <div key={key} style={{ paddingLeft: 16 }}>
          <span style={{ color: JSON_COLORS.key }}>"{key}"</span>
          <span style={{ color: JSON_COLORS.bracket }}>: </span>
          {renderJsonSyntax(value)}
          {i < entries.length - 1 && <span style={{ color: JSON_COLORS.bracket }}>,</span>}
        </div>
      ))}
      <span style={{ color: JSON_COLORS.bracket }}>{"}"}</span>
    </>
  );
}
 
export default function Editor() {
  const navigate = useNavigate();
  const { completeStep } = useStepper();
 
  const { data, isLoading: liveLoading, isError: liveError } =
  useGetMyDocumentsQuery(undefined, { skip: USE_FAKE_DATA });
 
  const isLoading = USE_FAKE_DATA ? false : liveLoading;
  const isError   = USE_FAKE_DATA ? false : liveError;
 
  const lastDoc       = USE_FAKE_DATA ? fakeDoc : data?.[data.length - 1];
  const extractedData = lastDoc?.extracted_data ?? {};
 
  const [fields, setFields] = useState<Record<string, any>>({});
 
  useEffect(() => {
    if (extractedData) setFields(extractedData);
  }, [lastDoc]);
 
  const previewJson = lastDoc
    ? {
        document_id:       lastDoc.id ?? lastDoc.document_id,
        extracted_data:    fields,
        validation_status: lastDoc.validation_status ?? "pending",
        last_edited_by:    "user_admin",
      }
    : null;
 
  const renderField = (key: string, value: any) => {
    const label       = key.toUpperCase().replace(/_/g, " ");
    const isMultiline = typeof value === "object" || String(value).length > 60;
    const displayValue = typeof value === "object"
      ? JSON.stringify(value, null, 2)
      : String(value ?? "");
 
    return (
      <Box key={key} sx={{
        display: "flex", alignItems: isMultiline ? "flex-start" : "center",
        gap: 2, py: 1.5,
        borderBottom: `1px solid ${colors.border}`,
        "&:last-child": { borderBottom: "none" },
      }}>
        <Typography variant="caption" sx={{
          color: colors.blueMuted, letterSpacing: 1.2, fontWeight: 700,
          fontSize: 11, width: 130, flexShrink: 0,
          pt: isMultiline ? 1.2 : 0, lineHeight: 1.4,
        }}>
          {label}
        </Typography>
        <TextField
          fullWidth multiline={isMultiline} minRows={isMultiline ? 2 : 1}
          value={displayValue} InputProps={{ readOnly: true }} size="small"
          sx={readonlyFieldSx}
        />
      </Box>
    );
  };
 
  const handleNext = () => {
    completeStep(1);
    navigate(ROUTES.VERIFICATION);
  };
 
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, pb: "100px" }}>
      <Typography variant="caption" sx={{
        color: colors.blueMuted, letterSpacing: 2, fontSize: 11, textTransform: "uppercase",
      }}>
        Home / Editor
      </Typography>
      <Typography variant="h4" fontWeight="bold" color={colors.textWhite} mt={0.5} mb={4}>
        DOCUMENT EDITOR
      </Typography>
 
      {isLoading && <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}><CircularProgress /></Box>}
      {isError   && <Alert severity="error">Erreur lors du chargement du document.</Alert>}
 
      {!isLoading && !isError && lastDoc && (
        <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" } }}>
 
          {/* Left — Extracted Fields */}
          <Paper sx={{ flex: 1, borderRadius: 3, border: `1px solid ${colors.borderCard}`, p: 3 }}>
            <Typography variant="h6" color={colors.textWhite} fontWeight="bold">Extracted Fields</Typography>
            <Typography variant="caption" color={colors.textMuted}>Read-only — extracted automatically</Typography>
            <Divider sx={{ my: 2 }} />
 
            <Box sx={{ display: "flex", gap: 2, pb: 1, mb: 0.5, borderBottom: `2px solid ${colors.border}` }}>
              {["Champ", "Valeur"].map((h) => (
                <Typography key={h} variant="caption" sx={{
                  width: h === "Champ" ? 130 : undefined, flexShrink: 0,
                  color: colors.textMuted, fontWeight: 700, fontSize: 10,
                  letterSpacing: 1.5, textTransform: "uppercase",
                }}>
                  {h}
                </Typography>
              ))}
            </Box>
 
            {Object.keys(fields).length > 0
              ? Object.entries(fields).map(([key, value]) => renderField(key, value))
              : <Typography color={colors.textMuted} variant="body2" sx={{ mt: 2 }}>
                  Aucun champ extrait disponible.
                </Typography>}
          </Paper>
 
          {/* Right — JSON Output Preview */}
          <Paper sx={{
            flex: 1, borderRadius: 3, border: `1px solid ${colors.borderCard}`,
            p: 3, display: "flex", flexDirection: "column",
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" color={colors.textWhite} fontWeight="bold">&lt;/&gt; Output Preview</Typography>
              <Typography variant="caption" sx={{
                color: colors.blueMuted, bgcolor: `${colors.blueDeep}33`,
                border: `1px solid ${colors.blueButton}`,
                borderRadius: 1, px: 1.5, py: 0.4, fontSize: 11, letterSpacing: 1,
              }}>
                JSON
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{
              flex: 1, overflow: "auto", bgcolor: colors.bgDark,
              borderRadius: 2, p: 2, fontFamily: "monospace", fontSize: 13,
            }}>
              {previewJson && renderJsonSyntax(previewJson)}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
              <CircleIcon sx={{ fontSize: 10, color: USE_FAKE_DATA ? colors.amber : colors.green }} />
              <Typography variant="caption" color={colors.textMuted}>
                {USE_FAKE_DATA ? "Fake data mode" : "Connected to API"}
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
 
      {!isLoading && !isError && !lastDoc && (
        <Alert severity="info">Aucun document disponible. Veuillez d'abord uploader un fichier.</Alert>
      )}
 
      {/* Bottom bar — Stepper + Next */}
      {!isLoading && !isError && lastDoc && (
        <Box sx={{
          position: "fixed", bottom: 0, left: 260, right: 0,
          bgcolor: colors.bgDark, borderTop: `1px solid ${colors.border}`,
          px: 4, py: 1, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box sx={{ flex: 1 }}><PipelineStepper /></Box>
          <Button
            variant="contained" endIcon={<ArrowForwardIcon />}
            onClick={handleNext} size="small"
            sx={{ px: 3, fontWeight: "bold", letterSpacing: 1, ml: 2, whiteSpace: "nowrap" }}
          >
            NEXT
          </Button>
        </Box>
      )}
    </Box>
  );
}