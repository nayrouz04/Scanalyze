import { useState } from "react";
import {
  Box, Paper, TextField, Button, Typography,
  Link, MenuItem, Select, InputLabel, FormControl, Divider,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import PersonIcon   from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import { useNavigate } from "react-router-dom";
import { colors }      from "@theme";
import logo            from "@assets/logo.svg";
import { ROUTES }      from "@constants";

// FormState — all registration form fields grouped in a single typed object
interface FormState {
  fullName:  string;
  birthDate: string;
  phone:     string;
  role:      string;
  address:   string;
  email:     string;
  password:  string;
  confirm:   string;
}

// Initial empty state — defined outside component to avoid re-creation on each render
const INITIAL_FORM: FormState = {
  fullName:  "",
  birthDate: "",
  phone:     "",
  role:      "",
  address:   "",
  email:     "",
  password:  "",
  confirm:   "",
};

export default function SignUpPage() {
  const navigate = useNavigate();

  // Single typed state object holding every form field
  const [form,  setForm ] = useState<FormState>(INITIAL_FORM);

  // Error message — empty string means no error is displayed
  const [error, setError] = useState<string>("");

  // Handler for standard TextField inputs — properly typed with React.ChangeEvent
  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void =>
      setForm((prev: FormState) => ({ ...prev, [field]: e.target.value }));

  // Handler for MUI Select — uses SelectChangeEvent instead of ChangeEvent
  const handleSelectChange =
    (field: keyof FormState) =>
    (e: SelectChangeEvent<string>): void =>
      setForm((prev: FormState) => ({ ...prev, [field]: e.target.value }));

  const handleSignUp = (): void => {
    // Validate required fields
    if (!form.fullName || !form.email || !form.password || !form.confirm) {
      setError("All required fields must be filled in");
      return;
    }
    // Validate password confirmation match
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    // Success — account pending admin activation
    alert("Account created! Awaiting activation by an admin.");
    navigate(ROUTES.LOGIN);
  };

  return (
    // FIX: minHeight moved inside sx={} to prevent MUI from forwarding it
    // as an attribute to the native DOM element, which causes React warnings.
    <Box sx={{
      minHeight:       "100vh",
      display:         "flex",
      justifyContent:  "center",
      alignItems:      "center",
      backgroundColor: colors.bgPage,
      py:              4,
    }}>
      <Paper sx={{ padding: 4, width: "90%", maxWidth: 560, borderRadius: 3 }}>

        {/* Logo */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <img src={logo} alt="Scanalyze" height={50} />
        </Box>

        {/* ── Personal Information section ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <PersonIcon sx={{ color: colors.blueMuted }} />
          <Typography variant="body2" color={colors.blueMuted} fontWeight="bold" letterSpacing={1}>
            PERSONAL INFORMATION
          </Typography>
        </Box>

        {/* Full Name + Date of Birth */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth label="Full Name" placeholder="John Doe"
            value={form.fullName} onChange={handleChange("fullName")}
          />
          <TextField
            fullWidth label="Date of Birth"
            value={form.birthDate} onChange={handleChange("birthDate")}
            onFocus={(e: React.FocusEvent<HTMLInputElement>): void => { e.target.type = "date"; }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>):  void => { if (!e.target.value) e.target.type = "text"; }}
          />
        </Box>

        {/* Phone + Role */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth label="Phone Number" placeholder="0123456789"
            value={form.phone} onChange={handleChange("phone")}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            {/* handleSelectChange used here because MUI Select has a different event type */}
            <Select value={form.role} onChange={handleSelectChange("role")} label="Role">
              <MenuItem value="" disabled>Select role</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Office Address */}
        <TextField
          fullWidth label="Office Address"
          placeholder="Street name, City, Postal Code, Country"
          value={form.address} onChange={handleChange("address")}
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 3 }} />

        {/* ── Account Security section ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <SecurityIcon sx={{ color: colors.blueMuted }} />
          <Typography variant="body2" color={colors.blueMuted} fontWeight="bold" letterSpacing={1}>
            ACCOUNT SECURITY
          </Typography>
        </Box>

        {/* Professional Email */}
        <TextField
          fullWidth label="Professional Email" placeholder="email@company.com"
          value={form.email} onChange={handleChange("email")}
          sx={{ mb: 2 }}
        />

        {/* Password + Confirm Password */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            fullWidth label="Password" type="password"
            helperText="Min. 8 chars with 1 number"
            value={form.password} onChange={handleChange("password")}
          />
          <TextField
            fullWidth label="Confirm Password" type="password"
            value={form.confirm} onChange={handleChange("confirm")}
          />
        </Box>

        {/* Inline error message */}
        {error && (
          <Typography color="error" variant="body2" mt={2}>{error}</Typography>
        )}

        {/* Submit button */}
        <Button
          fullWidth variant="contained"
          sx={{ mt: 3, py: 1.5, fontSize: "1rem" }}
          onClick={handleSignUp}
        >
          Create Account →
        </Button>

        {/* Link to login page */}
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" color={colors.textMuted}>
            Already have an account?{" "}
            <Link href={ROUTES.LOGIN} underline="hover" color="primary.light">
              Sign in
            </Link>
          </Typography>
        </Box>

      </Paper>
    </Box>
  );
}
