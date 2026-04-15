export interface Clinic {
  id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  estado: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClinicInput {
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  estado?: boolean;
}

export type UpdateClinicInput = Partial<CreateClinicInput>;
