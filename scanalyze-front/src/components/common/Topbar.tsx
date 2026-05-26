import { useState } from "react";
import {
  AppBar, Toolbar, Typography, Box, Avatar, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Tabs, Tab, InputAdornment, CircularProgress, Alert,
} from "@mui/material";
import LogoutIcon    from "@mui/icons-material/Logout";
import EditIcon      from "@mui/icons-material/Edit";
import EmailIcon     from "@mui/icons-material/Email";
import LockIcon      from "@mui/icons-material/Lock";
import PhoneIcon     from "@mui/icons-material/Phone";
import Visibility    from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector }    from "react-redux";
import { useAppDispatch } from "@app/hooks";
import { PAGE_TITLES, DEFAULT_TITLE, ROUTES } from "@constants";
import { selectCurrentUser, logout } from "@features/auth/authSlice";
import { colors, dialogSx, btnPrimarySx } from "@theme";
 
// ─── Types ─────────────────────────────────────────────────────────────────
 
type TabValue = "email" | "password" | "phone";
 
interface FormState {
  email:           string;
  newPassword:     string;
  confirmPassword: string;
  phone:           string;
}
 
// ─── Sx constants ───────────────────────────────────────────────────────────
 
const iconBtnSx = {
  color: `${colors.textWhite}b3`,
  "&:hover": { color: colors.textWhite, bgcolor: `${colors.textWhite}1f` },
} as const;
 
const logoutBtnSx = {
  color: `${colors.textWhite}b3`,
  "&:hover": { color: colors.red, bgcolor: `${colors.red}18` },
} as const;
 
// ─── Component ─────────────────────────────────────────────────────────────
 
export default function Topbar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const user      = useSelector(selectCurrentUser);
 
  const title    = PAGE_TITLES[location.pathname] || DEFAULT_TITLE;
  const userName = user?.name ?? "Utilisateur";
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase();
 
  // ── Dialog state ──────────────────────────────────────────────────────────
  const [open, setOpen]             = useState(false);
  const [activeTab, setActiveTab]   = useState<TabValue>("email");
  const [showPassword, setShowPass] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
 
  const [form, setForm] = useState<FormState>({
    email: "", newPassword: "", confirmPassword: "", phone: "",
  });
 
  // ── Handlers ──────────────────────────────────────────────────────────────
 
  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
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
      if (!form.phone || !/^(\+216)?[2345789]\d{7}$/.test(form.phone.replace(/\s/g, ""))) {
        setErrorMsg("Veuillez saisir un numéro tunisien valide (ex: 20 123 456 ou +216 20 123 456).");
        return;
      }
    }
 
    try {
      setLoading(true);
      // TODO : remplacer par votre appel RTK Query / axios
      await new Promise((res) => setTimeout(res, 1000));
 
      const labels: Record<TabValue, string> = {
        email: "Email", password: "Mot de passe", phone: "Numéro de téléphone",
      };
      setSuccessMsg(`${labels[activeTab]} mis à jour avec succès.`);
      setForm({ email: "", newPassword: "", confirmPassword: "", phone: "" });
    } catch {
      setErrorMsg("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };
 
  // ── Render ────────────────────────────────────────────────────────────────
 
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">{title}</Typography>
 
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="body2">{userName}</Typography>
 
            <Avatar sx={{ width: 35, height: 35, bgcolor: "primary.dark" }}>
              {initials}
            </Avatar>
 
            <Tooltip title="Modifier le compte" placement="bottom">
              <IconButton size="small" onClick={handleOpen} sx={iconBtnSx}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
 
            <Tooltip title="Déconnexion" placement="bottom">
              <IconButton size="small" onClick={handleLogout} sx={logoutBtnSx}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
 
      {/* ── Dialog modifier le compte ──────────────────────────────────────── */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth PaperProps={{ sx: dialogSx }}>
        <DialogTitle sx={{ pb: 0 }}>Modifier mon compte</DialogTitle>
 
        <DialogContent sx={{ pt: 1 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 3 }}>
            <Tab value="email"    label="Email"        icon={<EmailIcon fontSize="small" />} iconPosition="start" />
            <Tab value="password" label="Mot de passe" icon={<LockIcon  fontSize="small" />} iconPosition="start" />
            <Tab value="phone"    label="Téléphone"    icon={<PhoneIcon fontSize="small" />} iconPosition="start" />
          </Tabs>
 
          {errorMsg   && <Alert severity="error"   sx={{ mb: 2 }}>{errorMsg}</Alert>}
          {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
 
          {/* ── Email ── */}
          {activeTab === "email" && (
            <TextField
              label="Nouvel email" type="email" value={form.email}
              onChange={handleChange("email")} fullWidth autoFocus
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment> }}
            />
          )}
 
          {/* ── Mot de passe ── */}
          {activeTab === "password" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Nouveau mot de passe" value={form.newPassword}
                type={showPassword ? "text" : "password"}
                onChange={handleChange("newPassword")} fullWidth autoFocus
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPass((v) => !v)} edge="end">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Confirmer le mot de passe" value={form.confirmPassword}
                type={showPassword ? "text" : "password"}
                onChange={handleChange("confirmPassword")} fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment> }}
              />
            </Box>
          )}
 
          {/* ── Téléphone ── */}
          {activeTab === "phone" && (
            <TextField
              label="Nouveau numéro de téléphone" type="tel" value={form.phone}
              onChange={handleChange("phone")} fullWidth autoFocus placeholder="+216 20 123 456"
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" /></InputAdornment> }}
            />
          )}
        </DialogContent>
 
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit" disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={handleSave} variant="contained" disabled={loading} sx={btnPrimarySx}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {loading ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}