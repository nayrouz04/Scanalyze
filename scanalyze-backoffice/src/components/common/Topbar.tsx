import { useState } from "react";
import {
  AppBar, Toolbar, Typography, Box, Avatar, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Tabs, Tab, InputAdornment, CircularProgress, Alert,
} from "@mui/material";
import LogoutIcon        from "@mui/icons-material/Logout";
import EditIcon          from "@mui/icons-material/Edit";
import EmailIcon         from "@mui/icons-material/Email";
import LockIcon          from "@mui/icons-material/Lock";
import PhoneIcon         from "@mui/icons-material/Phone";
import Visibility        from "@mui/icons-material/Visibility";
import VisibilityOff     from "@mui/icons-material/VisibilityOff";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch }           from "@app/hooks";
import { logout }                   from "@features/auth/authSlice";
import { ROUTES }                   from "@constants/routeConstants";
import { PAGE_TITLES, DEFAULT_TITLE, DEFAULT_USERNAME } from "@constants";
 
// ─── Types ────────────────────────────────────────────────────────────────────
 
type Props = { userName?: string };
 
type TabValue = "email" | "password" | "phone";
 
interface FormState {
  email:           string;
  newPassword:     string;
  confirmPassword: string;
  phone:           string;
}
 
// ─── Component ────────────────────────────────────────────────────────────────
 
export default function Topbar({ userName = DEFAULT_USERNAME }: Props) {
  const location = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
 
  // Dialog state
  const [open, setOpen]               = useState(false);
  const [activeTab, setActiveTab]     = useState<TabValue>("email");
  const [showPassword, setShowPass]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [successMsg, setSuccessMsg]   = useState<string | null>(null);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
 
  const [form, setForm] = useState<FormState>({
    email:           "",
    newPassword:     "",
    confirmPassword: "",
    phone:           "",
  });
 
  // Page title + initials
  const title    = PAGE_TITLES[location.pathname] || DEFAULT_TITLE;
  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "A";
 
  // ── Handlers ────────────────────────────────────────────────────────────────
 
  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  };
 
  const handleOpen = () => {
    setOpen(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    setForm({ email: "", newPassword: "", confirmPassword: "", phone: "" });
  };
 
  const handleClose = () => {
    setOpen(false);
    setSuccessMsg(null);
    setErrorMsg(null);
  };
 
  const handleTabChange = (_: React.SyntheticEvent, val: TabValue) => {
    setActiveTab(val);
    setSuccessMsg(null);
    setErrorMsg(null);
  };
 
  const handleChange = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
 
  const handleSave = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
 
    // ── Validation basique ──────────────────────────────────────────────────
    if (activeTab === "email") {
      if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setErrorMsg("Veuillez saisir une adresse email valide.");
        return;
      }
    }
    if (activeTab === "password") {
      if (!form.newPassword || form.newPassword.length < 6) {
        setErrorMsg("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setErrorMsg("Les mots de passe ne correspondent pas.");
        return;
      }
    }
    if (activeTab === "phone") {
      // Numéros tunisiens : 8 chiffres commençant par 2, 3, 4, 5, 7 ou 9 (optionnellement préfixé par +216)
      if (!form.phone || !/^(\+216)?[2345789]\d{7}$/.test(form.phone.replace(/\s/g, ""))) {
        setErrorMsg("Veuillez saisir un numéro tunisien valide (ex: 20 123 456 ou +216 20 123 456).");
        return;
      }
    }
 
    // ── Appel API (à remplacer par votre endpoint réel) ─────────────────────
    try {
      setLoading(true);
 
      // TODO : remplacer par votre appel RTK Query / axios
      await new Promise((res) => setTimeout(res, 1000)); // simulation
 
      const labels: Record<TabValue, string> = {
        email:    "Email",
        password: "Mot de passe",
        phone:    "Numéro de téléphone",
      };
      setSuccessMsg(`${labels[activeTab]} mis à jour avec succès.`);
      setForm({ email: "", newPassword: "", confirmPassword: "", phone: "" });
    } catch {
      setErrorMsg("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };
 
  // ── Render ──────────────────────────────────────────────────────────────────
 
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
 
          {/* Titre de la page courante */}
          <Typography variant="h6">{title}</Typography>
 
          {/* Droite : nom + avatar + modifier + déconnexion */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="body2">{userName}</Typography>
 
            <Avatar sx={{ width: 35, height: 35, bgcolor: "primary.dark" }}>
              {initials}
            </Avatar>
 
            {/* Bouton modifier le compte */}
            <Tooltip title="Modifier le compte">
              <IconButton
                onClick={handleOpen}
                size="small"
                sx={{
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.12)",
                    color:   "white",
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
 
            {/* Déconnexion */}
            <Tooltip title="Déconnexion">
              <IconButton
                onClick={handleLogout}
                size="small"
                sx={{
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(239, 68, 68, 0.15)",
                    color:   "#ef4444",
                  },
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
 
        </Toolbar>
      </AppBar>
 
      {/* ── Dialog modifier le compte ────────────────────────────────────── */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 0 }}>Modifier mon compte</DialogTitle>
 
        <DialogContent sx={{ pt: 1 }}>
          {/* Onglets */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab value="email"    label="Email"    icon={<EmailIcon fontSize="small" />} iconPosition="start" />
            <Tab value="password" label="Mot de passe" icon={<LockIcon fontSize="small" />}  iconPosition="start" />
            <Tab value="phone"    label="Téléphone" icon={<PhoneIcon fontSize="small" />} iconPosition="start" />
          </Tabs>
 
          {/* Messages */}
          {errorMsg   && <Alert severity="error"   sx={{ mb: 2 }}>{errorMsg}</Alert>}
          {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
 
          {/* ── Email ── */}
          {activeTab === "email" && (
            <TextField
              label="Nouvel email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              fullWidth
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          )}
 
          {/* ── Mot de passe ── */}
          {activeTab === "password" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Nouveau mot de passe"
                type={showPassword ? "text" : "password"}
                value={form.newPassword}
                onChange={handleChange("newPassword")}
                fullWidth
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPass((v) => !v)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Confirmer le mot de passe"
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}
 
          {/* ── Téléphone ── */}
          {activeTab === "phone" && (
            <TextField
              label="Nouveau numéro de téléphone"
              type="tel"
              value={form.phone}
              onChange={handleChange("phone")}
              fullWidth
              autoFocus
              placeholder="+216 20 123 456"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        </DialogContent>
 
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit" disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {loading ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}