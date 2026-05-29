// src/services/index.ts
export { baseApi }       from './api';
export { authApi,
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useChangePasswordMutation }   from './authApi';

export { documentsApi,
  useGetAllDocumentsQuery,
  useGetMyDocumentsQuery,
  useGetDocumentByIdQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation }   from './documentsApi';

// Backoffice seulement :
export { adminApi,
  useListUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useEnableUserMutation,
  useDisableUserMutation,
  useGetDashboardStatsQuery }   from './adminApi';

