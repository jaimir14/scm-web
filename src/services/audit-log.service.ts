import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AuditLogEntry, AuditLogFilters } from "@/types";

export function useAuditLog(filters: AuditLogFilters) {
  return useQuery({
    queryKey: ["audit-log", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.desde) params.set("desde", filters.desde);
      if (filters.hasta) params.set("hasta", filters.hasta);
      if (filters.usuarioId) params.set("usuarioId", filters.usuarioId);
      if (filters.modulo) params.set("modulo", filters.modulo);
      if (filters.accion) params.set("accion", filters.accion);
      return api.get<AuditLogEntry[]>(`/api/v1/audit-log?${params.toString()}`);
    },
  });
}
