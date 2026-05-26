import React, { useState, useEffect } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Tooltip,
  CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, InputAdornment,
  ToggleButton, ToggleButtonGroup, TablePagination, Divider,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  DataObject as DataObjectIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
  AccessTime as AccessTimeIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Gavel as GavelIcon,
  Folder as FolderIcon,
  CalendarToday as CalendarTodayIcon,
  Add as AddIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Download as DownloadIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";
import { colors, tableHeadCellSx } from "@theme";
 
import fakeResults from "../../assets/fakeData/history-results.json";
 
interface ProcessingResult {
  id: string;
  source_document: string;
  json_filename: string;
  doc_type: string;
  processed_at: string;
  processing_time_ms: number;
  confidence: number;
  fields_extracted: number;
  language: string;
  size: string;
  status: "uploaded" | "processing" | "failed";
}
 
// ─── Tokens locaux dérivés des couleurs du theme ──────────────────────────────
// Seules les valeurs qui n'existent pas dans colors.* sont définies ici.
const LOCAL = {
  bgTable:      "#1e2130",
  bgHeader:     "#252a3d",
  bgRowOdd:     "#1e2130",
  bgRowEven:    "#222638",
  bgRowHover:   "#2a3050",
  borderColor:  "#2e3450",
  textHeader:   "#9aa3c2",
  bgModal:      "#1e2130",
  bgModalHeader:"#252a3d",
  btnClose:     "#3a4470",
  btnCloseHover:"#4a5490",
} as const;
 
const DEFAULT_TYPES = [
  { value: "all",      label: "Tous",     icon: <FolderIcon      sx={{ fontSize: 15 }} />, color: colors.textLight,     bgcolor: "#ffffff15"                },
  { value: "invoices", label: "Factures", icon: <ReceiptIcon     sx={{ fontSize: 15 }} />, color: "#5c7cfa",            bgcolor: "#5c7cfa22"                },
  { value: "cv",       label: "CV",       icon: <PersonIcon      sx={{ fontSize: 15 }} />, color: colors.green,         bgcolor: `${colors.green}22`        },
  { value: "contrat",  label: "Contrats", icon: <GavelIcon       sx={{ fontSize: 15 }} />, color: colors.amber,         bgcolor: `${colors.amber}22`        },
  { value: "others",   label: "Autres",   icon: <DescriptionIcon sx={{ fontSize: 15 }} />, color: colors.textSecondary, bgcolor: `${colors.textSecondary}22`},
];
 
const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
 
const formatDuration = (ms: number): string => {
  if (ms < 1000)  return `${ms} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
  return `${(ms / 60000).toFixed(1)} min`;
};
 
const confidenceColor = (score: number): string => {
  if (score >= 0.95) return colors.green;
  if (score >= 0.85) return colors.amber;
  return colors.red;
};
 
const typeChipSx = (type: string) => {
  if (type === "invoices") return { bgcolor: "#5c7cfa22",              color: "#5c7cfa"        };
  if (type === "cv")       return { bgcolor: `${colors.green}22`,      color: colors.green     };
  if (type === "contrat")  return { bgcolor: `${colors.amber}22`,      color: colors.amber     };
  return { bgcolor: colors.bgHover, color: colors.textMuted };
};
 
const buildFakeJsonPreview = (result: ProcessingResult): object => ({
  document_id: result.id,
  source_file: result.source_document,
  doc_type: result.doc_type,
  language: result.language,
  confidence_score: result.confidence,
  status: result.status,
  processed_at: result.processed_at,
  extracted_fields: {
    ...(result.doc_type === "invoices" && {
      invoice_number: "FAC-2024-0312",
      date: "15/03/2024",
      vendor: "Société Example SARL",
      total_amount: "1 250,00 DT",
      tax_rate: "19%",
      payment_due: "15/04/2024",
    }),
    ...(result.doc_type === "cv" && {
      full_name: "Ahmed Benali",
      email: "ahmed.benali@email.com",
      phone: "+216 98 765 432",
      education: "Ingénieur Informatique — ESPRIT 2020",
      experience_years: 4,
      skills: ["Python", "React", "Spring Boot"],
    }),
    ...(result.doc_type === "contrat" && {
      contract_type: "Prestation de services",
      parties: ["Client Corp.", "Prestataire SARL"],
      start_date: "01/04/2024",
      end_date: "31/12/2024",
      amount: "48 000,00 DT",
    }),
    ...(result.doc_type === "others" && {
      title: "Rapport Annuel 2023",
      pages: 24,
      sections: ["Résumé Exécutif", "Analyse Financière", "Perspectives"],
    }),
  },
  processing_metadata: {
    ocr_engine: "PaddleOCR",
    nlp_model: "LLaMA via Ollama",
    ner_library: "spaCy",
    processing_time_ms: result.processing_time_ms,
    fields_count: result.fields_extracted,
  },
});
 
// ─── Simulateur de contenu de document ────────────────────────────────────────
const buildFakeDocumentContent = (result: ProcessingResult): React.ReactNode => {
  if (result.doc_type === "invoices") {
    return (
      <Box sx={{ fontFamily: "'Georgia', serif", color: "#1a1a2e", p: 4, bgcolor: "#fff", minHeight: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", letterSpacing: -0.5 }}>
              SOCIÉTÉ EXAMPLE SARL
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#555", mt: 0.5 }}>12 Rue de la République, Tunis 1001</Typography>
            <Typography sx={{ fontSize: 11, color: "#555" }}>Tél : +216 71 000 000 · contact@example.tn</Typography>
            <Typography sx={{ fontSize: 11, color: "#555" }}>MF : 1234567/A/M/000</Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: 28, fontWeight: 900, color: "#5c7cfa", letterSpacing: -1 }}>FACTURE</Typography>
            <Typography sx={{ fontSize: 13, color: "#555", mt: 0.5 }}>N° FAC-2024-0312</Typography>
            <Typography sx={{ fontSize: 11, color: "#888" }}>Date : 15/03/2024</Typography>
            <Typography sx={{ fontSize: 11, color: "#e03131", fontWeight: 700 }}>Échéance : 15/04/2024</Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: "#e0e0e0", mb: 3 }} />
        <Box sx={{ bgcolor: "#f8f9fa", borderRadius: 1.5, p: 2, mb: 3, border: "1px solid #e9ecef" }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, mb: 1 }}>Facturé à</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>CLIENT CORPORATION SA</Typography>
          <Typography sx={{ fontSize: 11, color: "#555" }}>45 Avenue Habib Bourguiba, Sfax 3000</Typography>
          <Typography sx={{ fontSize: 11, color: "#555" }}>MF : 9876543/B/P/000</Typography>
        </Box>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", mb: 3 }}>
          <Box component="thead">
            <Box component="tr" sx={{ bgcolor: "#1a1a2e" }}>
              {["Description", "Qté", "P.U. HT", "TVA", "Total HT"].map((h) => (
                <Box component="th" key={h} sx={{ p: "8px 12px", fontSize: 11, fontWeight: 700, color: "#fff", textAlign: h === "Description" ? "left" : "right" }}>{h}</Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {[
              { desc: "Développement application web",      qty: 1, pu: "800,00",  tva: "19%", total: "800,00"  },
              { desc: "Intégration API REST",               qty: 2, pu: "150,00",  tva: "19%", total: "300,00"  },
              { desc: "Formation utilisateurs (½ jour)",    qty: 1, pu: "100,00",  tva: "19%", total: "100,00"  },
            ].map((row, i) => (
              <Box component="tr" key={i} sx={{ bgcolor: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                <Box component="td" sx={{ p: "8px 12px", fontSize: 11, borderBottom: "1px solid #e9ecef" }}>{row.desc}</Box>
                <Box component="td" sx={{ p: "8px 12px", fontSize: 11, textAlign: "right", borderBottom: "1px solid #e9ecef" }}>{row.qty}</Box>
                <Box component="td" sx={{ p: "8px 12px", fontSize: 11, textAlign: "right", borderBottom: "1px solid #e9ecef" }}>{row.pu} DT</Box>
                <Box component="td" sx={{ p: "8px 12px", fontSize: 11, textAlign: "right", borderBottom: "1px solid #e9ecef" }}>{row.tva}</Box>
                <Box component="td" sx={{ p: "8px 12px", fontSize: 11, fontWeight: 600, textAlign: "right", borderBottom: "1px solid #e9ecef" }}>{row.total} DT</Box>
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ width: 260 }}>
            {[
              { label: "Sous-total HT", value: "1 050,00 DT" },
              { label: "TVA (19%)",     value: "199,50 DT"   },
              { label: "Timbre fiscal", value: "0,50 DT"     },
            ].map((row) => (
              <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between", py: 0.6 }}>
                <Typography sx={{ fontSize: 11, color: "#555" }}>{row.label}</Typography>
                <Typography sx={{ fontSize: 11, color: "#1a1a2e" }}>{row.value}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", bgcolor: "#1a1a2e", p: "8px 12px", borderRadius: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>TOTAL TTC</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#5c7cfa" }}>1 250,00 DT</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ mt: 4, pt: 2, borderTop: "1px solid #e0e0e0" }}>
          <Typography sx={{ fontSize: 10, color: "#aaa", textAlign: "center" }}>
            Paiement par virement bancaire · RIB : 20-018-0123456789-19 · Banque Zitouna
          </Typography>
        </Box>
      </Box>
    );
  }
 
  if (result.doc_type === "cv") {
    return (
      <Box sx={{ fontFamily: "'Arial', sans-serif", color: "#1a1a2e", minHeight: "100%", display: "flex" }}>
        <Box sx={{ width: 200, bgcolor: "#1a1a2e", p: 3, flexShrink: 0 }}>
          <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: colors.green, display: "flex", alignItems: "center", justifyContent: "center", mb: 2, mx: "auto" }}>
            <Typography sx={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>AB</Typography>
          </Box>
          <Typography sx={{ fontSize: 9, fontWeight: 700, color: colors.green, textTransform: "uppercase", letterSpacing: 1, mb: 1.5, textAlign: "center" }}>Contact</Typography>
          {[
            { label: "Email",    value: "ahmed.benali@email.com"  },
            { label: "Tél",     value: "+216 98 765 432"          },
            { label: "Ville",   value: "Tunis, Tunisie"           },
            { label: "LinkedIn",value: "linkedin.com/in/abenali"  },
          ].map((item) => (
            <Box key={item.label} sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 9, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</Typography>
              <Typography sx={{ fontSize: 10, color: colors.textLight, wordBreak: "break-all" }}>{item.value}</Typography>
            </Box>
          ))}
          <Divider sx={{ borderColor: colors.borderCard, my: 2 }} />
          <Typography sx={{ fontSize: 9, fontWeight: 700, color: colors.green, textTransform: "uppercase", letterSpacing: 1, mb: 1.5 }}>Compétences</Typography>
          {["Python", "React", "Spring Boot", "Docker", "PostgreSQL", "Git"].map((skill) => (
            <Box key={skill} sx={{ bgcolor: LOCAL.bgHeader, borderRadius: 0.8, px: 1, py: 0.4, mb: 0.8 }}>
              <Typography sx={{ fontSize: 10, color: colors.textLight }}>{skill}</Typography>
            </Box>
          ))}
          <Divider sx={{ borderColor: colors.borderCard, my: 2 }} />
          <Typography sx={{ fontSize: 9, fontWeight: 700, color: colors.green, textTransform: "uppercase", letterSpacing: 1, mb: 1.5 }}>Langues</Typography>
          {[{ l: "Arabe", n: "Natif" }, { l: "Français", n: "Courant" }, { l: "Anglais", n: "Professionnel" }].map((lang) => (
            <Box key={lang.l} sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: 10, color: colors.textLight }}>{lang.l}</Typography>
              <Typography sx={{ fontSize: 9, color: colors.textSecondary }}>{lang.n}</Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ flex: 1, p: 3, bgcolor: "#fff" }}>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", letterSpacing: -0.5 }}>Ahmed Benali</Typography>
          <Typography sx={{ fontSize: 13, color: colors.green, fontWeight: 600, mb: 2 }}>Ingénieur Full-Stack · 4 ans d'expérience</Typography>
          <Typography sx={{ fontSize: 11, color: "#555", lineHeight: 1.7, mb: 3, borderLeft: `3px solid ${colors.green}`, pl: 2 }}>
            Ingénieur logiciel passionné, spécialisé dans le développement d'applications web modernes et scalables.
          </Typography>
          <Typography sx={{ fontSize: 10, fontWeight: 800, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: 1.5, mb: 1.5 }}>Expérience Professionnelle</Typography>
          {[
            { title: "Ingénieur Full-Stack",  company: "TechStart Tunisia",    period: "Jan 2022 – Présent",   tasks: ["Développement d'une plateforme SaaS en React/Spring Boot", "Mise en place de CI/CD avec GitHub Actions et Docker", "Optimisation des performances : réduction de 40% du temps de chargement"] },
            { title: "Développeur Backend",   company: "Digital Solutions SA", period: "Juil 2020 – Déc 2021", tasks: ["APIs REST avec FastAPI (Python)", "Modélisation et optimisation de bases PostgreSQL", "Intégration de services tiers (Stripe, Twilio)"] },
          ].map((exp) => (
            <Box key={exp.title} sx={{ mb: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>{exp.title}</Typography>
                  <Typography sx={{ fontSize: 11, color: colors.green }}>{exp.company}</Typography>
                </Box>
                <Typography sx={{ fontSize: 10, color: "#888", bgcolor: "#f8f9fa", px: 1, py: 0.3, borderRadius: 1, whiteSpace: "nowrap" }}>{exp.period}</Typography>
              </Box>
              <Box component="ul" sx={{ m: 0, mt: 0.8, pl: 2.5 }}>
                {exp.tasks.map((t) => (
                  <Box component="li" key={t} sx={{ fontSize: 10, color: "#555", mb: 0.4, lineHeight: 1.6 }}>{t}</Box>
                ))}
              </Box>
            </Box>
          ))}
          <Typography sx={{ fontSize: 10, fontWeight: 800, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: 1.5, mb: 1.5, mt: 1 }}>Formation</Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>Diplôme d'Ingénieur — Informatique</Typography>
              <Typography sx={{ fontSize: 11, color: "#555" }}>ESPRIT — École Supérieure Privée d'Ingénierie</Typography>
            </Box>
            <Typography sx={{ fontSize: 10, color: "#888" }}>2020</Typography>
          </Box>
        </Box>
      </Box>
    );
  }
 
  if (result.doc_type === "contrat") {
    return (
      <Box sx={{ fontFamily: "'Times New Roman', serif", color: "#1a1a2e", p: 4, bgcolor: "#fff", minHeight: "100%" }}>
        <Typography sx={{ fontSize: 16, fontWeight: 800, textAlign: "center", textTransform: "uppercase", letterSpacing: 2, mb: 0.5 }}>Contrat de Prestation de Services</Typography>
        <Typography sx={{ fontSize: 11, textAlign: "center", color: "#555", mb: 3 }}>Réf. CONT-2024-047</Typography>
        <Divider sx={{ borderColor: "#1a1a2e", borderWidth: 2, mb: 1 }} />
        <Divider sx={{ borderColor: "#1a1a2e", mb: 3 }} />
        <Typography sx={{ fontSize: 12, fontWeight: 700, textDecoration: "underline", mb: 1.5 }}>ENTRE LES SOUSSIGNÉS :</Typography>
        <Box sx={{ bgcolor: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: 1, p: 2, mb: 2 }}>
          <Typography sx={{ fontSize: 11, mb: 0.5 }}>
            <strong>CLIENT CORPORATION SA</strong>, société anonyme au capital de 500 000 DT, représentée par M. Karim Mansour, ci-après <em>« le Client »</em>
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 11, textAlign: "center", color: "#888", mb: 2 }}>— ET —</Typography>
        <Box sx={{ bgcolor: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: 1, p: 2, mb: 3 }}>
          <Typography sx={{ fontSize: 11 }}>
            <strong>PRESTATAIRE SARL</strong>, représentée par Mme Sonia Trabelsi, ci-après <em>« le Prestataire »</em>
          </Typography>
        </Box>
        {[
          { title: "Article 1 – Objet",         content: "Le présent contrat a pour objet de définir les conditions dans lesquelles le Prestataire s'engage à fournir des services de développement logiciel et de conseil en transformation digitale." },
          { title: "Article 2 – Durée",         content: "Le présent contrat prend effet à compter du 01/04/2024 pour une durée de neuf (9) mois, soit jusqu'au 31/12/2024." },
          { title: "Article 3 – Rémunération",  content: "En contrepartie des prestations, le Client versera la somme de 48 000,00 DT hors taxes, payable mensuellement par tranches de 5 333,33 DT." },
          { title: "Article 4 – Confidentialité", content: "Les parties s'engagent à garder confidentiels tous les documents et informations échangés, pendant cinq (5) ans après expiration du contrat." },
        ].map((article) => (
          <Box key={article.title} sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.8, color: "#1a1a2e" }}>{article.title}</Typography>
            <Typography sx={{ fontSize: 11, color: "#333", lineHeight: 1.8, textAlign: "justify" }}>{article.content}</Typography>
          </Box>
        ))}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-around" }}>
          {["Le Client", "Le Prestataire"].map((party) => (
            <Box key={party} sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, mb: 4 }}>{party}</Typography>
              <Box sx={{ width: 120, borderBottom: "1px solid #1a1a2e", mb: 0.5 }} />
              <Typography sx={{ fontSize: 10, color: "#888" }}>Signature et cachet</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
 
  // Others / default
  return (
    <Box sx={{ fontFamily: "'Arial', sans-serif", color: "#1a1a2e", p: 4, bgcolor: "#fff", minHeight: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, pb: 2, borderBottom: "2px solid #1a1a2e" }}>
        <Box sx={{ width: 48, height: 48, bgcolor: "#1a1a2e", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArticleIcon sx={{ color: "#fff", fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>Rapport Annuel 2023</Typography>
          <Typography sx={{ fontSize: 11, color: "#888" }}>Document interne · 24 pages · Confidentiel</Typography>
        </Box>
      </Box>
      <Box sx={{ bgcolor: "#f8f9fa", border: "1px solid #e9ecef", borderRadius: 1, p: 2, mb: 3 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#1a1a2e", mb: 0.5 }}>Résumé Exécutif</Typography>
        <Typography sx={{ fontSize: 11, color: "#555", lineHeight: 1.8, textAlign: "justify" }}>
          L'exercice 2023 a été marqué par une croissance soutenue, avec un chiffre d'affaires en hausse de 18%.
        </Typography>
      </Box>
      {["1. Analyse Financière", "2. Performance Opérationnelle", "3. Perspectives 2024"].map((section, i) => (
        <Box key={section} sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", mb: 1 }}>{section}</Typography>
          <Box sx={{ height: 8, bgcolor: "#f0f0f0", borderRadius: 1, mb: 1 }} />
          <Box sx={{ height: 8, bgcolor: "#f0f0f0", borderRadius: 1, mb: 1, width: "85%" }} />
          <Box sx={{ height: 8, bgcolor: "#f0f0f0", borderRadius: 1, width: i === 1 ? "78%" : "88%" }} />
        </Box>
      ))}
    </Box>
  );
};
 
// ─── Modal visualisation document original ────────────────────────────────────
interface DocumentViewerModalProps {
  result: ProcessingResult | null;
  onClose: () => void;
}
 
const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ result, onClose }) => {
  const [zoom, setZoom] = useState(1);
  if (!result) return null;
 
  return (
    <Dialog
      open={!!result} onClose={onClose} maxWidth="lg" fullWidth
      PaperProps={{
        sx: {
          backgroundColor: LOCAL.bgModal,
          border: `1px solid ${LOCAL.borderColor}`,
          borderRadius: 2,
          boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
          height: "90vh", maxHeight: "90vh",
          display: "flex", flexDirection: "column",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: LOCAL.bgModalHeader,
          color: colors.textLight,
          borderBottom: `1px solid ${LOCAL.borderColor}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          py: 1.5, px: 2.5, flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ArticleIcon sx={{ color: colors.green, fontSize: 20 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.2 }}>{result.source_document}</Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>Document source original</Typography>
          </Box>
          <Chip label={result.doc_type} size="small" sx={{ fontSize: 11, fontWeight: 600, ml: 1, ...typeChipSx(result.doc_type) }} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: LOCAL.bgTable, border: `1px solid ${LOCAL.borderColor}`, borderRadius: 1, px: 1, py: 0.3 }}>
            <IconButton size="small" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} sx={{ color: colors.textSecondary, p: 0.3, "&:hover": { color: colors.textLight } }}>
              <ZoomOutIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography variant="caption" sx={{ color: colors.textSecondary, minWidth: 36, textAlign: "center" }}>
              {Math.round(zoom * 100)}%
            </Typography>
            <IconButton size="small" onClick={() => setZoom((z) => Math.min(2, z + 0.1))} sx={{ color: colors.textSecondary, p: 0.3, "&:hover": { color: colors.textLight } }}>
              <ZoomInIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: colors.textSecondary, ml: 0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
 
      {/* Info bar */}
      <Box sx={{ px: 2.5, py: 1, bgcolor: colors.bgPage, borderBottom: `1px solid ${LOCAL.borderColor}`, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", flexShrink: 0 }}>
        <Chip label={`Confiance : ${(result.confidence * 100).toFixed(0)}%`} size="small" icon={<CheckCircleIcon sx={{ fontSize: "13px !important" }} />} sx={{ bgcolor: confidenceColor(result.confidence) + "22", color: confidenceColor(result.confidence), fontSize: 10, height: 22 }} />
        <Chip label={`${result.fields_extracted} champs extraits`}           size="small" sx={{ bgcolor: `${colors.green}22`, color: colors.green, fontSize: 10, height: 22 }} />
        <Chip label={`Traitement : ${formatDuration(result.processing_time_ms)}`} size="small" icon={<AccessTimeIcon sx={{ fontSize: "13px !important" }} />} sx={{ bgcolor: `${colors.textSecondary}22`, color: colors.textSecondary, fontSize: 10, height: 22 }} />
        <Chip label={result.size} size="small" sx={{ bgcolor: "#ffffff10", color: colors.textSecondary, fontSize: 10, height: 22 }} />
        <Typography variant="caption" sx={{ color: colors.textSecondary, ml: "auto" }}>Traité le {formatDate(result.processed_at)}</Typography>
      </Box>
 
      <DialogContent sx={{ backgroundColor: LOCAL.bgRowHover, p: 3, overflowY: "auto", flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <Box sx={{
          width: 794, minHeight: 1123,
          backgroundColor: "#fff",
          boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
          borderRadius: 0.5, overflow: "hidden",
          transform: `scale(${zoom})`, transformOrigin: "top center",
          transition: "transform 0.2s ease",
          mb: zoom < 1 ? `${-(1123 * (1 - zoom))}px` : 0,
        }}>
          {buildFakeDocumentContent(result)}
        </Box>
      </DialogContent>
 
      <DialogActions sx={{ backgroundColor: LOCAL.bgModalHeader, borderTop: `1px solid ${LOCAL.borderColor}`, px: 2.5, py: 1.2, gap: 1, flexShrink: 0 }}>
        <Typography variant="caption" sx={{ color: colors.textSecondary, flexGrow: 1 }}>
          PDF · {result.size} · Langue : {result.language.toUpperCase()} · {result.source_document}
        </Typography>
        <Button size="small" onClick={onClose} variant="contained" sx={{ backgroundColor: LOCAL.btnClose, color: colors.textLight, textTransform: "none", "&:hover": { backgroundColor: LOCAL.btnCloseHover } }}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
 
// ─── Modal aperçu JSON ────────────────────────────────────────────────────────
interface JsonPreviewModalProps {
  result: ProcessingResult | null;
  onClose: () => void;
}
 
const JsonPreviewModal: React.FC<JsonPreviewModalProps> = ({ result, onClose }) => {
  if (!result) return null;
  const jsonContent = buildFakeJsonPreview(result);
 
  return (
    <Dialog
      open={!!result} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{
        sx: {
          backgroundColor: LOCAL.bgModal,
          border: `1px solid ${LOCAL.borderColor}`,
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: LOCAL.bgModalHeader, color: colors.textLight,
          borderBottom: `1px solid ${LOCAL.borderColor}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          py: 1.5, px: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DataObjectIcon sx={{ color: "#5c7cfa", fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={600}>{result.json_filename}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: colors.textSecondary }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
 
      <DialogContent sx={{ backgroundColor: LOCAL.bgModal, p: 0 }}>
        <Box sx={{ px: 2.5, pt: 2, pb: 1, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Chip label={`Source : ${result.source_document}`}                        size="small" icon={<DescriptionIcon />}                                     sx={{ bgcolor: "#5c7cfa22", color: "#5c7cfa", fontSize: 11 }} />
          <Chip label={`Confiance : ${(result.confidence * 100).toFixed(0)}%`}      size="small" icon={<CheckCircleIcon />}                                     sx={{ bgcolor: confidenceColor(result.confidence) + "22", color: confidenceColor(result.confidence), fontSize: 11 }} />
          <Chip label={`Traitement : ${formatDuration(result.processing_time_ms)}`} size="small" icon={<AccessTimeIcon />}                                      sx={{ bgcolor: `${colors.textSecondary}22`, color: colors.textSecondary, fontSize: 11 }} />
          <Chip label={`${result.fields_extracted} champs extraits`}                size="small"                                                                sx={{ bgcolor: `${colors.green}22`, color: colors.green, fontSize: 11 }} />
          <Chip label={`Traité le : ${formatDate(result.processed_at)}`}            size="small" icon={<CalendarTodayIcon sx={{ fontSize: 13 }} />}             sx={{ bgcolor: `${colors.amber}22`, color: colors.amber, fontSize: 11, "& .MuiChip-icon": { color: colors.amber } }} />
        </Box>
        <Box component="pre" sx={{ m: 2.5, mt: 1, p: 2, bgcolor: colors.bgPage, borderRadius: 1.5, border: `1px solid ${LOCAL.borderColor}`, fontSize: "0.78rem", color: colors.textLight, overflow: "auto", maxHeight: "55vh", fontFamily: "'Fira Code', 'Consolas', monospace", lineHeight: 1.7 }}>
          {JSON.stringify(jsonContent, null, 2)}
        </Box>
      </DialogContent>
 
      <DialogActions sx={{ backgroundColor: LOCAL.bgModalHeader, borderTop: `1px solid ${LOCAL.borderColor}`, px: 2.5, py: 1.2, gap: 1 }}>
        <Typography variant="caption" sx={{ color: colors.textSecondary, flexGrow: 1 }}>
          JSON · {result.size} · Langue : {result.language.toUpperCase()}
        </Typography>
        <Button
          size="small" startIcon={<DownloadIcon sx={{ fontSize: 15 }} />} variant="outlined"
          onClick={() => {
            const blob = new Blob([JSON.stringify(buildFakeJsonPreview(result), null, 2)], { type: "application/json" });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement("a");
            a.href = url; a.download = result.json_filename; a.click();
            URL.revokeObjectURL(url);
          }}
          sx={{ borderColor: LOCAL.btnClose, color: colors.green, textTransform: "none", fontSize: "0.78rem", "&:hover": { borderColor: colors.green, bgcolor: `${colors.green}11` } }}
        >
          Exporter JSON
        </Button>
        <Button size="small" onClick={onClose} variant="contained" sx={{ backgroundColor: LOCAL.btnClose, color: colors.textLight, textTransform: "none", "&:hover": { backgroundColor: LOCAL.btnCloseHover } }}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
 
// ─── Modal nouveau type ───────────────────────────────────────────────────────
interface NewTypeModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (label: string) => void;
}
 
const NewTypeModal: React.FC<NewTypeModalProps> = ({ open, onClose, onAdd }) => {
  const [label, setLabel] = useState("");
 
  const handleSave = () => {
    if (!label.trim()) return;
    onAdd(label.trim());
    setLabel(""); onClose();
  };
  const handleClose = () => { setLabel(""); onClose(); };
 
  return (
    <Dialog
      open={open} onClose={handleClose} maxWidth="xs" fullWidth
      PaperProps={{
        sx: { backgroundColor: LOCAL.bgModal, border: `1px solid ${LOCAL.borderColor}`, borderRadius: 2, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" },
      }}
    >
      <DialogTitle sx={{ backgroundColor: LOCAL.bgModalHeader, color: colors.textLight, borderBottom: `1px solid ${LOCAL.borderColor}`, display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5, px: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={600}>Nouveau type de document</Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: colors.textSecondary }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: LOCAL.bgModal, pt: "20px !important" }}>
        <TextField
          fullWidth size="small" label="Nom du type" placeholder="Ex : Rapport, Bon de commande..."
          value={label} onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
          autoFocus
          InputLabelProps={{ sx: { color: colors.textSecondary } }}
          InputProps={{
            sx: {
              bgcolor: LOCAL.bgHeader, color: colors.textLight,
              border: `1px solid ${LOCAL.borderColor}`, borderRadius: 1,
              "& input": { color: colors.textLight },
              "& input::placeholder": { color: colors.textSecondary },
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ backgroundColor: LOCAL.bgModalHeader, borderTop: `1px solid ${LOCAL.borderColor}`, px: 2.5, py: 1.5, gap: 1 }}>
        <Button size="small" onClick={handleClose} sx={{ color: colors.textSecondary, textTransform: "none", "&:hover": { bgcolor: "#ffffff10" } }}>Annuler</Button>
        <Button size="small" onClick={handleSave} variant="contained" disabled={!label.trim()}
          sx={{ backgroundColor: "#5c7cfa", color: "#fff", textTransform: "none", fontWeight: 600, "&:hover": { backgroundColor: "#4a6ae8" }, "&.Mui-disabled": { backgroundColor: LOCAL.btnClose, color: colors.textSecondary } }}>
          Créer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
 
// ─── Composant principal ──────────────────────────────────────────────────────
const HistoryPage: React.FC = () => {
  const [results,        setResults]        = useState<ProcessingResult[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [previewResult,  setPreview]        = useState<ProcessingResult | null>(null);
  const [documentViewer, setDocumentViewer] = useState<ProcessingResult | null>(null);
  const [search,         setSearch]         = useState<string>("");
  const [typeFilter,     setTypeFilter]     = useState<string>("all");
  const [page,           setPage]           = useState<number>(0);
  const [rowsPerPage,    setRowsPerPage]    = useState<number>(5);
  const [newTypeModal,   setNewTypeModal]   = useState(false);
  const [customTypes,    setCustomTypes]    = useState<{ value: string; label: string }[]>([]);
 
  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(fakeResults as ProcessingResult[]);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
 
  const allTypeConfig = [
    ...DEFAULT_TYPES,
    ...customTypes.map((t) => ({
      value: t.value, label: t.label,
      icon: <DescriptionIcon sx={{ fontSize: 15 }} />,
      color: colors.textSecondary,
      bgcolor: `${colors.textSecondary}22`,
    })),
  ];
 
  const filteredResults = results.filter((r) => {
    const matchSearch = search === "" || r.source_document.toLowerCase().includes(search.toLowerCase()) || r.json_filename.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === "all" || r.doc_type === typeFilter;
    return matchSearch && matchType;
  });
 
  const paginatedResults = filteredResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
 
  const handleSearchChange      = (value: string) => { setSearch(value); setPage(0); };
  const handleTypeFilterChange  = (value: string) => { setTypeFilter(value); setPage(0); };
  const handleChangePage        = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };
  const handleAddType           = (label: string) => {
    const value = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    setCustomTypes((prev) => [...prev, { value, label }]);
  };
 
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }
 
  return (
    <Box p={3}>
 
      {/* En-tête */}
      <Box mb={3} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: colors.textLight }}>Documents</Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
            Fichiers JSON structurés générés après extraction OCR + analyse LLaMA
          </Typography>
        </Box>
        <Tooltip title="Nouveau type de document" placement="left">
          <IconButton
            onClick={() => setNewTypeModal(true)}
            sx={{ color: "#5c7cfa", border: `1px solid ${LOCAL.btnClose}`, borderRadius: 1.5, p: "8px", "&:hover": { backgroundColor: LOCAL.bgRowHover, borderColor: "#5c7cfa" } }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
 
      {/* Filtres */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 2.5, flexWrap: "wrap" }}>
        <TextField
          size="small" placeholder="Rechercher un fichier..."
          value={search} onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: colors.textSecondary }} /></InputAdornment>,
            sx: { bgcolor: LOCAL.bgHeader, color: colors.textLight, border: `1px solid ${LOCAL.borderColor}`, borderRadius: 1, "& input": { color: colors.textLight } },
          }}
          sx={{ width: 280 }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", fontSize: "0.72rem", whiteSpace: "nowrap" }}>
            Type de document
          </Typography>
          <ToggleButtonGroup
            value={typeFilter} exclusive size="small"
            onChange={(_, val) => { if (val !== null) handleTypeFilterChange(val); }}
            sx={{
              bgcolor: LOCAL.bgHeader, border: `1px solid ${LOCAL.borderColor}`, borderRadius: 1.5, flexWrap: "wrap",
              "& .MuiToggleButton-root": {
                border: "none", borderRadius: "6px !important",
                color: colors.textSecondary, textTransform: "none",
                fontSize: "0.8rem", fontWeight: 500, px: 1.5, py: 0.6, gap: 0.6,
                transition: "all 0.2s",
                "&:hover": { bgcolor: "#ffffff10", color: colors.textLight },
              },
            }}
          >
            {allTypeConfig.map((t) => (
              <ToggleButton key={t.value} value={t.value}
                sx={{ "&.Mui-selected": { bgcolor: `${t.bgcolor} !important`, color: `${t.color} !important`, fontWeight: "700 !important" } }}
              >
                {t.icon}{t.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>
 
      {/* Tableau */}
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: LOCAL.bgTable, boxShadow: "none", border: `1px solid ${LOCAL.borderColor}`, borderRadius: 2, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{
              backgroundColor: LOCAL.bgHeader,
              "& th": { ...tableHeadCellSx, borderBottom: `2px solid ${LOCAL.borderColor}`, color: LOCAL.textHeader, py: 1.8 },
            }}>
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
                  onClick={() => setDocumentViewer(result)}
                  sx={{
                    backgroundColor: index % 2 === 0 ? LOCAL.bgRowEven : LOCAL.bgRowOdd,
                    "&:hover": { backgroundColor: LOCAL.bgRowHover, cursor: "pointer" },
                    "& td": { borderBottom: `1px solid ${LOCAL.borderColor}`, color: colors.textLight, py: 1.6 },
                    "&:last-child td": { borderBottom: "none" },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <DataObjectIcon sx={{ fontSize: 15, color: "#5c7cfa" }} />
                      <Typography variant="body2" sx={{ color: "#5c7cfa", fontFamily: "monospace", fontSize: "0.82rem" }}>{result.json_filename}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <ArticleIcon sx={{ fontSize: 14, color: colors.green }} />
                      <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: "0.82rem" }}>{result.source_document}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={result.doc_type} size="small" sx={{ fontSize: 11, fontWeight: 600, textTransform: "capitalize", ...typeChipSx(result.doc_type) }} />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="bold" sx={{ color: confidenceColor(result.confidence) }}>
                      {(result.confidence * 100).toFixed(0)}%
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: colors.textSecondary, fontSize: "0.82rem" }}>{formatDuration(result.processing_time_ms)}</TableCell>
                  <TableCell sx={{ color: colors.textSecondary, fontSize: "0.82rem" }}>{formatDate(result.processed_at)}</TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: "flex", gap: 0.8, justifyContent: "center" }}>
                      <Tooltip title="Voir le document original" placement="top">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDocumentViewer(result); }}
                          sx={{ color: colors.green, border: `1px solid ${colors.green}33`, borderRadius: 1, p: "5px", "&:hover": { backgroundColor: `${colors.green}11`, borderColor: colors.green } }}>
                          <DescriptionIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Voir le JSON extrait" placement="top">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setPreview(result); }}
                          sx={{ color: "#5c7cfa", border: `1px solid ${LOCAL.btnClose}`, borderRadius: 1, p: "5px", "&:hover": { backgroundColor: LOCAL.bgRowHover, borderColor: "#5c7cfa" } }}>
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
      <Box sx={{
        backgroundColor: LOCAL.bgHeader, border: `1px solid ${LOCAL.borderColor}`, borderTop: "none",
        borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "space-between", px: 2,
      }}>
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: "0.78rem" }}>
          {filteredResults.length} résultat{filteredResults.length > 1 ? "s" : ""} sur {results.length} total
        </Typography>
        <TablePagination
          component="div"
          count={filteredResults.length} page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Lignes par page :"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count !== -1 ? count : `plus de ${count}`}`}
          sx={{
            color: colors.textSecondary,
            "& .MuiTablePagination-select":       { color: colors.textLight,     bgcolor: LOCAL.bgTable, borderRadius: 1 },
            "& .MuiTablePagination-selectIcon":   { color: colors.textSecondary },
            "& .MuiIconButton-root":              { color: colors.textSecondary, "&:hover": { bgcolor: "#ffffff10", color: colors.textLight }, "&.Mui-disabled": { color: LOCAL.btnClose } },
            "& .MuiTablePagination-displayedRows":{ color: colors.textSecondary },
            "& .MuiTablePagination-selectLabel":  { color: colors.textSecondary },
          }}
        />
      </Box>
 
      {/* Modals */}
      <DocumentViewerModal result={documentViewer} onClose={() => setDocumentViewer(null)} />
      <JsonPreviewModal    result={previewResult}  onClose={() => setPreview(null)} />
      <NewTypeModal        open={newTypeModal}     onClose={() => setNewTypeModal(false)} onAdd={handleAddType} />
    </Box>
  );
};
 
export default HistoryPage;