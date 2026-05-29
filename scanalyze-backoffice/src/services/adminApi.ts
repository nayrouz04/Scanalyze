// src/services/adminApi.ts  (backoffice seulement)
import { baseApi }                        from './api';
import { API_ENDPOINTS }                  from '../constants/apiConstants';
import type { AdminUser, DashboardStats } from '../models/authModels';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // GET /admin/users
    listUsers: builder.query<AdminUser[], void>({
      query: () => API_ENDPOINTS.USERS,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'User' as const, id })), 'User']
          : ['User'],
    }),

    // POST /admin/users
    createUser: builder.mutation<AdminUser, Partial<AdminUser> & { password: string }>({
      query: (body) => ({
        url:    API_ENDPOINTS.USERS,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // PATCH /admin/users/:id
    updateUser: builder.mutation<AdminUser, { id: string; data: Partial<AdminUser> }>({
      query: ({ id, data }) => ({
        url:    API_ENDPOINTS.USER_BY_ID(id),
        method: 'PATCH',
        body:   data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'User', id }],
    }),

    // DELETE /admin/users/:id
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url:    API_ENDPOINTS.USER_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [{ type: 'User', id }, 'User'],
    }),

    // POST /admin/users/:id/enable
    enableUser: builder.mutation<void, string>({
      query: (id) => ({
        url:    API_ENDPOINTS.ENABLE_USER(id),
        method: 'POST',
      }),
      invalidatesTags: (_, __, id) => [{ type: 'User', id }],
    }),

    // POST /admin/users/:id/disable
    disableUser: builder.mutation<void, string>({
      query: (id) => ({
        url:    API_ENDPOINTS.DISABLE_USER(id),
        method: 'POST',
      }),
      invalidatesTags: (_, __, id) => [{ type: 'User', id }],
    }),

    // GET /admin/dashboard
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => API_ENDPOINTS.DASHBOARD,
      providesTags: ['Dashboard'],
    }),

  }),
});

export const {
  useListUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useEnableUserMutation,
  useDisableUserMutation,
  useGetDashboardStatsQuery,
} = adminApi;