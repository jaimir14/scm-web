export interface User {
  id: number;
  usuario: string;
  nombre: string;
  rol: string;
  activo: boolean;
  ultimoAcceso?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserInput {
  usuario: string;
  nombre: string;
  rol: string;
  password: string;
  activo?: boolean;
}

export interface UpdateUserInput {
  nombre?: string;
  rol?: string;
  password?: string;
  activo?: boolean;
}
