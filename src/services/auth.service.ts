import { useMutation } from "@tanstack/react-query";
import { api, setToken, removeToken } from "@/lib/api";
import type { LoginRequest, LoginResponse, AuthUser } from "@/types";

// Mock users for prototype-only login (no backend required)
const MOCK_USERS: Record<string, AuthUser> = {
  admin: {
    id: 1,
    usuario: "admin",
    nombre: "Administrador",
    rol: "Administrador",
    rolId: 1,
    esAdmin: true,
  },
  dgarcia: {
    id: 2,
    usuario: "dgarcia",
    nombre: "Dra. Daniela García",
    rol: "Médico",
    rolId: 2,
    esAdmin: false,
    especialidad: "Odontología",
    clinicaId: 1,
  },
};

const MOCK_TOKEN_PREFIX = "mock-token-";

function isMockToken(token: string | null): boolean {
  return !!token && token.startsWith(MOCK_TOKEN_PREFIX);
}

function getMockUserFromToken(token: string): AuthUser | null {
  const usuario = token.slice(MOCK_TOKEN_PREFIX.length);
  return MOCK_USERS[usuario] ?? buildGenericDoctor(usuario);
}

function buildGenericDoctor(usuario: string): AuthUser {
  return {
    id: 1000 + (usuario.charCodeAt(0) || 0),
    usuario,
    nombre: usuario,
    rol: "Médico",
    rolId: 2,
    esAdmin: false,
    clinicaId: 1,
  };
}

async function mockLogin(credentials: LoginRequest): Promise<LoginResponse> {
  // Any password is accepted in the prototype
  const user =
    MOCK_USERS[credentials.usuario] ?? buildGenericDoctor(credentials.usuario);
  return {
    token: `${MOCK_TOKEN_PREFIX}${user.usuario}`,
    user,
  };
}

export async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    return await api.post<LoginResponse>("/api/v1/auth/login", credentials);
  } catch {
    // Fallback to local mock when the backend is unreachable (prototype mode)
    return mockLogin(credentials);
  }
}

export async function getCurrentUser(): Promise<AuthUser> {
  // If we have a mock token, resolve user locally without hitting the backend
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (isMockToken(token)) {
    const user = getMockUserFromToken(token!);
    if (user) return user;
  }
  try {
    return await api.get<AuthUser>("/api/v1/auth/me");
  } catch (e) {
    if (isMockToken(token)) {
      const user = getMockUserFromToken(token!);
      if (user) return user;
    }
    throw e;
  }
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
