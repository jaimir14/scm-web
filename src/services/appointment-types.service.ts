import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AppointmentType, CreateAppointmentTypeInput, UpdateAppointmentTypeInput } from "@/types";

export function useAppointmentTypes() {
  return useQuery({
    queryKey: ["appointment-types"],
    queryFn: () => api.get<AppointmentType[]>("/api/v1/appointment-types"),
  });
}

export function useActiveAppointmentTypes() {
  return useQuery({
    queryKey: ["appointment-types", "active"],
    queryFn: () => api.get<AppointmentType[]>("/api/v1/appointment-types/active"),
  });
}

export function useCreateAppointmentType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppointmentTypeInput) =>
      api.post<AppointmentType>("/api/v1/appointment-types", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-types"] });
    },
  });
}

export function useUpdateAppointmentType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAppointmentTypeInput }) =>
      api.put<AppointmentType>(`/api/v1/appointment-types/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-types"] });
    },
  });
}

export function useDeleteAppointmentType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/appointment-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-types"] });
    },
  });
}
