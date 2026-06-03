// src/models/documentModels.ts

export interface Document {
  id:                 string;
  filename:           string;
  original_filename?: string;
  file_type:          string;
  file_size?:         number;
  doc_type?:          string | null;   // null avant traitement OCR
  status:             'uploaded' | 'pending' | 'processing' | 'done' | 'failed' | 'error';
  minio_path?:        string;
  uploaded_at:        string;
  created_at?:        string;
  owner_id?:          string;
}

export interface Job {
  id:          string;
  document_id: string;
  status:      'pending' | 'running' | 'done' | 'error';
  result?:     any;
  created_at:  string;
}
