// src/features/auth/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../../services/authApi";
import type { RootState } from "../../app/store";

interface AuthState {
  accessToken:     string | null;
  refreshToken:    string | null;
  isAuthenticated: boolean;
  role:            "admin" | "user" | null;
  user:            { role: "admin" | "user" } | null;
}

function parseToken(token: string | null): { role: "admin" | "user" | null } {
  if (!token) return { role: null };
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { role: payload.role ?? null };
  } catch {
    return { role: null };
  }
}

const storedToken = localStorage.getItem("access_token");
const parsedRole  = parseToken(storedToken).role;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    accessToken:     storedToken,
    refreshToken:    localStorage.getItem("refresh_token"),
    isAuthenticated: !!storedToken,
    role:            parsedRole,
    user:            parsedRole ? { role: parsedRole } : null,
  } as AuthState,

  reducers: {
    logout: (state) => {
      state.accessToken     = null;
      state.refreshToken    = null;
      state.isAuthenticated = false;
      state.role            = null;
      state.user            = null;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
  },

  extraReducers: (builder) => {
    // ✅ Login fulfilled — inchangé
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        const role            = parseToken(payload.access_token).role;
        state.accessToken     = payload.access_token;
        state.refreshToken    = payload.refresh_token;
        state.isAuthenticated = true;
        state.role            = role;
        state.user            = role ? { role } : null;
        localStorage.setItem("access_token",  payload.access_token);
        localStorage.setItem("refresh_token", payload.refresh_token);
      }
    );

    // ✅ CORRIGÉ : register ne touche plus au state auth du tout
    // Le backend ne retourne pas de token, et l'utilisateur doit
    // vérifier son email avant de pouvoir se connecter
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectRole            = (state: RootState) => state.auth.role;
export const selectAccessToken     = (state: RootState) => state.auth.accessToken;
export const selectUser            = (state: RootState) => state.auth.user;