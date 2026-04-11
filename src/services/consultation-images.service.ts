import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ConsultationImage,
  PresignedUrlResponse,
  PresignedUrlInput,
  RegisterImageInput,
} from "@/types";

export function useConsultationImages(consultaId: number | undefined) {
  return useQuery({
    queryKey: ["consultation-images", consultaId],
    queryFn: () =>
      api.get<ConsultationImage[]>(
        `/api/v1/consultation-images/consultation/${consultaId}`
      ),
    enabled: !!consultaId,
  });
}

export function useRequestPresignedUrl() {
  return useMutation({
    mutationFn: (data: PresignedUrlInput) =>
      api.post<PresignedUrlResponse>(
        "/api/v1/consultation-images/presigned-url",
        data
      ),
  });
}

export function useRegisterImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterImageInput) =>
      api.post<ConsultationImage>("/api/v1/consultation-images", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation-images"] });
    },
  });
}

export function useDeleteConsultationImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/api/v1/consultation-images/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation-images"] });
    },
  });
}

/**
 * Upload a file directly to DigitalOcean Spaces using a presigned URL.
 */
export async function uploadFileToSpaces(
  uploadUrl: string,
  file: File
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}
