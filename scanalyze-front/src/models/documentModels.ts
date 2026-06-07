// src/models/documentModels.ts
export interface Document {
  id:                 string;
  filename:           string;
  original_filename?: string;
  file_type:          string;
  file_size?:         number;
  doc_type?:          string | null;
  status:             'uploaded' | 'pending' | 'processing' | 'done' | 'failed' | 'error';
  minio_path?:        string;
  uploaded_at:        string;
  created_at?:        string;
  owner_id?:          string;
}

export interface Job {
  id: string;
  document_id: string;
  status: 'queued' | 'ocr_running' | 'ai_running' | 'done' | 'failed' | 'pending' | 'running' | 'error';
  result?: any;
  created_at: string;
  completed_at?: string | null;
  duration_ms?: number | null;
  error_message?: string | null;
}
