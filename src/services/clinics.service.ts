import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Clinic, CreateClinicInput, UpdateClinicInput } from "@/types";

export function useClinics() {
  return useQuery({
    queryKey: ["clinics"],
    queryFn: () => api.get<Clinic[]>("/api/v1/clinics"),
  });
}

export function useActiveClinics() {
  return useQuery({
    queryKey: ["clinics", "active"],
    queryFn: () => api.get<Clinic[]>("/api/v1/clinics/active"),
  });
}

export function useCreateClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClinicInput) =>
      api.post<Clinic>("/api/v1/clinics", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
    },
  });
}

export function useUpdateClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClinicInput }) =>
      api.put<Clinic>(`/api/v1/clinics/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
    },
  });
}

export function useDeleteClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/clinics/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
    },
  });
}
