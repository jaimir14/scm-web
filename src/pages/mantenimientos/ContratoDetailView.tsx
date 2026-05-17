import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FormSection, FormGrid, FormField } from "@/components/ui/form-section";
import { InfoField } from "@/components/ui/info-field";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanTratamientoContrato } from "@/components/expediente/dental/PlanTratamientoContrato";
import { EstadoCuenta } from "@/components/expediente/dental/EstadoCuenta";
import { usePermissions } from "@/contexts/PermissionContext";
import { useDentists } from "@/services/users.service";
import {
  useContrato, useUpdateContrato, useCambiarEstado, useDeleteContrato,
  useAddTratamiento, useUpdateTratamientoItem, useRemoveTratamiento,
  useRegistrarPago, useEditarPago, useAnularPago,
} from "@/services/contratos.service";
import type {
  Contrato, EstadoContrato, UpdateContratoInput,
  AddTratamientoInput, UpdateTratamientoItemInput,
  RegistrarPagoInput, EditarPagoInput, Periodicidad,
  AccionContrato,
} from "@/types/contrato";
import {
  ESTADO_CONTRATO_VARIANT, ESTADO_TRANSITIONS, PERIODICIDAD_LABEL,
} from "@/types/contrato";
import {
  FileSignature, ArrowLeft, Pencil, Trash2, MoreVertical,
  RefreshCcw, CreditCard, Ban, History, Plus,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formatters";

const formatDate = (d: string) => new Date(d).toLocaleDateString("es-CR");

export function ContratoDetailView({ id }: { id: string }) {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { data: contrato, isLoading, error } = useContrato(id);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const cambiarEstadoMutation = useCambiarEstado();
  const deleteContrato = useDeleteContrato();
  const addTratamiento = useAddTratamiento();
  const updateTratamientoItem = useUpdateTratamientoItem();
  const removeTratamiento = useRemoveTratamiento();
  const registrarPago = useRegistrarPago();
  const editarPago = useEditarPago();
  const anularPago = useAnularPago();

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !contrato) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-destructive">Error al cargar el contrato</p>
        <Button variant="outline" className="mt-3" onClick={() => navigate("/mantenimientos/contratos")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver
        </Button>
      </div>
    );
  }

  const v = ESTADO_CONTRATO_VARIANT[contrato.estado];
  const transitions = ESTADO_TRANSITIONS[contrato.estado];

  const handleCambiarEstado = (estado: EstadoContrato) => {
    cambiarEstadoMutation.mutate(
      { id: contrato.id, estado },
      {
        onSuccess: () => toast.success(`Estado cambiado a ${ESTADO_CONTRATO_VARIANT[estado].label}`),
        onError: (err: Error) => toast.error(err.message || "Error al cambiar estado"),
      }
    );
  };

  const handleDelete = () => {
    deleteContrato.mutate(contrato.id, {
      onSuccess: () => { toast.success("Contrato eliminado"); navigate("/mantenimientos/contratos"); },
      onError: (err: Error) => toast.error(err.message || "Error al eliminar"),
    });
  };

  const handleAddTratamiento = (input: AddTratamientoInput) => {
    addTratamiento.mutate({ id: contrato.id, ...input }, {
      onSuccess: () => toast.success("Tratamiento agregado"),
      onError: (err: Error) => toast.error(err.message || "Error al agregar tratamiento"),
    });
  };

  const handleUpdateItem = (itemId: string, input: UpdateTratamientoItemInput) => {
    updateTratamientoItem.mutate({ id: contrato.id, itemId, ...input }, {
      onSuccess: () => toast.success("Tratamiento actualizado"),
      onError: (err: Error) => toast.error(err.message || "Error al actualizar"),
    });
  };

  const handleRemoveItem = (itemId: string) => {
    removeTratamiento.mutate({ id: contrato.id, itemId }, {
      onSuccess: () => toast.success("Tratamiento eliminado"),
      onError: (err: Error) => toast.error(err.message || "Error al eliminar"),
    });
  };

  const handleRegistrarPago = (input: RegistrarPagoInput) => {
    registrarPago.mutate({ id: contrato.id, ...input }, {
      onSuccess: () => toast.success("Pago registrado"),
      onError: (err: Error) => toast.error(err.message || "Error al registrar pago"),
    });
  };

  const handleEditarPago = (pagoId: string, input: EditarPagoInput) => {
    editarPago.mutate({ id: contrato.id, pagoId, ...input }, {
      onSuccess: () => toast.success("Pago actualizado"),
      onError: (err: Error) => toast.error(err.message || "Error al actualizar pago"),
    });
  };

  const handleAnularPago = (pagoId: string, motivo?: string) => {
    anularPago.mutate({ id: contrato.id, pagoId, motivoAnulacion: motivo }, {
      onSuccess: () => toast.success("Pago anulado"),
      onError: (err: Error) => toast.error(err.message || "Error al anular pago"),
    });
  };

  const readOnly = contrato.estado === "COMPLETADO" || contrato.estado === "CANCELADO";
  const canEdit = hasPermission("contratos.editar");
  const canPago = hasPermission("contratos.pago.registrar");

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Top bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => navigate("/mantenimientos/contratos")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Contratos
        </Button>
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <h1 className="text-xl font-bold font-mono truncate">{contrato.numero}</h1>
          <Badge variant="outline" className={v.cls}>{v.label}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {(canEdit || (contrato.estado === "BORRADOR" && hasPermission("contratos.eliminar"))) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm"><MoreVertical className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && <DropdownMenuItem onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>}
                {canEdit && transitions.length > 0 && <DropdownMenuSeparator />}
                {canEdit && transitions.map(t => (
                  <DropdownMenuItem key={t} onClick={() => handleCambiarEstado(t)}><RefreshCcw className="h-4 w-4 mr-2" /> Pasar a {ESTADO_CONTRATO_VARIANT[t].label}</DropdownMenuItem>
                ))}
                {contrato.estado === "BORRADOR" && hasPermission("contratos.eliminar") && (
                  <><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="h-4 w-4 mr-2" /> Eliminar</DropdownMenuItem></>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Section 1 — Información del contrato */}
      <FormSection icon={FileSignature} title="Información del contrato" description="Datos generales del contrato">
        <FormGrid>
          <InfoField className="col-span-6 md:col-span-4" label="Paciente" value={`${contrato.paciente.nombre} ${contrato.paciente.apellido1}${contrato.paciente.apellido2 ? " " + contrato.paciente.apellido2 : ""}`} />
          <InfoField className="col-span-6 md:col-span-4" label="Identificación" value={`${contrato.paciente.tipoIdentificacion}: ${contrato.paciente.numeroIdentificacion}`} />
          <InfoField className="col-span-6 md:col-span-4" label="Dentista" value={contrato.dentista.nombre} />
          <InfoField className="col-span-6 md:col-span-4" label="N° Contrato" value={contrato.numero} />
          <InfoField className="col-span-6 md:col-span-4" label="Fecha" value={formatDate(contrato.fecha)} />
          <InfoField className="col-span-6 md:col-span-4" label="Estado" value={<Badge variant="outline" className={v.cls}>{v.label}</Badge>} />
          <InfoField className="col-span-6 md:col-span-4" label="Moneda" value={contrato.moneda === "CRC" ? "Colones (₡)" : "Dólares ($)"} />
          <InfoField className="col-span-6 md:col-span-4" label="Plazo" value={contrato.plazo ? `${contrato.plazo} meses` : "—"} />
          <InfoField className="col-span-6 md:col-span-4" label="Periodicidad" value={contrato.periodicidad ? PERIODICIDAD_LABEL[contrato.periodicidad] : "—"} />
          <InfoField className="col-span-6 md:col-span-4" label="Creado por" value={contrato.creadoPor.nombre} />
          <InfoField className="col-span-6 md:col-span-4" label="Fecha de creación" value={formatDate(contrato.createdAt)} />
          {contrato.descripcion && <InfoField className="col-span-12" label="Descripción" value={<span className="whitespace-pre-wrap">{contrato.descripcion}</span>} />}
          {contrato.notas && <InfoField className="col-span-12" label="Notas" value={<span className="whitespace-pre-wrap">{contrato.notas}</span>} />}
        </FormGrid>
      </FormSection>

      {/* Section 2 — Plan de tratamiento */}
      <PlanTratamientoContrato contrato={contrato} onAddTratamiento={handleAddTratamiento} onUpdateItem={handleUpdateItem} onRemoveItem={handleRemoveItem} readOnly={readOnly || !canEdit} />

      {/* Section 3 — Estado de cuenta */}
      <EstadoCuenta contrato={contrato} onRegistrarPago={handleRegistrarPago} onEditarPago={handleEditarPago} onAnularPago={handleAnularPago} readOnly={readOnly || !canPago} />

      {/* Section 4 — Historial */}
      <HistorialTimeline contrato={contrato} />

      {/* Edit dialog */}
      <EditContratoDialog open={editOpen} onOpenChange={setEditOpen} contrato={contrato} />

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar contrato</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará permanentemente el contrato {contrato.numero}. No se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Edit Contrato Dialog ──────────────────────────────────────────────────

function EditContratoDialog({ open, onOpenChange, contrato }: { open: boolean; onOpenChange: (open: boolean) => void; contrato: Contrato }) {
  const dentists = useDentists();
  const updateContrato = useUpdateContrato();
  const [dentistaId, setDentistaId] = useState(String(contrato.dentistaId));
  const [fecha, setFecha] = useState(contrato.fecha.slice(0, 10));
  const [moneda, setMoneda] = useState(contrato.moneda);
  const [plazo, setPlazo] = useState(contrato.plazo ? String(contrato.plazo) : "");
  const [periodicidad, setPeriodicidad] = useState<Periodicidad | "">(contrato.periodicidad ?? "");
  const [descripcion, setDescripcion] = useState(contrato.descripcion ?? "");
  const [notas, setNotas] = useState(contrato.notas ?? "");

  useEffect(() => {
    setDentistaId(String(contrato.dentistaId)); setFecha(contrato.fecha.slice(0, 10));
    setMoneda(contrato.moneda); setPlazo(contrato.plazo ? String(contrato.plazo) : "");
    setPeriodicidad(contrato.periodicidad ?? ""); setDescripcion(contrato.descripcion ?? "");
    setNotas(contrato.notas ?? "");
  }, [contrato]);

  const handleSave = () => {
    if (!dentistaId) { toast.error("Seleccione un dentista"); return; }
    const payload: { id: string } & UpdateContratoInput = {
      id: contrato.id, dentistaId: Number(dentistaId), fecha, moneda,
      ...(plazo ? { plazo: Number(plazo) } : { plazo: undefined }),
      ...(periodicidad ? { periodicidad } : { periodicidad: undefined }),
      ...(descripcion ? { descripcion } : { descripcion: undefined }),
      ...(notas ? { notas } : { notas: undefined }),
    };
    updateContrato.mutate(payload, {
      onSuccess: () => { toast.success("Contrato actualizado"); onOpenChange(false); },
      onError: (err: Error) => toast.error(err.message || "Error al actualizar"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Editar Contrato — {contrato.numero}</DialogTitle></DialogHeader>
        <FormGrid>
          <div className="col-span-12 sm:col-span-6">
            <FormField label="Dentista" required>
              <Select value={dentistaId} onValueChange={setDentistaId}>
                <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                <SelectContent>{(dentists.data ?? []).map(d => <SelectItem key={d.id} value={String(d.id)}>{d.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="col-span-12 sm:col-span-6"><FormField label="Fecha" required><Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></FormField></div>
          <div className="col-span-6 sm:col-span-4">
            <FormField label="Moneda">
              <Select value={moneda} onValueChange={v => setMoneda(v as typeof moneda)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="CRC">CRC (₡)</SelectItem><SelectItem value="USD">USD ($)</SelectItem></SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="col-span-6 sm:col-span-4"><FormField label="Plazo (meses)"><Input type="number" min={1} value={plazo} onChange={e => setPlazo(e.target.value)} /></FormField></div>
          <div className="col-span-12 sm:col-span-4">
            <FormField label="Periodicidad">
              <Select value={periodicidad || "none"} onValueChange={v => setPeriodicidad(v === "none" ? "" : v as Periodicidad)}>
                <SelectTrigger><SelectValue placeholder="Ninguna" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin periodicidad</SelectItem>
                  {(Object.entries(PERIODICIDAD_LABEL) as [Periodicidad, string][]).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="col-span-12"><FormField label="Descripción"><Textarea rows={2} value={descripcion} onChange={e => setDescripcion(e.target.value)} /></FormField></div>
          <div className="col-span-12"><FormField label="Notas"><Textarea rows={2} value={notas} onChange={e => setNotas(e.target.value)} /></FormField></div>
        </FormGrid>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={updateContrato.isPending}>{updateContrato.isPending ? "Guardando..." : "Guardar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Historial Timeline ────────────────────────────────────────────────────

const HISTORIAL_ICON: Record<AccionContrato, React.ComponentType<{ className?: string }>> = {
  CREACION: FileSignature, ACTIVACION: RefreshCcw, MODIFICACION: Pencil,
  ESTADO_CAMBIADO: RefreshCcw, TRATAMIENTO_AGREGADO: Plus, TRATAMIENTO_MODIFICADO: Pencil,
  TRATAMIENTO_ELIMINADO: Trash2, PAGO_REGISTRADO: CreditCard, PAGO_ANULADO: Ban,
};

function HistorialTimeline({ contrato }: { contrato: Contrato }) {
  return (
    <FormSection icon={History} title="Historial de cambios" description="Registro de todas las acciones sobre este contrato">
      {contrato.historial.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin registros en el historial.</p>
      ) : (
        <ol className="space-y-3">
          {contrato.historial.map(entry => {
            const Icon = HISTORIAL_ICON[entry.accion] ?? History;
            return (
              <li key={entry.id} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{entry.descripcion}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.nombreUsuario} · {formatDate(entry.createdAt)}</p>
                  {entry.detalle && (
                    <details className="mt-1">
                      <summary className="text-xs text-muted-foreground cursor-pointer select-none">Ver detalle</summary>
                      <pre className="text-[10px] bg-muted/50 rounded p-2 mt-1 overflow-x-auto">{JSON.stringify(entry.detalle, null, 2)}</pre>
                    </details>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </FormSection>
  );
}
