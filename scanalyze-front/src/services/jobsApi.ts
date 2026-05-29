// src/services/jobsApi.ts
import { baseApi } from './api';
import type { Job } from '../models/documentModels';

export const jobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // POST /jobs/  → lancer un job sur un document
    createJob: builder.mutation<Job, { document_id: string }>({
      query: (body) => ({
        url: '/jobs/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Job'],
    }),

    // GET /jobs/:id  → polling du statut du job
    getJobById: builder.query<Job, string>({
      query: (id) => `/jobs/${id}`,
      providesTags: (_, __, id) => [{ type: 'Job', id }],
    }),
  }),
});

export const {
  useCreateJobMutation,
  useGetJobByIdQuery,
} = jobsApi;