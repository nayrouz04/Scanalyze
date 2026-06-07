// src/services/index.ts
export { baseApi }                          from "./api";
export {
  authApi,
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useChangePasswordMutation,
}                                           from "./authApi";
export {
  aiApi,
  useGetAISuggestionsMutation,
}                                           from "./aiApi";
export {
  documentsApi,
  useGetAllDocumentsQuery,
  useGetMyDocumentsQuery,
  useGetDocumentByIdQuery,
  useLazyGetDocumentDownloadUrlQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
}                                           from "./documentsApi";
export {
  jobsApi,
  useCreateJobMutation,
  useGetJobByIdQuery,
}                                           from "./jobsApi";
export {
  resultsApi,
  useGetExtractedFieldsQuery,
  useGetProcessingHistoryQuery,
  useValidateFieldMutation,
  useSkipFieldMutation,
  useApproveJobMutation,
  useExportJobResultsMutation,
  useExportJobResultsPdfMutation,
}                                           from "./resultsApi";
