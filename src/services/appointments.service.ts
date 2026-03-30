import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  UpdateAppointmentStatusInput,
} from "@/types";

export interface AppointmentFilters {
  fecha?: string;
  profesionalId?: string;
  clinicaId?: string;
}

export function useAppointments(filters: AppointmentFilters) {
  return useQuery({
    queryKey: ["appointments", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.fecha) params.set("fecha", filters.fecha);
      if (filters.profesionalId) params.set("profesionalId", filters.profesionalId);
      if (filters.clinicaId) params.set("clinicaId", filters.clinicaId);
      return api.get<Appointment[]>(`/api/v1/appointments?${params.toString()}`);
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppointmentInput) =>
      api.post<Appointment>("/api/v1/appointments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAppointmentInput }) =>
      api.put<Appointment>(`/api/v1/appointments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAppointmentStatusInput }) =>
      api.put<Appointment>(`/api/v1/appointments/${id}/status`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/appointments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
