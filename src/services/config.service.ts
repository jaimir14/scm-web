import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SystemConfig } from "@/types";

export function useConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: () => api.get<SystemConfig>("/api/v1/config"),
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SystemConfig) =>
      api.put<SystemConfig>("/api/v1/config", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });
}
