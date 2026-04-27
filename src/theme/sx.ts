import { colors } from "./colors";

// Input sx réutilisable (pour les cas où le thème global ne suffit pas)
export const inputSx = {
  "& .MuiOutlinedInput-root": {
    color: colors.textWhite,
    bgcolor: colors.bgInput,
    "& fieldset":             { borderColor: colors.borderCard },
    "&:hover fieldset":       { borderColor: colors.blue },
    "&.Mui-focused fieldset": { borderColor: colors.blue },
  },
  "& .MuiInputLabel-root": { color: colors.textMuted },
} as const;

export const selectSx = {
  color: colors.textWhite,
  bgcolor: colors.bgInput,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.borderCard },
} as const;

export const tableHeadCellSx = {
  color: colors.textMuted,
  borderColor: colors.border,
  fontSize: 11,
  letterSpacing: 1,
  textTransform: "uppercase" as const,
} as const;

export const tableCellSx = {
  borderColor: colors.border,
} as const;

export const dialogSx = {
  bgcolor: colors.bgCard,
  border: `1px solid ${colors.borderCard}`,
  borderRadius: 3,
  minWidth: 420,
} as const;

export const btnPrimarySx = {
  bgcolor: colors.blueButton,
  "&:hover": { bgcolor: colors.blueButtonHover },
  fontWeight: "bold",
} as const;

export const btnDangerSx = {
  bgcolor: colors.red,
  "&:hover": { bgcolor: "#dc2626" },
} as const;
export const stepperSx = {
  connector: {
    borderColor: colors.border,
    minHeight: 16,
  },
  label: {
    default:   colors.textMuted,
    active:    colors.textWhite,
    completed: colors.textSecondary,
    disabled:  colors.border,
  },
  icon: {
    active:    colors.blue,
    completed: colors.green,
    accessible: colors.bgHover,
    locked:    colors.bgCard,
  },
} as const;