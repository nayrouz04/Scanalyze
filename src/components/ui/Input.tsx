import TextField, { TextFieldProps } from "@mui/material/TextField";

type Props = TextFieldProps;

export default function Input(props: Props) {
  return <TextField fullWidth variant="outlined" {...props} />;
}