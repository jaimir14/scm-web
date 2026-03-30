import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Patient, CreatePatientInput, UpdatePatientInput, PaginationMeta } from "@/types";

export function usePatients(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["patients", page, limit],
    queryFn: async () => {
      const result = await api.get<{ data: Patient[]; meta: PaginationMeta }>(
        `/api/v1/patients?page=${page}&limit=${limit}`
      );
      // The endpoint may return data directly as array or wrapped
      return result;
    },
  });
}

export function useSearchPatients(q: string, type: string = "nombre") {
  return useQuery({
    queryKey: ["patients", "search", q, type],
    queryFn: () =>
      api.get<Patient[]>(
        `/api/v1/patients/search?q=${encodeURIComponent(q)}&type=${type}`
      ),
    enabled: q.length > 0,
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
