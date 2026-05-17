import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormGrid, FormField } from "@/components/ui/form-section";
import { Search, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, currencySymbol, todayStr } from "@/lib/formatters";
import { useDentists } from "@/services/users.service";
import { useTreatments } from "@/services/treatments.service";
import { useSearchPatients } from "@/services/patients.service";
import { useCreateContrato } from "@/services/contratos.service";
import { useAuth } from "@/contexts/AuthContext";
import type { Patient } from "@/types/patient";
import type {
  Moneda,
  CreateContratoInput,
  CreateContratoTratamientoInput,
  Periodicidad,
} from "@/types/contrato";
import { PERIODICIDAD_LABEL } from "@/types/contrato";

interface CreateContratoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}

export function CreateContratoDialog({ open, onOpenChange, onCreated }: CreateContratoDialogProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientQ, setPatientQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dentistaId, setDentistaId] = useState<string>("");
  const [fecha, setFecha] = useState(todayStr());
  const [moneda, setMoneda] = useState<Moneda>("CRC");
  const [plazo, setPlazo] = useState<string>("");
  const [periodicidad, setPeriodicidad] = useState<Periodicidad | "">("");
  const [descripcion, setDescripcion] = useState("");
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<CreateContratoTratamientoInput[]>([]);
  const [addItemOpen, setAddItemOpen] = useState(false);

  const dentists = useDentists();
  const treatments = useTreatments();
  const searchResults = useSearchPatients(debouncedQ, "nombre", 1, 20);
  const createContrato = useCreateContrato();

  useEffect(() => {
    return () => { if (searchDebounce.current) clearTimeout(searchDebounce.current); };
  }, []);

  const handlePatientSearch = (v: string) => {
    setPatientQ(v);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => setDebouncedQ(v), 300);
  };

  const resetDialog = () => {
    setStep(1); setSelectedPatient(null); setPatientQ(""); setDebouncedQ("");
    setDentistaId(""); setFecha(todayStr()); setMoneda("CRC"); setPlazo("");
    setPeriodicidad(""); setDescripcion(""); setNotas(""); setItems([]);
  };

  const handleClose = (v: boolean) => { if (!v) resetDialog(); onOpenChange(v); };

  const handleSubmit = () => {
    if (!selectedPatient) return;
    if (!dentistaId) { toast.error("Seleccione un dentista"); return; }
    const payload: CreateContratoInput = {
      pacienteId: selectedPatient.id, dentistaId: Number(dentistaId),
      clinicaId: user?.clinicaId ?? 0, fecha, moneda,
      ...(plazo ? { plazo: Number(plazo) } : {}),
      ...(periodicidad ? { periodicidad } : {}),
      ...(descripcion ? { descripcion } : {}),
      ...(notas ? { notas } : {}),
      tratamientos: items,
    };
    createContrato.mutateAsync(payload).then(newContrato => {
      toast.success("Contrato creado"); handleClose(false); onCreated(newContrato.id);
    }).catch((err: Error) => toast.error(err.message || "Error al crear contrato"));
  };

  const patients = searchResults.data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Nuevo Contrato — Seleccionar paciente" : "Nuevo Contrato — Datos del contrato"}</DialogTitle>
          <p className="text-xs text-muted-foreground">{step} de 2</p>
        </DialogHeader>
        {step === 1 ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar paciente por nombre..." value={patientQ} onChange={e => handlePatientSearch(e.target.value)} className="pl-9" autoFocus />
            </div>
            <div className="max-h-72 overflow-y-auto rounded-md border divide-y">
              {searchResults.isLoading ? (
                <div className="py-4 text-center text-sm text-muted-foreground">Buscando...</div>
              ) : patients.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">{debouncedQ ? "Sin resultados" : "Ingrese un nombre para buscar"}</div>
              ) : (
                patients.map(p => (
                  <button key={p.id} type="button" className="w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors" onClick={() => { setSelectedPatient(p); setStep(2); }}>
                    <p className="text-sm font-medium">{p.nombre} {p.apellido1} {p.apellido2 ?? ""}</p>
                    <p className="text-xs text-muted-foreground">{p.tipoIdentificacion}: {p.numeroIdentificacion}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-muted/50 rounded-lg p-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{selectedPatient?.nombre} {selectedPatient?.apellido1} {selectedPatient?.apellido2 ?? ""}</p>
                <p className="text-xs text-muted-foreground">{selectedPatient?.tipoIdentificacion}: {selectedPatient?.numeroIdentificacion}</p>
              </div>
              <button type="button" className="text-xs text-primary underline shrink-0" onClick={() => setStep(1)}>Cambiar</button>
            </div>
            <FormGrid>
              <div className="col-span-12 sm:col-span-6">
                <FormField label="Dentista" required>
                  <Select value={dentistaId} onValueChange={setDentistaId}>
                    <SelectTrigger><SelectValue placeholder="Seleccione un dentista" /></SelectTrigger>
                    <SelectContent>{(dentists.data ?? []).map(d => <SelectItem key={d.id} value={String(d.id)}>{d.nombre}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <FormField label="Fecha" required><Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} /></FormField>
              </div>
              <div className="col-span-6 sm:col-span-4">
                <FormField label="Moneda">
                  <Select value={moneda} onValueChange={v => setMoneda(v as Moneda)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="CRC">CRC (₡)</SelectItem><SelectItem value="USD">USD ($)</SelectItem></SelectContent>
                  </Select>
                </FormField>
              </div>
              <div className="col-span-6 sm:col-span-4">
                <FormField label="Plazo (meses)"><Input type="number" min={1} value={plazo} onChange={e => setPlazo(e.target.value)} placeholder="Opcional" /></FormField>
              </div>
              <div className="col-span-12 sm:col-span-4">
                <FormField label="Periodicidad">
                  <Select value={periodicidad || "none"} onValueChange={v => setPeriodicidad(v === "none" ? "" : v as Periodicidad)}>
                    <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin periodicidad</SelectItem>
                      {(Object.entries(PERIODICIDAD_LABEL) as [Periodicidad, string][]).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <div className="col-span-12"><FormField label="Descripción"><Textarea rows={2} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Opcional" /></FormField></div>
              <div className="col-span-12"><FormField label="Notas"><Textarea rows={2} value={notas} onChange={e => setNotas(e.target.value)} placeholder="Opcional" /></FormField></div>
            </FormGrid>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Tratamientos ({items.length})</p>
                <Button size="sm" variant="outline" onClick={() => setAddItemOpen(true)}><Plus className="h-4 w-4 mr-1.5" /> Agregar</Button>
              </div>
              {items.length > 0 && (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Tratamiento</TableHead><TableHead className="text-right">Precio</TableHead><TableHead></TableHead></TableRow></TableHeader>
                    <TableBody>
                      {items.map((item, idx) => {
                        const t = (treatments.data ?? []).find(x => x.id === item.tratamientoId);
                        return (
                          <TableRow key={idx}>
                            <TableCell>{t?.nombre ?? `ID ${item.tratamientoId}`}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatCurrency(item.precioUnitario, moneda)}</TableCell>
                            <TableCell><Button size="icon" variant="ghost" onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4" /></Button></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
          {step === 2 && <Button onClick={handleSubmit} disabled={createContrato.isPending}>{createContrato.isPending ? "Creando..." : "Crear Contrato"}</Button>}
        </DialogFooter>
      </DialogContent>
      <AddTratamientoItemDialog open={addItemOpen} onOpenChange={setAddItemOpen} moneda={moneda} onAdd={item => { setItems(prev => [...prev, item]); setAddItemOpen(false); }} />
    </Dialog>
  );
}

function AddTratamientoItemDialog({ open, onOpenChange, moneda, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; moneda: Moneda; onAdd: (item: CreateContratoTratamientoInput) => void }) {
  const treatments = useTreatments();
  const [tratamientoId, setTratamientoId] = useState<string>("");
  const [precio, setPrecio] = useState<string>("");
  const [pieza, setPieza] = useState("");
  const symbol = currencySymbol(moneda);

  const handleAdd = () => {
    if (!tratamientoId || !precio) { toast.error("Seleccione un tratamiento e ingrese el precio"); return; }
    onAdd({ tratamientoId: Number(tratamientoId), precioUnitario: Number(precio), pieza: pieza || undefined });
    setTratamientoId(""); setPrecio(""); setPieza("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Agregar tratamiento</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <FormField label="Tratamiento" required>
            <Select value={tratamientoId} onValueChange={v => { const t = (treatments.data ?? []).find(x => String(x.id) === v); setTratamientoId(v); if (t?.precio) setPrecio(String(t.precio)); }}>
              <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
              <SelectContent>{(treatments.data ?? []).map(t => <SelectItem key={t.id} value={String(t.id)}>{t.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Precio" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{symbol}</span>
              <Input className="pl-7" type="number" value={precio} onChange={e => setPrecio(e.target.value)} />
            </div>
          </FormField>
          <FormField label="Pieza / zona"><Input value={pieza} onChange={e => setPieza(e.target.value)} placeholder="Ej. 16" /></FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleAdd}>Agregar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
