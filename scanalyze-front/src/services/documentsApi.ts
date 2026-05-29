// src/services/documentsApi.ts
import { baseApi } from './api';
import type { Document } from '../models/documentModels';

export const documentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // GET /documents/  → tous les docs (admin)
    getAllDocuments: builder.query<Document[], void>({
      query: () => '/documents/',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Document' as const, id })), 'Document']
          : ['Document'],
    }),

    // GET /documents/me  → docs de l'utilisateur connecté
    getMyDocuments: builder.query<Document[], void>({
      query: () => '/documents/me',
      providesTags: ['Document'],
    }),

    // GET /documents/:id
    getDocumentById: builder.query<Document, string>({
      query: (id) => `/documents/${id}`,
      providesTags: (_, __, id) => [{ type: 'Document', id }],
    }),

    // POST /documents/upload  → multipart/form-data
    uploadDocument: builder.mutation<Document, FormData>({
      query: (formData) => ({
        url: '/documents/upload',
        method: 'POST',
        body: formData,
        // NE PAS mettre Content-Type, le browser le gère pour multipart
        formData: true,
      }),
      invalidatesTags: ['Document'],
    }),

    // DELETE /documents/:id
    deleteDocument: builder.mutation<void, string>({
      query: (id) => ({
        url: `/documents/${id}`,
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