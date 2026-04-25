//importation le hook useState pour gérer les etats locaux du formulaire
import { useState } from "react";
//les composants MUI utilisés dans la page 
import { Box, Paper, TextField, Button, Typography, Checkbox, FormControlLabel, Link } from "@mui/material";
//useDispatch : hook typé pour envoyer des actions Redux
import { useAppDispatch } from "../../app/hooks";
//actions Redux n
import { setCredentials } from "../../features/auth/authSlice";
//hook pour naviguer vers une autre page aprés le login 
import { useNavigate } from "react-router-dom";
//palett de couleurs de Scanalyze
import { colors } from "../../theme";
//image de logo 
import logo from "../../assets/logo.svg";

export default function LoginPage() {
  //fonction pour envoyer des actions au store Redux
  const dispatch  = useAppDispatch();
  //focntion pour changer de page 
  const navigate  = useNavigate();
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error,      setError]      = useState("");

  const handleLogin = () => {
    if (email === "admin@scanalyze.com" && password === "admin123") {
      dispatch(setCredentials({ 
        user: { name: "Admin", email: "admin@scanalyze.com", role: "admin" },
        token: "admin-token"
      }));
      navigate("/");
    } else if (email === "user@scanalyze.com" && password === "user123") {
      dispatch(setCredentials({ 
        user: { name: "User", email: "user@scanalyze.com", role: "user" },
        token: "user-token"
      }));
      navigate("/");
    } else {
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: colors.bgPage }}>
      <Paper sx={{ padding: 4, width: 400, borderRadius: 3 }}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <img src={logo} alt="Scanalyze" height={50} />
        </Box>
        <TextField fullWidth label="Email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
        <FormControlLabel
          control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} sx={{ color: colors.textMuted }} />}
          label={<Typography color={colors.textMuted} variant="body2">Remember me</Typography>}
          sx={{ mt: 1 }}
        />
        {error && <Typography color="error" variant="body2" mt={1}>{error}</Typography>}
        <Button fullWidth variant="contained" sx={{ mt: 2, py: 1.5, fontSize: "1rem" }} onClick={handleLogin}>
          Sign In
        </Button>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" color={colors.textMuted}>
            Don't have an account?{" "}
            <Link href="/signup" underline="hover" color="primary.light">Sign Up</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}