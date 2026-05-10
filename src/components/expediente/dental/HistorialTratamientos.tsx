import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormSection, FormGrid, FormField } from "@/components/ui/form-section";
import { useTreatments } from "@/services/treatments.service";
import { Activity, Plus, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";

type TxStatus = "realizado" | "en_curso" | "cancelado";

interface Tx {
  id: string;
  fecha: string;
  tratamiento: string;
  treatmentId?: number;
  pieza?: string;
  detalle?: string;
  dentista: string;
  estado: TxStatus;
}

const STATUS_VARIANT: Record<TxStatus, { label: string; cls: string }> = {
  realizado:  { label: "Realizado",  cls: "bg-success/15 border-success" },
  en_curso:   { label: "En curso",   cls: "bg-warning/20 border-warning" },
  cancelado:  { label: "Cancelado",  cls: "bg-destructive/15 border-destructive" },
};

const SAMPLE: Tx[] = [
  { id: "1", fecha: "2026-05-09", tratamiento: "Amalgama",     pieza: "16", detalle: "Aplicado sin problemas", dentista: "Dr. García", estado: "realizado" },
  { id: "2", fecha: "2026-04-22", tratamiento: "Limpieza",     pieza: "Boca completa", detalle: "Profilaxis general", dentista: "Dr. García", estado: "realizado" },
  { id: "3", fecha: "2026-05-15", tratamiento: "Endodoncia",   pieza: "26", detalle: "Primera sesión", dentista: "Dr. García", estado: "en_curso" },
];

interface Props {
  patientName?: string;
}

export function HistorialTratamientos({ patientName = "Paciente actual" }: Props) {
  const { data: treatments } = useTreatments();
  const [items, setItems] = useState<Tx[]>(SAMPLE);
  const [openAdd, setOpenAdd] = useState(false);
  const [draft, setDraft] = useState<Partial<Tx>>({ estado: "realizado", fecha: new Date().toISOString().slice(0, 10), dentista: "Dr. García" });

  const add = () => {
    if (!draft.tratamiento || !draft.fecha) {
      toast.error("Complete tratamiento y fecha");
      return;
    }
    setItems(p => [
      {
        id: String(Date.now()),
        fecha: draft.fecha!,
        tratamiento: draft.tratamiento!,
        treatmentId: draft.treatmentId,
        pieza: draft.pieza,
        detalle: draft.detalle,
        dentista: draft.dentista || "—",
        estado: (draft.estado as TxStatus) || "realizado",
      },
      ...p,
    ]);
    setDraft({ estado: "realizado", fecha: new Date().toISOString().slice(0, 10), dentista: "Dr. García" });
    setOpenAdd(false);
    toast.success("Tratamiento agregado");
  };

  return (
    <FormSection
      icon={Activity}
      title="Historial de tratamientos"
      description="Tratamientos realizados y en curso del paciente"
      actions={
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Agregar tratamiento</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nuevo tratamiento</DialogTitle></DialogHeader>
            <FormGrid>
              <div className="col-span-12">
                <FormField label="Paciente">
                  <Input value={patientName} disabled />
                </FormField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <FormField label="Dentista" required>
                  <Input value={draft.dentista || ""} onChange={e => setDraft(d => ({ ...d, dentista: e.target.value }))} />
                </FormField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <FormField label="Fecha" required>
                  <Input type="date" value={draft.fecha || ""} onChange={e => setDraft(d => ({ ...d, fecha: e.target.value }))} />
                </FormField>
              </div>
              <div className="col-span-12 sm:col-span-8">
                <FormField label="Tratamiento" required>
                  <Select
                    value={draft.treatmentId ? String(draft.treatmentId) : ""}
                    onValueChange={v => {
                      const t = treatments?.find(x => x.id === Number(v));
                      setDraft(d => ({ ...d, treatmentId: Number(v), tratamiento: t?.nombre || "" }));
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccione del catálogo" /></SelectTrigger>
                    <SelectContent>
                      {treatments?.map(t => (
                        <SelectItem key={t.id} value={String(t.id)}>{t.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <div className="col-span-12 sm:col-span-4">
                <FormField label="Pieza / zona">
                  <Input value={draft.pieza || ""} onChange={e => setDraft(d => ({ ...d, pieza: e.target.value }))} placeholder="Ej. 16" />
                </FormField>
              </div>
              <div className="col-span-12 sm:col-span-6">
                <FormField label="Estado">
                  <Select value={draft.estado as string} onValueChange={(v: TxStatus) => setDraft(d => ({ ...d, estado: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_VARIANT).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <div className="col-span-12">
                <FormField label="Detalle del tratamiento realizado">
                  <Textarea rows={3} value={draft.detalle || ""} onChange={e => setDraft(d => ({ ...d, detalle: e.target.value }))} placeholder="Descripción, materiales, observaciones…" />
                </FormField>
              </div>
            </FormGrid>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenAdd(false)}>Cancelar</Button>
              <Button onClick={add}>Aceptar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Fecha</TableHead>
              <TableHead>Tratamiento</TableHead>
              <TableHead>Pieza</TableHead>
              <TableHead>Detalle</TableHead>
              <TableHead>Dentista</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                  Sin tratamientos registrados
                </TableCell>
              </TableRow>
            ) : (
              items.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{t.fecha}</TableCell>
                  <TableCell className="font-medium">{t.tratamiento}</TableCell>
                  <TableCell>{t.pieza || "—"}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[260px] truncate">{t.detalle || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{t.dentista}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_VARIANT[t.estado].cls}>
                      {STATUS_VARIANT[t.estado].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => toast.info("Ver detalle")}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => toast.info("Editar tratamiento")}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </FormSection>
  );
}
