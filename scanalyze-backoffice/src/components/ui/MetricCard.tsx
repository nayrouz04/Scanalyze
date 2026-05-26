// MetricCard — displays a single labeled metric value inside a card
// Used in dashboards and summary sections
import { Card, CardContent, Typography } from "@mui/material";

type Props = {
  // title — the metric label (e.g. "Total Users")
  title: string;
  // value — the numeric or string value to display
  value: string | number;
};

export default function MetricCard({ title, value }: Props) {
  return (
    <Card>
      <CardContent>
        {/* Metric label — muted secondary color */}
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        {/* Metric value — large and prominent */}
        <Typography variant="h5">{value}</Typography>
      </CardContent>
    </Card>
  );
}
