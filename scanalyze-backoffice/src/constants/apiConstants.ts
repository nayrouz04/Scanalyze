export const API_BASE_URL = 'http://localhost:8000/api/v1';

console.log('API_BASE_URL:', API_BASE_URL);

export const API_TAGS = {
  DOCUMENTS: 'Document',
  USERS:     'User',
  JOBS:      'Job',
  DASHBOARD: 'Dashboard',
} as const;

export const API_ENDPOINTS = {

  // Auth
  LOGIN:           '/auth/token',
  REGISTER:        '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  CHANGE_PASSWORD: '/auth/change-password',

  // Documents
  DOCUMENTS:      '/documents/',
  MY_DOCUMENTS:   '/documents/me',
  UPLOAD:         '/documents/upload',
  DOCUMENT_BY_ID: (id: string) => `/documents/${id}`,

  // Jobs / OCR Pipeline
  JOBS:      '/jobs/',
  JOB_BY_ID: (id: string) => `/jobs/${id}`,

  // Admin
  DASHBOARD:     '/admin/dashboard',
  USERS:         '/admin/users',
  USERS_PENDING: '/admin/users/pending',           // ← ajout
  USER_BY_ID:    (id: string) => `/admin/users/${id}`,
  ENABLE_USER:   (id: string) => `/admin/users/${id}/enable`,
  DISABLE_USER:  (id: string) => `/admin/users/${id}/disable`,

} as const;