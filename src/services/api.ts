import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiUrls }                   from "../constants/ApiUrls";
import { API_TAGS }                  from "../constants/apiConstants";

/**
 * api — the main RTK Query API slice.
 *
 * Covers:
 *   - Documents : upload, results, stats, activity
 *   - Users     : CRUD + activation toggle (admin only)
 *
 * Authentication endpoints live in authApi.ts.
 * Document-specific endpoints live in documentsApi.ts.
 */

// ─── Models ──────────────────────────────────────────────────────────────────

/** User — clean model for a user account */
export interface User {
  id?:       string;
  fullName:  string;
  email:     string;
  role:      "admin" | "user";
  password?: string;
  active?:   boolean;
}

/** UserPatch — partial update payload for an existing user */
export interface UserPatch {
  id:        string;
  fullName?: string;
  role?:     string;
  active?:   boolean;
}

/** ToggleActive — payload for toggling a user's active status */
export interface ToggleActive {
  id:     string;
  active: boolean;
}

// ─── API slice ───────────────────────────────────────────────────────────────

export const api = createApi({
  reducerPath: "api",

  // Base URL comes from ApiUrls — single source of truth for all API URLs
  baseQuery: fetchBaseQuery({
    baseUrl: ApiUrls.BASE_URL,
  }),

  // Cache tag types used for automatic cache invalidation
  tagTypes: [API_TAGS.DOCUMENTS, API_TAGS.USERS],

  endpoints: (builder) => ({

    // ─── Documents ───────────────────────────────────────────────────────────

    /** Upload a document (multipart/form-data) */
    uploadDocument: builder.mutation({
      query: (file: FormData) => ({
        url:    ApiUrls.UPLOAD,
        method: "POST",
        body:   file,
      }),
      invalidatesTags: [API_TAGS.DOCUMENTS],
    }),

    /** Fetch all processed document results */
    getResults: builder.query({
      query:        () => ApiUrls.RESULTS,
      providesTags: [API_TAGS.DOCUMENTS],
    }),

    /** Fetch dashboard stats (counts, success rate, etc.) */
    getStats: builder.query({
      query: () => ApiUrls.STATS,
    }),

    /** Fetch recent activity for the dashboard feed */
    getActivity: builder.query({
      query: () => ApiUrls.ACTIVITY,
    }),

    // ─── Users ───────────────────────────────────────────────────────────────

    /** Fetch all users (admin only) */
    getUsers: builder.query({
      query:        () => ApiUrls.USERS,
      providesTags: [API_TAGS.USERS],
    }),

    /** Create a new user account (admin only) */
    createUser: builder.mutation({
      query: (user: User) => ({
        url:    ApiUrls.USERS,
        method: "POST",
        body:   user,
      }),
      invalidatesTags: [API_TAGS.USERS],
    }),

    /** Update a user's details (admin only) */
    updateUser: builder.mutation({
      query: ({ id, ...patch }: UserPatch) => ({
        url:    ApiUrls.USER_BY_ID(id),
        method: "PATCH",
        body:   patch,
      }),
      invalidatesTags: [API_TAGS.USERS],
    }),

    /** Delete a user account (admin only) */
    deleteUser: builder.mutation({
      query: (id: string) => ({
        url:    ApiUrls.USER_BY_ID(id),
        method: "DELETE",
      }),
      invalidatesTags: [API_TAGS.USERS],
    }),

    /** Toggle a user's active/inactive status (admin only) */
    toggleUserActive: builder.mutation({
      query: ({ id, active }: ToggleActive) => ({
        url:    ApiUrls.USER_ACTIVATE(id),
        method: "PATCH",
        body:   { active },
      }),
      invalidatesTags: [API_TAGS.USERS],
    }),
  }),
});

// Export auto-generated hooks for use in components
export const {
  useGetStatsQuery,
  useGetResultsQuery,
  useGetActivityQuery,
  useUploadDocumentMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserActiveMutation,
} = api;
