import { baseApi }       from './api';
import { API_ENDPOINTS } from '../constants/apiConstants';
import type { AdminUser, DashboardStats } from '../models/authModels';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // GET /admin/users → liste complète
    listUsers: builder.query<AdminUser[], void>({
      query: () => API_ENDPOINTS.USERS,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'User' as const, id })), 'User']
          : ['User'],
    }),

    // GET /admin/users/pending → users en attente
    listPendingUsers: builder.query<AdminUser[], void>({
      query: () => API_ENDPOINTS.USERS_PENDING,   // ← corrigé
      providesTags: ['User'],
    }),

    // POST /admin/users → créer un user
    createUser: builder.mutation<AdminUser, Partial<AdminUser> & { password: string }>({
      query: (body) => ({
        url:    API_ENDPOINTS.USERS,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // PATCH /admin/users/:id → modifier un user
    updateUser: builder.mutation<AdminUser, { id: string; data: Partial<AdminUser> }>({
      query: ({ id, data }) => ({
        url:    API_ENDPOINTS.USER_BY_ID(id),
        method: 'PATCH',
        body:   data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'User', id }],
    }),

    // DELETE /admin/users/:id → supprimer un user
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url:    API_ENDPOINTS.USER_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [{ type: 'User', id }, 'User'],
    }),

    // POST /admin/users/:id/enable → activer
    enableUser: builder.mutation<void, string>({
      query: (id) => ({
        url:    API_ENDPOINTS.ENABLE_USER(id),
        method: 'POST',
      }),
      invalidatesTags: (_, __, id) => [{ type: 'User', id }, 'User'],
    }),

    // POST /admin/users/:id/disable → désactiver
    disableUser: builder.mutation<void, string>({
      query: (id) => ({
        url:    API_ENDPOINTS.DISABLE_USER(id),
        method: 'POST',
      }),
      invalidatesTags: (_, __, id) => [{ type: 'User', id }, 'User'],
    }),

    // GET /admin/dashboard → stats KPIs
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => API_ENDPOINTS.DASHBOARD,
      providesTags: ['Dashboard'],
    }),

  }),
});

export const {
  useListUsersQuery,
  useListPendingUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useEnableUserMutation,
  useDisableUserMutation,
  useGetDashboardStatsQuery,
} = adminApi;