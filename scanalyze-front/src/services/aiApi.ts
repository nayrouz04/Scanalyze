// src/services/aiApi.ts
import { baseApi } from './api';

export interface AISuggestion {
  value: string;
  reason: string;
}

export interface AISuggestionRequest {
  field_key: string;
  current_value: string;
  doc_type: string;
  all_fields: Record<string, string>;
}

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAISuggestions: builder.mutation<AISuggestion[], AISuggestionRequest>({
      query: (body) => ({
        url: '/ai/suggestions',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetAISuggestionsMutation,
} = aiApi;
