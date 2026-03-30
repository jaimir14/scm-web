export interface Consultation {
  id: number;
  pacienteId: number;
  profesionalId: number;
  fecha: string;
  hora?: string;
  oculto?: boolean;
  peso?: string;
  talla?: string;
  imc?: string;
  temperatura?: string;
  presionArterial?: string;
  frecuenciaCardiaca?: string;
  frecuenciaRespiratoria?: string;
  saturacionOxigeno?: string;
  motivoConsulta?: string;
  examenFisico?: string;
  indicaciones?: string;
  impresionDiagnostica?: string;
  profesional?: { id: number; nombre: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateConsultationInput {
  pacienteId: number;
  profesionalId: number;
  fecha: string;
  hora?: string;
  oculto?: boolean;
  peso?: string;
  talla?: string;
  imc?: string;
  temperatura?: string;
  presionArterial?: string;
  frecuenciaCardiaca?: string;
  frecuenciaRespiratoria?: string;
  saturacionOxigeno?: string;
  motivoConsulta?: string;
  examenFisico?: string;
  indicaciones?: string;
  impresionDiagnostica?: string;
}

export type UpdateConsultationInput = Partial<CreateConsultationInput>;
