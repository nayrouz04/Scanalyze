//hook pour gerer les etat locaux 
import { useState } from "react";
//composant MUI
import {
  Box, Typography, Grid, Card, CardContent,
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Button, List, ListItemButton, ListItemText,
  ListItemIcon, CircularProgress, Alert, Pagination,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptIcon     from "@mui/icons-material/Receipt";
import PersonIcon      from "@mui/icons-material/Person";
import GavelIcon       from "@mui/icons-material/Gavel";
import FolderIcon      from "@mui/icons-material/Folder";
import MoreVertIcon    from "@mui/icons-material/MoreVert";
import TrendingUpIcon  from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
//des hook RTK Query pour appeler le backend et recuperr la liste des docu et les statiques 
import { useGetResultsQuery, useGetStatsQuery } from "../../services/api";
import { colors, tableHeadCellSx, tableCellSx } from "../../theme";

//nombre de documents affichés par page 
const ROWS_PER_PAGE = 5;

const categories = [
  { label: "All Documents", icon: <FolderIcon />,     count: "12k",  value: "all" },
  { label: "Invoices",      icon: <ReceiptIcon />,    count: "4.2k", value: "invoices" },
  { label: "CV",            icon: <PersonIcon />,     count: "1.8k", value: "cv" },
  { label: "Contrat",       icon: <GavelIcon />,      count: "920",  value: "contrat" },
  { label: "Others",        icon: <DescriptionIcon />,count: "3.1k", value: "others" },
];

export default function Dashboard() {
 //categorie selectionné dans la sidebar 
  const [activeCategory, setActiveCategory] = useState("all");
  //page courant de la pagination 
  const [page, setPage] = useState(1);

  const { data: documents = [], isLoading: loadingDocs, isError: errorDocs } = useGetResultsQuery(undefined);
  const { data: stats, isLoading: loadingStats, isError: errorStats }        = useGetStatsQuery(undefined);

  //les constructions des KPIs
  const kpis = stats ? [
    { title: "TOTAL DOCS",    value: stats.totalDocs    ?? "—", trend: stats.totalDocsTrend    ?? "", up: true,  color: colors.blue },
    { title: "SUCCESS RATE",  value: stats.successRate  ?? "—", trend: stats.successRateTrend  ?? "", up: true,  color: colors.green },
    { title: "FAILURE RATE",  value: stats.failureRate  ?? "—", trend: stats.failureRateTrend  ?? "", up: false, color: colors.red },
    { title: "AVG PROC TIME", value: stats.avgProcTime  ?? "—", trend: stats.avgProcTimeTrend  ?? "", up: true,  color: colors.blue },
  ] : [];

  const filteredDocs  = activeCategory === "all" ? documents : documents.filter((d: any) => d.type === activeCategory);
  const totalPages    = Math.ceil(filteredDocs.length / ROWS_PER_PAGE);
  const paginatedDocs = filteredDocs.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
//quand on change la catgorie , on revient toujours à la page 1 
  const handleCategoryChange = (value: string) => { setActiveCategory(value); setPage(1); };

  return (
    <Box>
      {/* KPI Cards */}
      {loadingStats ? (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}><CircularProgress size={28} /></Box>
      ) : errorStats ? (
        <Alert severity="error" sx={{ mb: 3 }}>Erreur lors du chargement des statistiques.</Alert>
      ) : (
        <Grid container spacing={2} mb={3}>
          {kpis.map((kpi) => (
            <Grid item xs={12} sm={6} md={3} key={kpi.title}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="caption" color={colors.textMuted} letterSpacing={1}>{kpi.title}</Typography>
                    <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: kpi.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: kpi.color }} />
                    </Box>
                  </Box>
                  <Typography variant="h4" color={colors.textWhite} fontWeight="bold" mt={1}>{kpi.value}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                    {kpi.up
                      ? <TrendingUpIcon   sx={{ fontSize: 16, color: colors.green }} />
                      : <TrendingDownIcon sx={{ fontSize: 16, color: colors.red }} />
                    }
                    <Typography variant="caption" color={kpi.up ? colors.green : colors.red}>{kpi.trend}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Recent Documents */}
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" color={colors.textWhite}>Recent Documents</Typography>
            <Button size="small" sx={{ color: colors.blueMuted }}>View All</Button>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            {/* Category sidebar */}
            <Box sx={{ width: 180, flexShrink: 0, bgcolor: colors.bgDark, borderRadius: 2, p: 1 }}>
              <List dense>
                {categories.map((cat) => (
                  <ListItemButton key={cat.value} selected={activeCategory === cat.value} onClick={() => handleCategoryChange(cat.value)}>
                    <ListItemIcon sx={{ color: colors.blueMuted, minWidth: 32 }}>{cat.icon}</ListItemIcon>
                    <ListItemText
                      primary={cat.label} secondary={cat.count}
                      primaryTypographyProps={{ color: colors.textWhite, fontSize: 13 }}
                      secondaryTypographyProps={{ color: colors.textMuted, fontSize: 11 }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>

            {/* Table */}
            <Box sx={{ flex: 1, overflow: "auto" }}>
              {loadingDocs ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress size={28} /></Box>
              ) : errorDocs ? (
                <Alert severity="error">Erreur lors du chargement des documents.</Alert>
              ) : (
                <>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableHeadCellSx}>ID</TableCell>
                        <TableCell sx={tableHeadCellSx}>Name</TableCell>
                        <TableCell sx={tableHeadCellSx}>Date</TableCell>
                        <TableCell sx={tableHeadCellSx}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedDocs.map((doc: any) => (
                        <TableRow key={doc.id}>
                          <TableCell sx={tableCellSx}>{doc.id}</TableCell>
                          <TableCell sx={{ ...tableCellSx, color: colors.textWhite }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <DescriptionIcon sx={{ fontSize: 16, color: colors.blueMuted }} />
                              {doc.name}
                            </Box>
                          </TableCell>
                          <TableCell sx={tableCellSx}>{doc.date}</TableCell>
                          <TableCell sx={tableCellSx}>
                            <IconButton size="small" sx={{ color: colors.textMuted }}><MoreVertIcon fontSize="small" /></IconButton>
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
                </>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}