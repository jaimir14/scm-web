export interface AuditLogEntry {
  id: number;
  fecha: string;
  fechaFormateada?: string;
  usuarioId: number;
  usuario?: string;
  accion: string;
  modulo: string;
  ip?: string;
  detalle?: string;
  createdAt?: string;
}

export interface AuditLogFilters {
  desde?: string;
  hasta?: string;
  usuarioId?: string;
  modulo?: string;
  accion?: string;
}
