// src/pages/historique/HistoriquePage.tsx  (backoffice)
import React, { useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Tooltip,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, InputAdornment,
  ToggleButton, ToggleButtonGroup, TablePagination, Divider,
} from "@mui/material";
import {
  Visibility    as VisibilityIcon,
  Close         as CloseIcon,
  DataObject    as DataObjectIcon,
  Search        as SearchIcon,
  CheckCircle   as CheckCircleIcon,
  Description   as DescriptionIcon,
  AccessTime    as AccessTimeIcon,
  Receipt       as ReceiptIcon,
  Person        as PersonIcon,
  Gavel         as GavelIcon,
  Folder        as FolderIcon,
  CalendarToday as CalendarTodayIcon,
  Add           as AddIcon,
  ZoomIn        as ZoomInIcon,
  ZoomOut       as ZoomOutIcon,
  Download      as DownloadIcon,
  Article       as ArticleIcon,
} from "@mui/icons-material";

import { colors, tableHeadCellSx } from "@theme";

// ── RTK Query ─────────────────────────────────────────────────────────────────
import { useGetAllDocumentsQuery } from "@services/documentsApi";
import type { Document }           from "@models/documentModels";

// ── Tokens UI locaux ──────────────────────────────────────────────────────────
const LOCAL = {
  bgTable:       "#1e2130",
  bgHeader:      "#252a3d",
  bgRowOdd:      "#1e2130",
  bgRowEven:     "#222638",
  bgRowHover:    "#2a3050",
  borderColor:   "#2e3450",
  textHeader:    "#9aa3c2",
  bgModal:       "#1e2130",
  bgModalHeader: "#252a3d",
  btnClose:      "#3a4470",
  btnCloseHover: "#4a5490",
} as const;

// ── Filtres de type ───────────────────────────────────────────────────────────
const DEFAULT_TYPES = [
  { value: "all",      label: "Tous",     icon: <FolderIcon      sx={{ fontSize: 15 }} />, color: colors.textLight,     bgcolor: "#ffffff15"                 },
  { value: "invoice",  label: "Factures", icon: <ReceiptIcon     sx={{ fontSize: 15 }} />, color: "#5c7cfa",            bgcolor: "#5c7cfa22"                 },
  { value: "cv",       label: "CV",       icon: <PersonIcon      sx={{ fontSize: 15 }} />, color: colors.green,         bgcolor: `${colors.green}22`         },
  { value: "contract", label: "Contrats", icon: <GavelIcon       sx={{ fontSize: 15 }} />, color: colors.amber,         bgcolor: `${colors.amber}22`         },
  { value: "other",    label: "Autres",   icon: <DescriptionIcon sx={{ fontSize: 15 }} />, color: colors.textSecondary, bgcolor: `${colors.textSecondary}22` },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const typeChipSx = (type?: string) => {
  if (type === "invoice")  return { bgcolor: "#5c7cfa22",             color: "#5c7cfa"        };
  if (type === "cv")       return { bgcolor: `${colors.green}22`,     color: colors.green     };
  if (type === "contract") return { bgcolor: `${colors.amber}22`,     color: colors.amber     };
  return { bgcolor: colors.bgHover, color: colors.textMuted };
};

const statusChipSx = (status: string) => {
  if (status === "done")       return { bgcolor: `${colors.green}22`, color: colors.green };
  if (status === "processing") return { bgcolor: `${colors.amber}22`, color: colors.amber };
  if (status === "error")      return { bgcolor: `${colors.red}22`,   color: colors.red   };
  return { bgcolor: "#ffffff15", color: colors.textMuted };
};

const statusLabel: Record<string, string> = {
  pending:    "En attente",
  processing: "En cours",
  done:       "Terminé",
  error:      "Échoué",
};

// ── Modal — Aperçu JSON (données réelles du document) ─────────────────────────
interface JsonPreviewModalProps {
  doc: Document | null;
  onClose: () => void;
}

const JsonPreviewModal: React.FC<JsonPreviewModalProps> = ({ doc, onClose }) => {
  if (!doc) return null;

  // On affiche les champs réels disponibles dans l'objet Document
  const jsonContent = {
    document_id:  doc.id,
    filename:     doc.filename,
    doc_type:     doc.doc_type ?? "—",
    status:       doc.status,
    owner_id:     doc.owner_id,
    created_at:   doc.created_at,
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(jsonContent, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `${doc.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={!!doc} onClose={onClose} maxWidth="md" fullWidth
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
          <Typography variant="subtitle1" fontWeight={600}>
            {doc.id.slice(0, 8)}…json
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: colors.textSecondary }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: LOCAL.bgModal, p: 0 }}>
        <Box sx={{ px: 2.5, pt: 2, pb: 1, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Chip
            label={`Source : ${doc.filename}`}
            size="small" icon={<DescriptionIcon />}
            sx={{ bgcolor: "#5c7cfa22", color: "#5c7cfa", fontSize: 11 }}
          />
          <Chip
            label={`Statut : ${statusLabel[doc.status] ?? doc.status}`}
            size="small"
            sx={statusChipSx(doc.status)}
          />
          {doc.doc_type && (
            <Chip
              label={`Type : ${doc.doc_type}`}
              size="small"
              sx={typeChipSx(doc.doc_type)}
            />
          )}
          <Chip
            label={`Traité le : ${formatDate(doc.created_at)}`}
            size="small" icon={<CalendarTodayIcon sx={{ fontSize: 13 }} />}
            sx={{
              bgcolor: `${colors.amber}22`, color: colors.amber, fontSize: 11,
              "& .MuiChip-icon": { color: colors.amber },
            }}
          />
        </Box>
        <Box
          component="pre"
          sx={{
            m: 2.5, mt: 1, p: 2,
            bgcolor: colors.bgPage,
            borderRadius: 1.5,
            border: `1px solid ${LOCAL.borderColor}`,
            fontSize: "0.78rem",
            color: colors.textLight,
            overflow: "auto",
            maxHeight: "55vh",
            fontFamily: "'Fira Code', 'Consolas', monospace",
            lineHeight: 1.7,
          }}
        >
          {JSON.stringify(jsonContent, null, 2)}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          backgroundColor: LOCAL.bgModalHeader,
          borderTop: `1px solid ${LOCAL.borderColor}`,
          px: 2.5, py: 1.2, gap: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: colors.textSecondary, flexGrow: 1 }}>
          JSON · {doc.filename}
        </Typography>
        <Button
          size="small"
          startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
          variant="outlined"
          onClick={handleExport}
          sx={{
            borderColor: LOCAL.btnClose, color: colors.green,
            textTransform: "none", fontSize: "0.78rem",
            "&:hover": { borderColor: colors.green, bgcolor: `${colors.green}11` },
          }}
        >
          Exporter JSON
        </Button>
        <Button
          size="small" onClick={onClose} variant="contained"
          sx={{
            backgroundColor: LOCAL.btnClose, color: colors.textLight,
            textTransform: "none",
            "&:hover": { backgroundColor: LOCAL.btnCloseHover },
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Modal — Détails document ──────────────────────────────────────────────────
interface DocumentDetailModalProps {
  doc: Document | null;
  onClose: () => void;
}

const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({ doc, onClose }) => {
  if (!doc) return null;

  return (
    <Dialog
      open={!!doc} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{
        sx: {
          backgroundColor: LOCAL.bgModal,
          border: `1px solid ${LOCAL.borderColor}`,
          borderRadius: 2,
          boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: LOCAL.bgModalHeader,
          color: colors.textLight,
          borderBottom: `1px solid ${LOCAL.borderColor}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          py: 1.5, px: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ArticleIcon sx={{ color: colors.green, fontSize: 20 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.2 }}>
              {doc.filename}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              Détails du document
            </Typography>
          </Box>
          {doc.doc_type && (
            <Chip
              label={doc.doc_type} size="small"
              sx={{ fontSize: 11, fontWeight: 600, ml: 1, ...typeChipSx(doc.doc_type) }}
            />
          )}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: colors.textSecondary }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: LOCAL.bgModal, pt: "20px !important" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { label: "ID",           value: doc.id         },
            { label: "Fichier",      value: doc.filename   },
            { label: "Propriétaire", value: doc.owner_id   },
            { label: "Date upload",  value: formatDate(doc.created_at) },
          ].map(({ label, value }) => (
            <Box
              key={label}
              sx={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderBottom: `1px solid ${LOCAL.borderColor}`, pb: 1.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: LOCAL.textHeader, fontWeight: 600,
                  letterSpacing: 0.8, textTransform: "uppercase",
                }}
              >
                {label}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textLight, fontFamily: "monospace" }}>
                {value}
              </Typography>
            </Box>
          ))}

          {/* Statut */}
          <Box
            sx={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderBottom: `1px solid ${LOCAL.borderColor}`, pb: 1.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: LOCAL.textHeader, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase" }}
            >
              Statut
            </Typography>
            <Chip
              label={statusLabel[doc.status] ?? doc.status}
              size="small"
              sx={statusChipSx(doc.status)}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          backgroundColor: LOCAL.bgModalHeader,
          borderTop: `1px solid ${LOCAL.borderColor}`,
          px: 2.5, py: 1.2,
        }}
      >
        <Button
          size="small" onClick={onClose} variant="contained"
          sx={{
            backgroundColor: LOCAL.btnClose, color: colors.textLight,
            textTransform: "none",
            "&:hover": { backgroundColor: LOCAL.btnCloseHover },
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Modal — Nouveau type ──────────────────────────────────────────────────────
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
    setLabel("");
    onClose();
  };
  const handleClose = () => { setLabel(""); onClose(); };

  return (
    <Dialog
      open={open} onClose={handleClose} maxWidth="xs" fullWidth
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
        <Typography variant="subtitle1" fontWeight={600}>
          Nouveau type de document
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: colors.textSecondary }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: LOCAL.bgModal, pt: "20px !important" }}>
        <TextField
          fullWidth size="small"
          label="Nom du type"
          placeholder="Ex : Rapport, Bon de commande..."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
          autoFocus
          InputLabelProps={{ sx: { color: colors.textSecondary } }}
          InputProps={{
            sx: {
              bgcolor: LOCAL.bgHeader, color: colors.textLight,
              border: `1px solid ${LOCAL.borderColor}`, borderRadius: 1,
              "& input": { color: colors.textLight },
            },
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{
          backgroundColor: LOCAL.bgModalHeader,
          borderTop: `1px solid ${LOCAL.borderColor}`,
          px: 2.5, py: 1.5, gap: 1,
        }}
      >
        <Button
          size="small" onClick={handleClose}
          sx={{ color: colors.textSecondary, textTransform: "none" }}
        >
          Annuler
        </Button>
        <Button
          size="small" onClick={handleSave} variant="contained"
          disabled={!label.trim()}
          sx={{
            backgroundColor: "#5c7cfa", color: "#fff",
            textTransform: "none", fontWeight: 600,
            "&:hover": { backgroundColor: "#4a6ae8" },
            "&.Mui-disabled": { backgroundColor: LOCAL.btnClose, color: colors.textSecondary },
          }}
        >
          Créer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Composant principal ───────────────────────────────────────────────────────
const HistoryPage: React.FC = () => {
  const [previewDoc,    setPreviewDoc]    = useState<Document | null>(null);
  const [detailDoc,     setDetailDoc]     = useState<Document | null>(null);
  const [search,        setSearch]        = useState<string>("");
  const [typeFilter,    setTypeFilter]    = useState<string>("all");
  const [page,          setPage]          = useState<number>(0);
  const [rowsPerPage,   setRowsPerPage]   = useState<number>(5);
  const [newTypeModal,  setNewTypeModal]  = useState(false);
  const [customTypes,   setCustomTypes]   = useState<{ value: string; label: string }[]>([]);

  // ── RTK Query ───────────────────────────────────────────────────────────────
  const {
    data:      documents  = [],
    isLoading: loading,
    isError:   error,
  } = useGetAllDocumentsQuery();

  // ── Config types (défaut + custom) ─────────────────────────────────────────
  const allTypeConfig = [
    ...DEFAULT_TYPES,
    ...customTypes.map((t) => ({
      value:  t.value,
      label:  t.label,
      icon:   <DescriptionIcon sx={{ fontSize: 15 }} />,
      color:  colors.textSecondary,
      bgcolor: `${colors.textSecondary}22`,
    })),
  ];

  // ── Filtrage ────────────────────────────────────────────────────────────────
  const filteredResults = documents.filter((doc) => {
    const matchSearch =
      search === "" ||
      doc.filename.toLowerCase().includes(search.toLowerCase()) ||
      doc.id.toLowerCase().includes(search.toLowerCase());
    const matchType =
      typeFilter === "all" || doc.doc_type === typeFilter;
    return matchSearch && matchType;
  });

  const paginatedResults = filteredResults.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSearchChange      = (value: string) => { setSearch(value); setPage(0); };
  const handleTypeFilterChange  = (value: string) => { setTypeFilter(value); setPage(0); };
  const handleChangePage        = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  const handleAddType = (label: string) => {
    const value = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    setCustomTypes((prev) => [...prev, { value, label }]);
  };

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Impossible de charger les documents. Vérifiez la connexion à l'API.
        </Alert>
      </Box>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box p={3}>

      {/* En-tête */}
      <Box mb={3} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: colors.textLight }}>
            Documents
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
            Tous les documents uploadés et traités sur la plateforme
          </Typography>
        </Box>
        <Tooltip title="Nouveau type de document" placement="left">
          <IconButton
            onClick={() => setNewTypeModal(true)}
            sx={{
              color: "#5c7cfa",
              border: `1px solid ${LOCAL.btnClose}`,
              borderRadius: 1.5, p: "8px",
              "&:hover": { backgroundColor: LOCAL.bgRowHover, borderColor: "#5c7cfa" },
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filtres */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 2.5, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Rechercher un fichier..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
              </InputAdornment>
            ),
            sx: {
              bgcolor: LOCAL.bgHeader, color: colors.textLight,
              border: `1px solid ${LOCAL.borderColor}`,
              borderRadius: 1, "& input": { color: colors.textLight },
            },
          }}
          sx={{ width: 280 }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: colors.textSecondary, fontWeight: 700,
              letterSpacing: 0.8, textTransform: "uppercase",
              fontSize: "0.72rem", whiteSpace: "nowrap",
            }}
          >
            Type de document
          </Typography>
          <ToggleButtonGroup
            value={typeFilter} exclusive size="small"
            onChange={(_, val) => { if (val !== null) handleTypeFilterChange(val); }}
            sx={{
              bgcolor: LOCAL.bgHeader,
              border: `1px solid ${LOCAL.borderColor}`,
              borderRadius: 1.5, flexWrap: "wrap",
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
              <ToggleButton
                key={t.value} value={t.value}
                sx={{
                  "&.Mui-selected": {
                    bgcolor:    `${t.bgcolor} !important`,
                    color:      `${t.color} !important`,
                    fontWeight: "700 !important",
                  },
                }}
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
        sx={{
          backgroundColor: LOCAL.bgTable,
          boxShadow: "none",
          border: `1px solid ${LOCAL.borderColor}`,
          borderRadius: 2,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: LOCAL.bgHeader,
                "& th": {
                  ...tableHeadCellSx,
                  borderBottom: `2px solid ${LOCAL.borderColor}`,
                  color: LOCAL.textHeader, py: 1.8,
                },
              }}
            >
              <TableCell>Fichier</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Propriétaire</TableCell>
              <TableCell>Date upload</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedResults.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7} align="center"
                  sx={{ py: 6, color: colors.textSecondary }}
                >
                  Aucun résultat trouvé.
                </TableCell>
              </TableRow>
            ) : (
              paginatedResults.map((doc, index) => (
                <TableRow
                  key={doc.id}
                  onClick={() => setDetailDoc(doc)}
                  sx={{
                    backgroundColor: index % 2 === 0 ? LOCAL.bgRowEven : LOCAL.bgRowOdd,
                    "&:hover": { backgroundColor: LOCAL.bgRowHover, cursor: "pointer" },
                    "& td": {
                      borderBottom: `1px solid ${LOCAL.borderColor}`,
                      color: colors.textLight, py: 1.6,
                    },
                    "&:last-child td": { borderBottom: "none" },
                  }}
                >
                  {/* Fichier */}
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <ArticleIcon sx={{ fontSize: 14, color: colors.green }} />
                      <Typography
                        variant="body2"
                        sx={{ color: colors.textSecondary, fontSize: "0.82rem" }}
                      >
                        {doc.filename}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* ID court */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ color: "#5c7cfa", fontFamily: "monospace", fontSize: "0.82rem" }}
                    >
                      {doc.id.slice(0, 8)}…
                    </Typography>
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    {doc.doc_type ? (
                      <Chip
                        label={doc.doc_type} size="small"
                        sx={{ fontSize: 11, fontWeight: 600, textTransform: "capitalize", ...typeChipSx(doc.doc_type) }}
                      />
                    ) : (
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>—</Typography>
                    )}
                  </TableCell>

                  {/* Statut */}
                  <TableCell>
                    <Chip
                      label={statusLabel[doc.status] ?? doc.status}
                      size="small"
                      sx={statusChipSx(doc.status)}
                    />
                  </TableCell>

                  {/* Owner */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.textSecondary, fontSize: "0.82rem", fontFamily: "monospace" }}
                    >
                      {doc.owner_id.slice(0, 8)}…
                    </Typography>
                  </TableCell>

                  {/* Date */}
                  <TableCell sx={{ color: colors.textSecondary, fontSize: "0.82rem" }}>
                    {formatDate(doc.created_at)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: "flex", gap: 0.8, justifyContent: "center" }}>
                      <Tooltip title="Détails du document" placement="top">
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); setDetailDoc(doc); }}
                          sx={{
                            color: colors.green,
                            border: `1px solid ${colors.green}33`,
                            borderRadius: 1, p: "5px",
                            "&:hover": { backgroundColor: `${colors.green}11`, borderColor: colors.green },
                          }}
                        >
                          <DescriptionIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Voir les métadonnées JSON" placement="top">
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }}
                          sx={{
                            color: "#5c7cfa",
                            border: `1px solid ${LOCAL.btnClose}`,
                            borderRadius: 1, p: "5px",
                            "&:hover": { backgroundColor: LOCAL.bgRowHover, borderColor: "#5c7cfa" },
                          }}
                        >
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
      <Box
        sx={{
          backgroundColor: LOCAL.bgHeader,
          border: `1px solid ${LOCAL.borderColor}`,
          borderTop: "none",
          borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
          display: "flex", alignItems: "center",
          justifyContent: "space-between", px: 2,
        }}
      >
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: "0.78rem" }}>
          {filteredResults.length} résultat{filteredResults.length > 1 ? "s" : ""} sur {documents.length} total
        </Typography>
        <TablePagination
          component="div"
          count={filteredResults.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Lignes par page :"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} sur ${count !== -1 ? count : `plus de ${count}`}`
          }
          sx={{
            color: colors.textSecondary,
            "& .MuiTablePagination-select":        { color: colors.textLight, bgcolor: LOCAL.bgTable, borderRadius: 1 },
            "& .MuiTablePagination-selectIcon":    { color: colors.textSecondary },
            "& .MuiIconButton-root":               { color: colors.textSecondary, "&:hover": { bgcolor: "#ffffff10", color: colors.textLight }, "&.Mui-disabled": { color: LOCAL.btnClose } },
            "& .MuiTablePagination-displayedRows": { color: colors.textSecondary },
            "& .MuiTablePagination-selectLabel":   { color: colors.textSecondary },
          }}
        />
      </Box>

      {/* Modals */}
      <DocumentDetailModal doc={detailDoc}    onClose={() => setDetailDoc(null)}    />
      <JsonPreviewModal    doc={previewDoc}   onClose={() => setPreviewDoc(null)}   />
      <NewTypeModal        open={newTypeModal} onClose={() => setNewTypeModal(false)} onAdd={handleAddType} />
    </Box>
  );
};

export default HistoryPage;