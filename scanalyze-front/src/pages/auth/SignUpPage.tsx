// src/pages/auth/SignUpPage.tsx  (frontoffice)
import { useState } from "react";
import {
  Box, Paper, TextField, Button, Typography, Link,
  MenuItem, Select, InputLabel, FormControl, Divider,
  CircularProgress,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import PersonIcon   from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import { useNavigate }          from "react-router-dom";
import { useRegisterMutation }  from "@services/authApi";
import { colors }               from "@theme";
import logo                     from "@assets/logo.svg";
import { ROUTES }               from "@constants";
import type { RegisterRequest } from "@models/authModels";

interface FormState {
  fullName:  string;
  phone:     string;
  role:      "user" | "admin" | "";
  address:   string;
  email:     string;
  password:  string;
  confirm:   string;
}

const INITIAL_FORM: FormState = {
  fullName:  "",
  phone:     "",
  role:      "",
  address:   "",
  email:     "",
  password:  "",
  confirm:   "",
};

export default function SignUpPage() {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [form,  setForm]  = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string>("");

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSelectChange =
    (field: keyof FormState) =>
    (e: SelectChangeEvent<string>): void =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = (): string => {
    if (!form.fullName || !form.email || !form.password || !form.confirm || !form.address)
      return "Tous les champs obligatoires doivent être remplis";
    if (form.password !== form.confirm)
      return "Les mots de passe ne correspondent pas";
    if (form.password.length < 8)
      return "Le mot de passe doit contenir au moins 8 caractères";
    if (!/[0-9]/.test(form.password))
      return "Le mot de passe doit contenir au moins un chiffre";
    if (!/[A-Z]/.test(form.password))
      return "Le mot de passe doit contenir au moins une majuscule";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password))
      return "Le mot de passe doit contenir au moins un caractère spécial (!@#$%...)";
    return "";
  };

  const handleSignUp = async (): Promise<void> => {
    setError("");

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    const body: RegisterRequest = {
      email:          form.email,
      password:       form.password,
      full_name:      form.fullName,
      office_address: form.address,
      ...(form.phone && { phone_nbr: form.phone }),
      ...(form.role  && { role: form.role as "admin" | "user" }),
    };

    try {
      await registerUser(body).unwrap();
      navigate(ROUTES.LOGIN, {
        state: { message: "Compte créé ! En attente d'activation par un admin." },
      });

    } catch (err: unknown) {
      console.error("Register error:", err);
      const apiErr = err as {
        data?: {
          detail?: string;
          errors?: Array<{ field: string; message: string }>;
        };
      };
      const errors = apiErr?.data?.errors;
      if (errors && Array.isArray(errors)) {
        setError(errors.map((e) => e.message).join(" | "));
      } else {
        setError(
          apiErr?.data?.detail ??
          "Une erreur est survenue lors de la création du compte"
        );
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
      py:              4,
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
        <FormControl fullWidth sx={{ mb: 2 }}>
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

        {/* Office Address */}
        <TextField
          fullWidth
          label="Office Address *"
          placeholder="Street, City, Postal Code, Country"
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
          type="email"
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
            helperText="Min. 8 chars, 1 majuscule, 1 chiffre, 1 caractère spécial"
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