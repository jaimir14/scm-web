import { useMutation } from "@tanstack/react-query";
import { api, setToken, removeToken } from "@/lib/api";
import type { LoginRequest, LoginResponse, AuthUser } from "@/types";

export async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>("/api/v1/auth/login", credentials);
}

export async function getCurrentUser(): Promise<AuthUser> {
  return api.get<AuthUser>("/api/v1/auth/me");
}

export function logout(): void {
  removeToken();
  window.location.href = "/login";
}

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const result = await loginApi(credentials);
      setToken(result.token);
      return result;
    },
  });
}
