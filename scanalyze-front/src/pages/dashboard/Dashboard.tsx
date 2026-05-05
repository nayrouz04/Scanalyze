// Dashboard — main page showing KPI cards and a paginated document table
// Fetches live data from the backend via RTK Query
import { useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent,
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Button, List, ListItemButton, ListItemText,
  ListItemIcon, CircularProgress, Alert, Pagination, Chip,
} from "@mui/material";
import DescriptionIcon  from "@mui/icons-material/Description";
import ReceiptIcon      from "@mui/icons-material/Receipt";
import PersonIcon       from "@mui/icons-material/Person";
import GavelIcon        from "@mui/icons-material/Gavel";
import FolderIcon       from "@mui/icons-material/Folder";
import MoreVertIcon     from "@mui/icons-material/MoreVert";
import TrendingUpIcon   from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { useNavigate }  from "react-router-dom";
import { useGetResultsQuery, useGetStatsQuery } from "@services";
import { colors, tableHeadCellSx, tableCellSx } from "@theme";
import { ROUTES } from "@constants";

// Number of rows shown per page in the documents table
const ROWS_PER_PAGE = 5;

// Category sidebar items — each maps to a document type filter value
const categories = [
  { label: "All Documents", icon: <FolderIcon />,      count: "12k",  value: "all"      },
  { label: "Invoices",      icon: <ReceiptIcon />,     count: "4.2k", value: "invoices" },
  { label: "CV",            icon: <PersonIcon />,      count: "1.8k", value: "cv"       },
  { label: "Contrat",       icon: <GavelIcon />,       count: "920",  value: "contrat"  },
  { label: "Others",        icon: <DescriptionIcon />, count: "3.1k", value: "others"   },
];

// Returns MUI sx styles for the status chip based on document status
const statusChipSx = (status: string) => {
  if (status === "success")    return { bgcolor: colors.green + "22", color: colors.green };
  if (status === "failed")     return { bgcolor: colors.red   + "22", color: colors.red   };
  if (status === "processing") return { bgcolor: colors.amber + "22", color: colors.amber };
  return { bgcolor: colors.bgHover, color: colors.textMuted };
};

export default function Dashboard() {
  // Active category filter in the left sidebar
  const [activeCategory, setActiveCategory] = useState<string>("all");
  // Current pagination page index
  const [page, setPage] = useState<number>(1);

  const navigate = useNavigate();

  // Fetch documents and statistics from the backend
  const { data: documents = [], isLoading: loadingDocs,  isError: errorDocs  } = useGetResultsQuery(undefined);
  const { data: stats,          isLoading: loadingStats, isError: errorStats  } = useGetStatsQuery(undefined);

  // Build KPI cards from the stats response
  const kpis = stats ? [
    { title: "TOTAL DOCS",    value: stats.totalDocs   ?? "—", trend: stats.totalDocsTrend   ?? "", up: true,  color: colors.blue  },
    { title: "SUCCESS RATE",  value: stats.successRate ?? "—", trend: stats.successRateTrend ?? "", up: true,  color: colors.green },
    { title: "FAILURE RATE",  value: stats.failureRate ?? "—", trend: stats.failureRateTrend ?? "", up: false, color: colors.red   },
    { title: "AVG PROC TIME", value: stats.avgProcTime ?? "—", trend: stats.avgProcTimeTrend ?? "", up: true,  color: colors.blue  },
  ] : [];

  // Filter documents by active category; "all" shows every document
  const filteredDocs  = activeCategory === "all"
    ? documents
    : documents.filter((d: any) => d.type === activeCategory);

  const totalPages    = Math.ceil(filteredDocs.length / ROWS_PER_PAGE);
  const paginatedDocs = filteredDocs.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // Reset to page 1 whenever the category changes
  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
    setPage(1);
  };

  return (
    <Box>

      {/* ── KPI Cards ───────────────────────────────────────────── */}
      {loadingStats ? (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <CircularProgress size={28} />
        </Box>
      ) : errorStats ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load statistics.
        </Alert>
      ) : (
        <Grid container spacing={2} mb={3}>
          {kpis.map((kpi) => (
            <Grid item xs={12} sm={6} md={3} key={kpi.title}>
              <Card>
                <CardContent>

                  {/* Title + colored dot indicator */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="caption" color={colors.textMuted} letterSpacing={1}>
                      {kpi.title}
                    </Typography>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: "50%",
                      bgcolor: kpi.color + "22",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: kpi.color }} />
                    </Box>
                  </Box>

                  {/* Main value */}
                  <Typography variant="h4" color={colors.textWhite} fontWeight="bold" mt={1}>
                    {kpi.value}
                  </Typography>

                  {/* Trend indicator — green arrow if trending up, red if down */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                    {kpi.up
                      ? <TrendingUpIcon   sx={{ fontSize: 16, color: colors.green }} />
                      : <TrendingDownIcon sx={{ fontSize: 16, color: colors.red   }} />
                    }
                    <Typography variant="caption" color={kpi.up ? colors.green : colors.red}>
                      {kpi.trend}
                    </Typography>
                  </Box>

                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Recent Documents ────────────────────────────────────── */}
      <Card>
        <CardContent>

          {/* Section header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" color={colors.textWhite}>Recent Documents</Typography>
            {/* "View All" navigates to the full history page */}
            <Button size="small" sx={{ color: colors.blueMuted }} onClick={() => navigate(ROUTES.HISTORIQUE)}>
              View All
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>

            {/* ── Left: Category filter sidebar ── */}
            <Box sx={{ width: 180, flexShrink: 0, bgcolor: colors.bgDark, borderRadius: 2, p: 1 }}>
              <List dense>
                {categories.map((cat) => (
                  <ListItemButton
                    key={cat.value}
                    selected={activeCategory === cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                  >
                    <ListItemIcon sx={{ color: colors.blueMuted, minWidth: 32 }}>
                      {cat.icon}
                    </ListItemIcon>

                    {/*
                     * FIX: primaryTypographyProps / secondaryTypographyProps are deprecated in MUI v5
                     * and cause React DOM warnings when passed to native elements.
                     * Use slotProps instead to style the inner Typography nodes safely.
                     */}
                    <ListItemText
                      primary={cat.label}
                      secondary={cat.count}
                      slotProps={{
                        primary:   { style: { color: colors.textWhite, fontSize: 13 } },
                        secondary: { style: { color: colors.textMuted,  fontSize: 11 } },
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>

            {/* ── Right: Documents table ── */}
            <Box sx={{ flex: 1, overflow: "auto" }}>
              {loadingDocs ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : errorDocs ? (
                <Alert severity="error">Failed to load documents.</Alert>
              ) : (
                <>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableHeadCellSx}>ID</TableCell>
                        <TableCell sx={tableHeadCellSx}>Name</TableCell>
                        {/* Type column — only shown when "All Documents" is active */}
                        {activeCategory === "all" && (
                          <TableCell sx={tableHeadCellSx}>Type</TableCell>
                        )}
                        <TableCell sx={tableHeadCellSx}>Date</TableCell>
                        <TableCell sx={tableHeadCellSx}>Status</TableCell>
                        <TableCell sx={tableHeadCellSx}>Action</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedDocs.map((doc: any) => (
                        <TableRow
                          key={doc.id}
                          sx={{ "&:hover": { bgcolor: colors.bgHover }, transition: "background 0.15s" }}
                        >
                          <TableCell sx={tableCellSx}>{doc.id}</TableCell>

                          {/* Document name with file icon */}
                          <TableCell sx={{ ...tableCellSx, color: colors.textWhite }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <DescriptionIcon sx={{ fontSize: 16, color: colors.blueMuted }} />
                              {doc.name}
                            </Box>
                          </TableCell>

                          {/* Type chip — only shown for "All Documents" */}
                          {activeCategory === "all" && (
                            <TableCell sx={tableCellSx}>
                              <Chip
                                label={doc.type ?? "—"}
                                size="small"
                                sx={{ bgcolor: colors.blueMuted + "22", color: colors.blueMuted, fontSize: 11, fontWeight: "bold" }}
                              />
                            </TableCell>
                          )}

                          <TableCell sx={tableCellSx}>{doc.date}</TableCell>

                          {/* Status chip — color driven by statusChipSx */}
                          <TableCell sx={tableCellSx}>
                            <Chip
                              label={doc.status ?? "—"}
                              size="small"
                              sx={{ fontSize: 11, fontWeight: "bold", ...statusChipSx(doc.status) }}
                            />
                          </TableCell>

                          {/* Action menu placeholder */}
                          <TableCell sx={tableCellSx}>
                            <IconButton size="small" sx={{ color: colors.textMuted }}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination — only rendered when more than one page exists */}
                  {totalPages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, v) => setPage(v)}
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
