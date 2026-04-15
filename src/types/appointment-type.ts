export interface AppointmentType {
  id: number;
  nombre: string;
  duracion: number;
  estado: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAppointmentTypeInput {
  nombre: string;
  duracion: number;
  estado?: boolean;
}

export type UpdateAppointmentTypeInput = Partial<CreateAppointmentTypeInput>;
