// src/models/authModels.ts
 
export interface LoginRequest {
  login: string;      // email dans ton API Scanalyze
  password: string;
}
 
export interface LoginResponse {
  access_token:  string;
  refresh_token: string;
  // Le backend peut retourner le user inline — on rend optional pour être safe
  user?: {
    id:             string;
    full_name:      string;
    email:          string;
    role:           "admin" | "user";
    is_active:      boolean;
    office_address: string;
  };
}
 
export interface RegisterRequest {
  email:          string;
  password:       string;
  full_name:      string;
  office_address: string;
  phone_nbr?:     string;
  role?:          "admin" | "user";
}
 
export interface RegisterResponse {
  access_token:  string;
  refresh_token?: string;
}
 
export interface ForgotPasswordRequest {
  email: string;
}
 
export interface ChangePasswordRequest {
  current_password: string;
  new_password:     string;
}
 
// ── Admin models ──────────────────────────────────────────────────────────────
 
export interface AdminUser {
  id:             string;
  email:          string;
  full_name:      string;
  office_address: string;
  phone_nbr?:     string;
  role:           "admin" | "user";
  is_active:      boolean;
  created_at:     string;
}
 
export interface DashboardStats {
  total_users:     number;
  total_documents: number;
  total_jobs:      number;
}