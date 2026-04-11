const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  status: number;
  details?: string[];

  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export { ApiError };

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    removeToken();
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new ApiError("No autorizado", 401);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let json: any;
  try {
    json = await response.json();
  } catch {
    throw new ApiError(`Error ${response.status}: respuesta no valida`, response.status);
  }

  if (!response.ok || json.success === false) {
    throw new ApiError(
      json.error || `Error ${response.status}`,
      response.status,
      json.details
    );
  }

  return json.data as T;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.body != null && { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T = void>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};
