export interface Patient {
  id: number;
  clinicaId: number;
  profesionalId: number;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  sexo?: string;
  estadoCivil?: string;
  fechaNacimiento?: string;
  tipoSangre?: string;
  direccion?: string;
  email?: string;
  telefonoCasa?: string;
  telefonoCelular?: string;
  telefonoTrabajo?: string;
  otroTelefono?: string;
  ocupacion?: string;
  antecedentesPatologicos?: string;
  antecedentesNoPatologicos?: Record<string, boolean>;
  antecedentesQuirurgicos?: string;
  antecedentesGinecoObstetricos?: Record<string, string>;
  antecedentesHeredoFamiliares?: string;
  antecedentesOtros?: string;
  notas?: string;
  clinica?: { id: number; nombre: string };
  profesional?: { id: number; nombre: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePatientInput {
  clinicaId: number;
  profesionalId: number;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  sexo?: string;
  estadoCivil?: string;
  fechaNacimiento?: string;
  tipoSangre?: string;
  direccion?: string;
  email?: string;
  telefonoCasa?: string;
  telefonoCelular?: string;
  telefonoTrabajo?: string;
  otroTelefono?: string;
  ocupacion?: string;
  antecedentesPatologicos?: string;
  antecedentesNoPatologicos?: Record<string, boolean>;
  antecedentesQuirurgicos?: string;
  antecedentesGinecoObstetricos?: Record<string, string>;
  antecedentesHeredoFamiliares?: string;
  antecedentesOtros?: string;
  notas?: string;
}

export type UpdatePatientInput = Partial<CreatePatientInput>;
