// src/pages/auth/LoginPage.tsx
import { useState } from "react";
import {
  Box, Paper, TextField, Button, Typography,
  Checkbox, FormControlLabel, Link, CircularProgress,
} from "@mui/material";
import { useNavigate }       from "react-router-dom";
import { useLoginMutation }  from "@services/authApi";
import { colors }            from "@theme";
import logo                  from "@assets/logo.svg";
import { ROUTES }            from "@constants";

export default function LoginPage() {
  const navigate = useNavigate();

  const [loginUser, { isLoading }] = useLoginMutation();

  const [email,      setEmail]      = useState<string>("");
  const [password,   setPassword]   = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error,      setError]      = useState<string>("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return; // 🛡️ garde

    try {
      setError("");

      const result = await loginUser({ login: email, password }).unwrap();

      const parsedRole = result.user.role;

      if (rememberMe) {
        localStorage.setItem("remember_me", "true");
      }

      if (parsedRole === "admin") {
        navigate(ROUTES.HOME);
      } else {
        setError("Accès réservé aux administrateurs.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }

    } catch (err: any) {
      console.error(err);

      const status = err?.status;
      if (status === 401) {
        setError("Email ou mot de passe incorrect.");
      } else if (status === 403) {
        setError("Votre compte n'est pas encore vérifié. Vérifiez votre boîte mail.");
      } else if (status === 422) {
        setError("Email ou mot de passe invalide.");
      } else if (status === 400) {
        setError("Requête invalide. Vérifiez vos informations.");
      } else {
        setError("Une erreur est survenue. Réessayez plus tard.");
      }
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

        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <img src={logo} alt="Scanalyze" height={50} />
        </Box>

        <Typography variant="h5" fontWeight={700} sx={{ textAlign: "center" }} mb={2}>
          Sign In
        </Typography>

        <TextField
          fullWidth
          label="Email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="email"
        />

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

        {error && (
          <Typography color="error" variant="body2" mt={1}>
            {error}
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2, py: 1.5, fontSize: "1rem" }}
          onClick={handleLogin}
          disabled={isLoading || !email.trim() || !password.trim()}
        >
          {isLoading
            ? <CircularProgress size={24} color="inherit" />
            : "Sign In"
          }
        </Button>

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