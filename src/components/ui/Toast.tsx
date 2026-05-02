// Toast — temporary snackbar notification with severity styling
// Auto-dismisses after 3 seconds; also closeable manually
import { Snackbar, Alert } from "@mui/material";

type Props = {
  // open      — controls visibility of the snackbar
  open:      boolean;
  // message   — the text content to display
  message:   string;
  // severity  — controls the color and icon (default: "info")
  severity?: "success" | "error" | "warning" | "info";
  // onClose   — called when the snackbar is dismissed
  onClose:   () => void;
};

export default function Toast({ open, message, severity = "info", onClose }: Props) {
  return (
    // Auto-hides after 3000ms; calls onClose on timeout or manual close
    <Snackbar open={open} autoHideDuration={3000} onClose={onClose}>
      <Alert severity={severity} onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  );
}
