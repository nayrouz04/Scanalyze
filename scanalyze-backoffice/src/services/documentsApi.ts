// src/services/documentsApi.ts
import { baseApi }           from './api';
import { API_ENDPOINTS }     from '../constants/apiConstants';
import type { Document }     from '../models/documentModels';

export const documentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // GET /documents/ → tous les docs (admin only)
    getAllDocuments: builder.query<Document[], void>({
      query: () => API_ENDPOINTS.DOCUMENTS,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Document' as const, id })), 'Document']
          : ['Document'],
    }),

    // GET /documents/owned → docs de l'utilisateur connecté
    getMyDocuments: builder.query<Document[], void>({
      query: () => API_ENDPOINTS.MY_DOCUMENTS,
      providesTags: ['Document'],
    }),

    // GET /documents/:id → doc spécifique (admin only)
    getDocumentById: builder.query<Document, string>({
      query: (id) => API_ENDPOINTS.DOCUMENT_BY_ID(id),
      providesTags: (_, __, id) => [{ type: 'Document', id }],
    }),

    // POST /documents/upload → multipart/form-data (user only)
    uploadDocument: builder.mutation<Document, FormData>({
      query: (formData) => ({
        url:      API_ENDPOINTS.UPLOAD,
        method:   'POST',
        body:     formData,
        formData: true,
      }),
      invalidatesTags: ['Document'],
    }),

    // DELETE /documents/:id → admin only
    deleteDocument: builder.mutation<void, string>({
      query: (id) => ({
        url:    API_ENDPOINTS.DOCUMENT_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [{ type: 'Document', id }, 'Document'],
    }),

  }),
});

export const {
  useGetAllDocumentsQuery,
  useGetMyDocumentsQuery,
  useGetDocumentByIdQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
} = documentsApi;