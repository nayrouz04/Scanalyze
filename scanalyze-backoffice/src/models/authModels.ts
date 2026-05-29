// src/models/authModels.ts
export interface LoginRequest {
  login: string;      // email dans ton API
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  office_address: string;
  role?: 'admin' | 'user';
}

export interface RegisterResponse {
  access_token: string;
}

export interface ForgotPasswordRequest { email: string; }

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  office_address: string;
  phone_nbr?: string;
  role: 'admin' | 'user';
  is_active: boolean;
}

export interface DashboardStats {
  total_users: number;
  total_documents: number;
  total_jobs: number;
  // adapte selon la réponse réelle de ton API
}