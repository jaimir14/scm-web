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

// Mock data for prototype mode (when backend is unreachable)
const MOCK_STATS: DashboardStats = {
  citasHoy: 12,
  pacientes: 348,
  expedientes: 412,
  clinicas: 3,
};

const MOCK_UPCOMING: UpcomingAppointment[] = [
  { id: 1, hora: "09:00", paciente: "María Rodríguez", medico: "Dra. Daniela García", tipo: "Limpieza" },
  { id: 2, hora: "10:30", paciente: "Carlos Jiménez", medico: "Dra. Daniela García", tipo: "Consulta" },
  { id: 3, hora: "11:15", paciente: "Ana Solís", medico: "Dr. Rafael Zamora", tipo: "Ortodoncia" },
  { id: 4, hora: "14:00", paciente: "José Vargas", medico: "Dra. Daniela García", tipo: "Extracción" },
  { id: 5, hora: "15:30", paciente: "Laura Mora", medico: "Dr. Rafael Zamora", tipo: "Endodoncia" },
];

const MOCK_ACTIVITY: RecentActivityItem[] = [
  { id: 1, hora: "Hace 5 min", accion: "Cita registrada", detalle: "María Rodríguez - Limpieza", tipo: "cita" },
  { id: 2, hora: "Hace 20 min", accion: "Expediente actualizado", detalle: "Carlos Jiménez", tipo: "expediente" },
  { id: 3, hora: "Hace 1 hora", accion: "Pago recibido", detalle: "Ana Solís - ₡85,000", tipo: "pago" },
  { id: 4, hora: "Hace 2 horas", accion: "Paciente registrado", detalle: "José Vargas", tipo: "paciente" },
  { id: 5, hora: "Hace 3 horas", accion: "Tratamiento completado", detalle: "Laura Mora - Endodoncia", tipo: "tratamiento" },
];

async function withMockFallback<T>(promise: Promise<T>, mock: T): Promise<T> {
  try {
    return await promise;
  } catch (error: any) {
    // Fallback to mock when backend is unreachable in prototype mode
    if (error?.name !== "ApiError") {
      return mock;
    }
    throw error;
  }
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => withMockFallback(api.get<DashboardStats>("/api/v1/dashboard/stats"), MOCK_STATS),
  });
}

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: ["dashboard", "upcoming-appointments"],
    queryFn: () =>
      withMockFallback(api.get<UpcomingAppointment[]>("/api/v1/dashboard/upcoming-appointments"), MOCK_UPCOMING),
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["dashboard", "recent-activity"],
    queryFn: () =>
      withMockFallback(api.get<RecentActivityItem[]>("/api/v1/dashboard/recent-activity"), MOCK_ACTIVITY),
  });
}
