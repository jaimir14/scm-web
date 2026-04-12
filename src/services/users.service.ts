import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User, CreateUserInput, UpdateUserInput } from "@/types";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.get<User[]>("/api/v1/users"),
  });
}

export function useDoctors() {
  return useQuery({
    queryKey: ["users", "doctors"],
    queryFn: () => api.get<User[]>("/api/v1/users/doctors"),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) =>
      api.post<User>("/api/v1/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserInput }) =>
      api.put<User>(`/api/v1/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// --- User Photo ---

export function useUserPhotoUrl(userId: number | undefined) {
  return useQuery({
    queryKey: ["user-photo", userId],
    queryFn: () =>
      api.get<{ viewUrl: string | null }>(`/api/v1/users/${userId}/photo/view-url`),
    enabled: !!userId,
  });
}

export function useRequestUserPhotoPresignedUrl() {
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: { fileName: string; mimeType: string; fileSize: number } }) =>
      api.post<{ uploadUrl: string; storagePath: string }>(
        `/api/v1/users/${userId}/photo/presigned-url`,
        data
      ),
  });
}

export function useRegisterUserPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, storagePath }: { userId: number; storagePath: string }) =>
      api.put<User>(`/api/v1/users/${userId}/photo`, { storagePath }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-photo"] });
    },
  });
}

export function useDeleteUserPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      api.delete(`/api/v1/users/${userId}/photo`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-photo"] });
    },
  });
}
