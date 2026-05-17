export type EstadoContrato = 'BORRADOR' | 'ACTIVO' | 'PAUSADO' | 'COMPLETADO' | 'CANCELADO'
export type EstadoItem = 'PROPUESTO' | 'ACEPTADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO'
export type TipoPago = 'EFECTIVO' | 'TARJETA' | 'SINPE' | 'TRANSFERENCIA' | 'CHEQUE' | 'OTRO'
export type EstadoPago = 'APLICADO' | 'ANULADO'
export type Moneda = 'CRC' | 'USD'
export type Periodicidad = 'SEMANAL' | 'QUINCENAL' | 'MENSUAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL'
export type AccionContrato =
  | 'CREACION'
  | 'ACTIVACION'
  | 'MODIFICACION'
  | 'ESTADO_CAMBIADO'
  | 'TRATAMIENTO_AGREGADO'
  | 'TRATAMIENTO_MODIFICADO'
  | 'TRATAMIENTO_ELIMINADO'
  | 'PAGO_REGISTRADO'
  | 'PAGO_ANULADO'

export interface ContratoTratamientoItem {
  id: string          // cuid — new model
  contratoId: string  // cuid — new model
  tratamientoId: number
  tratamiento: { id: number; nombre: string; codigo: string }
  pieza: string | null
  cantidad: number
  precioUnitario: number
  descuento: number
  subtotal: number
  estadoItem: EstadoItem
  fechaPropuesta: string | null
  observaciones: string | null
  createdAt: string
}

export interface ContratoPago {
  id: string          // cuid — new model
  contratoId: string  // cuid — new model
  fecha: string
  monto: number
  tipoPago: TipoPago
  estado: EstadoPago
  concepto: string | null
  referencia: string | null
  numeroFactura: string | null
  autorizacion: string | null
  notas: string | null
  motivoAnulacion: string | null
  registradoPorId: number
  registradoPor: { id: number; nombre: string }
  createdAt: string
}

export interface ContratoHistorialEntry {
  id: string          // cuid — new model
  contratoId: string  // cuid — new model
  accion: AccionContrato
  descripcion: string
  usuarioId: number
  nombreUsuario: string
  detalle: Record<string, unknown> | null
  createdAt: string
}

export interface Contrato {
  id: string          // cuid — new model
  numero: string
  pacienteId: number
  paciente: {
    id: number
    nombre: string
    apellido1: string
    apellido2: string | null
    numeroIdentificacion: string
    tipoIdentificacion: string
  }
  dentistaId: number
  dentista: { id: number; nombre: string }
  clinicaId: number
  fecha: string
  descripcion: string | null
  estado: EstadoContrato
  moneda: Moneda
  plazo: number | null
  periodicidad: Periodicidad | null
  notas: string | null
  creadoPorId: number
  creadoPor: { id: number; nombre: string }
  tratamientos: ContratoTratamientoItem[]
  pagos: ContratoPago[]
  historial: ContratoHistorialEntry[]
  montoTotal: number
  montoPagado: number
  saldo: number
  createdAt: string
  updatedAt: string
}

export interface CreateContratoTratamientoInput {
  tratamientoId: number
  pieza?: string
  cantidad?: number
  precioUnitario: number
  descuento?: number
  estadoItem?: EstadoItem
  fechaPropuesta?: string
  observaciones?: string
}

export interface CreateContratoInput {
  pacienteId: number
  dentistaId: number
  clinicaId: number
  fecha: string
  descripcion?: string
  moneda?: Moneda
  plazo?: number
  periodicidad?: Periodicidad
  notas?: string
  tratamientos?: CreateContratoTratamientoInput[]
}

export type UpdateContratoInput = Partial<Omit<CreateContratoInput, 'tratamientos'>>

export type AddTratamientoInput = CreateContratoTratamientoInput
export type UpdateTratamientoItemInput = Partial<AddTratamientoInput>

export interface RegistrarPagoInput {
  fecha: string
  monto: number
  tipoPago: TipoPago
  concepto?: string
  referencia?: string
  numeroFactura?: string
  autorizacion?: string
  notas?: string
}

export type EditarPagoInput = Partial<Omit<RegistrarPagoInput, 'monto'>>

export interface AnularPagoInput {
  motivoAnulacion?: string
}

export interface CambiarEstadoInput {
  estado: EstadoContrato
}

export interface ContratoQuery {
  page?: number
  limit?: number
  q?: string
  estado?: EstadoContrato
  pacienteId?: number
  dentistaId?: number
}

export const ESTADO_CONTRATO_VARIANT: Record<EstadoContrato, { label: string; cls: string }> = {
  BORRADOR:   { label: 'Borrador',   cls: 'bg-muted text-foreground' },
  ACTIVO:     { label: 'Activo',     cls: 'bg-success/20 text-foreground border-success' },
  PAUSADO:    { label: 'Pausado',    cls: 'bg-warning/20 text-foreground border-warning' },
  COMPLETADO: { label: 'Completado', cls: 'bg-primary/15 text-foreground border-primary' },
  CANCELADO:  { label: 'Cancelado',  cls: 'bg-destructive/15 text-foreground border-destructive' },
}

export const ESTADO_ITEM_VARIANT: Record<EstadoItem, { label: string; cls: string }> = {
  PROPUESTO:  { label: 'Propuesto',  cls: 'bg-muted text-foreground' },
  ACEPTADO:   { label: 'Aceptado',   cls: 'bg-primary/15 text-foreground border-primary' },
  EN_CURSO:   { label: 'En curso',   cls: 'bg-warning/20 text-foreground border-warning' },
  FINALIZADO: { label: 'Finalizado', cls: 'bg-success/20 text-foreground border-success' },
  CANCELADO:  { label: 'Cancelado',  cls: 'bg-destructive/15 text-foreground border-destructive' },
}

export const TIPO_PAGO_LABEL: Record<TipoPago, string> = {
  EFECTIVO:     'Efectivo',
  TARJETA:      'Tarjeta',
  SINPE:        'SINPE',
  TRANSFERENCIA:'Transferencia',
  CHEQUE:       'Cheque',
  OTRO:         'Otro',
}

export const PERIODICIDAD_LABEL: Record<Periodicidad, string> = {
  SEMANAL:     'Semanal',
  QUINCENAL:   'Quincenal',
  MENSUAL:     'Mensual',
  TRIMESTRAL:  'Trimestral',
  SEMESTRAL:   'Semestral',
  ANUAL:       'Anual',
}

export const ESTADO_TRANSITIONS: Record<EstadoContrato, EstadoContrato[]> = {
  BORRADOR:   ['ACTIVO'],
  ACTIVO:     ['PAUSADO', 'COMPLETADO', 'CANCELADO'],
  PAUSADO:    ['ACTIVO', 'CANCELADO'],
  COMPLETADO: [],
  CANCELADO:  [],
}
