import { Card, CardContent, Typography } from "@mui/material";

type Props = { title: string; value: string | number };

export default function MetricCard({ title, value }: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Typography variant="h5">{value}</Typography>
      </CardContent>
    </Card>
  );
}