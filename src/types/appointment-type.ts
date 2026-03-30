export interface AppointmentType {
  id: number;
  nombre: string;
  duracion: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAppointmentTypeInput {
  nombre: string;
  duracion: number;
  activo?: boolean;
}

export type UpdateAppointmentTypeInput = Partial<CreateAppointmentTypeInput>;
