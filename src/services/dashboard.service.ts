import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface DashboardStats {
  citasHoy: number;
  pacientes: number;
  expedientes: number;
  clinicas: number;
}

export interface UpcomingAppointment {
  id: number;
  hora: string;
  paciente: string;
  medico: string;
  tipo: string;
}

export interface RecentActivityItem {
  id: number;
  hora: string;
  accion: string;
  detalle: string;
  tipo: string;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => api.get<DashboardStats>("/api/v1/dashboard/stats"),
  });
}

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: ["dashboard", "upcoming-appointments"],
    queryFn: () =>
      api.get<UpcomingAppointment[]>("/api/v1/dashboard/upcoming-appointments"),
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["dashboard", "recent-activity"],
    queryFn: () =>
      api.get<RecentActivityItem[]>("/api/v1/dashboard/recent-activity"),
  });
}
