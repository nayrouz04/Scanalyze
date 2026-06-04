// src/services/resultsApi.ts
import { baseApi } from './api';
import { API_ENDPOINTS } from '../constants/apiConstants';

export interface ProcessingHistoryResult {
  id: string;
  job_id: string;
  document_id: string;
  source_document: string;
  json_filename: string;
  doc_type: string | null;
  processed_at: string | null;
  processing_time_ms: number | null;
  confidence: number | null;
  fields_extracted: number;
  language: string | null;
  size: string | null;
  status: string;
  exported_data?: string | null;
}

export interface ExtractedField {
  id: string;
  document_id: string;
  job_id: string;
  field_name: string;
  field_label: string | null;
  field_category: string | null;
  ocr_value: string | null;
  raw_value: string | null;
  normalized_value: string | null;
  data_type: string | null;
  page_number: number | null;
  bbox_x: number | null;
  bbox_y: number | null;
  bbox_w: number | null;
  bbox_h: number | null;
  confidence: number | null;
  is_validated: boolean;
  is_skipped: boolean;
  validated_by: string | null;
  validated_at: string | null;
  created_at: string;
}

export const resultsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProcessingHistory: builder.query<ProcessingHistoryResult[], void>({
      query: () => API_ENDPOINTS.RESULTS_HISTORY,
      providesTags: ['Job'],
    }),
    getExtractedFields: builder.query<ExtractedField[], string>({
      query: (jobId) => `/results/${jobId}`,
      providesTags: (_, __, jobId) => [{ type: 'Job', id: jobId }],
    }),
    validateField: builder.mutation<ExtractedField, { fieldId: string; normalizedValue: string }>({
      query: ({ fieldId, normalizedValue }) => ({
        url: `/results/fields/${fieldId}/validate`,
        method: 'PATCH',
        body: { normalized_value: normalizedValue },
      }),
      invalidatesTags: (_, __, { fieldId }) => [{ type: 'Job', id: fieldId }, 'Job'],
    }),
    skipField: builder.mutation<ExtractedField, string>({
      query: (fieldId) => ({
        url: `/results/fields/${fieldId}/skip`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Job'],
    }),
    approveJob: builder.mutation<{ message: string }, string>({
      query: (jobId) => ({
        url: `/results/${jobId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, jobId) => [{ type: 'Job', id: jobId }, 'Job'],
    }),
    exportJobResults: builder.mutation<string, string>({
      query: (jobId) => ({
        url: `/results/${jobId}/export`,
        method: 'POST',
        responseHandler: (response) => response.text(),
      }),
      invalidatesTags: (_, __, jobId) => [{ type: 'Job', id: jobId }, 'Job'],
    }),
    exportJobResultsPdf: builder.mutation<Blob, string>({
      query: (jobId) => ({
        url: `/results/${jobId}/export/pdf`,
        method: 'POST',
        responseHandler: (response) => response.blob(),
      }),
      invalidatesTags: (_, __, jobId) => [{ type: 'Job', id: jobId }, 'Job'],
    }),
  }),
});

export const {
  useGetProcessingHistoryQuery,
  useGetExtractedFieldsQuery,
  useValidateFieldMutation,
  useSkipFieldMutation,
  useApproveJobMutation,
  useExportJobResultsMutation,
  useExportJobResultsPdfMutation,
} = resultsApi;
