import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Professional, CreateProfessionalInput, UpdateProfessionalInput } from "@/types";

export function useProfessionals() {
  return useQuery({
    queryKey: ["professionals"],
    queryFn: () => api.get<Professional[]>("/api/v1/professionals"),
  });
}

export function useActiveProfessionals() {
  return useQuery({
    queryKey: ["professionals", "active"],
    queryFn: () => api.get<Professional[]>("/api/v1/professionals/active"),
  });
}

export function useCreateProfessional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProfessionalInput) =>
      api.post<Professional>("/api/v1/professionals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
    },
  });
}

export function useUpdateProfessional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProfessionalInput }) =>
      api.put<Professional>(`/api/v1/professionals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
    },
  });
}

export function useDeleteProfessional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/professionals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
    },
  });
}
