// src/models/documentModels.ts
export interface Document {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  created_at: string;
  owner_id: string;
}

export interface Job {
  id: string;
  document_id: string;
  status: 'pending' | 'running' | 'done' | 'error';
  result?: any;
  created_at: string;
}