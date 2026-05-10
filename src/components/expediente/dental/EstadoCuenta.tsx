import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormSection, FormField, FormGrid } from "@/components/ui/form-section";
import { Wallet, Plus, Eye, Ban, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

type MovType = "cargo" | "abono" | "ajuste" | "anulacion";
type MovStatus = "aplicado" | "pendiente" | "anulado";

interface Mov {
  id: string;
  fecha: string;
  tipo: MovType;
  concepto: string;
  contrato?: string;
  monto: number;
  moneda: string;
  formaPago?: string;
  factura?: string;
  referencia?: string;
  autorizacion?: string;
  estado: MovStatus;
}

const TIPO_LABEL: Record<MovType, string> = { cargo: "Cargo", abono: "Abono", ajuste: "Ajuste", anulacion: "Anulación" };
const TIPO_CLS: Record<MovType, string> = {
  cargo: "bg-warning/15 border-warning",
  abono: "bg-success/15 border-success",
  ajuste: "bg-muted",
  anulacion: "bg-destructive/15 border-destructive",
};
const ESTADO_CLS: Record<MovStatus, string> = {
  aplicado: "bg-success/20 border-success",
  pendiente: "bg-warning/20 border-warning",
  anulado: "bg-destructive/15 border-destructive line-through",
};

const SAMPLE: Mov[] = [
  { id: "1", fecha: "2026-05-01", tipo: "cargo",  concepto: "Plan de tratamiento CT-2026-0042", contrato: "CT-2026-0042", monto: 240000, moneda: "CRC", estado: "aplicado" },
  { id: "2", fecha: "2026-05-02", tipo: "abono",  concepto: "Abono cuota 1", contrato: "CT-2026-0042", monto: 40000, moneda: "CRC", formaPago: "Tarjeta", factura: "F-001234", autorizacion: "AUT-99812", estado: "aplicado" },
  { id: "3", fecha: "2026-05-05", tipo: "abono",  concepto: "Abono parcial", monto: 20000, moneda: "CRC", formaPago: "Efectivo", estado: "aplicado" },
  { id: "4", fecha: "2026-06-01", tipo: "cargo",  concepto: "Cuota 2", contrato: "CT-2026-0042", monto: 40000, moneda: "CRC", estado: "pendiente" },
];

export function EstadoCuenta() {
  const [movs, setMovs] = useState<Mov[]>(SAMPLE);
  const [openPay, setOpenPay] = useState(false);
  const [draft, setDraft] = useState<Partial<Mov>>({ tipo: "abono", moneda: "CRC", estado: "aplicado" });

  const totalContratado = movs.filter(m => m.tipo === "cargo" && m.estado !== "anulado").reduce((s, m) => s + m.monto, 0);
  const totalPagado = movs.filter(m => m.tipo === "abono" && m.estado === "aplicado").reduce((s, m) => s + m.monto, 0);
  const saldo = totalContratado - totalPagado;
  const vencidos = movs.filter(m => m.tipo === "cargo" && m.estado === "pendiente" && m.fecha < new Date().toISOString().slice(0, 10));

  const next = movs.filter(m => m.tipo === "cargo" && m.estado === "pendiente").sort((a, b) => a.fecha.localeCompare(b.fecha))[0];

  const registrar = () => {
    if (!draft.concepto || !draft.monto) {
      toast.error("Complete concepto y monto"); return;
    }
    setMovs(p => [
      ...p,
      {
        id: String(Date.now()),
        fecha: draft.fecha || new Date().toISOString().slice(0, 10),
        tipo: (draft.tipo as MovType) || "abono",
        concepto: draft.concepto!,
        contrato: draft.contrato,
        monto: Number(draft.monto),
        moneda: draft.moneda || "CRC",
        formaPago: draft.formaPago,
        factura: draft.factura,
        referencia: draft.referencia,
        autorizacion: draft.autorizacion,
        estado: (draft.estado as MovStatus) || "aplicado",
      },
    ]);
    setDraft({ tipo: "abono", moneda: "CRC", estado: "aplicado" });
    setOpenPay(false);
    toast.success("Movimiento registrado");
  };

  const anular = (id: string) =>
    setMovs(p => p.map(m => (m.id === id ? { ...m, estado: "anulado" } : m)));
  const reactivar = (id: string) =>
    setMovs(p => p.map(m => (m.id === id ? { ...m, estado: "aplicado" } : m)));

  return (
    <div className="space-y-5">
      <FormSection
        icon={Wallet}
        title="Estado de cuenta"
        description="Resumen financiero del paciente"
        actions={
          <Dialog open={openPay} onOpenChange={setOpenPay}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Registrar pago</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Nuevo movimiento</DialogTitle></DialogHeader>
              <FormGrid>
                <div className="col-span-6">
                  <FormField label="Tipo">
                    <Select value={draft.tipo as string} onValueChange={(v: MovType) => setDraft(d => ({ ...d, tipo: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(TIPO_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
                <div className="col-span-6">
                  <FormField label="Fecha"><Input type="date" value={draft.fecha || ""} onChange={e => setDraft(d => ({ ...d, fecha: e.target.value }))} /></FormField>
                </div>
                <div className="col-span-12">
                  <FormField label="Concepto" required><Input value={draft.concepto || ""} onChange={e => setDraft(d => ({ ...d, concepto: e.target.value }))} /></FormField>
                </div>
                <div className="col-span-6">
                  <FormField label="Monto" required><Input type="number" value={draft.monto ?? ""} onChange={e => setDraft(d => ({ ...d, monto: Number(e.target.value) }))} /></FormField>
                </div>
                <div className="col-span-3">
                  <FormField label="Moneda"><Input value={draft.moneda || ""} onChange={e => setDraft(d => ({ ...d, moneda: e.target.value }))} /></FormField>
                </div>
                <div className="col-span-3">
                  <FormField label="Contrato"><Input value={draft.contrato || ""} onChange={e => setDraft(d => ({ ...d, contrato: e.target.value }))} /></FormField>
                </div>
                <div className="col-span-6">
                  <FormField label="Forma de pago"><Input value={draft.formaPago || ""} onChange={e => setDraft(d => ({ ...d, formaPago: e.target.value }))} placeholder="Efectivo, Tarjeta, SINPE…" /></FormField>
                </div>
                <div className="col-span-6">
                  <FormField label="N° factura"><Input value={draft.factura || ""} onChange={e => setDraft(d => ({ ...d, factura: e.target.value }))} /></FormField>
                </div>
                <div className="col-span-6">
                  <FormField label="Referencia"><Input value={draft.referencia || ""} onChange={e => setDraft(d => ({ ...d, referencia: e.target.value }))} /></FormField>
                </div>
                <div className="col-span-6">
                  <FormField label="Autorización"><Input value={draft.autorizacion || ""} onChange={e => setDraft(d => ({ ...d, autorizacion: e.target.value }))} /></FormField>
                </div>
              </FormGrid>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenPay(false)}>Cancelar</Button>
                <Button onClick={registrar}>Registrar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Stat label="Total contratado" value={`₡${totalContratado.toLocaleString()}`} />
          <Stat label="Total pagado" value={`₡${totalPagado.toLocaleString()}`} accent="success" />
          <Stat label="Saldo pendiente" value={`₡${saldo.toLocaleString()}`} accent="warning" />
          <Stat label="Pagos vencidos" value={vencidos.length.toString()} accent={vencidos.length ? "destructive" : undefined} />
          <Stat label="Próxima cuota" value={next ? `₡${next.monto.toLocaleString()}` : "—"} />
          <Stat label="Próximo vencimiento" value={next?.fecha || "—"} />
        </div>
      </FormSection>

      <FormSection icon={Wallet} title="Movimientos" description="Cargos, abonos y ajustes del paciente">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Forma</TableHead>
                <TableHead>Factura</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movs.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{m.fecha}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={TIPO_CLS[m.tipo]}>{TIPO_LABEL[m.tipo]}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{m.concepto}</TableCell>
                  <TableCell className="text-muted-foreground">{m.contrato || "—"}</TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">{m.moneda} {m.monto.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{m.formaPago || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{m.factura || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className={ESTADO_CLS[m.estado]}>{m.estado}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => toast.info("Ver detalle")}><Eye className="h-4 w-4" /></Button>
                      {m.estado !== "anulado" ? (
                        <Button size="icon" variant="ghost" onClick={() => anular(m.id)}><Ban className="h-4 w-4" /></Button>
                      ) : (
                        <Button size="icon" variant="ghost" onClick={() => reactivar(m.id)}><RefreshCcw className="h-4 w-4" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </FormSection>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "primary" | "success" | "warning" | "destructive" }) {
  const cls =
    accent === "success" ? "border-success/40" :
    accent === "warning" ? "border-warning/40" :
    accent === "destructive" ? "border-destructive/40" :
    accent === "primary" ? "border-primary/40" : "";
  return (
    <div className={`rounded-lg border p-3 bg-card ${cls}`}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-base font-semibold tabular-nums mt-0.5">{value}</p>
    </div>
  );
}
