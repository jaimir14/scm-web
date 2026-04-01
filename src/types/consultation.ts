export interface Consultation {
  id: number;
  pacienteId: number;
  profesionalId: number;
  fecha: string;
  ocultar?: boolean;
  peso?: number | string | null;
  talla?: number | string | null;
  imc?: number | string | null;
  temperatura?: number | string | null;
  presionArterial?: string | null;
  frecuenciaCardiaca?: number | string | null;
  frecuenciaRespiratoria?: number | string | null;
  satO2?: number | string | null;
  motivoConsulta?: string | null;
  examenFisico?: string | null;
  impresionDiagnostica?: string | null;
  indicacionesTratamientos?: string | null;
  profesional?: { id: number; nombre: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateConsultationInput {
  pacienteId: number;
  profesionalId: number;
  fecha: string;
  ocultar?: boolean;
  peso: string | number;
  talla?: string | number;
  imc?: string | number;
  temperatura?: string | number;
  presionArterial?: string;
  frecuenciaCardiaca?: string | number;
  frecuenciaRespiratoria?: string | number;
  satO2?: string | number;
  motivoConsulta: string;
  examenFisico?: string;
  impresionDiagnostica?: string;
  indicacionesTratamientos?: string;
}

export type UpdateConsultationInput = Partial<CreateConsultationInput>;
