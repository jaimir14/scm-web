// Shared mock data for the entire system — links profesionales, usuarios, patients, appointments, and history

export interface Profesional {
  id: string;
  nombre: string;
  especialidad: string;
  clinica: string;
  estado: string;
  usuarioId: string; // links to Usuario
}

export interface Usuario {
  id: string;
  usuario: string;
  nombre: string;
  rol: "Administrador" | "Médico" | "Recepción" | "Enfermería";
  estado: string;
  profesionalId?: string; // links to Profesional (only for Médico role)
}

export interface Patient {
  id: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
  identificacion: string;
  telefono: string;
  email: string;
  fechaNacimiento: string;
  sexo: string;
  direccion: string;
  tipoSangre: string;
  foto?: string;
}

export interface HistoryEntry {
  id: string;
  fecha: string;
  hora: string;
  profesionalId: string;
  medico: string; // display name, auto-filled from profesional
  peso: string;
  talla: string;
  imc: string;
  temp: string;
  presionArterial: string;
  fc: string;
  fr: string;
  satO2: string;
  motivoConsulta: string;
  examenFisico: string;
  impresionDiagnostica: string;
  indicaciones: string;
  notas: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  profesionalId: string;
  profesionalName: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: "confirmada" | "pendiente" | "completada" | "cancelada";
  clinica: string;
}

// --- Profesionales ---
export const profesionales: Profesional[] = [
  { id: "prof1", nombre: "Dr. García Mora", especialidad: "Medicina General", clinica: "Clínica Central", estado: "Activo", usuarioId: "u2" },
  { id: "prof2", nombre: "Dr. Sánchez López", especialidad: "Cardiología", clinica: "Clínica Norte", estado: "Activo", usuarioId: "u4" },
  { id: "prof3", nombre: "Dra. Vargas Rojas", especialidad: "Pediatría", clinica: "Clínica Central", estado: "Activo", usuarioId: "u5" },
];

// --- Usuarios ---
export const usuarios: Usuario[] = [
  { id: "u1", usuario: "admin", nombre: "Administrador", rol: "Administrador", estado: "Activo" },
  { id: "u2", usuario: "dgarcia", nombre: "Dr. García Mora", rol: "Médico", estado: "Activo", profesionalId: "prof1" },
  { id: "u3", usuario: "recepcion1", nombre: "Laura Mora", rol: "Recepción", estado: "Activo" },
  { id: "u4", usuario: "dsanchez", nombre: "Dr. Sánchez López", rol: "Médico", estado: "Activo", profesionalId: "prof2" },
  { id: "u5", usuario: "dvargas", nombre: "Dra. Vargas Rojas", rol: "Médico", estado: "Activo", profesionalId: "prof3" },
];

// --- Patients ---
export const patients: Patient[] = [
  {
    id: "p1", nombre: "María", apellido1: "López", apellido2: "Jiménez",
    identificacion: "1-0234-0567", telefono: "8812-3456", email: "maria@email.com",
    fechaNacimiento: "1990-03-01", sexo: "Femenino", direccion: "San José, Costa Rica", tipoSangre: "O+",
  },
  {
    id: "p2", nombre: "Carlos", apellido1: "Ramírez", apellido2: "Solano",
    identificacion: "3-0456-0789", telefono: "7745-1234", email: "carlos.r@email.com",
    fechaNacimiento: "1985-07-15", sexo: "Masculino", direccion: "Heredia, Costa Rica", tipoSangre: "A+",
  },
  {
    id: "p3", nombre: "Ana", apellido1: "Mora", apellido2: "Vega",
    identificacion: "2-0678-0123", telefono: "6698-7890", email: "ana.mora@email.com",
    fechaNacimiento: "1978-11-22", sexo: "Femenino", direccion: "Cartago, Costa Rica", tipoSangre: "B-",
  },
];

// --- History ---
export const patientHistory: Record<string, HistoryEntry[]> = {
  p1: [
    {
      id: "h1", fecha: "2026-01-15", hora: "09:00 AM", profesionalId: "prof1", medico: "Dr. García Mora",
      peso: "62", talla: "1.65", imc: "22.8", temp: "36.5", presionArterial: "120/80", fc: "72", fr: "18", satO2: "98",
      motivoConsulta: "Control rutinario. Paciente refiere sentirse bien, sin molestias.",
      examenFisico: "Paciente en buen estado general, signos vitales normales.",
      impresionDiagnostica: "Paciente sana. Control de rutina sin hallazgos.",
      indicaciones: "Continuar con hábitos saludables. Próximo control en 6 meses.", notas: "",
    },
    {
      id: "h2", fecha: "2026-02-20", hora: "10:30 AM", profesionalId: "prof1", medico: "Dr. García Mora",
      peso: "63", talla: "1.65", imc: "23.1", temp: "37.2", presionArterial: "125/82", fc: "78", fr: "20", satO2: "97",
      motivoConsulta: "Dolor de garganta y malestar general desde hace 3 días.",
      examenFisico: "Faringe eritematosa. Amígdalas levemente inflamadas. Sin exudado.",
      impresionDiagnostica: "Faringitis aguda viral.",
      indicaciones: "Ibuprofeno 400mg c/8h por 5 días. Reposo. Líquidos abundantes.",
      notas: "Paciente alérgica a penicilina.",
    },
  ],
  p2: [
    {
      id: "h3", fecha: "2026-03-10", hora: "02:00 PM", profesionalId: "prof1", medico: "Dr. García Mora",
      peso: "85", talla: "1.78", imc: "26.8", temp: "36.8", presionArterial: "135/88", fc: "80", fr: "16", satO2: "99",
      motivoConsulta: "Seguimiento de hipertensión. Paciente refiere cumplimiento de medicación.",
      examenFisico: "PA ligeramente elevada. Resto del examen sin particularidades.",
      impresionDiagnostica: "Hipertensión arterial controlada.",
      indicaciones: "Continuar con Losartán 50mg/día. Dieta baja en sodio. Control en 1 mes.", notas: "",
    },
  ],
  p3: [],
};

const today = "2026-03-30";

// --- Appointments (linked to profesionalId) ---
export const appointments: Appointment[] = [
  {
    id: "a1", patientId: "p1", patientName: "María López Jiménez",
    profesionalId: "prof1", profesionalName: "Dr. García Mora",
    date: today, time: "09:00", duration: 30, type: "Control", status: "confirmada", clinica: "Clínica Central",
  },
  {
    id: "a2", patientId: "p2", patientName: "Carlos Ramírez Solano",
    profesionalId: "prof1", profesionalName: "Dr. García Mora",
    date: today, time: "10:00", duration: 30, type: "Seguimiento", status: "pendiente", clinica: "Clínica Central",
  },
  {
    id: "a3", patientId: "p3", patientName: "Ana Mora Vega",
    profesionalId: "prof2", profesionalName: "Dr. Sánchez López",
    date: today, time: "11:30", duration: 45, type: "Primera Consulta", status: "confirmada", clinica: "Clínica Norte",
  },
  {
    id: "a4", patientId: "p1", patientName: "María López Jiménez",
    profesionalId: "prof1", profesionalName: "Dr. García Mora",
    date: "2026-03-31", time: "14:00", duration: 30, type: "Seguimiento", status: "pendiente", clinica: "Clínica Norte",
  },
  {
    id: "a5", patientId: "p2", patientName: "Carlos Ramírez Solano",
    profesionalId: "prof3", profesionalName: "Dra. Vargas Rojas",
    date: "2026-04-01", time: "09:30", duration: 30, type: "Control", status: "pendiente", clinica: "Clínica Central",
  },
];

// Helper to get profesional by usuario login
export function getProfesionalByUsuario(username: string): Profesional | undefined {
  const user = usuarios.find(u => u.usuario === username);
  if (!user?.profesionalId) return undefined;
  return profesionales.find(p => p.id === user.profesionalId);
}

// Helper to get appointments for a profesional
export function getAppointmentsForProfesional(profesionalId: string): Appointment[] {
  return appointments.filter(a => a.profesionalId === profesionalId);
}
