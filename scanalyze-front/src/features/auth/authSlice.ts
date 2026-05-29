// src/features/auth/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
 
// ── Types ─────────────────────────────────────────────────────────────────────
 
interface AuthUser {
  role: "admin" | "user";
  name: string;       // ← ajouté pour Topbar
  email: string;      // ← ajouté pour usage futur
}
 
interface AuthState {
  accessToken:     string | null;
  refreshToken:    string | null;
  isAuthenticated: boolean;
  role:            "admin" | "user" | null;
  user:            AuthUser | null;
}
 
// ── Helpers ───────────────────────────────────────────────────────────────────
 
function parseRole(token: string | null): "admin" | "user" | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "admin" ? "admin" : "user";
  } catch {
    return null;
  }
}
 
// ── Initial state — hydraté depuis localStorage ───────────────────────────────
 
const storedToken   = localStorage.getItem("access_token");
const storedRefresh = localStorage.getItem("refresh_token");
const parsedRole    = parseRole(storedToken);
 
const initialState: AuthState = {
  accessToken:     storedToken,
  refreshToken:    storedRefresh,
  isAuthenticated: !!storedToken,
  role:            parsedRole,
  user: parsedRole
    ? {
        role:  parsedRole,
        name:  localStorage.getItem("user_name")  ?? "Utilisateur",
        email: localStorage.getItem("user_email") ?? "",
      }
    : null,
};
 
// ── Slice ─────────────────────────────────────────────────────────────────────
 
const authSlice = createSlice({
  name: "auth",
  initialState,
 
  reducers: {
    logout: (state) => {
      state.accessToken     = null;
      state.refreshToken    = null;
      state.isAuthenticated = false;
      state.role            = null;
      state.user            = null;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");
    },
  },
 
  extraReducers: (builder) => {
    // ── Login fulfilled ────────────────────────────────────────────────────────
    builder.addMatcher(
      (action): action is any =>
        action.type === "api/executeMutation/fulfilled" &&
        action.meta?.arg?.endpointName === "login",
      (state, action) => {
        const payload = action.payload as {
          access_token:  string;
          refresh_token: string;
          user?: { full_name?: string; email?: string; role?: string };
        };
 
        const role  = parseRole(payload.access_token);
        const name  = payload.user?.full_name  ?? "Utilisateur";
        const email = payload.user?.email      ?? "";
 
        state.accessToken     = payload.access_token;
        state.refreshToken    = payload.refresh_token ?? null;
        state.isAuthenticated = true;
        state.role            = role;
        state.user            = role ? { role, name, email } : null;
 
        localStorage.setItem("access_token",  payload.access_token);
        localStorage.setItem("refresh_token", payload.refresh_token ?? "");
        localStorage.setItem("user_name",     name);
        localStorage.setItem("user_email",    email);
      }
    );
 
    // ── Register fulfilled ────────────────────────────────────────────────────
    builder.addMatcher(
      (action): action is any =>
        action.type === "api/executeMutation/fulfilled" &&
        action.meta?.arg?.endpointName === "register",
      (state, action) => {
        const payload = action.payload as {
          access_token:   string;
          refresh_token?: string;
          user?: { full_name?: string; email?: string };
        };
 
        const role  = parseRole(payload.access_token);
        const name  = payload.user?.full_name ?? "Utilisateur";
        const email = payload.user?.email     ?? "";
 
        state.accessToken     = payload.access_token;
        state.refreshToken    = payload.refresh_token ?? null;
        state.isAuthenticated = true;
        state.role            = role;
        state.user            = role ? { role, name, email } : null;
 
        localStorage.setItem("access_token", payload.access_token);
        if (payload.refresh_token) {
          localStorage.setItem("refresh_token", payload.refresh_token);
        }
        localStorage.setItem("user_name",  name);
        localStorage.setItem("user_email", email);
      }
    );
  },
});
 
export const { logout } = authSlice.actions;
export default authSlice.reducer;
 
// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectRole            = (state: RootState) => state.auth.role;
export const selectAccessToken     = (state: RootState) => state.auth.accessToken;
export const selectUser            = (state: RootState) => state.auth.user;
 
// Alias — utilisé par Topbar.tsx
export const selectCurrentUser     = (state: RootState) => state.auth.user;