// HistoryPage — affiche la liste des fichiers JSON générés après traitement OCR/LLaMA
import React, { useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Tooltip,
  CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, InputAdornment,
  ToggleButton, ToggleButtonGroup, TablePagination, Divider,
} from "@mui/material";
import VisibilityIcon    from "@mui/icons-material/Visibility";
import CloseIcon         from "@mui/icons-material/Close";
import DataObjectIcon    from "@mui/icons-material/DataObject";
import SearchIcon        from "@mui/icons-material/Search";
import CheckCircleIcon   from "@mui/icons-material/CheckCircle";
import DescriptionIcon   from "@mui/icons-material/Description";
import AccessTimeIcon    from "@mui/icons-material/AccessTime";
import ErrorIcon         from "@mui/icons-material/Error";
import CloudUploadIcon   from "@mui/icons-material/CloudUpload";
import ReceiptIcon       from "@mui/icons-material/Receipt";
import PersonIcon        from "@mui/icons-material/Person";
import GavelIcon         from "@mui/icons-material/Gavel";
import FolderIcon        from "@mui/icons-material/Folder";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ZoomInIcon        from "@mui/icons-material/ZoomIn";
import ZoomOutIcon       from "@mui/icons-material/ZoomOut";
import FactCheckIcon     from "@mui/icons-material/FactCheck";
import { colors }        from "@theme";
import { useNavigate }   from "react-router-dom";
import { ROUTES }        from "@constants";
import { useGetProcessingHistoryQuery } from "@services";
 
interface ProcessingResult {
  id:                  string;
  job_id:              string;
  document_id:         string;
  source_document:     string;
  json_filename:       string;
  doc_type:            string | null;
  processed_at:        string | null;
  processing_time_ms:  number | null;
  confidence:          number | null;
  fields_extracted:    number;
  language:            string | null;
  size:                string | null;
  status:              string;
  exported_data?:      string | null;
}
 
// ── Type colors — hors palette globale ──────────────────────────────────────
const TYPE_COLORS: Record<string, { color: string; bgcolor: string }> = {
  invoices: { color: "#5c7cfa", bgcolor: "#5c7cfa22" },
  cv:       { color: "#20c997", bgcolor: "#20c99722" },
  contrat:  { color: "#ff922b", bgcolor: "#ff922b22" },
};
 
const typeConfig = [
  { value: "all",      label: "Tous",     icon: <FolderIcon      sx={{ fontSize: 15 }} />, ...{ color: colors.textLight,   bgcolor: `${colors.textWhite}15` } },
  { value: "invoices", label: "Factures", icon: <ReceiptIcon     sx={{ fontSize: 15 }} />, ...TYPE_COLORS.invoices },
  { value: "cv",       label: "CV",       icon: <PersonIcon      sx={{ fontSize: 15 }} />, ...TYPE_COLORS.cv       },
  { value: "contrat",  label: "Contrats", icon: <GavelIcon       sx={{ fontSize: 15 }} />, ...TYPE_COLORS.contrat  },
  { value: "others",   label: "Autres",   icon: <DescriptionIcon sx={{ fontSize: 15 }} />, ...{ color: colors.textSecondary, bgcolor: `${colors.textSecondary}22` } },
];
 
const typeChipSx = (type: string) =>
  TYPE_COLORS[type] ?? { bgcolor: colors.bgHover, color: colors.textMuted };
 
const confidenceColor = (score?: number | null): string => {
  if (score == null) return colors.textSecondary;
  if (score >= 0.95) return colors.green;
  if (score >= 0.85) return colors.amber;
  return colors.red;
};

const formatConfidence = (score?: number | null) =>
  score == null ? "N/A" : `${(score * 100).toFixed(0)}%`;

const normalizeDocType = (type?: string | null) => type ?? "others";

const formatLanguage = (language?: string | null) => (language ?? "fr").toUpperCase();
 
const statusConfig = {
  uploaded:   { label: "Uploadé",  color: "#20c997", bgcolor: "#20c99722", icon: <CloudUploadIcon sx={{ fontSize: 13 }} /> },
  processing: { label: "En cours", color: "#5c7cfa", bgcolor: "#5c7cfa22", icon: <AccessTimeIcon  sx={{ fontSize: 13 }} /> },
  failed:     { label: "Échoué",   color: colors.red, bgcolor: `${colors.red}22`, icon: <ErrorIcon sx={{ fontSize: 13 }} /> },
} as const;
 
const formatDate = (iso?: string | null) => {
  if (!iso) return "N/A";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};
 
const formatDuration = (ms?: number | null) => {
  if (ms == null) return "N/A";
  if (ms < 1000)  return `${ms} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
  return `${(ms / 60000).toFixed(1)} min`;
};
 
const parseExportedData = (exportedData?: string | null): object | null => {
  if (!exportedData) return null;
  try {
    return JSON.parse(exportedData);
  } catch {
    return null;
  }
};

const buildFakeJsonPreview = (result: ProcessingResult): object => (
  parseExportedData(result.exported_data) ?? {
  document_id:    result.id,
  source_file:    result.source_document,
  doc_type:       result.doc_type,
  language:       result.language,
  confidence_score: result.confidence,
  status:         result.status,
  processed_at:   result.processed_at,
  extracted_fields: {
    ...(result.doc_type === "invoices" && {
      invoice_number: "FAC-2024-0312", date: "15/03/2024",
      vendor: "Société Example SARL", total_amount: "1 250,00 DT",
      tax_rate: "19%", payment_due: "15/04/2024",
    }),
    ...(result.doc_type === "cv" && {
      full_name: "Ahmed Benali", email: "ahmed.benali@email.com",
      phone: "+216 98 765 432", education: "Ingénieur Informatique — ESPRIT 2020",
      experience_years: 4, skills: ["Python", "React", "Spring Boot"],
    }),
    ...(result.doc_type === "contrat" && {
      contract_type: "Prestation de services",
      parties: ["Client Corp.", "Prestataire SARL"],
      start_date: "01/04/2024", end_date: "31/12/2024", amount: "48 000,00 DT",
    }),
    ...(result.doc_type === "others" && {
      title: "Rapport Annuel 2023", pages: 24,
      sections: ["Résumé Exécutif", "Analyse Financière", "Perspectives"],
    }),
  },
  processing_metadata: {
    ocr_engine: "PaddleOCR", nlp_model: "LLaMA via Ollama", ner_library: "spaCy",
    processing_time_ms: result.processing_time_ms, fields_count: result.fields_extracted,
  },
  }
);
 
// ── DocumentOriginalContent ──────────────────────────────────────────────────
const DocumentOriginalContent: React.FC<{ result: ProcessingResult }> = ({ result }) => {
  const docStyle: React.CSSProperties = {
    background: "#ffffff", color: "#111",
    fontFamily: "'Georgia', serif", padding: "48px 56px",
    minHeight: "600px", borderRadius: "4px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
    maxWidth: "780px", margin: "0 auto",
  };
 
  if (result.doc_type === "invoices") {
    return (
      <div style={docStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 22, fontFamily: "Arial Black, sans-serif", marginBottom: 8 }}>SOCIÉTÉ EXAMPLE SARL</div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>
              12 Rue de la République, Tunis 1001<br />
              Tél : +216 71 000 000 · contact@example.tn<br />
              MF : 1234567/A/M/000
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: TYPE_COLORS.invoices.color, fontFamily: "Arial Black, sans-serif" }}>FACTURE</div>
            <div style={{ fontSize: 13, color: "#444", marginTop: 6, lineHeight: 1.7 }}>
              N° FAC-2024-0312<br />Date : 15/03/2024<br />
              <span style={{ color: "#e53935", fontWeight: 700 }}>Échéance : 15/04/2024</span>
            </div>
          </div>
        </div>
        <hr style={{ border: "none", borderTop: "1px solid #ddd", marginBottom: 24 }} />
        <div style={{ border: "1px solid #e0e0e0", borderRadius: 6, padding: "16px 20px", marginBottom: 28, background: "#f8f9fc" }}>
          <div style={{ fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Facturé à</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>CLIENT CORPORATION SA</div>
          <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>45 Avenue Habib Bourguiba, Sfax 3000<br />MF : 9876543/B/P/000</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 24 }}>
          <thead>
            <tr style={{ background: "#1a1a2e", color: "#fff" }}>
              {["Description", "Qté", "P.U. HT", "TVA", "Total HT"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: h === "Description" ? "left" : "center", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Développement application web", "1", "800,00 DT", "19%", "800,00 DT"],
              ["Intégration API REST", "2", "150,00 DT", "19%", "300,00 DT"],
              ["Formation utilisateurs (½ jour)", "1", "100,00 DT", "19%", "100,00 DT"],
            ].map(([desc, qty, pu, tva, total], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f5f6fa" }}>
                <td style={{ padding: "10px 12px" }}>{desc}</td>
                <td style={{ padding: "10px 12px", textAlign: "center" }}>{qty}</td>
                <td style={{ padding: "10px 12px", textAlign: "center" }}>{pu}</td>
                <td style={{ padding: "10px 12px", textAlign: "center" }}>{tva}</td>
                <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700 }}>{total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 280, fontSize: 13 }}>
            {[["Total HT", "1 200,00 DT"], ["TVA (19%)", "228,00 DT"]].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee" }}>
                <span style={{ color: "#666" }}>{label}</span><span>{val}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontWeight: 800, fontSize: 15, borderTop: "2px solid #222" }}>
              <span>Total TTC</span><span style={{ color: TYPE_COLORS.invoices.color }}>1 428,00 DT</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
 
  if (result.doc_type === "cv") {
    const name  = result.source_document.includes("sarah") ? "Sarah Khelil"            : "Ahmed Benali";
    const email = result.source_document.includes("sarah") ? "sarah.khelil@email.com"  : "ahmed.benali@email.com";
    const phone = result.source_document.includes("sarah") ? "+216 97 123 456"         : "+216 98 765 432";
    return (
      <div style={{ ...docStyle, fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${TYPE_COLORS.invoices.color}, ${TYPE_COLORS.cv.color})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
            {name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{name}</div>
            <div style={{ fontSize: 14, color: TYPE_COLORS.invoices.color, fontWeight: 600, marginBottom: 6 }}>Ingénieur Développement Logiciel</div>
            <div style={{ fontSize: 12, color: "#666" }}>{email} · {phone} · Tunis, Tunisie</div>
          </div>
        </div>
        <hr style={{ border: "none", borderTop: `2px solid ${TYPE_COLORS.invoices.color}`, marginBottom: 20 }} />
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: TYPE_COLORS.invoices.color, marginBottom: 10 }}>Compétences</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Python", "React", "Spring Boot", "Docker", "PostgreSQL", "Machine Learning"].map(s => (
              <span key={s} style={{ background: "#eef0ff", color: "#3a5bd9", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: TYPE_COLORS.invoices.color, marginBottom: 10 }}>Formation</div>
          <div style={{ borderLeft: `3px solid ${TYPE_COLORS.invoices.color}`, paddingLeft: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Ingénieur en Informatique</div>
            <div style={{ fontSize: 13, color: "#555" }}>ESPRIT — 2016 – 2020</div>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: TYPE_COLORS.invoices.color, marginBottom: 10 }}>Expérience professionnelle</div>
          {[
            { poste: "Développeur Full Stack", entreprise: "TechCorp Tunisie", periode: "2022 – Présent", desc: "Développement d'applications web React/Spring Boot, intégration API REST, déploiement Docker." },
            { poste: "Développeur Backend",    entreprise: "StartupDev",       periode: "2020 – 2022",   desc: "Conception de microservices Python/FastAPI, gestion base de données PostgreSQL." },
          ].map((exp) => (
            <div key={exp.poste} style={{ borderLeft: "3px solid #e0e0e0", paddingLeft: 14, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{exp.poste}</div>
              <div style={{ fontSize: 12, color: TYPE_COLORS.invoices.color, marginBottom: 4 }}>{exp.entreprise} · {exp.periode}</div>
              <div style={{ fontSize: 13, color: "#555" }}>{exp.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
 
  if (result.doc_type === "contrat") {
    return (
      <div style={{ ...docStyle, fontFamily: "Georgia, serif" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Contrat de Prestation de Services</div>
          <div style={{ fontSize: 13, color: "#666" }}>Référence : CTR-2024-0089 · Version 1.0</div>
        </div>
        <hr style={{ border: "none", borderTop: "1px solid #999", marginBottom: 24 }} />
        <p style={{ fontSize: 13, lineHeight: 1.9, marginBottom: 20 }}>
          Entre les soussignés : <strong>Client Corp.</strong>, société anonyme au capital de 500 000 DT, domiciliée au 10 Avenue de la Liberté, Tunis, représentée par son Directeur Général, ci-après désignée « Le Client »,
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.9, marginBottom: 24 }}>
          Et : <strong>Prestataire SARL</strong>, société à responsabilité limitée, immatriculée au Registre de Commerce de Tunis sous le n° B0123456, représentée par son Gérant, ci-après désignée « Le Prestataire ».
        </p>
        {[
          { titre: "Article 1 — Objet du contrat", texte: "Le Prestataire s'engage à fournir au Client des services de développement logiciel et de conseil en transformation digitale, conformément au cahier des charges annexé au présent contrat." },
          { titre: "Article 2 — Durée", texte: "Le présent contrat prend effet au 01/04/2024 et prend fin le 31/12/2024, soit une durée de neuf (9) mois, renouvelable par tacite reconduction sauf préavis de 30 jours." },
          { titre: "Article 3 — Rémunération", texte: "En contrepartie des services rendus, le Client s'engage à verser au Prestataire la somme forfaitaire de 48 000,00 DT (quarante-huit mille dinars), payable mensuellement en 9 tranches égales de 5 333,33 DT." },
          { titre: "Article 4 — Confidentialité", texte: "Chaque partie s'engage à maintenir strictement confidentielles toutes informations échangées dans le cadre de ce contrat, pour une durée de 3 ans après son expiration." },
        ].map((art) => (
          <div key={art.titre} style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{art.titre}</div>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "#333", margin: 0 }}>{art.texte}</p>
          </div>
        ))}
        <div style={{ marginTop: 40, display: "flex", justifyContent: "space-between" }}>
          {["Le Client", "Le Prestataire"].map((sig) => (
            <div key={sig} style={{ textAlign: "center", width: "40%" }}>
              <div style={{ borderTop: "1px solid #666", paddingTop: 8, fontSize: 13, color: "#444" }}>{sig}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>Signature & cachet</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
 
  return (
    <div style={{ ...docStyle, fontFamily: "Arial, sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>RAPPORT ANNUEL 2023</div>
        <div style={{ fontSize: 13, color: "#666" }}>Exercice fiscal — 1er Janvier au 31 Décembre 2023</div>
      </div>
      <hr style={{ border: "none", borderTop: "2px solid #222", marginBottom: 24 }} />
      {[
        { titre: "1. Résumé Exécutif",    texte: "L'année 2023 a été marquée par une croissance soutenue de l'activité avec un chiffre d'affaires en hausse de 18% par rapport à l'exercice précédent. La stratégie de diversification des marchés a porté ses fruits, permettant à l'entreprise de consolider sa position concurrentielle." },
        { titre: "2. Analyse Financière", texte: "Le résultat net de l'exercice s'établit à 2 450 000 DT, en progression de 12% par rapport à 2022. La marge opérationnelle s'améliore à 22%, reflétant les efforts d'optimisation des coûts engagés depuis le deuxième trimestre." },
        { titre: "3. Perspectives 2024",  texte: "Les projections pour 2024 anticipent une croissance de 20 à 25%, soutenue par le lancement de nouveaux produits et l'expansion sur les marchés régionaux. Un programme d'investissement de 3,5 millions DT est prévu pour moderniser l'outil de production." },
      ].map((s) => (
        <div key={s.titre} style={{ marginBottom: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: "#1a1a2e" }}>{s.titre}</div>
          <p style={{ fontSize: 13, lineHeight: 1.9, color: "#444", margin: 0 }}>{s.texte}</p>
        </div>
      ))}
    </div>
  );
};
 
// ── Modal JSON ───────────────────────────────────────────────────────────────
const JsonPreviewModal: React.FC<{ result: ProcessingResult | null; onClose: () => void }> = ({ result, onClose }) => {
  if (!result) return null;
  const jsonContent = buildFakeJsonPreview(result);
  return (
    <Dialog open={!!result} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { bgcolor: colors.bgCard, border: `1px solid ${colors.borderCard}`, borderRadius: 2, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" } }}>
      <DialogTitle sx={{ bgcolor: colors.bgDark, color: colors.textLight, borderBottom: `1px solid ${colors.borderCard}`, display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5, px: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DataObjectIcon sx={{ color: TYPE_COLORS.invoices.color, fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={600}>{result.json_filename}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: colors.textMuted }}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: colors.bgCard, p: 0 }}>
        <Box sx={{ px: 2.5, pt: 2, pb: 1, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Chip label={`Source : ${result.source_document}`} size="small" icon={<DescriptionIcon />} sx={{ bgcolor: `${TYPE_COLORS.invoices.color}22`, color: TYPE_COLORS.invoices.color, fontSize: 11 }} />
          <Chip label={`Confiance : ${formatConfidence(result.confidence)}`} size="small" icon={<CheckCircleIcon />} sx={{ bgcolor: `${confidenceColor(result.confidence)}22`, color: confidenceColor(result.confidence), fontSize: 11 }} />
          <Chip label={`Traitement : ${formatDuration(result.processing_time_ms)}`} size="small" icon={<AccessTimeIcon />} sx={{ bgcolor: `${colors.textSecondary}22`, color: colors.textSecondary, fontSize: 11 }} />
          <Chip label={`${result.fields_extracted} champs extraits`} size="small" sx={{ bgcolor: `${TYPE_COLORS.cv.color}22`, color: TYPE_COLORS.cv.color, fontSize: 11 }} />
          <Chip label={`Traité le : ${formatDate(result.processed_at)}`} size="small" icon={<CalendarTodayIcon sx={{ fontSize: 13 }} />} sx={{ bgcolor: `${TYPE_COLORS.contrat.color}22`, color: TYPE_COLORS.contrat.color, fontSize: 11, "& .MuiChip-icon": { color: TYPE_COLORS.contrat.color } }} />
        </Box>
        <Box component="pre" sx={{ m: 2.5, mt: 1, p: 2, bgcolor: colors.bgPage, borderRadius: 1.5, border: `1px solid ${colors.borderCard}`, fontSize: "0.78rem", color: colors.textLight, overflow: "auto", maxHeight: "55vh", fontFamily: "'Fira Code', 'Consolas', monospace", lineHeight: 1.7 }}>
          {JSON.stringify(jsonContent, null, 2)}
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: colors.bgDark, borderTop: `1px solid ${colors.borderCard}`, px: 2.5, py: 1.2, gap: 1 }}>
        <Typography variant="caption" sx={{ color: colors.textSecondary, flexGrow: 1 }}>
          JSON · {result.size ?? "N/A"} · Langue : {formatLanguage(result.language)}
        </Typography>
        <Button size="small" onClick={onClose} variant="contained" sx={{ bgcolor: colors.bgHover, color: colors.textLight, textTransform: "none", "&:hover": { bgcolor: colors.borderExport } }}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
 
// ── Modal document original ──────────────────────────────────────────────────
const typeDocLabel: Record<string, string> = {
  invoices: "Factures", cv: "CV", contrat: "Contrat", others: "Autres",
};
 
const DocumentPreviewModal: React.FC<{ result: ProcessingResult | null; onClose: () => void }> = ({ result, onClose }) => {
  const [zoom, setZoom] = useState(100);
  if (!result) return null;
 
  return (
    <Dialog open={!!result} onClose={onClose} maxWidth="lg" fullWidth
      PaperProps={{ sx: { bgcolor: colors.bgCard, border: `1px solid ${colors.borderCard}`, borderRadius: 2, boxShadow: "0 8px 48px rgba(0,0,0,0.7)", height: "90vh", display: "flex", flexDirection: "column" } }}>
      <DialogTitle sx={{ bgcolor: colors.bgDark, color: colors.textLight, borderBottom: `1px solid ${colors.borderCard}`, display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5, px: 2.5, flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: `${TYPE_COLORS.cv.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DescriptionIcon sx={{ fontSize: 18, color: TYPE_COLORS.cv.color }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: colors.textLight, lineHeight: 1.2 }}>{result.source_document}</Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>Document source original</Typography>
          </Box>
          <Chip label={typeDocLabel[normalizeDocType(result.doc_type)] ?? normalizeDocType(result.doc_type)} size="small" sx={{ ...typeChipSx(normalizeDocType(result.doc_type)), fontSize: 11, fontWeight: 700, ml: 1 }} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small" onClick={() => setZoom(z => Math.max(60, z - 10))} sx={{ color: colors.textSecondary, "&:hover": { color: colors.textLight } }}><ZoomOutIcon fontSize="small" /></IconButton>
          <Typography variant="caption" sx={{ color: colors.textSecondary, minWidth: 42, textAlign: "center" }}>{zoom}%</Typography>
          <IconButton size="small" onClick={() => setZoom(z => Math.min(150, z + 10))} sx={{ color: colors.textSecondary, "&:hover": { color: colors.textLight } }}><ZoomInIcon fontSize="small" /></IconButton>
          <Divider orientation="vertical" flexItem sx={{ borderColor: colors.borderCard, mx: 0.5 }} />
          <IconButton onClick={onClose} size="small" sx={{ color: colors.textSecondary }}><CloseIcon fontSize="small" /></IconButton>
        </Box>
      </DialogTitle>
      <Box sx={{ bgcolor: colors.bgDark, borderBottom: `1px solid ${colors.borderCard}`, px: 2.5, py: 1, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", flexShrink: 0 }}>
        <Chip label={`Confiance : ${formatConfidence(result.confidence)}`} size="small" icon={<CheckCircleIcon sx={{ fontSize: 13, color: `${confidenceColor(result.confidence)} !important` }} />} sx={{ bgcolor: `${confidenceColor(result.confidence)}22`, color: confidenceColor(result.confidence), fontSize: 11, fontWeight: 700 }} />
        <Chip label={`${result.fields_extracted} champs extraits`} size="small" sx={{ bgcolor: `${TYPE_COLORS.cv.color}15`, color: TYPE_COLORS.cv.color, fontSize: 11 }} />
        <Chip label={`Traitement : ${formatDuration(result.processing_time_ms)}`} size="small" icon={<AccessTimeIcon sx={{ fontSize: 13 }} />} sx={{ bgcolor: `${TYPE_COLORS.invoices.color}15`, color: TYPE_COLORS.invoices.color, fontSize: 11 }} />
        <Chip label={result.size ?? "N/A"} size="small" sx={{ bgcolor: `${colors.textWhite}10`, color: colors.textSecondary, fontSize: 11 }} />
        <Typography variant="caption" sx={{ color: colors.textSecondary, ml: "auto", fontSize: "0.74rem" }}>Traité le {formatDate(result.processed_at)}</Typography>
      </Box>
      <DialogContent sx={{ bgcolor: colors.bgPage, p: 3, overflowY: "auto", flex: 1 }}>
        <Box sx={{ transformOrigin: "top center", transform: `scale(${zoom / 100})`, transition: "transform 0.2s ease" }}>
          <DocumentOriginalContent result={result} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: colors.bgDark, borderTop: `1px solid ${colors.borderCard}`, px: 2.5, py: 1.2, flexShrink: 0 }}>
        <Typography variant="caption" sx={{ color: colors.textSecondary, flexGrow: 1 }}>
          PDF · {result.size ?? "N/A"} · Langue : {formatLanguage(result.language)} · {result.source_document}
        </Typography>
        <Button size="small" onClick={onClose} variant="contained" sx={{ bgcolor: colors.bgHover, color: colors.textLight, textTransform: "none", "&:hover": { bgcolor: colors.borderExport } }}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
 
// ── Composant principal ──────────────────────────────────────────────────────
const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
 
  const [previewResult, setPreview]       = useState<ProcessingResult | null>(null);
  const [docPreviewResult, setDocPreview] = useState<ProcessingResult | null>(null);
  const [search, setSearch]               = useState("");
  const [typeFilter, setTypeFilter]       = useState("all");
  const [page, setPage]                   = useState(0);
  const [rowsPerPage, setRowsPerPage]     = useState(5);

  const {
    data: results = [],
    isLoading: loading,
  } = useGetProcessingHistoryQuery();
 
  const filteredResults = (results || []).filter((r) => {
    const matchSearch =
      search === "" ||
      (r.source_document?.toLowerCase?.() || "").includes(search.toLowerCase()) ||
      (r.json_filename?.toLowerCase?.() || "").includes(search.toLowerCase());
    const matchType = typeFilter === "all" || (r.doc_type ?? "others") === typeFilter;
    return matchSearch && matchType;
  });
 
  const paginatedResults = (filteredResults || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
 
  const handleSearchChange      = (value: string) => { setSearch(value); setPage(0); };
  const handleTypeFilterChange  = (value: string) => { setTypeFilter(value); setPage(0); };
  const handleChangePage        = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };
 
  const handleVerify = (result: ProcessingResult) => {
    navigate(ROUTES.VERIFICATION, {
      state: { fromHistory: true, documentId: result.document_id, jobId: result.job_id, sourceDocument: result.source_document, docType: result.doc_type },
    });
  };
 
  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  }
 
  return (
    <Box p={3}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" color={colors.textLight}>Documents</Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
          Fichiers JSON structurés générés après extraction OCR + analyse LLaMA
        </Typography>
      </Box>
 
      {/* Filtres */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 2.5, flexWrap: "wrap" }}>
        <TextField
          size="small" placeholder="Rechercher un fichier..."
          value={search} onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.textSecondary }} /></InputAdornment>,
            sx: {
              bgcolor: colors.bgDark, color: colors.textLight,
              border: `1px solid ${colors.borderCard}`, borderRadius: 1,
              "& input": { color: colors.textLight },
            },
          }}
          sx={{ width: 280 }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", fontSize: "0.72rem", whiteSpace: "nowrap" }}>
            Type de document
          </Typography>
          <ToggleButtonGroup
            value={typeFilter} exclusive
            onChange={(_, val) => { if (val !== null) handleTypeFilterChange(val); }}
            size="small"
            sx={{
              bgcolor: colors.bgDark, border: `1px solid ${colors.borderCard}`, borderRadius: 1.5,
              "& .MuiToggleButton-root": { border: "none", borderRadius: "6px !important", color: colors.textSecondary, textTransform: "none", fontSize: "0.8rem", fontWeight: 500, px: 1.5, py: 0.6, gap: 0.6, transition: "all 0.2s", "&:hover": { bgcolor: `${colors.textWhite}10`, color: colors.textLight } },
            }}
          >
            {typeConfig.map((t) => (
              <ToggleButton key={t.value} value={t.value} sx={{ "&.Mui-selected": { bgcolor: `${t.bgcolor} !important`, color: `${t.color} !important`, fontWeight: "700 !important" } }}>
                {t.icon}{t.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>
 
      {/* Tableau */}
      <TableContainer component={Paper} sx={{ bgcolor: colors.bgCard, boxShadow: "none", border: `1px solid ${colors.borderCard}`, borderRadius: 2, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: colors.bgDark, "& th": { borderBottom: `2px solid ${colors.borderCard}`, color: colors.textSecondary, fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.05em", textTransform: "uppercase", py: 1.8 } }}>
              <TableCell>Fichier JSON généré</TableCell>
              <TableCell>Document source</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="center">Confiance</TableCell>
              <TableCell>Durée</TableCell>
              <TableCell>Traité le</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: colors.textSecondary }}>Aucun résultat trouvé.</TableCell>
              </TableRow>
            ) : (
              paginatedResults.map((result, index) => (
                <TableRow
                  key={result.id}
                  onClick={() => handleVerify(result)}
                  sx={{
                    bgcolor: index % 2 === 0 ? colors.bgCard : colors.bgDark,
                    "&:hover": { bgcolor: colors.bgHover, cursor: "pointer" },
                    "& td": { borderBottom: `1px solid ${colors.borderCard}`, color: colors.textLight, py: 1.6 },
                    "&:last-child td": { borderBottom: "none" },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <DataObjectIcon sx={{ fontSize: 15, color: TYPE_COLORS.invoices.color }} />
                      <Typography variant="body2" sx={{ color: TYPE_COLORS.invoices.color, fontFamily: "monospace", fontSize: "0.82rem" }}>
                        {result.json_filename || "N/A"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: colors.textSecondary, fontSize: "0.82rem" }}>{result.source_document || "N/A"}</TableCell>
                  <TableCell>
                    <Chip label={result.doc_type || "unknown"} size="small" sx={{ fontSize: 11, fontWeight: 600, textTransform: "capitalize", ...typeChipSx(result.doc_type || "") }} />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="bold" sx={{ color: confidenceColor(result.confidence) }}>
                      {formatConfidence(result.confidence)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: colors.textSecondary, fontSize: "0.82rem" }}>{result.processing_time_ms ? formatDuration(result.processing_time_ms) : "N/A"}</TableCell>
                  <TableCell sx={{ color: colors.textSecondary, fontSize: "0.82rem" }}>{result.processed_at ? formatDate(result.processed_at) : "N/A"}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.8 }}>
                      <Tooltip title="Vérifier et corriger ce document" placement="top">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleVerify(result); }}
                          sx={{ color: "#a78bfa", border: "1px solid #3b2a6b", borderRadius: 1, p: "5px", "&:hover": { bgcolor: "#a78bfa15", borderColor: "#a78bfa" } }}>
                          <FactCheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Voir le document original" placement="top">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDocPreview(result); }}
                          sx={{ color: TYPE_COLORS.cv.color, border: `1px solid ${TYPE_COLORS.cv.color}44`, borderRadius: 1, p: "5px", "&:hover": { bgcolor: `${TYPE_COLORS.cv.color}15`, borderColor: TYPE_COLORS.cv.color } }}>
                          <DescriptionIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Voir le JSON extrait" placement="top">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setPreview(result); }}
                          sx={{ color: TYPE_COLORS.invoices.color, border: `1px solid ${TYPE_COLORS.invoices.color}44`, borderRadius: 1, p: "5px", "&:hover": { bgcolor: `${TYPE_COLORS.invoices.color}15`, borderColor: TYPE_COLORS.invoices.color } }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
 
      {/* Pagination */}
      <Box sx={{ bgcolor: colors.bgDark, border: `1px solid ${colors.borderCard}`, borderTop: "none", borderBottomLeftRadius: 8, borderBottomRightRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", px: 2 }}>
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: "0.78rem" }}>
          {filteredResults.length} résultat{filteredResults.length > 1 ? "s" : ""} sur {results.length} total
        </Typography>
        <TablePagination
          component="div" count={filteredResults.length} page={page}
          onPageChange={handleChangePage} rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Lignes par page :"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count !== -1 ? count : `plus de ${count}`}`}
          sx={{
            color: colors.textSecondary, fontSize: "0.78rem",
            "& .MuiTablePagination-select": { color: colors.textLight, bgcolor: colors.bgCard, borderRadius: 1 },
            "& .MuiTablePagination-selectIcon": { color: colors.textSecondary },
            "& .MuiIconButton-root": { color: colors.textSecondary, "&:hover": { bgcolor: `${colors.textWhite}10`, color: colors.textLight }, "&.Mui-disabled": { color: colors.bgHover } },
            "& .MuiTablePagination-displayedRows": { color: colors.textSecondary },
            "& .MuiTablePagination-selectLabel":   { color: colors.textSecondary },
          }}
        />
      </Box>
 
      <JsonPreviewModal     result={previewResult}    onClose={() => setPreview(null)}    />
      <DocumentPreviewModal result={docPreviewResult} onClose={() => setDocPreview(null)} />
    </Box>
  );
};
 
export default HistoryPage;
