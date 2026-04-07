// ─────────────────────────────────────────────
//  containers/Login/index.tsx
//  Page publique — avec React Hook Form + Redux
//  Concepts : useForm, register, handleSubmit,
//             formState.errors, useDispatch, useSelector
// ─────────────────────────────────────────────

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { ROUTES } from "../../navigation/routes";
import { loginRequest } from "../../store/auth/authSlice";
import {
  selectIsLoading,
  selectAuthError,
  selectToken,
} from "../../store/auth/authSelectors";

// ── Type des données du formulaire ────────────
interface LoginFormData {
  email:      string;
  password:   string;
  rememberMe: boolean;
}

// ─────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── React Hook Form ───────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // ── Redux state ───────────────────────────
  const isLoading  = useSelector(selectIsLoading);
  const reduxError = useSelector(selectAuthError);
  const token      = useSelector(selectToken);

  // ── Redirection si connecté ───────────────
  useEffect(() => {
    if (token) navigate(ROUTES.DASHBOARD);
  }, [token, navigate]);

  // ── Soumission → Redux/Saga ───────────────
  const onSubmit = (data: LoginFormData) => {
    dispatch(loginRequest({ email: data.email, password: data.password }));
  };

  // ── Rendu ─────────────────────────────────
  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logoContainer}>
          <div style={styles.logoBox}>
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <rect width="52" height="52" rx="14" fill="#1a3a8f" />
              <path
                d="M10 16h10v20H10V16zm12 0h14a7 7 0 010 14h-7v6H22V16zm7 8h6a1.5 1.5 0 000-3h-6v3z"
                fill="white"
              />
            </svg>
          </div>
          <h1 style={styles.title}>Scanalyze</h1>
          <p style={styles.subtitle}>Intelligent Document Processing</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>

          {/* Email */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email or Username</label>
            <input
              type="text"
              placeholder="Enter your email or username"
              style={styles.input}
              {...register("email", {
                required: "Veuillez remplir ce champ",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Adresse email invalide",
                },
              })}
            />
            {errors.email && (
              <div style={styles.errorBox}>⚠️ {errors.email.message}</div>
            )}
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              style={styles.input}
              {...register("password", {
                required: "Veuillez remplir ce champ",
                minLength: {
                  value: 6,
                  message: "Minimum 6 caractères",
                },
              })}
            />
            {errors.password && (
              <div style={styles.errorBox}>⚠️ {errors.password.message}</div>
            )}
          </div>

          {/* Remember me */}
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              style={styles.checkbox}
              {...register("rememberMe")}
            />
            Remember me
          </label>

          {/* Erreur Redux (backend) */}
          {reduxError && (
            <div style={styles.errorBox}>⚠️ {reduxError}</div>
          )}

          {/* Bouton LOGIN */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.loginBtn,
              opacity: isLoading ? 0.7 : 1,
              cursor:  isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Connexion en cours..." : "LOGIN"}
          </button>

        </form>

        {/* Lien Sign Up */}
        <p style={styles.signupText}>
          Don't have an account?{" "}
          <span
            style={styles.signupLink}
            onClick={() => navigate(ROUTES.SIGNUP)}
          >
            Sign Up
          </span>
        </p>

      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "24px 16px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e0e0e0",
    padding: "40px 48px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
  },
  logoContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "32px",
  },
  logoBox:  { marginBottom: "12px" },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 4px",
    letterSpacing: "1px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#1a3a8f",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    fontSize: "14px",
    border: "1.5px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    color: "#111827",
    backgroundColor: "#fff",
    boxSizing: "border-box",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#374151",
    cursor: "pointer",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: "#1a3a8f",
    cursor: "pointer",
  },
  errorBox: {
    fontSize: "13px",
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "10px 14px",
  },
  loginBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#1a3a8f",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    border: "none",
    borderRadius: "8px",
    marginTop: "4px",
  },
  signupText: {
    textAlign: "center",
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "24px",
    marginBottom: 0,
  },
  signupLink: {
    color: "#1a3a8f",
    fontWeight: "700",
    cursor: "pointer",
  },
};