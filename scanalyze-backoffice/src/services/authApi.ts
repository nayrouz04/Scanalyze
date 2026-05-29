// src/services/authApi.ts
import { baseApi } from './api';
import { API_ENDPOINTS } from '../constants/apiConstants'; // ← ajouter
import type {
  LoginRequest, LoginResponse,
  RegisterRequest, RegisterResponse,
  ForgotPasswordRequest, ChangePasswordRequest,
} from '../models/authModels';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: API_ENDPOINTS.LOGIN,           // ← au lieu de '/auth/token' hardcodé
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.REGISTER,        // ← au lieu de '/auth/register'
        method: 'POST',
        body,
      }),
    }),

    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.FORGOT_PASSWORD, // ← au lieu de '/auth/forgot-password'
        method: 'POST',
        body,
      }),
    }),

    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.CHANGE_PASSWORD, // ← au lieu de '/auth/change-password'
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useChangePasswordMutation,
} = authApi;