import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Role, CreateRoleInput, UpdateRoleInput } from "@/types";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => api.get<Role[]>("/api/v1/roles"),
  });
}

export function useActiveRoles() {
  return useQuery({
    queryKey: ["roles", "active"],
    queryFn: async () => {
      const roles = await api.get<Role[]>("/api/v1/roles");
      return roles.filter(r => r.activo);
    },
  });
}

export function useRole(id: number | undefined) {
  return useQuery({
    queryKey: ["roles", id],
    queryFn: () => api.get<Role>(`/api/v1/roles/${id}`),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleInput) =>
      api.post<Role>("/api/v1/roles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleInput }) =>
      api.put<Role>(`/api/v1/roles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

// --- Role Features (permissions) ---

export interface RoleFeatureAssignment {
  rolId: number;
  featureKeys: string[];
}

export function useRoleFeatures(rolId: number | undefined) {
  return useQuery({
    queryKey: ["role-features", rolId],
    queryFn: () => api.get<string[]>(`/api/v1/roles/${rolId}/features`),
    enabled: !!rolId,
  });
}

export function useAssignRoleFeatures() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rolId, featureKeys }: RoleFeatureAssignment) =>
      api.put(`/api/v1/roles/${rolId}/features`, { featureKeys }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["role-features", variables.rolId] });
      queryClient.invalidateQueries({ queryKey: ["my-permissions"] });
    },
  });
}

// --- Current user permissions ---

export function useMyPermissions(enabled = true) {
  return useQuery({
    queryKey: ["my-permissions"],
    queryFn: () => api.get<string[]>("/api/v1/auth/my-permissions"),
    enabled,
    retry: 1,
  });
}
