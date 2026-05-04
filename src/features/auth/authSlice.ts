// authSlice.ts — Redux slice managing authentication state
// Handles login (setCredentials) and logout actions
import { createSlice }        from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, SetCredentialsPayload } from "@models/authModels";

// Initial state — no user is authenticated at app startup
const initialState: AuthState = {
  user:            null,
  token:           null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // setCredentials — called after a successful login
    // Stores the user object, token, and marks the session as authenticated
    setCredentials(state, action: PayloadAction<SetCredentialsPayload>) {
      state.user            = action.payload.user;
      state.token           = action.payload.token;
      state.isAuthenticated = true;
    },

    // logout — clears all auth state and returns to the initial unauthenticated state
    logout(state) {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
