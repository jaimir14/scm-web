import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FormSection, FormGrid, FormField } from "@/components/ui/form-section";
import { useTreatments } from "@/services/treatments.service";
import {
  ListChecks,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, currencySymbol } from "@/lib/formatters";
import type { Treatment } from "@/types";
import type {
  Contrato,
  Moneda,
  AddTratamientoInput,
  UpdateTratamientoItemInput,
  EstadoItem,
} from "@/types/contrato";
import {
  ESTADO_ITEM_VARIANT,
} from "@/types/contrato";

// ─── Shared form values type ───────────────────────────────────────────────

type TratamientoFormValues = Partial<AddTratamientoInput & { treatmentId?: number }>;

// ─── Props ─────────────────────────────────────────────────────────────────

interface PlanTratamientoContratoProps {
  contrato: Contrato
  onAddTratamiento: (input: AddTratamientoInput) => void
  onUpdateItem: (itemId: string, input: UpdateTratamientoItemInput) => void
  onRemoveItem: (itemId: string) => void
  readOnly?: boolean
}

export function PlanTratamientoContrato({
  contrato,
  onAddTratamiento,
  onUpdateItem,
  onRemoveItem,
  readOnly = false,
}: PlanTratamientoContratoProps) {
  const { data: treatments } = useTreatments();
  const [openAdd, setOpenAdd] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TratamientoFormValues>({ estadoItem: "PROPUESTO" });
  const [editDraft, setEditDraft] = useState<TratamientoFormValues>({});

  const totals = useMemo(() => ({
    montoTotal: contrato.montoTotal,
    montoPagado: contrato.montoPagado,
    saldo: contrato.saldo,
  }), [contrato.montoTotal, contrato.montoPagado, contrato.saldo]);

  const addItem = () => {
    if (!draft.tratamientoId || !draft.precioUnitario) {
      toast.error("Complete tratamiento y precio");
      return;
    }
    onAddTratamiento({
      tratamientoId: draft.tratamientoId,
      pieza: draft.pieza,
      cantidad: draft.cantidad,
      precioUnitario: Number(draft.precioUnitario),
      descuento: draft.descuento,
      estadoItem: draft.estadoItem as EstadoItem,
      fechaPropuesta: draft.fechaPropuesta,
      observaciones: draft.observaciones,
    });
    setDraft({ estadoItem: "PROPUESTO" });
    setOpenAdd(false);
  };

  const saveEditItem = () => {
    if (!editItemId) return;
    onUpdateItem(editItemId, {
      tratamientoId: editDraft.tratamientoId,
      pieza: editDraft.pieza,
      cantidad: editDraft.cantidad,
      precioUnitario: editDraft.precioUnitario !== undefined ? Number(editDraft.precioUnitario) : undefined,
      descuento: editDraft.descuento,
      estadoItem: editDraft.estadoItem as EstadoItem | undefined,
      fechaPropuesta: editDraft.fechaPropuesta,
      observaciones: editDraft.observaciones,
    });
    setEditItemId(null);
    setEditDraft({});
  };

  const editingItem = editItemId ? contrato.tratamientos.find(t => t.id === editItemId) : null;

  return (
    <div className="space-y-5">
      <FormSection icon={ListChecks} title="Plan de tratamiento" description="Tratamientos propuestos y su seguimiento">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <SummaryCard label="Total del plan" value={totals.montoTotal} moneda={contrato.moneda} />
          <SummaryCard label="Total pagado" value={totals.montoPagado} moneda={contrato.moneda} accent="success" />
          <SummaryCard label="Saldo pendiente" value={totals.saldo} moneda={contrato.moneda} accent="warning" />
          <SummaryCard label="Ítems" value={contrato.tratamientos.length} isCount />
        </div>

        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline">{contrato.tratamientos.length} ítems</Badge>
          {!readOnly && (
            <Dialog open={openAdd} onOpenChange={setOpenAdd}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Agregar tratamiento</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Nuevo ítem del plan</DialogTitle></DialogHeader>
                <TratamientoFormFields
                  values={draft}
                  onChange={setDraft}
                  moneda={contrato.moneda}
                  treatments={treatments}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenAdd(false)}>Cancelar</Button>
                  <Button onClick={addItem}>Agregar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tratamiento</TableHead>
                <TableHead>Pieza</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                {!readOnly && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {contrato.tratamientos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={readOnly ? 5 : 6} className="text-center py-8 text-muted-foreground">
                    No hay tratamientos registrados
                  </TableCell>
                </TableRow>
              ) : (
                contrato.tratamientos.map(it => (
                  <TableRow key={it.id}>
                    <TableCell className="font-medium">{it.tratamiento.nombre}</TableCell>
                    <TableCell>{it.pieza || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(it.subtotal, contrato.moneda)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={ESTADO_ITEM_VARIANT[it.estadoItem].cls}>{ESTADO_ITEM_VARIANT[it.estadoItem].label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{it.fechaPropuesta || "—"}</TableCell>
                    {!readOnly && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditItemId(it.id);
                              setEditDraft({
                                tratamientoId: it.tratamientoId,
                                pieza: it.pieza ?? undefined,
                                cantidad: it.cantidad,
                                precioUnitario: it.precioUnitario,
                                descuento: it.descuento,
                                estadoItem: it.estadoItem,
                                fechaPropuesta: it.fechaPropuesta ?? undefined,
                                observaciones: it.observaciones ?? undefined,
                              });
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar tratamiento</AlertDialogTitle>
                                <AlertDialogDescription>¿Está seguro que desea eliminar este ítem del plan de tratamiento? Esta acción no se puede deshacer.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onRemoveItem(it.id)}>Eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </FormSection>

      {editingItem && (
        <Dialog open={!!editItemId} onOpenChange={open => { if (!open) { setEditItemId(null); setEditDraft({}); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Editar ítem del plan</DialogTitle></DialogHeader>
            <TratamientoFormFields
              values={editDraft}
              onChange={setEditDraft}
              moneda={contrato.moneda}
              treatments={treatments}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditItemId(null); setEditDraft({}); }}>Cancelar</Button>
              <Button onClick={saveEditItem}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

// ─── Shared form fields (used by both Add and Edit dialogs) ────────────────

function TratamientoFormFields({
  values,
  onChange,
  moneda,
  treatments,
}: {
  values: TratamientoFormValues;
  onChange: React.Dispatch<React.SetStateAction<TratamientoFormValues>>;
  moneda: Moneda;
  treatments: Treatment[] | undefined;
}) {
  const symbol = currencySymbol(moneda);

  return (
    <FormGrid>
      <div className="col-span-12 sm:col-span-8">
        <FormField label="Tratamiento" required>
          <Select
            value={values.tratamientoId ? String(values.tratamientoId) : ""}
            onValueChange={v => {
              const t = treatments?.find(x => String(x.id) === v);
              onChange(d => ({ ...d, tratamientoId: Number(v), precioUnitario: t?.precio ?? d.precioUnitario }));
            }}
          >
            <SelectTrigger><SelectValue placeholder="Catálogo" /></SelectTrigger>
            <SelectContent>
              {treatments?.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
      </div>
      <div className="col-span-12 sm:col-span-4">
        <FormField label="Pieza / zona">
          <Input value={values.pieza || ""} onChange={e => onChange(d => ({ ...d, pieza: e.target.value }))} placeholder="Ej. 16" />
        </FormField>
      </div>
      <div className="col-span-6">
        <FormField label="Precio" required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{symbol}</span>
            <Input className="pl-7" type="number" value={values.precioUnitario ?? ""} onChange={e => onChange(d => ({ ...d, precioUnitario: Number(e.target.value) }))} />
          </div>
        </FormField>
      </div>
      <div className="col-span-6">
        <FormField label="Estado">
          <Select value={values.estadoItem as string} onValueChange={(v: EstadoItem) => onChange(d => ({ ...d, estadoItem: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(ESTADO_ITEM_VARIANT).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
      </div>
      <div className="col-span-6">
        <FormField label="Fecha propuesta">
          <Input type="date" value={values.fechaPropuesta || ""} onChange={e => onChange(d => ({ ...d, fechaPropuesta: e.target.value }))} />
        </FormField>
      </div>
      <div className="col-span-6">
        <FormField label="Descuento">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{symbol}</span>
            <Input className="pl-7" type="number" value={values.descuento ?? ""} onChange={e => onChange(d => ({ ...d, descuento: Number(e.target.value) }))} />
          </div>
        </FormField>
      </div>
      <div className="col-span-12">
        <FormField label="Observaciones">
          <Textarea rows={2} value={values.observaciones || ""} onChange={e => onChange(d => ({ ...d, observaciones: e.target.value }))} />
        </FormField>
      </div>
    </FormGrid>
  );
}

// ─── Summary Card ──────────────────────────────────────────────────────────

function SummaryCard({ label, value, accent, isCount, moneda = 'CRC' }: { label: string; value: number; accent?: "primary" | "success" | "warning"; isCount?: boolean; moneda?: Moneda }) {
  const cls =
    accent === "primary" ? "border-primary/40" :
    accent === "success" ? "border-success/40" :
    accent === "warning" ? "border-warning/40" : "";
  return (
    <div className={`rounded-lg border p-3 bg-card ${cls}`}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums mt-0.5">{isCount ? value : formatCurrency(value, moneda)}</p>
    </div>
  );
}
