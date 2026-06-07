// src/services/authApi.ts
import { baseApi } from './api';
import { API_ENDPOINTS } from '../constants/apiConstants';
import type {
  LoginRequest, LoginResponse,
  RegisterRequest, RegisterResponse,
  ForgotPasswordRequest, ChangePasswordRequest,
} from '../models/authModels';
 
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
 
    // POST /auth/token — JSON { login, password }
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url:    API_ENDPOINTS.LOGIN,
        method: 'POST',
        body:   credentials, // { login, password } en JSON
      }),
    }),
 
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url:    API_ENDPOINTS.REGISTER,
        method: 'POST',
        body,
      }),
    }),
 
    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: (body) => ({
        url:    API_ENDPOINTS.FORGOT_PASSWORD,
        method: 'POST',
        body,
      }),
    }),
 
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({
        url:    API_ENDPOINTS.CHANGE_PASSWORD,
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