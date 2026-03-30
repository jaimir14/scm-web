export interface Treatment {
  id: number;
  codigo: string;
  nombre: string;
  categoria?: string;
  precio?: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTreatmentInput {
  codigo: string;
  nombre: string;
  categoria?: string;
  precio?: number;
  activo?: boolean;
}

export type UpdateTreatmentInput = Partial<CreateTreatmentInput>;
