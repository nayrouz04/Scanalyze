// src/services/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../app/store';
import { API_BASE_URL, API_TAGS } from '../constants/apiConstants'; // ← ajouter API_TAGS

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: Object.values(API_TAGS), // ← au lieu de ['Document', 'User', 'Job', 'Dashboard'] hardcodé
  endpoints: () => ({}),
});