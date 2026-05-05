import { colors } from "./colors";

// Reusable input sx — for cases where the global MUI theme override is not enough
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

// Reusable Select sx
export const selectSx = {
  color: colors.textWhite,
  bgcolor: colors.bgInput,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.borderCard },
} as const;

// Table header cell sx
export const tableHeadCellSx = {
  color: colors.textMuted,
  borderColor: colors.border,
  fontSize: 11,
  letterSpacing: 1,
  textTransform: "uppercase" as const,
} as const;

// Table body cell sx
export const tableCellSx = {
  borderColor: colors.border,
} as const;

// Dialog paper sx
export const dialogSx = {
  bgcolor: colors.bgCard,
  border: `1px solid ${colors.borderCard}`,
  borderRadius: 3,
  minWidth: 420,
} as const;

// Primary action button sx
export const btnPrimarySx = {
  bgcolor: colors.blueButton,
  "&:hover": { bgcolor: colors.blueButtonHover },
  fontWeight: "bold",
} as const;

// Danger / destructive action button sx
export const btnDangerSx = {
  bgcolor: colors.red,
  "&:hover": { bgcolor: "#dc2626" },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// stepperSx — sx object passed directly to the <Stepper> component via sx={{}}
//
// FIX: previously exported as a nested config object (stepperSx.connector etc.)
// which caused React DOM warnings when minHeight leaked onto native elements.
// Now structured as a flat MUI sx object using CSS selectors, so MUI handles
// the transformation to CSS internally and never forwards props to the DOM.
// ─────────────────────────────────────────────────────────────────────────────
export const stepperSx = {
  // Connector line between steps
  "& .MuiStepConnector-line": {
    borderColor: colors.border,
    minHeight:   16,
  },
  // Default step label color
  "& .MuiStepLabel-label": {
    color:    colors.textMuted,
    fontSize: "0.875rem",
  },
  // Active step label
  "& .MuiStepLabel-label.Mui-active": {
    color:      colors.textWhite,
    fontWeight: 600,
  },
  // Completed step label
  "& .MuiStepLabel-label.Mui-completed": {
    color: colors.textSecondary,
  },
  // Disabled / locked step label
  "& .MuiStepLabel-label.Mui-disabled": {
    color: colors.border,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// stepperTokens — raw design tokens for stepper icon colors
// Use these in component logic (e.g. iconBg function), NOT as sx props.
// Keeping tokens separate from sx objects prevents accidental prop leakage.
// ─────────────────────────────────────────────────────────────────────────────
export const stepperTokens = {
  icon: {
    active:     colors.blue,
    completed:  colors.green,
    accessible: colors.bgHover,
    locked:     colors.bgCard,
  },
} as const;
