import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormSection, FormGrid, FormField } from "@/components/ui/form-section";
import { useTreatments } from "@/services/treatments.service";
import { ListChecks, FileSignature, Plus, Pencil, FileText, CreditCard, Power } from "lucide-react";
import { toast } from "sonner";

type PlanStatus = "propuesto" | "aceptado" | "en_curso" | "finalizado" | "cancelado";

interface PlanItem {
  id: string;
  treatmentId?: number;
  tratamiento: string;
  pieza: string;
  precio: number;
  estado: PlanStatus;
  fecha: string;
  dentista: string;
  observaciones?: string;
}

const STATUS_VARIANT: Record<PlanStatus, { label: string; cls: string }> = {
  propuesto:   { label: "Propuesto",   cls: "bg-muted text-foreground" },
  aceptado:    { label: "Aceptado",    cls: "bg-primary/15 text-foreground border-primary" },
  en_curso:    { label: "En curso",    cls: "bg-warning/20 text-foreground border-warning" },
  finalizado:  { label: "Finalizado",  cls: "bg-success/20 text-foreground border-success" },
  cancelado:   { label: "Cancelado",   cls: "bg-destructive/15 text-foreground border-destructive" },
};

const SAMPLE_ITEMS: PlanItem[] = [
  { id: "1", tratamiento: "Resina compuesta", pieza: "16", precio: 35000, estado: "aceptado", fecha: "2026-05-12", dentista: "Dr. García" },
  { id: "2", tratamiento: "Endodoncia",       pieza: "26", precio: 180000, estado: "propuesto", fecha: "2026-05-20", dentista: "Dr. García" },
  { id: "3", tratamiento: "Limpieza dental",  pieza: "Boca completa", precio: 25000, estado: "finalizado", fecha: "2026-04-30", dentista: "Dr. García" },
];

export function PlanTratamientoContrato() {
  const { data: treatments } = useTreatments();
  const [items, setItems] = useState<PlanItem[]>(SAMPLE_ITEMS);
  const [openAdd, setOpenAdd] = useState(false);
  const [draft, setDraft] = useState<Partial<PlanItem>>({ estado: "propuesto" });

  const totals = useMemo(() => {
    const total = items.reduce((s, i) => s + i.precio, 0);
    const aceptado = items.filter(i => i.estado !== "propuesto" && i.estado !== "cancelado").reduce((s, i) => s + i.precio, 0);
    const pagado = 60000; // mock
    return { total, aceptado, pagado, saldo: aceptado - pagado };
  }, [items]);

  const addItem = () => {
    if (!draft.tratamiento || !draft.pieza || !draft.precio) {
      toast.error("Complete tratamiento, pieza y precio");
      return;
    }
    setItems(p => [
      ...p,
      {
        id: String(Date.now()),
        tratamiento: draft.tratamiento!,
        pieza: draft.pieza!,
        precio: Number(draft.precio),
        estado: (draft.estado as PlanStatus) || "propuesto",
        fecha: draft.fecha || new Date().toISOString().slice(0, 10),
        dentista: draft.dentista || "—",
        observaciones: draft.observaciones,
        treatmentId: draft.treatmentId,
      },
    ]);
    setDraft({ estado: "propuesto" });
    setOpenAdd(false);
    toast.success("Tratamiento agregado al plan");
  };

  return (
    <div className="space-y-5">
      {/* Resumen */}
      <FormSection icon={ListChecks} title="Plan de tratamiento" description="Tratamientos propuestos y su seguimiento">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <SummaryCard label="Total del plan" value={totals.total} />
          <SummaryCard label="Aceptado" value={totals.aceptado} accent="primary" />
          <SummaryCard label="Pagado" value={totals.pagado} accent="success" />
          <SummaryCard label="Saldo pendiente" value={totals.saldo} accent="warning" />
        </div>

        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline">{items.length} ítems</Badge>
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Agregar tratamiento</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Nuevo ítem del plan</DialogTitle></DialogHeader>
              <FormGrid>
                <div className="col-span-12 sm:col-span-8">
                  <FormField label="Tratamiento" required>
                    <Select
                      value={draft.treatmentId ? String(draft.treatmentId) : ""}
                      onValueChange={v => {
                        const t = treatments?.find(x => x.id === Number(v));
                        setDraft(d => ({ ...d, treatmentId: Number(v), tratamiento: t?.nombre || "", precio: t?.precio ?? d.precio }));
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
                  <FormField label="Pieza / zona" required>
                    <Input value={draft.pieza || ""} onChange={e => setDraft(d => ({ ...d, pieza: e.target.value }))} placeholder="Ej. 16" />
                  </FormField>
                </div>
                <div className="col-span-6">
                  <FormField label="Precio" required>
                    <Input type="number" value={draft.precio ?? ""} onChange={e => setDraft(d => ({ ...d, precio: Number(e.target.value) }))} />
                  </FormField>
                </div>
                <div className="col-span-6">
                  <FormField label="Estado">
                    <Select value={draft.estado as string} onValueChange={(v: PlanStatus) => setDraft(d => ({ ...d, estado: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_VARIANT).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
                <div className="col-span-6">
                  <FormField label="Fecha propuesta">
                    <Input type="date" value={draft.fecha || ""} onChange={e => setDraft(d => ({ ...d, fecha: e.target.value }))} />
                  </FormField>
                </div>
                <div className="col-span-6">
                  <FormField label="Dentista">
                    <Input value={draft.dentista || ""} onChange={e => setDraft(d => ({ ...d, dentista: e.target.value }))} />
                  </FormField>
                </div>
                <div className="col-span-12">
                  <FormField label="Observaciones">
                    <Textarea rows={2} value={draft.observaciones || ""} onChange={e => setDraft(d => ({ ...d, observaciones: e.target.value }))} />
                  </FormField>
                </div>
              </FormGrid>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAdd(false)}>Cancelar</Button>
                <Button onClick={addItem}>Agregar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                <TableHead>Dentista</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(it => (
                <TableRow key={it.id}>
                  <TableCell className="font-medium">{it.tratamiento}</TableCell>
                  <TableCell>{it.pieza}</TableCell>
                  <TableCell className="text-right tabular-nums">₡{it.precio.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_VARIANT[it.estado].cls}>{STATUS_VARIANT[it.estado].label}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{it.fecha}</TableCell>
                  <TableCell className="text-muted-foreground">{it.dentista}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </FormSection>

      {/* Contrato */}
      <ContratoCard total={totals.aceptado} />
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent?: "primary" | "success" | "warning" }) {
  const cls =
    accent === "primary" ? "border-primary/40" :
    accent === "success" ? "border-success/40" :
    accent === "warning" ? "border-warning/40" : "";
  return (
    <div className={`rounded-lg border p-3 bg-card ${cls}`}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums mt-0.5">₡{value.toLocaleString()}</p>
    </div>
  );
}

function ContratoCard({ total }: { total: number }) {
  const [exists, setExists] = useState(true);
  if (!exists) {
    return (
      <FormSection icon={FileSignature} title="Contrato" description="Aún no hay contrato vinculado a este plan">
        <Button onClick={() => setExists(true)}><Plus className="h-4 w-4 mr-1.5" /> Crear contrato</Button>
      </FormSection>
    );
  }
  return (
    <FormSection
      icon={FileSignature}
      title="Contrato"
      description="Acuerdo financiero asociado al plan de tratamiento"
      actions={
        <div className="hidden md:flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="h-4 w-4 mr-1.5" /> Ver</Button>
          <Button size="sm" variant="outline"><Pencil className="h-4 w-4 mr-1.5" /> Modificar</Button>
          <Button size="sm"><CreditCard className="h-4 w-4 mr-1.5" /> Registrar pago</Button>
          <Button size="sm" variant="ghost" onClick={() => setExists(false)}><Power className="h-4 w-4 mr-1.5" /> Inactivar</Button>
        </div>
      }
    >
      <FormGrid>
        <Info col={3} label="N° contrato" value="CT-2026-0042" />
        <Info col={3} label="Fecha de creación" value="2026-05-01" />
        <Info col={3} label="Monto original" value={`₡${total.toLocaleString()}`} />
        <Info col={3} label="Moneda" value="CRC" />
        <Info col={3} label="Plazo" value="6 meses" />
        <Info col={3} label="Periodicidad" value="Mensual" />
        <Info col={3} label="Cuota estimada" value={`₡${Math.round(total / 6).toLocaleString()}`} />
        <Info col={3} label="Cuotas totales" value="6" />
        <Info col={3} label="Saldo actual" value={`₡${Math.max(total - 60000, 0).toLocaleString()}`} />
        <Info col={3} label="Estado" value={<Badge className="bg-success/20 text-foreground border-success" variant="outline">Activo</Badge>} />
        <div className="col-span-12">
          <FormField label="Detalle del contrato">
            <Textarea rows={3} defaultValue="Plan de pagos mensuales sin intereses. Cobros automáticos del día 1 de cada mes." />
          </FormField>
        </div>
      </FormGrid>
    </FormSection>
  );
}

function Info({ col, label, value }: { col: number; label: string; value: React.ReactNode }) {
  return (
    <div className={`col-span-6 sm:col-span-${col}`}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}
