import { useState } from "react";
import {
  Box, Typography, Card, CardContent,
  Table, TableHead, TableRow, TableCell, TableBody,
  Button, List, ListItemButton, ListItemText, ListItemIcon,
  CircularProgress, Alert, Pagination, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
 
import DescriptionIcon     from "@mui/icons-material/Description";
import ReceiptIcon         from "@mui/icons-material/Receipt";
import PersonIcon          from "@mui/icons-material/Person";
import GavelIcon           from "@mui/icons-material/Gavel";
import FolderIcon          from "@mui/icons-material/Folder";
import UploadFileIcon      from "@mui/icons-material/UploadFile";
import HourglassTopIcon    from "@mui/icons-material/HourglassTop";
import ErrorIcon           from "@mui/icons-material/Error";
import TrendingUpIcon      from "@mui/icons-material/TrendingUp";
import TrendingDownIcon    from "@mui/icons-material/TrendingDown";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import VisibilityIcon      from "@mui/icons-material/Visibility";
import DeleteIcon          from "@mui/icons-material/Delete";
import ArticleIcon         from "@mui/icons-material/Article";
import CheckCircleIcon     from "@mui/icons-material/CheckCircle";
import WarningAmberIcon    from "@mui/icons-material/WarningAmber";
import AssessmentIcon      from "@mui/icons-material/Assessment";
import CloseIcon           from "@mui/icons-material/Close";
import OpenInNewIcon       from "@mui/icons-material/OpenInNew";
 
import { useNavigate } from "react-router-dom";
 
import { useGetResultsQuery, useGetStatsQuery } from "@services";
import { colors, tableHeadCellSx, tableCellSx } from "@theme";
import { ROUTES } from "@constants";
 
import fakeStats from "../../assets/fakeData/dashboard-stats.json";
import fakeDocs  from "../../assets/fakeData/dashboard-documents.json";
 
const USE_FAKE_DATA = true;
const ROWS_PER_PAGE = 5;
 
const categories = [
  { label: "Tous les documents", icon: <FolderIcon />,      count: "12", value: "all"      },
  { label: "Factures",           icon: <ReceiptIcon />,     count: "4",  value: "invoices" },
  { label: "CV",                 icon: <PersonIcon />,      count: "3",  value: "cv"       },
  { label: "Contrats",           icon: <GavelIcon />,       count: "3",  value: "contrat"  },
  { label: "Autres",             icon: <DescriptionIcon />, count: "2",  value: "others"   },
];
 
const statusChipSx = (status: string) => {
  if (status === "uploaded")   return { bgcolor: `${colors.blue}22`,  color: colors.blue  };
  if (status === "processing") return { bgcolor: `${colors.amber}22`, color: colors.amber };
  if (status === "failed")     return { bgcolor: `${colors.red}22`,   color: colors.red   };
  return { bgcolor: colors.bgHover, color: colors.textMuted };
};
 
const StatusIcon = ({ status }: { status: string }) => {
  if (status === "uploaded")   return <UploadFileIcon   sx={{ fontSize: 14 }} />;
  if (status === "processing") return <HourglassTopIcon sx={{ fontSize: 14 }} />;
  if (status === "failed")     return <ErrorIcon        sx={{ fontSize: 14 }} />;
  return null;
};
 
const statusLabel: Record<string, string> = {
  uploaded:   "Uploadé",
  processing: "En cours",
  failed:     "Échoué",
};
 
const typeColor = (type: string) => {
  if (type === "invoices") return { bgcolor: "#5c7cfa22", color: "#5c7cfa"    };
  if (type === "cv")       return { bgcolor: `${colors.green}22`, color: colors.green };
  if (type === "contrat")  return { bgcolor: `${colors.amber}22`, color: colors.amber };
  return { bgcolor: colors.bgHover, color: colors.textMuted };
};
 
export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [page,           setPage]           = useState<number>(1);
  const [previewDoc,     setPreviewDoc]     = useState<any | null>(null);
 
  const navigate = useNavigate();
 
  const { data: liveDocuments = [], isLoading: loadingDocs,  isError: errorDocs  } =
    useGetResultsQuery(undefined, { skip: USE_FAKE_DATA });
  const { data: liveStats,          isLoading: loadingStats, isError: errorStats } =
    useGetStatsQuery(undefined,  { skip: USE_FAKE_DATA });
 
  const documents = USE_FAKE_DATA ? fakeDocs  : liveDocuments;
  const stats     = USE_FAKE_DATA ? fakeStats : liveStats;
 
  const isLoadingDocs  = USE_FAKE_DATA ? false : loadingDocs;
  const isErrorDocs    = USE_FAKE_DATA ? false : errorDocs;
  const isLoadingStats = USE_FAKE_DATA ? false : loadingStats;
  const isErrorStats   = USE_FAKE_DATA ? false : errorStats;
 
  const kpis = stats
    ? [
        {
          title: "TOTAL DOCUMENTS TRAITÉS",
          value: stats.totalProcessed        ?? "—",
          trend: stats.totalProcessedTrend   ?? "",
          up:    true,
          color: colors.blue,
          icon:  <AssessmentIcon sx={{ fontSize: 18, color: colors.blue }} />,
        },
        {
          title: "TYPE LE PLUS TRAITÉ",
          value: stats.mostProcessedType      ?? "—",
          trend: stats.mostProcessedTypeTrend ?? "",
          up:    true,
          color: colors.green,
          icon:  <ArticleIcon sx={{ fontSize: 18, color: colors.green }} />,
        },
        {
          title: "TAUX D'EXTRACTION RÉUSSI",
          value: stats.extractionSuccessRate  ?? "—",
          trend: stats.extractionSuccessTrend ?? "",
          up:    true,
          color: colors.green,
          icon:  <CheckCircleIcon sx={{ fontSize: 18, color: colors.green }} />,
        },
        {
          title: "DOCS FAIBLE CONFIANCE",
          value: stats.lowConfidenceDocs  ?? "—",
          trend: stats.lowConfidenceTrend ?? "",
          up:    false,
          color: colors.red,
          icon:  <WarningAmberIcon sx={{ fontSize: 18, color: colors.red }} />,
        },
      ]
    : [];
 
  const filteredDocs =
    activeCategory === "all"
      ? documents
      : documents.filter((d: any) => d.type === activeCategory);
 
  const totalPages    = Math.ceil(filteredDocs.length / ROWS_PER_PAGE);
  const paginatedDocs = filteredDocs.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );
 
  const handleCategoryChange = (value: string) => { setActiveCategory(value); setPage(1); };
  const handleDelete         = (docId: string) => console.log("delete", docId);
 
  return (
    <Box sx={{ width: "100%" }}>
 
      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      {isLoadingStats ? (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <CircularProgress size={28} />
        </Box>
      ) : isErrorStats ? (
        <Alert severity="error" sx={{ mb: 3 }}>Impossible de charger les statistiques.</Alert>
      ) : (
        <Box sx={{ display: "flex", gap: 2, mb: 3, width: "100%" }}>
          {kpis.map((kpi) => (
            <Card
              key={kpi.title}
              sx={{
                flex: 1, minWidth: 0, minHeight: 150,
                borderRadius: 3,
                bgcolor: colors.bgCard,
                border: `1px solid ${colors.border}`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                transition: "all 0.25s ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 25px rgba(0,0,0,0.35)" },
              }}
            >
              <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" sx={{ color: colors.textMuted, letterSpacing: 1.2, fontWeight: 700, textTransform: "uppercase" }}>
                    {kpi.title}
                  </Typography>
                  <Box sx={{ width: 38, height: 38, borderRadius: "50%", bgcolor: `${kpi.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {kpi.icon}
                  </Box>
                </Box>
                <Typography variant="h3" sx={{ color: colors.textWhite, fontWeight: 700, mt: 3, mb: 2 }}>
                  {kpi.value}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                  {kpi.up
                    ? <TrendingUpIcon   sx={{ fontSize: 18, color: colors.green }} />
                    : <TrendingDownIcon sx={{ fontSize: 18, color: colors.red   }} />
                  }
                  <Typography variant="body2" sx={{ color: kpi.up ? colors.green : colors.red, fontWeight: 600 }}>
                    {kpi.trend}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
 
      {/* ── Tableau documents ─────────────────────────────────────────────── */}
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Typography variant="h6" color={colors.textWhite}>Documents uploadés</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Fichiers bruts reçus — en attente ou en cours de traitement
              </Typography>
            </Box>
            <Button size="small" sx={{ color: colors.blueMuted }} onClick={() => navigate(ROUTES.HISTORIQUE)}>
              Voir les résultats →
            </Button>
          </Box>
 
          <Box sx={{ display: "flex", gap: 2 }}>
 
            {/* Catégories */}
            <Box sx={{ width: 190, flexShrink: 0, bgcolor: colors.bgDark, borderRadius: 2, p: 1 }}>
              <Typography variant="caption" color={colors.textMuted} sx={{ px: 1, pb: 0.5, display: "block", letterSpacing: 1 }}>
                CATÉGORIES
              </Typography>
              <List dense>
                {categories.map((cat) => (
                  <ListItemButton
                    key={cat.value}
                    selected={activeCategory === cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                    sx={{
                      borderRadius: 1, mb: 0.3,
                      "&.Mui-selected": {
                        bgcolor: `${colors.blueMuted}22`,
                        "& .MuiListItemText-primary": { color: colors.blueMuted },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: colors.blueMuted, minWidth: 32 }}>{cat.icon}</ListItemIcon>
                    <ListItemText primary={cat.label} secondary={`${cat.count} fichiers`} />
                  </ListItemButton>
                ))}
              </List>
            </Box>
 
            {/* Tableau */}
            <Box sx={{ flex: 1, overflow: "auto" }}>
              {isLoadingDocs ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : isErrorDocs ? (
                <Alert severity="error">Impossible de charger les documents.</Alert>
              ) : filteredDocs.length === 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 6, gap: 1 }}>
                  <FolderIcon sx={{ fontSize: 40, color: colors.textMuted, opacity: 0.4 }} />
                  <Typography color={colors.textMuted}>Aucun document dans cette catégorie.</Typography>
                </Box>
              ) : (
                <>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableHeadCellSx}>ID</TableCell>
                        <TableCell sx={tableHeadCellSx}>Nom du fichier</TableCell>
                        {activeCategory === "all" && <TableCell sx={tableHeadCellSx}>Type</TableCell>}
                        <TableCell sx={tableHeadCellSx}>Taille</TableCell>
                        <TableCell sx={tableHeadCellSx}>Pages</TableCell>
                        <TableCell sx={tableHeadCellSx}>Date upload</TableCell>
                        <TableCell sx={tableHeadCellSx}>Statut</TableCell>
                        <TableCell sx={tableHeadCellSx}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedDocs.map((doc: any) => (
                        <TableRow
                          key={doc.id}
                          sx={{ "&:hover": { bgcolor: colors.bgHover }, transition: "background 0.15s" }}
                        >
                          <TableCell sx={tableCellSx}>{doc.id}</TableCell>
                          <TableCell sx={tableCellSx}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <InsertDriveFileIcon sx={{ fontSize: 15, color: colors.blueMuted }} />
                              {doc.name}
                            </Box>
                          </TableCell>
                          {activeCategory === "all" && (
                            <TableCell sx={tableCellSx}>
                              {doc.status === "processing" ? (
                                <Typography variant="caption" color={colors.textMuted}>—</Typography>
                              ) : (
                                <Chip label={doc.type} size="small" sx={{ fontSize: 11, fontWeight: 600, textTransform: "capitalize", ...typeColor(doc.type) }} />
                              )}
                            </TableCell>
                          )}
                          <TableCell sx={tableCellSx}>{doc.size}</TableCell>
                          <TableCell sx={tableCellSx}>{doc.pages}</TableCell>
                          <TableCell sx={tableCellSx}>{doc.date}</TableCell>
                          <TableCell sx={tableCellSx}>
                            <Chip
                              icon={<StatusIcon status={doc.status} />}
                              label={statusLabel[doc.status]}
                              size="small"
                              sx={statusChipSx(doc.status)}
                            />
                          </TableCell>
                          <TableCell sx={tableCellSx}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Tooltip title="Prévisualiser" arrow>
                                <IconButton
                                  size="small" onClick={() => setPreviewDoc(doc)}
                                  sx={{ color: colors.blueMuted, "&:hover": { bgcolor: `${colors.blueMuted}22`, color: colors.blue } }}
                                >
                                  <VisibilityIcon sx={{ fontSize: 17 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer" arrow>
                                <IconButton
                                  size="small" onClick={() => handleDelete(doc.id)}
                                  sx={{ color: colors.textMuted, "&:hover": { bgcolor: `${colors.red}22`, color: colors.red } }}
                                >
                                  <DeleteIcon sx={{ fontSize: 17 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
 
                  {totalPages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                      <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} />
                    </Box>
                  )}
 
                  <Typography variant="caption" color={colors.textMuted} sx={{ mt: 1.5, display: "block" }}>
                    {filteredDocs.length} document{filteredDocs.length > 1 ? "s" : ""} trouvé{filteredDocs.length > 1 ? "s" : ""}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
 
      {/* ══════════════════════════════════════════════════════════
          Dialog — Aperçu du document
      ══════════════════════════════════════════════════════════ */}
      <Dialog
        open={!!previewDoc} onClose={() => setPreviewDoc(null)}
        maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.bgCard, borderRadius: 3,
            border: `1px solid ${colors.borderCard}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: `1px solid ${colors.border}`,
            pb: 1.5, px: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <InsertDriveFileIcon sx={{ color: colors.blueMuted, fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={600} color={colors.textWhite}>
              {previewDoc?.name}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setPreviewDoc(null)} sx={{ color: colors.textMuted }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
 
        <DialogContent sx={{ pt: 2.5, px: 2.5, pb: 1 }}>
          {previewDoc && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { label: "ID",          value: previewDoc.id    },
                { label: "Taille",      value: previewDoc.size  },
                { label: "Pages",       value: previewDoc.pages },
                { label: "Date upload", value: previewDoc.date  },
              ].map(({ label, value }) => (
                <Box
                  key={label}
                  sx={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    borderBottom: `1px solid ${colors.border}`, pb: 1,
                  }}
                >
                  <Typography variant="caption" sx={{ color: colors.textMuted, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase" }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textWhite }}>{value}</Typography>
                </Box>
              ))}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="caption" sx={{ color: colors.textMuted, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase" }}>
                  Type
                </Typography>
                {previewDoc.status === "processing" ? (
                  <Typography variant="body2" color={colors.textMuted}>—</Typography>
                ) : (
                  <Chip label={previewDoc.type} size="small" sx={{ fontSize: 11, fontWeight: 600, textTransform: "capitalize", ...typeColor(previewDoc.type) }} />
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
 
        <DialogActions
          sx={{
            px: 2.5, pb: 2, pt: 1.5,
            borderTop: `1px solid ${colors.border}`,
            mt: 1.5, display: "flex", justifyContent: "space-between",
          }}
        >
          <Button
            variant="outlined" size="small"
            startIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
            onClick={() => { if (previewDoc?.url) window.open(previewDoc.url, "_blank", "noopener,noreferrer"); }}
            disabled={!previewDoc?.url}
            sx={{
              borderColor: `${colors.blueMuted}66`,
              color: colors.blueMuted,
              textTransform: "none",
              "&:hover": { borderColor: colors.blueMuted, bgcolor: `${colors.blueMuted}11` },
              "&.Mui-disabled": { borderColor: colors.border, color: colors.textMuted },
            }}
          >
            Voir le document original
          </Button>
          <Button
            onClick={() => setPreviewDoc(null)} variant="contained" size="small"
            sx={{ bgcolor: colors.bgHover, color: colors.textWhite, textTransform: "none", "&:hover": { bgcolor: colors.borderExport } }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}