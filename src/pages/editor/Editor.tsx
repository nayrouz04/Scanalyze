//useStat ger ls champs editables localemnt
//useEffect synchronise les champs quand les données API arrivent
import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, CircularProgress, Alert, Paper, Divider } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CircleIcon       from "@mui/icons-material/Circle";
import { useNavigate }  from "react-router-dom";
//hook RTK Query pour recuperer ls documents depuis le backend 
import { useGetResultsQuery } from "../../services/api";
import { colors } from "../../theme";

export default function Editor() {
  const navigate = useNavigate();
  //appel API retourne de tous les documents 
  const { data, isLoading, isError } = useGetResultsQuery(undefined);
  //prend le dernier document de la liste 
  const lastDoc      = data?.[data.length - 1];
  //les champs extrait par l'OCR par ce document
  const extractedData = lastDoc?.extracted_data ?? {};
  //copie locale editable de extractedData
  const [fields, setFields] = useState<Record<string, any>>({});

  //quand les données API arrivent ou changent , copie extractedData dans fields pour pouvoir les editer localement
  useEffect(() => { if (extractedData) setFields(extractedData); }, [data]);

  //met à jour un seul champs fiels sans toucher aux autres 
  const handleChange = (key: string, value: string) => setFields((prev) => ({ ...prev, [key]: value }));
  
  //construit l'objet JSON de previsualisation qui sera affiché à droite il se met à jour en temps réel quand on édite les champs 
  const previewJson = lastDoc ? {
    document_id:       lastDoc.id ?? lastDoc.document_id,
    extracted_data:    fields,
    validation_status: lastDoc.validation_status ?? "pending",
    last_edited_by:    "user_admin",
  } : null;

  //la fonction transforme la clé en label lisible 
  const renderField = (key: string, value: any) => {
    const label      = key.toUpperCase().replace(/_/g, " ");
    const isMultiline = typeof value === "object" || String(value).length > 60;
    const displayValue = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value ?? "");
    //chaque champs extrait devient un textField éditable
    return (
      <Box key={key} mb={2.5}>
        <Typography variant="caption" sx={{ color: colors.blueMuted, letterSpacing: 1.5, fontWeight: 600, fontSize: 11 }}>
          {label}
        </Typography>
        <TextField
          fullWidth multiline={isMultiline} minRows={isMultiline ? 3 : 1}
          value={displayValue} onChange={(e) => handleChange(key, e.target.value)}
          sx={{ mt: 0.5 }}
        />
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="caption" sx={{ color: colors.blueMuted, letterSpacing: 2, fontSize: 11, textTransform: "uppercase" }}>
        Home / Editor
      </Typography>
      <Typography variant="h4" fontWeight="bold" color={colors.textWhite} mt={0.5} mb={4}>
        DOCUMENT EDITOR
      </Typography>

      {isLoading && <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}><CircularProgress /></Box>}
      {isError   && <Alert severity="error">Erreur lors du chargement du document.</Alert>}

      {!isLoading && !isError && lastDoc && (
        <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" } }}>
          {/* Extracted Fields */}
          <Paper sx={{ flex: 1, borderRadius: 3, border: `1px solid ${colors.borderCard}`, p: 3 }}>
            <Typography variant="h6" color={colors.textWhite} fontWeight="bold">Extracted Fields</Typography>
            <Typography variant="caption" color={colors.textMuted}>Manual validation required</Typography>
            <Divider sx={{ my: 2 }} />
            {Object.keys(fields).length > 0
              ? Object.entries(fields).map(([key, value]) => renderField(key, value))
              : <Typography color={colors.textMuted} variant="body2">Aucun champ extrait disponible.</Typography>
            }
          </Paper>

          {/* Output Preview */}
          <Paper sx={{ flex: 1, borderRadius: 3, border: `1px solid ${colors.borderCard}`, p: 3, display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" color={colors.textWhite} fontWeight="bold">&lt;/&gt; Output Preview</Typography>
              <Typography variant="caption" sx={{ color: colors.blueMuted, bgcolor: "#1e3a8a33", border: `1px solid ${colors.blueButton}`, borderRadius: 1, px: 1.5, py: 0.4, fontSize: 11, letterSpacing: 1 }}>
                JSON
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flex: 1, overflow: "auto", bgcolor: colors.bgDark, borderRadius: 2, p: 2, fontFamily: "monospace", fontSize: 13 }}>
              {previewJson && renderJsonSyntax(previewJson)}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
              <CircleIcon sx={{ fontSize: 10, color: colors.green }} />
              <Typography variant="caption" color={colors.textMuted}>Connected to API</Typography>
            </Box>
          </Paper>
        </Box>
      )}

      {!isLoading && !isError && !lastDoc && (
        <Alert severity="info">Aucun document disponible. Veuillez d'abord uploader un fichier.</Alert>
      )}

      {!isLoading && !isError && lastDoc && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/verification")}
            sx={{ px: 4, fontWeight: "bold", letterSpacing: 1 }}>
            NEXT
          </Button>
        </Box>
      )}
    </Box>
  );
}

function renderJsonSyntax(obj: any): JSX.Element {
  if (typeof obj === "string")  return <span style={{ color: "#86efac" }}>"{obj}"</span>;
  if (typeof obj === "number")  return <span style={{ color: "#fb923c" }}>{obj}</span>;
  if (typeof obj === "boolean") return <span style={{ color: "#f472b6" }}>{String(obj)}</span>;
  if (obj === null)             return <span style={{ color: "#94a3b8" }}>null</span>;
  if (Array.isArray(obj)) {
    return (
      <>
        <span style={{ color: "#e2e8f0" }}>{"["}</span>
        {obj.map((item, i) => (
          <div key={i} style={{ paddingLeft: 16 }}>
            {renderJsonSyntax(item)}
            {i < obj.length - 1 && <span style={{ color: "#e2e8f0" }}>,</span>}
          </div>
        ))}
        <span style={{ color: "#e2e8f0" }}>{"]"}</span>
      </>
    );
  }
  const entries = Object.entries(obj);
  return (
    <>
      <span style={{ color: "#e2e8f0" }}>{"{"}</span>
      {entries.map(([key, value], i) => (
        <div key={key} style={{ paddingLeft: 16 }}>
          <span style={{ color: "#60a5fa" }}>"{key}"</span>
          <span style={{ color: "#e2e8f0" }}>: </span>
          {renderJsonSyntax(value)}
          {i < entries.length - 1 && <span style={{ color: "#e2e8f0" }}>,</span>}
        </div>
      ))}
      <span style={{ color: "#e2e8f0" }}>{"}"}</span>
    </>
  );
}