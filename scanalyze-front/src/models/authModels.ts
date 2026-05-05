// authModels.ts — TypeScript interfaces for authentication-related data
// Used across authSlice.ts, authApi.ts, and PrivateRoute.tsx

// User — represents an authenticated user in the system
export interface User {
  name:  string;
  email: string;
  role:  "admin" | "user";
}

// AuthState — shape of the auth slice in the Redux store
export interface AuthState {
  user:            User | null;
  token:           string | null;
  isAuthenticated: boolean;
}

// SetCredentialsPayload — data dispatched after a successful login response
export interface SetCredentialsPayload {
  user:  User;
  token: string;
}
