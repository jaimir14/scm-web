export interface Appointment {
  id: number;
  pacienteId: number;
  profesionalId: number;
  clinicaId: number;
  tipoCitaId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: "PENDIENTE" | "ATENDIDA" | "CANCELADA";
  notas?: string;
  paciente?: { id: number; nombre: string; apellido1: string; apellido2?: string };
  profesional?: { id: number; nombre: string; clinicaId: number; clinica?: { id: number; nombre: string } };
  clinica?: { id: number; nombre: string };
  tipoCita?: { id: number; nombre: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAppointmentInput {
  pacienteId: number;
  profesionalId: number;
  clinicaId: number;
  tipoCitaId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  notas?: string;
}

export type UpdateAppointmentInput = Partial<CreateAppointmentInput>;

export interface UpdateAppointmentStatusInput {
  estado: "ATENDIDA" | "CANCELADA";
}
