import Chip from "@mui/material/Chip";

type StatusType = "success" | "error" | "warning" | "info";
type Props = { status: StatusType; label?: string };

export default function StatusBadge({ status, label }: Props) {
  return <Chip label={label || status} color={status} size="small" />;
}