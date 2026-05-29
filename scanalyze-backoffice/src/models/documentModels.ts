// src/models/documentModels.ts

export interface Document {
  id:         string;
  filename:   string;
  doc_type?:  string;   // null avant traitement OCR
  status:     'pending' | 'processing' | 'done' | 'error';
  created_at: string;
  owner_id:   string;
}

export interface Job {
  id:          string;
  document_id: string;
  status:      'pending' | 'running' | 'done' | 'error';
  result?:     any;
  created_at:  string;
}