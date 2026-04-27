import Button, { ButtonProps } from "@mui/material/Button";

type Props = ButtonProps & {
  label: string;
};

export default function CustomButton({ label, ...props }: Props) {
  return <Button {...props}>{label}</Button>;
}