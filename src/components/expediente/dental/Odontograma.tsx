import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection, FormField, FormGrid } from "@/components/ui/form-section";
import { useTreatments } from "@/services/treatments.service";
import { Smile, Eraser, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ToothStatus =
  | "sano"
  | "observacion"
  | "propuesto"
  | "en_tratamiento"
  | "finalizado"
  | "ausente";

interface ToothState {
  status: ToothStatus;
  treatmentId?: number;
  notes?: string;
}

const STATUS_META: Record<ToothStatus, { label: string; cls: string; dot: string }> = {
  sano:           { label: "Sano",              cls: "bg-card hover:bg-accent border-border text-foreground",                  dot: "bg-muted-foreground/40" },
  observacion:    { label: "Observación",       cls: "bg-warning/15 hover:bg-warning/25 border-warning text-foreground",        dot: "bg-warning" },
  propuesto:      { label: "Tratamiento propuesto", cls: "bg-primary/10 hover:bg-primary/20 border-primary text-foreground",    dot: "bg-primary" },
  en_tratamiento: { label: "En tratamiento",    cls: "bg-primary/30 hover:bg-primary/40 border-primary text-foreground",        dot: "bg-primary" },
  finalizado:     { label: "Finalizado",        cls: "bg-success/15 hover:bg-success/25 border-success text-foreground",        dot: "bg-success" },
  ausente:        { label: "Ausente",           cls: "bg-destructive/10 hover:bg-destructive/20 border-destructive text-foreground line-through opacity-70", dot: "bg-destructive" },
};

// FDI numbering — adult dentition (32 teeth)
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT  = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_LEFT  = [31, 32, 33, 34, 35, 36, 37, 38];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

export function Odontograma() {
  const { data: treatments } = useTreatments();
  const [teeth, setTeeth] = useState<Record<number, ToothState>>({});
  const [selected, setSelected] = useState<number | null>(null);

  const current: ToothState = (selected != null && teeth[selected]) || { status: "sano" };

  const updateCurrent = (patch: Partial<ToothState>) => {
    if (selected == null) return;
    setTeeth(prev => ({ ...prev, [selected]: { ...current, ...patch } }));
  };

  const reset = () => {
    setTeeth({});
    setSelected(null);
    toast.success("Odontograma reiniciado");
  };

  const save = () => toast.success("Odontograma guardado");

  return (
    <div className="space-y-5">
      <FormSection
        icon={Smile}
        title="Odontograma"
        description="Seleccione una pieza para registrar su estado y tratamiento"
        actions={
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={reset}>
              <Eraser className="h-4 w-4 mr-1.5" /> Limpiar
            </Button>
            <Button size="sm" onClick={save}>
              <Save className="h-4 w-4 mr-1.5" /> Guardar
            </Button>
          </div>
        }
      >
        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-5">
          {(Object.keys(STATUS_META) as ToothStatus[]).map(s => (
            <Badge key={s} variant="outline" className="gap-1.5 font-normal">
              <span className={cn("h-2 w-2 rounded-full", STATUS_META[s].dot)} />
              {STATUS_META[s].label}
            </Badge>
          ))}
        </div>

        {/* Arches */}
        <div className="rounded-lg border bg-muted/30 p-4 md:p-6 space-y-4">
          <ArchRow label="Superior derecha" teeth={UPPER_RIGHT} states={teeth} selected={selected} onSelect={setSelected} />
          <ArchRow label="Superior izquierda" teeth={UPPER_LEFT} states={teeth} selected={selected} onSelect={setSelected} />
          <div className="border-t border-dashed my-2" />
          <ArchRow label="Inferior derecha" teeth={LOWER_RIGHT} states={teeth} selected={selected} onSelect={setSelected} />
          <ArchRow label="Inferior izquierda" teeth={LOWER_LEFT} states={teeth} selected={selected} onSelect={setSelected} />
        </div>

        {/* Mobile actions */}
        <div className="flex md:hidden items-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={reset} className="flex-1">
            <Eraser className="h-4 w-4 mr-1.5" /> Limpiar
          </Button>
          <Button size="sm" onClick={save} className="flex-1">
            <Save className="h-4 w-4 mr-1.5" /> Guardar
          </Button>
        </div>
      </FormSection>

      {/* Detail panel */}
      <FormSection
        icon={Smile}
        title={selected != null ? `Pieza ${selected}` : "Detalle de pieza"}
        description={selected != null ? STATUS_META[current.status].label : "Seleccione una pieza dental para ver y editar el detalle"}
      >
        {selected == null ? (
          <p className="text-sm text-muted-foreground">Aún no se ha seleccionado ninguna pieza.</p>
        ) : (
          <FormGrid>
            <div className="col-span-12 sm:col-span-6">
              <FormField label="Estado">
                <Select value={current.status} onValueChange={(v: ToothStatus) => updateCurrent({ status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_META) as ToothStatus[]).map(s => (
                      <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormField label="Tratamiento">
                <Select
                  value={current.treatmentId ? String(current.treatmentId) : ""}
                  onValueChange={v => updateCurrent({ treatmentId: Number(v) })}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccione del catálogo" /></SelectTrigger>
                  <SelectContent>
                    {treatments?.map(t => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.codigo} — {t.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <div className="col-span-12">
              <FormField label="Observaciones">
                <Textarea
                  rows={3}
                  placeholder="Notas clínicas para esta pieza"
                  value={current.notes || ""}
                  onChange={e => updateCurrent({ notes: e.target.value })}
                />
              </FormField>
            </div>
          </FormGrid>
        )}
      </FormSection>
    </div>
  );
}

function ArchRow({
  label, teeth, states, selected, onSelect,
}: {
  label: string;
  teeth: number[];
  states: Record<number, ToothState>;
  selected: number | null;
  onSelect: (n: number) => void;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {teeth.map(n => {
          const st = states[n]?.status || "sano";
          const meta = STATUS_META[st];
          const isSel = selected === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onSelect(n)}
              className={cn(
                "relative h-12 w-10 md:h-14 md:w-11 rounded-md border-2 flex flex-col items-center justify-center text-[11px] font-medium transition-all",
                meta.cls,
                isSel && "ring-2 ring-ring ring-offset-2 ring-offset-background scale-105",
              )}
              aria-label={`Pieza ${n} — ${meta.label}`}
            >
              <span className={cn("absolute top-1 right-1 h-1.5 w-1.5 rounded-full", meta.dot)} />
              <span className="text-foreground">{n}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
