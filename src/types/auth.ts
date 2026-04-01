export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface AuthUser {
  id: number;
  usuario: string;
  nombre: string;
  rol: string;
  especialidad?: string;
  clinicaId?: number;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
