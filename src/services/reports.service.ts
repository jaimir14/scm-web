import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ReportFilters {
  [key: string]: string | undefined;
}

export function useAppointmentsReport(filters: ReportFilters, enabled: boolean) {
  return useQuery({
    queryKey: ["reports", "appointments", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      return api.get<Record<string, string>[]>(
        `/api/v1/reports/appointments?${params.toString()}`
      );
    },
    enabled,
  });
}

export function usePatientsReport(filters: ReportFilters, enabled: boolean) {
  return useQuery({
    queryKey: ["reports", "patients", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      return api.get<Record<string, string>[]>(
        `/api/v1/reports/patients?${params.toString()}`
      );
    },
    enabled,
  });
}

export function useClinicsReport(filters: ReportFilters, enabled: boolean) {
  return useQuery({
    queryKey: ["reports", "clinics", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      return api.get<Record<string, string>[]>(
        `/api/v1/reports/clinics?${params.toString()}`
      );
    },
    enabled,
  });
}

export function useTreatmentsReport(filters: ReportFilters, enabled: boolean) {
  return useQuery({
    queryKey: ["reports", "treatments", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      return api.get<Record<string, string>[]>(
        `/api/v1/reports/treatments?${params.toString()}`
      );
    },
    enabled,
  });
}

export function useUsersReport(filters: ReportFilters, enabled: boolean) {
  return useQuery({
    queryKey: ["reports", "users", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      return api.get<Record<string, string>[]>(
        `/api/v1/reports/users?${params.toString()}`
      );
    },
    enabled,
  });
}
