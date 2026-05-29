// src/services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../app/store";
import { API_BASE_URL, API_TAGS } from "../constants/apiConstants";
 
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  // Tags centralisés depuis apiConstants — évite les strings hardcodées
  tagTypes: Object.values(API_TAGS),
  endpoints: () => ({}),
});