// src/pages/auth/LoginPage.tsx  (backoffice)
import { useState } from "react";
import {
  Box, Paper, TextField, Button, Typography,
  Checkbox, FormControlLabel, Link, CircularProgress,
} from "@mui/material";
import { useNavigate }       from "react-router-dom";
import { useLoginMutation }  from "@services/authApi";
import { useAppSelector }    from "@app/hooks";
import { selectRole }        from "@features/auth/authSlice";
import { colors }            from "@theme";
import logo                  from "@assets/logo.svg";
import { ROUTES }            from "@constants";

export default function LoginPage() {
  const navigate   = useNavigate();

  // RTK Query — la mutation met à jour Redux automatiquement via extraReducers
  const [loginUser, { isLoading }] = useLoginMutation();

  // Lecture du rôle depuis Redux après login (mis à jour par authSlice)
  const role = useAppSelector(selectRole);

  const [email,      setEmail]      = useState<string>("");
  const [password,   setPassword]   = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error,      setError]      = useState<string>("");

  const handleLogin = async () => {
    try {
      setError("");

      // unwrap() déclenche le catch si erreur HTTP
      await loginUser({ login: email, password }).unwrap();

      // À ce stade, authSlice a déjà mis à jour state.auth via matchFulfilled
      // On lit le rôle depuis le token décodé dans le slice
      // NB : on relit depuis localStorage car le state Redux n'est pas encore
      // disponible de façon synchrone ici — le slice l'a déjà persisté
      const storedToken = localStorage.getItem("access_token");
      let   parsedRole: string | null = null;

      if (storedToken) {
        try {
          const payload = JSON.parse(atob(storedToken.split(".")[1]));
          parsedRole    = payload.role ?? null;
        } catch { /* token malformé */ }
      }

      if (rememberMe) {
        localStorage.setItem("remember_me", "true");
      }

      // Redirection selon le rôle
      if (parsedRole === "admin") {
        navigate(ROUTES.HOME);   // HOME = /dashboard dans le backoffice
      } else {
        // Utilisateur normal sur le backoffice → non autorisé
        setError("Accès réservé aux administrateurs.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }

    } catch (err: any) {
      console.error(err);
      setError("Email ou mot de passe incorrect.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

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
        <Typography variant="h5" fontWeight={700} textAlign="center" mb={2}>
          Sign In
        </Typography>

        {/* Email */}
        <TextField
          fullWidth
          label="Email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="email"
        />

        {/* Password */}
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
          disabled={isLoading || !email || !password}
        >
          {isLoading
            ? <CircularProgress size={24} color="inherit" />
            : "Sign In"
          }
        </Button>

        {/* Lien signup */}
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