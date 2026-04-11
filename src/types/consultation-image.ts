export interface ConsultationImage {
  id: number;
  consultaId: number;
  fileName: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  description?: string | null;
  viewUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  storagePath: string;
}

export interface PresignedUrlInput {
  pacienteId: number;
  citaId: number;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface RegisterImageInput {
  consultaId: number;
  fileName: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  description?: string;
}
