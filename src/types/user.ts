export interface User {
  id: number;
  usuario: string;
  nombre: string;
  rolId: number;
  rol: string;
  esAdmin?: boolean;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  sexo: string;
  especialidad?: string | null;
  clinicaId: number;
  fotografia?: string | null;
  // Doctor-specific
  codigoProfesional?: string | null;
  duracionCitas?: number | null;
  color?: string | null;
  // Google Calendar
  googleCalendarActivo?: boolean;
  googleCalendarEmail?: string | null;
  googleClientId?: string | null;
  googleClientSecret?: string | null;
  estado?: boolean;
  ultimoAcceso?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserInput {
  usuario: string;
  nombre: string;
  rolId: number;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  sexo: string;
  password: string;
  clinicaId: number;
  especialidad?: string;
  codigoProfesional?: string;
  duracionCitas?: number;
  color?: string;
  googleCalendarActivo?: boolean;
  googleCalendarEmail?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  estado?: boolean;
}

export interface UpdateUserInput {
  nombre?: string;
  rolId?: number;
  tipoIdentificacion?: string;
  numeroIdentificacion?: string;
  sexo?: string;
  password?: string;
  clinicaId?: number;
  especialidad?: string;
  codigoProfesional?: string | null;
  duracionCitas?: number | null;
  color?: string | null;
  googleCalendarActivo?: boolean;
  googleCalendarEmail?: string | null;
  googleClientId?: string | null;
  googleClientSecret?: string | null;
  estado?: boolean;
}
