// LoginPage — user authentication form
// Supports two mock accounts (admin and user) until real API is connected
import { useState } from "react";
import {
  Box, Paper, TextField, Button,
  Typography, Checkbox, FormControlLabel, Link,
} from "@mui/material";
import { useAppDispatch } from "@app/hooks";
import { setCredentials } from "@features/auth/authSlice";
import { useNavigate }    from "react-router-dom";
import { colors }         from "@theme";
import logo               from "@assets/logo.svg";
import { ROUTES }         from "@constants";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Controlled form fields — all typed explicitly as required by team convention
  const [email,      setEmail]      = useState<string>("");
  const [password,   setPassword]   = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error,      setError]      = useState<string>("");

  const handleLogin = () => {
    // Mock admin login — replace with real RTK Query call when backend is ready
    if (email === "admin@scanalyze.com" && password === "admin123") {
      dispatch(setCredentials({
        user:  { name: "Admin", email: "admin@scanalyze.com", role: "admin" },
        token: "admin-token",
      }));
      navigate(ROUTES.HOME);

    // Mock regular user login
    } else if (email === "user@scanalyze.com" && password === "user123") {
      dispatch(setCredentials({
        user:  { name: "User", email: "user@scanalyze.com", role: "user" },
        token: "user-token",
      }));
      navigate(ROUTES.HOME);

    } else {
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <Box sx={{
      height: "100vh",
      display: "flex", justifyContent: "center", alignItems: "center",
      backgroundColor: colors.bgPage,
    }}>
      <Paper sx={{ padding: 4, width: 400, borderRadius: 3 }}>

        {/* Logo */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <img src={logo} alt="Scanalyze" height={50} />
        </Box>

        {/* Email and password fields */}
        <TextField
          fullWidth label="Email" margin="normal"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth label="Password" type="password" margin="normal"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />

        {/* Remember me checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              sx={{ color: colors.textMuted }}
            />
          }
          label={<Typography color={colors.textMuted} variant="body2">Remember me</Typography>}
          sx={{ mt: 1 }}
        />

        {/* Inline error message */}
        {error && (
          <Typography color="error" variant="body2" mt={1}>{error}</Typography>
        )}

        {/* Submit button */}
        <Button
          fullWidth variant="contained"
          sx={{ mt: 2, py: 1.5, fontSize: "1rem" }}
          onClick={handleLogin}
        >
          Sign In
        </Button>

        {/* Link to sign up */}
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
