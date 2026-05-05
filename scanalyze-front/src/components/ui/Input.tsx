// Input — thin wrapper around MUI TextField
// Always full-width and outlined by default
// Accepts all standard TextFieldProps for maximum flexibility
import TextField, { TextFieldProps } from "@mui/material/TextField";

type Props = TextFieldProps;

export default function Input(props: Props) {
  return <TextField fullWidth variant="outlined" {...props} />;
}
