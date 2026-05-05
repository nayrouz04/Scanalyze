// HistoriquePage — full paginated document history with search and type filter
// Fetches all processed documents from the backend via RTK Query
import { useState } from "react";
import {
  Box, Typography, Card, CardContent, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton, Chip,
  CircularProgress, Alert, Pagination, TextField,
  InputAdornment, MenuItem, Select, FormControl, InputLabel,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import MoreVertIcon    from "@mui/icons-material/MoreVert";
import SearchIcon      from "@mui/icons-material/Search";
import HistoryIcon     from "@mui/icons-material/History";
import { useGetResultsQuery }          from "@services";
import { colors, tableHeadCellSx, tableCellSx } from "@theme";

// Rows shown per page
const ROWS_PER_PAGE = 10;

// Available document type filter options
const TYPE_OPTIONS = [
  { value: "all",      label: "Tous"     },
  { value: "invoices", label: "Invoices" },
  { value: "cv",       label: "CV"       },
  { value: "contrat",  label: "Contrat"  },
  { value: "others",   label: "Others"   },
];

// Returns MUI sx styles for the status chip based on the document status string
const statusChipSx = (status: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    success:    { bg: colors.green + "22", color: colors.green },
    failed:     { bg: colors.red   + "22", color: colors.red   },
    processing: { bg: colors.amber + "22", color: colors.amber },
  };
  const style = map[status] ?? { bg: colors.bgHover, color: colors.textMuted };
  return { bgcolor: style.bg, color: style.color, fontWeight: "bold", fontSize: 11 };
};

export default function HistoriquePage() {
  const [page,       setPage]       = useState<number>(1);
  const [search,     setSearch]     = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Fetch all documents; default to empty array while loading
  const { data: documents = [], isLoading, isError } = useGetResultsQuery(undefined);

  // Filter by search text (name match) and selected type
  const filtered = documents.filter((d: any) => {
    const matchSearch = d.name?.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === "all" || d.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // Reset to page 1 when search or type filter changes
  const handleSearch = (v: string) => { setSearch(v);     setPage(1); };
  const handleType   = (v: string) => { setTypeFilter(v); setPage(1); };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 1100 }}>

        {/* Breadcrumb */}
        <Typography variant="caption" sx={{
          color: colors.blueMuted, letterSpacing: 2, fontSize: 11, textTransform: "uppercase",
        }}>
          Home / Historique
        </Typography>

        {/* Page title */}
        <Typography variant="h4" fontWeight={700} color={colors.textWhite} mt={0.5}
          sx={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}
        >
          Document{" "}
          <Box component="span" sx={{ color: colors.blue }}>History</Box>
        </Typography>

        <Typography variant="body2" color={colors.textMuted} mb={4}>
          Liste complète de tous les documents traités par le système.
        </Typography>

        {/* Main card */}
        <Box sx={{
          background:   `linear-gradient(135deg, ${colors.bgDark} 0%, ${colors.bgCard} 100%)`,
          border:       `1px solid ${colors.borderCard}`,
          borderRadius: 3,
          p:            { xs: 3, md: 5 },
        }}>
          {/* Card header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: "50%",
              bgcolor: colors.blue + "22", border: `1px solid ${colors.blueButton}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <HistoryIcon sx={{ color: colors.blue, fontSize: 20 }} />
            </Box>
            <Box>
              <Typography color={colors.textWhite} fontWeight="bold" fontSize={15}>
                Historique des Documents
              </Typography>
              <Typography variant="caption" color={colors.textMuted}>
                {filtered.length} document(s) trouvé(s)
              </Typography>
            </Box>
          </Box>

          {/* Search + Type filter */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <TextField
              size="small"
              placeholder="Rechercher un document..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.textMuted, fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, minWidth: 220 }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ color: colors.textMuted }}>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => handleType(e.target.value)}
                sx={{ color: colors.textWhite, bgcolor: colors.bgInput }}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Content area */}
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress size={28} sx={{ color: colors.blue }} />
            </Box>
          ) : isError ? (
            <Alert severity="error" sx={{
              bgcolor: colors.bgDark, border: `1px solid ${colors.red}`, color: colors.textWhite,
            }}>
              Erreur lors du chargement des documents.
            </Alert>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeadCellSx}>ID</TableCell>
                    <TableCell sx={tableHeadCellSx}>Nom</TableCell>
                    <TableCell sx={tableHeadCellSx}>Type</TableCell>
                    <TableCell sx={tableHeadCellSx}>Date</TableCell>
                    <TableCell sx={tableHeadCellSx}>Statut</TableCell>
                    <TableCell sx={tableHeadCellSx}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{
                        textAlign: "center", color: colors.textMuted,
                        py: 6, borderColor: colors.border,
                      }}>
                        Aucun document trouvé.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((doc: any) => (
                      <TableRow
                        key={doc.id}
                        sx={{ "&:hover": { bgcolor: colors.bgHover }, transition: "background 0.15s" }}
                      >
                        <TableCell sx={tableCellSx}>{doc.id}</TableCell>

                        {/* Document name with icon */}
                        <TableCell sx={{ ...tableCellSx, color: colors.textWhite }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <DescriptionIcon sx={{ fontSize: 16, color: colors.blueMuted }} />
                            {doc.name}
                          </Box>
                        </TableCell>

                        {/* Type chip */}
                        <TableCell sx={tableCellSx}>
                          <Chip
                            label={doc.type ?? "—"}
                            size="small"
                            sx={{ bgcolor: colors.blueMuted + "22", color: colors.blueMuted, fontSize: 11 }}
                          />
                        </TableCell>

                        <TableCell sx={tableCellSx}>{doc.date}</TableCell>

                        {/* Status chip */}
                        <TableCell sx={tableCellSx}>
                          <Chip label={doc.status ?? "—"} size="small" sx={statusChipSx(doc.status)} />
                        </TableCell>

                        {/* Action menu placeholder */}
                        <TableCell sx={tableCellSx}>
                          <IconButton size="small" sx={{ color: colors.textMuted }}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
