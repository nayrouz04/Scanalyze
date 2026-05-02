// KpiSection — displays four KPI metric cards in a responsive grid
// Fetches live stats from the backend via RTK Query
import { Grid, Card, CardContent, Typography } from "@mui/material";
import { useGetStatsQuery } from "@services";

// KpiCard — reusable card that displays a single metric
// Props:
//   title — the metric label (e.g. "Documents Uploaded")
//   value — the numeric or string value to display
function KpiCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card sx={{ background: "#111827", color: "white" }}>
      <CardContent>
        <Typography variant="body2" color="gray">
          {title}
        </Typography>
        <Typography variant="h5">{value}</Typography>
      </CardContent>
    </Card>
  );
}

export default function KpiSection() {
  // Fetch dashboard stats from the backend
  // Falls back to mock values while the API is not yet connected
  const { data } = useGetStatsQuery();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <KpiCard title="Documents Uploadés" value={data?.uploaded ?? 120} />
      </Grid>
      <Grid item xs={12} md={3}>
        <KpiCard title="Documents Traités"  value={data?.processed ?? 98} />
      </Grid>
      <Grid item xs={12} md={3}>
        <KpiCard title="En cours OCR"       value={data?.pending   ?? 10} />
      </Grid>
      <Grid item xs={12} md={3}>
        <KpiCard title="Erreurs"            value={data?.errors    ?? 2}  />
      </Grid>
    </Grid>
  );
}
