export interface PatientFile {
  id: number;
  pacienteId: number;
  consultaId?: number | null;
  fileName: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  description?: string | null;
  viewUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilePresignedUrlInput {
  pacienteId: number;
  consultaId?: number;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface RegisterFileInput {
  pacienteId: number;
  consultaId?: number;
  fileName: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  description?: string;
}
