import { Snackbar, Alert } from "@mui/material";

type Props = {
  open: boolean;
  message: string;
  severity?: "success" | "error" | "warning" | "info";
  onClose: () => void;
};

export default function Toast({ open, message, severity = "info", onClose }: Props) {
  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={onClose}>
      <Alert severity={severity} onClose={onClose}>{message}</Alert>
    </Snackbar>
  );
}