export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface AuthUser {
  id: number;
  usuario: string;
  nombre: string;
  rol: string; // role name from DB
  rolId: number; // role ID from DB
  esAdmin: boolean;
  especialidad?: string;
  clinicaId?: number;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
