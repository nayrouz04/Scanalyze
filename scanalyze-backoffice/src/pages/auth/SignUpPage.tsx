// src/pages/auth/SignUpPage.tsx  (backoffice)
import { useState }          from "react";
import {
  Box, Paper, TextField, Button, Typography,
  Link, MenuItem, Select, InputLabel, FormControl,
  Divider, CircularProgress, Alert,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import PersonIcon      from "@mui/icons-material/Person";
import SecurityIcon    from "@mui/icons-material/Security";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
  const [form,    setForm]    = useState<FormState>(INITIAL_FORM);
  const [error,   setError]   = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  // ✅ on garde l'email saisi même après reset du form pour l'afficher dans l'écran succès
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

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
      setSubmittedEmail(form.email);
      setSuccess(true);
      setForm(INITIAL_FORM);

    } catch (err: any) {
      const status = err?.status;
      const data   = err?.data;

      // ✅ Admin non vérifié qui re-soumet → email renvoyé côté backend, on affiche succès
      if (status === 409 && form.role === "admin") {
        setSubmittedEmail(form.email);
        setSuccess(true);
        setForm(INITIAL_FORM);
        return;
      }

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

  // ── Écran de succès ────────────────────────────────────────────────────────
  if (success) {
    return (
      <Box sx={{
        minHeight:       "100vh",
        display:         "flex",
        justifyContent:  "center",
        alignItems:      "center",
        backgroundColor: colors.bgPage,
        py: 4,
      }}>
        <Paper sx={{ padding: 4, width: "90%", maxWidth: 480, borderRadius: 3, textAlign: "center" }}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
            <img src={logo} alt="Scanalyze" height={50} />
          </Box>
          <CheckCircleIcon sx={{ fontSize: 64, color: colors.green, mb: 2 }} />
          <Typography variant="h6" fontWeight={700} color={colors.textWhite} mb={1}>
            Compte créé avec succès !
          </Typography>
          <Typography variant="body2" color={colors.textMuted} mb={3}>
            Un email de vérification a été envoyé à{" "}
            <strong>{submittedEmail}</strong>.
            <br />
            Veuillez cliquer sur le lien dans l'email pour activer votre compte.
            <br />
            <Typography component="span" variant="body2" color={colors.amber}>
              Ce lien expirera dans 24 heures.
            </Typography>
          </Typography>
          <Alert severity="info" sx={{ mb: 3, textAlign: "left" }}>
            Si vous ne trouvez pas l'email, vérifiez votre dossier spam ou
            re-soumettez le formulaire pour renvoyer le lien.
          </Alert>
          <Button
            fullWidth
            variant="contained"
            sx={{ py: 1.5 }}
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            Retour à la connexion
          </Button>
        </Paper>
      </Box>
    );
  }

  // ── Formulaire ─────────────────────────────────────────────────────────────
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

        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <img src={logo} alt="Scanalyze" height={50} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <PersonIcon sx={{ color: colors.blueMuted }} />
          <Typography variant="body2" color={colors.blueMuted} fontWeight="bold" letterSpacing={1}>
            PERSONAL INFORMATION
          </Typography>
        </Box>

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

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={form.role} onChange={handleSelectChange("role")} label="Role">
              <MenuItem value="" disabled>Select role</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TextField
          fullWidth
          label="Office Address *"
          placeholder="Street name, City, Postal Code, Country"
          value={form.address}
          onChange={handleChange("address")}
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <SecurityIcon sx={{ color: colors.blueMuted }} />
          <Typography variant="body2" color={colors.blueMuted} fontWeight="bold" letterSpacing={1}>
            ACCOUNT SECURITY
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Professional Email *"
          placeholder="email@company.com"
          value={form.email}
          onChange={handleChange("email")}
          sx={{ mb: 2 }}
          autoComplete="email"
        />

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

        {error && (
          <Typography color="error" variant="body2" mt={2} sx={{ whiteSpace: "pre-line" }}>
            {error}
          </Typography>
        )}

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