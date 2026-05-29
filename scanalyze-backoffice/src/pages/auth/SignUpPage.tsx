// src/pages/auth/SignUpPage.tsx  (backoffice)
import { useState }          from "react";
import {
  Box, Paper, TextField, Button, Typography,
  Link, MenuItem, Select, InputLabel, FormControl,
  Divider, CircularProgress,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import PersonIcon   from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import { useNavigate }         from "react-router-dom";
import { useRegisterMutation } from "@services/authApi";
import { colors }              from "@theme";
import logo                    from "@assets/logo.svg";
import { ROUTES }              from "@constants";

interface FormState {
  fullName: string;
  phone:    string;
  role:     "user" | "admin" | "";
  address:  string;
  email:    string;
  password: string;
  confirm:  string;
}

const INITIAL_FORM: FormState = {
  fullName: "",
  phone:    "",
  role:     "",
  address:  "",
  email:    "",
  password: "",
  confirm:  "",
};

// Validation mot de passe — doit correspondre aux règles backend
const validatePassword = (pwd: string): string | null => {
  if (pwd.length < 8)
    return "Le mot de passe doit contenir au moins 8 caractères.";
  if (!/[A-Z]/.test(pwd))
    return "Le mot de passe doit contenir au moins une majuscule.";
  if (!/[0-9]/.test(pwd))
    return "Le mot de passe doit contenir au moins un chiffre.";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd))
    return "Le mot de passe doit contenir au moins un caractère spécial (!@#$%...).";
  return null;
};

export default function SignUpPage() {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [form,  setForm]  = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string>("");

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSelectChange =
    (field: keyof FormState) =>
    (e: SelectChangeEvent<string>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSignUp = async () => {
    setError("");

    // Validation locale
    if (!form.fullName || !form.email || !form.password || !form.confirm || !form.address) {
      setError("Tous les champs obligatoires (*) doivent être remplis.");
      return;
    }

    const pwdError = validatePassword(form.password);
    if (pwdError) { setError(pwdError); return; }

    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const payload = {
      email:          form.email,
      password:       form.password,
      full_name:      form.fullName,
      office_address: form.address,
      role:           (form.role || "user") as "admin" | "user",
      ...(form.phone && { phone_nbr: form.phone }),
    };

    try {
      await registerUser(payload).unwrap();
      navigate(ROUTES.HOME);

    } catch (err: any) {
      const data = err?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const messages = data.errors
          .map((e: any) => e.message ?? e.msg ?? JSON.stringify(e))
          .join(" | ");
        setError(messages);
      } else if (data?.detail && typeof data.detail === "string") {
        setError(data.detail);
      } else {
        setError("Erreur lors de la création du compte.");
      }
    }
  };

  return (
    <Box sx={{
      minHeight:       "100vh",
      display:         "flex",
      justifyContent:  "center",
      alignItems:      "center",
      backgroundColor: colors.bgPage,
      py: 4,
    }}>
      <Paper sx={{ padding: 4, width: "90%", maxWidth: 560, borderRadius: 3 }}>

        {/* Logo */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <img src={logo} alt="Scanalyze" height={50} />
        </Box>

        {/* Personal Information */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <PersonIcon sx={{ color: colors.blueMuted }} />
          <Typography variant="body2" color={colors.blueMuted} fontWeight="bold" letterSpacing={1}>
            PERSONAL INFORMATION
          </Typography>
        </Box>

        {/* Full Name + Phone */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth label="Full Name *" placeholder="John Doe"
            value={form.fullName} onChange={handleChange("fullName")}
          />
          <TextField
            fullWidth label="Phone Number" placeholder="+216 12 345 678"
            value={form.phone} onChange={handleChange("phone")}
          />
        </Box>

        {/* Role */}
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={form.role}
              onChange={handleSelectChange("role")}
              label="Role"
            >
              <MenuItem value="" disabled>Select role</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Office Address */}
        <TextField
          fullWidth
          label="Office Address *"
          placeholder="Street name, City, Postal Code, Country"
          value={form.address}
          onChange={handleChange("address")}
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 3 }} />

        {/* Account Security */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <SecurityIcon sx={{ color: colors.blueMuted }} />
          <Typography variant="body2" color={colors.blueMuted} fontWeight="bold" letterSpacing={1}>
            ACCOUNT SECURITY
          </Typography>
        </Box>

        {/* Email */}
        <TextField
          fullWidth
          label="Professional Email *"
          placeholder="email@company.com"
          value={form.email}
          onChange={handleChange("email")}
          sx={{ mb: 2 }}
          autoComplete="email"
        />

        {/* Password + Confirm */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            fullWidth label="Password *" type="password"
            helperText="Min. 8 cars, 1 majuscule, 1 chiffre, 1 caractère spécial"
            value={form.password}
            onChange={handleChange("password")}
            autoComplete="new-password"
          />
          <TextField
            fullWidth label="Confirm Password *" type="password"
            value={form.confirm}
            onChange={handleChange("confirm")}
            autoComplete="new-password"
          />
        </Box>

        {/* Erreur */}
        {error && (
          <Typography color="error" variant="body2" mt={2} sx={{ whiteSpace: "pre-line" }}>
            {error}
          </Typography>
        )}

        {/* Submit */}
        <Button
          fullWidth variant="contained"
          sx={{ mt: 3, py: 1.5, fontSize: "1rem" }}
          onClick={handleSignUp}
          disabled={isLoading}
        >
          {isLoading
            ? <CircularProgress size={24} color="inherit" />
            : "Create Account →"
          }
        </Button>

        {/* Login link */}
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