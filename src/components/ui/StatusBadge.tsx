// StatusBadge — displays a colored chip representing a status
// Maps semantic status types to MUI Chip color variants
import Chip from "@mui/material/Chip";

// StatusType — the four supported semantic statuses
type StatusType = "success" | "error" | "warning" | "info";

type Props = {
  // status — controls the chip color
  status: StatusType;
  // label — optional custom text; falls back to the status string
  label?: string;
};

export default function StatusBadge({ status, label }: Props) {
  return <Chip label={label || status} color={status} size="small" />;
}
