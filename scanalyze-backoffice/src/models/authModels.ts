export interface LoginRequest {
  login:    string;
  password: string;
}

export interface LoginResponse {
  access_token:  string;
  refresh_token: string;
  token_type:    string;
  expires_in:    number;
  user: {
    id:        string;
    email:     string;
    full_name: string;
    role:      string;
  };
}

export interface RegisterRequest {
  email:          string;
  password:       string;
  full_name:      string;
  office_address: string;
  role?:          'admin' | 'user';
}

export interface RegisterResponse {
  id:              string;
  email:           string;
  full_name:       string;
  role:            string;
  is_active:       boolean;
  is_verified:     boolean;
  account_enabled: boolean;
  created_at:      string;
  office_address:  string;
  phone_nbr:       string | null;
  birth_date:      string | null;
}

export interface ForgotPasswordRequest { email: string; }

export interface ChangePasswordRequest {
  current_password: string;
  new_password:     string;
}

export interface AdminUser {
  id:              string;
  email:           string;
  full_name:       string;
  office_address:  string;
  phone_nbr?:      string;
  role:            'admin' | 'user';
  is_active:       boolean;
}

export interface DashboardStats {
  documents_processed?:      number;
  extraction_success_rate?:  number;
  low_confidence_documents?: number;
  most_processed_doc_type?:  string | null;
  total_users?:              number;
  total_documents?:          number;
  total_jobs?:               number;
  total_errors?:             number;
}
