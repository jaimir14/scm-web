export interface Professional {
  id: number;
  nombre: string;
  especialidad?: string;
  clinicaId?: number;
  telefono?: string;
  email?: string;
  activo: boolean;
  clinica?: { id: number; nombre: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProfessionalInput {
  nombre: string;
  especialidad?: string;
  clinicaId?: number;
  telefono?: string;
  email?: string;
  activo?: boolean;
}

export type UpdateProfessionalInput = Partial<CreateProfessionalInput>;
