import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/",
  }),
  tagTypes: ["Documents", "Users"],

  endpoints: (builder) => ({
    // ─── Documents ───────────────────────────────────────────
    uploadDocument: builder.mutation({
      query: (file: FormData) => ({
        url: "upload",
        method: "POST",
        body: file,
      }),
      invalidatesTags: ["Documents"],
    }),

    getResults: builder.query({
      query: () => "results",
      providesTags: ["Documents"],
    }),

    getStats: builder.query({
      query: () => "stats",
    }),

    getActivity: builder.query({
      query: () => "activity",
    }),

    // ─── Users ───────────────────────────────────────────────
    getUsers: builder.query({
      query: () => "users",
      providesTags: ["Users"],
    }),

    createUser: builder.mutation({
      query: (user: { fullName: string; email: string; role: "admin" | "user"; password: string }) => ({
        url: "users",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["Users"],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...patch }: { id: string; fullName?: string; role?: string; active?: boolean }) => ({
        url: `users/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: ["Users"],
    }),

    deleteUser: builder.mutation({
      query: (id: string) => ({
        url: `users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    toggleUserActive: builder.mutation({
      query: ({ id, active }: { id: string; active: boolean }) => ({
        url: `users/${id}/activate`,
        method: "PATCH",
        body: { active },
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

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

