// src/pages/auth/LoginPage.tsx
import { useState } from "react";
import {
  Box, Paper, TextField, Button, Typography,
  Checkbox, FormControlLabel, Link, CircularProgress,
} from "@mui/material";
import { useNavigate }       from "react-router-dom";
import { useLoginMutation }  from "@services/authApi";
import { useAuth }           from "@app/hooks";
import { colors }            from "@theme";
import logo                  from "@assets/logo.svg";
import { ROUTES }            from "@constants";
 
// ─────────────────────────────────────────────────────────────────────────────
// LoginPage
// - Utilise useLoginMutation (RTK Query)
// - Le token est sauvegardé automatiquement par authSlice via extraReducers
// - Pas besoin de dispatch manuel : matchFulfilled le gère
// ─────────────────────────────────────────────────────────────────────────────
 
export default function LoginPage() {
  const navigate = useNavigate();
 
  // RTK Query mutation — isLoading géré automatiquement
  const [loginUser, { isLoading }] = useLoginMutation();
 
  // Hook auth — pour lire le rôle après login (et rediriger)
  const { isAdmin } = useAuth();
 
  // Form state
  const [email,      setEmail]      = useState<string>("");
  const [password,   setPassword]   = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error,      setError]      = useState<string>("");
 
  // ── Submit ──────────────────────────────────────────────────────────────────
 
  const handleLogin = async (): Promise<void> => {
    setError("");
 
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }
 
    try {
      // unwrap() relance l'erreur si la requête échoue
      // Le store Redux est mis à jour automatiquement via extraReducers/matchFulfilled
      const response = await loginUser({ login: email, password }).unwrap();
 
      // Remember me — persist optionnel
      if (rememberMe) {
        localStorage.setItem("remember_me", "true");
      }
 
      // Lire le rôle depuis le token pour la redirection
      // (authSlice l'a déjà parsé et stocké dans Redux)
      const payload = JSON.parse(atob(response.access_token.split(".")[1]));
      const role    = payload.role as "admin" | "user";
 
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate(ROUTES.HOME);
      }
 
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError("Email ou mot de passe incorrect");
    }
  };
 
  // Permet de soumettre avec la touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter") handleLogin();
  };
 
  // ── UI ──────────────────────────────────────────────────────────────────────
 
  return (
    <Box
      sx={{
        height:          "100vh",
        display:         "flex",
        justifyContent:  "center",
        alignItems:      "center",
        backgroundColor: colors.bgPage,
      }}
    >
      <Paper sx={{ padding: 4, width: 400, borderRadius: 3 }}>
 
        {/* Logo */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <img src={logo} alt="Scanalyze" height={50} />
        </Box>
 
        {/* Titre */}
          <Typography variant="h5" fontWeight={700} sx={{ textAlign: "center" }} mb={2}>
          Sign In
        </Typography>
 
        {/* Email */}
        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="email"
          autoFocus
        />
 
        {/* Mot de passe */}
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="current-password"
        />
 
        {/* Remember me */}
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              sx={{ color: colors.textMuted }}
            />
          }
          label={
            <Typography color={colors.textMuted} variant="body2">
              Remember me
            </Typography>
          }
          sx={{ mt: 1 }}
        />
 
        {/* Erreur */}
        {error && (
          <Typography color="error" variant="body2" mt={1}>
            {error}
          </Typography>
        )}
 
        {/* Bouton */}
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2, py: 1.5, fontSize: "1rem" }}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading
            ? <CircularProgress size={24} color="inherit" />
            : "Sign In"
          }
        </Button>
 
        {/* Lien Sign Up */}
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" color={colors.textMuted}>
            Don't have an account?{" "}
            <Link href={ROUTES.SIGNUP} underline="hover" color="primary.light">
              Sign Up
            </Link>
          </Typography>
        </Box>
 
      </Paper>
    </Box>
  );
}
 