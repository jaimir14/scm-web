import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FormSection, FormField, FormGrid } from "@/components/ui/form-section";
import { InfoField } from "@/components/ui/info-field";
import { Wallet, Plus, Eye, Ban, Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, currencySymbol, todayStr } from "@/lib/formatters";
import type {
  Contrato,
  ContratoPago,
  RegistrarPagoInput,
  EditarPagoInput,
  TipoPago,
} from "@/types/contrato";
import { TIPO_PAGO_LABEL } from "@/types/contrato";

interface EstadoCuentaProps {
  contrato: Contrato
  onRegistrarPago: (input: RegistrarPagoInput) => void
  onEditarPago: (pagoId: string, input: EditarPagoInput) => void
  onAnularPago: (pagoId: string, motivo?: string) => void
  readOnly?: boolean
}

export function EstadoCuenta({
  contrato,
  onRegistrarPago,
  onEditarPago,
  onAnularPago,
  readOnly = false,
}: EstadoCuentaProps) {
  const [openPay, setOpenPay] = useState(false);
  const [draft, setDraft] = useState<Partial<RegistrarPagoInput>>({
    fecha: todayStr(),
    tipoPago: "EFECTIVO",
  });

  const [viewPago, setViewPago] = useState<ContratoPago | null>(null);
  const [editPago, setEditPago] = useState<ContratoPago | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<EditarPagoInput>>({});
  const [anularPagoId, setAnularPagoId] = useState<string | null>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState("");

  const symbol = currencySymbol(contrato.moneda);

  const registrar = () => {
    if (!draft.monto || !draft.tipoPago || !draft.fecha) {
      toast.error("Complete fecha, monto y forma de pago");
      return;
    }
    onRegistrarPago({
      fecha: draft.fecha,
      monto: Number(draft.monto),
      tipoPago: draft.tipoPago as TipoPago,
      concepto: draft.concepto,
      referencia: draft.referencia,
      numeroFactura: draft.numeroFactura,
      autorizacion: draft.autorizacion,
      notas: draft.notas,
    });
    setDraft({ fecha: todayStr(), tipoPago: "EFECTIVO" });
    setOpenPay(false);
  };

  const saveEdit = () => {
    if (!editPago) return;
    onEditarPago(editPago.id, editDraft);
    setEditPago(null);
    setEditDraft({});
  };

  const confirmAnular = () => {
    if (!anularPagoId) return;
    onAnularPago(anularPagoId, motivoAnulacion || undefined);
    setAnularPagoId(null);
    setMotivoAnulacion("");
  };

  return (
    <div className="space-y-5">
      <FormSection
        icon={Wallet}
        title="Movimientos"
        description="Pagos registrados en este contrato"
        actions={
          !readOnly ? (
            <Dialog open={openPay} onOpenChange={setOpenPay}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Registrar pago</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Registrar pago</DialogTitle></DialogHeader>
                <FormGrid>
                  <div className="col-span-6">
                    <FormField label="Fecha" required>
                      <Input type="date" value={draft.fecha || ""} onChange={e => setDraft(d => ({ ...d, fecha: e.target.value }))} />
                    </FormField>
                  </div>
                  <div className="col-span-6">
                    <FormField label="Monto" required>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{symbol}</span>
                        <Input className="pl-7" type="number" value={draft.monto ?? ""} onChange={e => setDraft(d => ({ ...d, monto: Number(e.target.value) }))} />
                      </div>
                    </FormField>
                  </div>
                  <div className="col-span-6">
                    <FormField label="Forma de pago" required>
                      <Select value={draft.tipoPago || ""} onValueChange={(v: TipoPago) => setDraft(d => ({ ...d, tipoPago: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(TIPO_PAGO_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                  <div className="col-span-6">
                    <FormField label="Concepto">
                      <Input value={draft.concepto || ""} onChange={e => setDraft(d => ({ ...d, concepto: e.target.value }))} />
                    </FormField>
                  </div>
                  <div className="col-span-6">
                    <FormField label="Referencia">
                      <Input value={draft.referencia || ""} onChange={e => setDraft(d => ({ ...d, referencia: e.target.value }))} />
                    </FormField>
                  </div>
                  <div className="col-span-6">
                    <FormField label="N° factura">
                      <Input value={draft.numeroFactura || ""} onChange={e => setDraft(d => ({ ...d, numeroFactura: e.target.value }))} />
                    </FormField>
                  </div>
                  <div className="col-span-6">
                    <FormField label="Autorización">
                      <Input value={draft.autorizacion || ""} onChange={e => setDraft(d => ({ ...d, autorizacion: e.target.value }))} />
                    </FormField>
                  </div>
                  <div className="col-span-6">
                    <FormField label="Notas">
                      <Input value={draft.notas || ""} onChange={e => setDraft(d => ({ ...d, notas: e.target.value }))} />
                    </FormField>
                  </div>
                </FormGrid>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenPay(false)}>Cancelar</Button>
                  <Button onClick={registrar}>Registrar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      >
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Forma de pago</TableHead>
                <TableHead>Factura</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contrato.pagos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay pagos registrados
                  </TableCell>
                </TableRow>
              ) : (
                contrato.pagos.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{new Date(m.fecha).toLocaleDateString("es-CR")}</TableCell>
                    <TableCell className="font-medium">{m.concepto || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">{formatCurrency(m.monto, contrato.moneda)}</TableCell>
                    <TableCell className="text-muted-foreground">{TIPO_PAGO_LABEL[m.tipoPago]}</TableCell>
                    <TableCell className="text-muted-foreground">{m.numeroFactura || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={m.estado === "APLICADO" ? "bg-success/20 border-success" : "bg-destructive/15 border-destructive line-through"}
                      >
                        {m.estado === "APLICADO" ? "Aplicado" : "Anulado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setViewPago(m)}><Eye className="h-4 w-4" /></Button>
                        {!readOnly && m.estado === "APLICADO" && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditPago(m);
                                setEditDraft({
                                  fecha: m.fecha,
                                  tipoPago: m.tipoPago,
                                  concepto: m.concepto ?? undefined,
                                  referencia: m.referencia ?? undefined,
                                  numeroFactura: m.numeroFactura ?? undefined,
                                  autorizacion: m.autorizacion ?? undefined,
                                  notas: m.notas ?? undefined,
                                });
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => { setAnularPagoId(m.id); setMotivoAnulacion(""); }}>
                              <Ban className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </FormSection>

      {viewPago && (
        <Dialog open={!!viewPago} onOpenChange={open => { if (!open) setViewPago(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Detalle del pago</DialogTitle></DialogHeader>
            <FormGrid>
              <InfoField label="Fecha" value={new Date(viewPago.fecha).toLocaleDateString("es-CR")} />
              <InfoField label="Monto" value={formatCurrency(viewPago.monto, contrato.moneda)} />
              <InfoField label="Forma de pago" value={TIPO_PAGO_LABEL[viewPago.tipoPago]} />
              <InfoField label="Estado" value={viewPago.estado} />
              <InfoField label="Concepto" value={viewPago.concepto || "—"} />
              <InfoField label="Referencia" value={viewPago.referencia || "—"} />
              <InfoField label="N° factura" value={viewPago.numeroFactura || "—"} />
              <InfoField label="Autorización" value={viewPago.autorizacion || "—"} />
              <InfoField label="Registrado por" value={viewPago.registradoPor.nombre} />
              {viewPago.notas && <InfoField className="col-span-12" label="Notas" value={viewPago.notas} />}
              {viewPago.motivoAnulacion && <InfoField className="col-span-12" label="Motivo de anulación" value={viewPago.motivoAnulacion} />}
            </FormGrid>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewPago(null)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {editPago && (
        <Dialog open={!!editPago} onOpenChange={open => { if (!open) { setEditPago(null); setEditDraft({}); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Editar pago</DialogTitle></DialogHeader>
            <FormGrid>
              <div className="col-span-6">
                <FormField label="Fecha">
                  <Input type="date" value={editDraft.fecha || ""} onChange={e => setEditDraft(d => ({ ...d, fecha: e.target.value }))} />
                </FormField>
              </div>
              <div className="col-span-6">
                <FormField label="Forma de pago">
                  <Select value={editDraft.tipoPago || ""} onValueChange={(v: TipoPago) => setEditDraft(d => ({ ...d, tipoPago: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIPO_PAGO_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <div className="col-span-12">
                <FormField label="Concepto">
                  <Input value={editDraft.concepto || ""} onChange={e => setEditDraft(d => ({ ...d, concepto: e.target.value }))} />
                </FormField>
              </div>
              <div className="col-span-6">
                <FormField label="Referencia">
                  <Input value={editDraft.referencia || ""} onChange={e => setEditDraft(d => ({ ...d, referencia: e.target.value }))} />
                </FormField>
              </div>
              <div className="col-span-6">
                <FormField label="N° factura">
                  <Input value={editDraft.numeroFactura || ""} onChange={e => setEditDraft(d => ({ ...d, numeroFactura: e.target.value }))} />
                </FormField>
              </div>
              <div className="col-span-6">
                <FormField label="Autorización">
                  <Input value={editDraft.autorizacion || ""} onChange={e => setEditDraft(d => ({ ...d, autorizacion: e.target.value }))} />
                </FormField>
              </div>
              <div className="col-span-6">
                <FormField label="Notas">
                  <Input value={editDraft.notas || ""} onChange={e => setEditDraft(d => ({ ...d, notas: e.target.value }))} />
                </FormField>
              </div>
            </FormGrid>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditPago(null); setEditDraft({}); }}>Cancelar</Button>
              <Button onClick={saveEdit}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {anularPagoId && (
        <AlertDialog open={!!anularPagoId} onOpenChange={open => { if (!open) { setAnularPagoId(null); setMotivoAnulacion(""); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Anular pago</AlertDialogTitle>
              <AlertDialogDescription>Esta acción anulará el pago. No se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="px-1 pb-2">
              <FormField label="Motivo de anulación (opcional)">
                <Textarea rows={2} value={motivoAnulacion} onChange={e => setMotivoAnulacion(e.target.value)} />
              </FormField>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setAnularPagoId(null); setMotivoAnulacion(""); }}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmAnular}>Anular</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
