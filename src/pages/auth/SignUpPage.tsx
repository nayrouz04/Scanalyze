//le hook useStete pour gérer les etats locaux du formulaire 
import { useState } from "react";
//composant MUI utilisés
import { Box, Paper, TextField, Button, Typography, Link, MenuItem, Select, InputLabel, FormControl, Divider } from "@mui/material";
//PersonIcon : icone pour la section "Personal Information"
import PersonIcon   from "@mui/icons-material/Person";
//SecurityIcon : icon cadenas pour la section "Account Security"
import SecurityIcon from "@mui/icons-material/Security";
//hook pour naviguer vers une autre page aprés l'inscription
import { useNavigate } from "react-router-dom";
//palette de couleurs de scanalyze 
import { colors } from "../../theme";
import logo from "../../assets/logo.svg";

export default function SignUpPage() {
  //fonction pour xhanger de page programmatiquement
  const navigate = useNavigate();
  //un seul etat form qui contient tous les champs du formulaire dans un pbjet . chaque champs comme vide ""
  const [form, setForm] = useState({ fullName: "", birthDate: "", phone: "", role: "", address: "", email: "", password: "", confirm: "" });
  //etat pour le message d'erreur vide au depart
  const [error, setError] = useState("");

  //une fonction generique qui met à jour n'importe quel champs du formulaire 
  const handleChange = (field: string) => (e: any) => setForm({ ...form, [field]: e.target.value });

  //vrifie que les champs obligatoires ne sont pas vides sinon il affiche un message d'erreur 
  const handleSignUp = () => {
    if (!form.fullName || !form.email || !form.password || !form.confirm) {
      setError("Tous les champs obligatoires doivent être remplis"); return;
    }

    //verifie que le password=confirm sinn affcihe l'erreur 
    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas"); return;
    }
    //si tout  est valide affiche un laerte de confirmation redirige login
    alert("Compte créé ! En attente d'activation par un admin.");
    navigate("/login");
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: colors.bgPage, py: 4 }}>
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
          <TextField fullWidth label="Full Name" placeholder="John Doe" value={form.fullName} onChange={handleChange("fullName")} />
          <TextField fullWidth label="Date of Birth" value={form.birthDate} onChange={handleChange("birthDate")}
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField fullWidth label="Phone Number" placeholder="0123456789" value={form.phone} onChange={handleChange("phone")} />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={form.role} onChange={handleChange("role")} label="Role">
              <MenuItem value="" disabled>Select role</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TextField fullWidth label="Office Address" placeholder="Street name, City, Postal Code, Country" value={form.address} onChange={handleChange("address")} sx={{ mb: 2 }} />

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <SecurityIcon sx={{ color: colors.blueMuted }} />
          <Typography variant="body2" color={colors.blueMuted} fontWeight="bold" letterSpacing={1}>
            ACCOUNT SECURITY
          </Typography>
        </Box>

        <TextField fullWidth label="Professional Email" placeholder="email@company.com" value={form.email} onChange={handleChange("email")} sx={{ mb: 2 }} />

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField fullWidth label="Password" type="password" helperText="Min. 8 chars with 1 number" value={form.password} onChange={handleChange("password")} />
          <TextField fullWidth label="Confirm Password" type="password" value={form.confirm} onChange={handleChange("confirm")} />
        </Box>

        {error && <Typography color="error" variant="body2" mt={2}>{error}</Typography>}

        <Button fullWidth variant="contained" sx={{ mt: 3, py: 1.5, fontSize: "1rem" }} onClick={handleSignUp}>
          Create Account →
        </Button>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" color={colors.textMuted}>
            Déjà un compte ?{" "}
            <Link href="/setCredentials" underline="hover" color="primary.light">Se connecter</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}