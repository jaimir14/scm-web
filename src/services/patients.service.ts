import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Patient, CreatePatientInput, UpdatePatientInput } from "@/types";

export function usePatients(page = 1, limit = 25, q = "", type = "nombre") {
  return useQuery({
    queryKey: ["patients", page, limit, q, type],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(q ? { q, type } : {}),
      });
      return api.getPaginated<Patient>(`/api/v1/patients?${params}`);
    },
  });
}

export function useSearchPatients(q: string, type: string = "nombre", page = 1, limit = 25) {
  return useQuery({
    queryKey: ["patients", "search", q, type, page, limit],
    queryFn: () => {
      const params = new URLSearchParams({
        q: q || "",
        type,
        page: String(page),
        limit: String(limit),
      });
      return api.getPaginated<Patient>(`/api/v1/patients/search?${params}`);
    },
  });
}

export function useProfessionalPatients(profesionalId: number | undefined) {
  return useQuery({
    queryKey: ["patients", "by-professional", profesionalId],
    queryFn: () =>
      api.get<Patient[]>(`/api/v1/patients/by-professional/${profesionalId}`),
    enabled: !!profesionalId,
  });
}

export function usePatient(id: string | number | undefined) {
  return useQuery({
    queryKey: ["patients", id],
    queryFn: () => api.get<Patient>(`/api/v1/patients/${id}`),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePatientInput) =>
      api.post<Patient>("/api/v1/patients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePatientInput }) =>
      api.put<Patient>(`/api/v1/patients/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/patients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
