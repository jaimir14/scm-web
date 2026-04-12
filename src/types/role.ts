export interface Role {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  esAdmin?: boolean;
  features?: RoleFeature[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Feature {
  id: number;
  clave: string; // unique key e.g. "doctor.dashboard"
  nombre: string; // display name
  descripcion?: string;
  modulo: string; // grouping e.g. "Doctor", "Reportes"
  activo: boolean;
}

export interface RoleFeature {
  id: number;
  rolId: number;
  featureId: number;
  feature?: Feature;
}

export interface CreateRoleInput {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdateRoleInput {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}
