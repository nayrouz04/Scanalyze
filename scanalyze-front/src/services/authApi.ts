// src/services/authApi.ts
import { baseApi } from "./api";
import { API_ENDPOINTS } from "../constants/apiConstants";
import type {
  LoginRequest,      LoginResponse,
  RegisterRequest,   RegisterResponse,
  ForgotPasswordRequest,
  ChangePasswordRequest,
} from "../models/authModels";
 
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
 
    // POST /api/v1/auth/token
    // Ton backend attend du JSON avec le champ "login" (pas OAuth2 standard)
    // Confirmé par la collection Postman : { "login": "...", "password": "..." }
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url:    API_ENDPOINTS.LOGIN,
        method: "POST",
        body:   {
          login:    credentials.login,
          password: credentials.password,
        },
      }),
    }),
 
    // POST /api/v1/auth/register
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url:    API_ENDPOINTS.REGISTER,
        method: "POST",
        body,
      }),
    }),
 
    // POST /api/v1/auth/forgot-password
    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (body) => ({
        url:    API_ENDPOINTS.FORGOT_PASSWORD,
        method: "POST",
        body,
      }),
    }),
 
    // POST /api/v1/auth/change-password  (requiert Bearer token)
    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      query: (body) => ({
        url:    API_ENDPOINTS.CHANGE_PASSWORD,
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});
 
export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useChangePasswordMutation,
} = authApi;