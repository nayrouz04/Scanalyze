import { createTheme } from "@mui/material/styles";
import { colors } from "./colors";

export const muiTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: colors.bgPage,
      paper:   colors.bgCard,
    },
    primary: { main: colors.blue },
    error:   { main: colors.red },
    success: { main: colors.green },
    text: {
      primary:   colors.textWhite,
      secondary: colors.textMuted,
    },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.bgCard,
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundColor: colors.bgCard },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.bgPage,
          boxShadow: "none",
          borderBottom: `1px solid ${colors.border}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.bgCard,
          borderRight: `1px solid ${colors.border}`,
          color: colors.textWhite,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root:  { borderColor: colors.border, color: colors.textMuted },
        head:  { color: colors.textMuted },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: colors.textMuted,
          borderColor: colors.border,
          "&.Mui-selected": { backgroundColor: colors.bgSelected, color: colors.textWhite },
          "&:hover":        { backgroundColor: colors.bgHover },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          marginBottom: 4,
          "&.Mui-selected":       { backgroundColor: colors.bgSelected },
          "&.Mui-selected:hover": { backgroundColor: colors.blueButton },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none" },
        containedPrimary: {
          backgroundColor: colors.blueButton,
          "&:hover": { backgroundColor: colors.blueButtonHover },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            color: colors.textWhite,
            backgroundColor: colors.bgInput,
            "& fieldset":              { borderColor: colors.borderCard },
            "&:hover fieldset":        { borderColor: colors.blue },
            "&.Mui-focused fieldset":  { borderColor: colors.blue },
          },
          "& .MuiInputLabel-root": { color: colors.textMuted },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: colors.textWhite,
          backgroundColor: colors.bgInput,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.borderCard },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: colors.blue },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.bgCard,
          border: `1px solid ${colors.borderCard}`,
          borderRadius: 12,
          minWidth: 420,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: colors.borderCard },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardInfo: {
          backgroundColor: colors.bgDark,
          color: colors.textWhite,
          border: `1px solid ${colors.blueButton}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: "bold" },
      },
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
});