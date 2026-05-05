// Button — thin wrapper around MUI Button
// Accepts all standard ButtonProps plus a required label prop
import Button, { ButtonProps } from "@mui/material/Button";

type Props = ButtonProps & {
  // label — the text displayed inside the button
  label: string;
};

export default function CustomButton({ label, ...props }: Props) {
  return <Button {...props}>{label}</Button>;
}
