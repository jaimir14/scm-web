import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Treatment, CreateTreatmentInput, UpdateTreatmentInput } from "@/types";

export function useTreatments() {
  return useQuery({
    queryKey: ["treatments"],
    queryFn: () => api.get<Treatment[]>("/api/v1/treatments"),
  });
}

export function useCreateTreatment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTreatmentInput) =>
      api.post<Treatment>("/api/v1/treatments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
    },
  });
}

export function useUpdateTreatment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTreatmentInput }) =>
      api.put<Treatment>(`/api/v1/treatments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
    },
  });
}

export function useDeleteTreatment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/treatments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
    },
  });
}
