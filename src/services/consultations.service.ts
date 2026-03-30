import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Consultation, CreateConsultationInput, UpdateConsultationInput } from "@/types";

export function usePatientConsultations(patientId: string | number | undefined) {
  return useQuery({
    queryKey: ["consultations", patientId],
    queryFn: () =>
      api.get<Consultation[]>(`/api/v1/patients/${patientId}/consultations`),
    enabled: !!patientId,
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateConsultationInput) =>
      api.post<Consultation>("/api/v1/consultations", data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["consultations", variables.pacienteId],
      });
    },
  });
}

export function useUpdateConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateConsultationInput }) =>
      api.put<Consultation>(`/api/v1/consultations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
  });
}
