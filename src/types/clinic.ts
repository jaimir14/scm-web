export interface Clinic {
  id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClinicInput {
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
}

export type UpdateClinicInput = Partial<CreateClinicInput>;
