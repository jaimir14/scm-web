import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  PatientFile,
  FilePresignedUrlInput,
  RegisterFileInput,
} from "@/types";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// --- Queries ---

/** List all files for a patient (expediente-level) */
export function usePatientFiles(pacienteId: number | string | undefined) {
  return useQuery({
    queryKey: ["patient-files", "patient", pacienteId],
    queryFn: () =>
      api.get<PatientFile[]>(`/api/v1/patient-files/patient/${pacienteId}`),
    enabled: !!pacienteId,
  });
}

/** List files for a specific consultation */
export function useConsultationFiles(consultaId: number | undefined) {
  return useQuery({
    queryKey: ["patient-files", "consultation", consultaId],
    queryFn: () =>
      api.get<PatientFile[]>(`/api/v1/patient-files/consultation/${consultaId}`),
    enabled: !!consultaId,
  });
}

// --- Mutations ---

export function useRequestFilePresignedUrl() {
  return useMutation({
    mutationFn: (data: FilePresignedUrlInput) =>
      api.post<{ uploadUrl: string; storagePath: string }>(
        "/api/v1/patient-files/presigned-url",
        data
      ),
  });
}

export function useRegisterFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterFileInput) =>
      api.post<PatientFile>("/api/v1/patient-files", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-files"] });
    },
  });
}

export function useDeletePatientFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/v1/patient-files/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-files"] });
    },
  });
}

// --- Upload helper ---

/**
 * Full upload flow: get presigned URL, upload to Spaces, register in backend.
 * Validates file size and type before starting.
 */
export async function uploadPatientFile(
  file: File,
  input: Omit<FilePresignedUrlInput, "fileName" | "mimeType" | "fileSize">,
  requestPresignedUrl: ReturnType<typeof useRequestFilePresignedUrl>,
  registerFile: ReturnType<typeof useRegisterFile>,
  description?: string
): Promise<PatientFile> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("El archivo no puede superar 20MB");
  }

  if (file.type !== "application/pdf") {
    throw new Error("Solo se permiten archivos PDF");
  }

  // 1. Get presigned URL
  const { uploadUrl, storagePath } = await requestPresignedUrl.mutateAsync({
    ...input,
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
  });

  // 2. Upload directly to Spaces
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  // 3. Register in backend
  return registerFile.mutateAsync({
    pacienteId: input.pacienteId,
    consultaId: input.consultaId,
    fileName: file.name,
    storagePath,
    fileSize: file.size,
    mimeType: file.type,
    description,
  });
}
