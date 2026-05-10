import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FormSection, FormField, FormGrid } from "@/components/ui/form-section";
import { Smile, Eraser, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ──────────────── Treatment / condition palette ──────────────── */

type TxKey =
  | "caries" | "amalgama" | "corona" | "gingivitis" | "endodoncia"
  | "resina" | "puente"   | "extraccion" | "sellante" | "hipersensibilidad"
  | "implante" | "infeccion";

interface TxMeta { label: string; color: string; }

const TX: Record<TxKey, TxMeta> = {
  caries:            { label: "Caries",            color: "hsl(0 70% 50%)"   },
  amalgama:          { label: "Amalgama",          color: "hsl(220 15% 30%)" },
  corona:            { label: "Corona",            color: "hsl(45 95% 50%)"  },
  gingivitis:        { label: "Gingivitis",        color: "hsl(330 70% 55%)" },
  endodoncia:        { label: "Endodoncia",        color: "hsl(265 65% 55%)" },
  resina:            { label: "Resina",            color: "hsl(200 80% 55%)" },
  puente:            { label: "Puente",            color: "hsl(35 85% 45%)"  },
  extraccion:        { label: "Extracción",        color: "hsl(0 0% 25%)"    },
  sellante:          { label: "Sellante",          color: "hsl(170 60% 45%)" },
  hipersensibilidad: { label: "Hipersensibilidad", color: "hsl(20 90% 55%)"  },
  implante:          { label: "Implante",          color: "hsl(140 55% 40%)" },
  infeccion:         { label: "Infección",         color: "hsl(355 80% 45%)" },
};

/* ──────────────── Dentition (FDI) ──────────────── */

const PERMANENT = {
  ur: [18, 17, 16, 15, 14, 13, 12, 11],
  ul: [21, 22, 23, 24, 25, 26, 27, 28],
  lr: [48, 47, 46, 45, 44, 43, 42, 41],
  ll: [31, 32, 33, 34, 35, 36, 37, 38],
};

const TEMPORARY = {
  ur: [55, 54, 53, 52, 51],
  ul: [61, 62, 63, 64, 65],
  lr: [85, 84, 83, 82, 81],
  ll: [71, 72, 73, 74, 75],
};

type Surface = "O" | "M" | "D" | "V" | "L";
const SURFACES: Surface[] = ["O", "M", "D", "V", "L"];
const SURFACE_LABEL: Record<Surface, string> = {
  O: "Oclusal", M: "Mesial", D: "Distal", V: "Vestibular", L: "Lingual/Palatino",
};

interface ToothState {
  /** Per-surface treatment. Use "whole" key for full-tooth marks. */
  surfaces: Partial<Record<Surface | "whole", TxKey>>;
  notes?: string;
}

/* ──────────────── Component ──────────────── */

export function Odontograma() {
  const [teeth, setTeeth] = useState<Record<number, ToothState>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [activeTx, setActiveTx] = useState<TxKey>("caries");
  const [wholeMode, setWholeMode] = useState(false);

  const current = (selected != null && teeth[selected]) || { surfaces: {} };

  const paint = (toothId: number, surface: Surface | "whole") => {
    setTeeth(prev => {
      const t: ToothState = prev[toothId] || { surfaces: {} };
      const next: ToothState = {
        ...t,
        surfaces: { ...t.surfaces, [surface]: activeTx },
      };
      // Painting "whole" clears individual surfaces for clarity
      if (surface === "whole") next.surfaces = { whole: activeTx };
      return { ...prev, [toothId]: next };
    });
  };

  const clearTooth = (toothId: number) => {
    setTeeth(prev => {
      const n = { ...prev };
      delete n[toothId];
      return n;
    });
  };

  const clearAll = () => {
    setTeeth({});
    setSelected(null);
    toast.success("Odontograma reiniciado");
  };

  const save = () => toast.success("Odontograma guardado");

  return (
    <div className="space-y-5">
      {/* Paleta de tratamientos */}
      <FormSection
        icon={Smile}
        title="Paleta de tratamientos"
        description="Seleccione un tratamiento o condición y luego marque las piezas o superficies"
        actions={
          <div className="hidden md:flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs">
              <Switch checked={wholeMode} onCheckedChange={setWholeMode} />
              Pieza completa
            </label>
            <Button variant="outline" size="sm" onClick={clearAll}>
              <Eraser className="h-4 w-4 mr-1.5" /> Limpiar todo
            </Button>
            <Button size="sm" onClick={save}>
              <Save className="h-4 w-4 mr-1.5" /> Guardar
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {(Object.keys(TX) as TxKey[]).map(k => {
            const m = TX[k];
            const sel = activeTx === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setActiveTx(k)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-all",
                  sel
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : "hover:bg-accent/40",
                )}
              >
                <span
                  className="h-3.5 w-3.5 rounded-sm border border-border shrink-0"
                  style={{ background: m.color }}
                />
                <span className="truncate">{m.label}</span>
              </button>
            );
          })}
        </div>
        <div className="md:hidden flex items-center justify-between gap-2 mt-4">
          <label className="flex items-center gap-2 text-xs">
            <Switch checked={wholeMode} onCheckedChange={setWholeMode} />
            Pieza completa
          </label>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearAll}>
              <Eraser className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={save}>
              <Save className="h-4 w-4 mr-1.5" /> Guardar
            </Button>
          </div>
        </div>
      </FormSection>

      {/* Dentición permanente */}
      <FormSection icon={Smile} title="Dentición permanente" description="Adultos — numeración FDI 11–48">
        <div className="rounded-lg border bg-muted/30 p-3 md:p-5 space-y-4">
          <ArchPair
            right={PERMANENT.ur} left={PERMANENT.ul}
            label="Maxilar superior"
            teeth={teeth} selected={selected} setSelected={setSelected}
            onPaint={paint} wholeMode={wholeMode}
          />
          <div className="border-t border-dashed" />
          <ArchPair
            right={PERMANENT.lr} left={PERMANENT.ll}
            label="Mandíbula inferior"
            teeth={teeth} selected={selected} setSelected={setSelected}
            onPaint={paint} wholeMode={wholeMode}
          />
        </div>
      </FormSection>

      {/* Dentición temporal */}
      <FormSection icon={Smile} title="Dentición temporal" description="Pediátrica — numeración FDI 51–85">
        <div className="rounded-lg border bg-muted/30 p-3 md:p-5 space-y-4">
          <ArchPair
            right={TEMPORARY.ur} left={TEMPORARY.ul}
            label="Maxilar superior"
            teeth={teeth} selected={selected} setSelected={setSelected}
            onPaint={paint} wholeMode={wholeMode}
          />
          <div className="border-t border-dashed" />
          <ArchPair
            right={TEMPORARY.lr} left={TEMPORARY.ll}
            label="Mandíbula inferior"
            teeth={teeth} selected={selected} setSelected={setSelected}
            onPaint={paint} wholeMode={wholeMode}
          />
        </div>
      </FormSection>

      {/* Detalle de pieza */}
      <FormSection
        icon={Smile}
        title={selected != null ? `Detalle pieza ${selected}` : "Detalle de pieza"}
        description={selected != null ? "Tratamientos por superficie" : "Seleccione una pieza para ver el detalle"}
        actions={
          selected != null ? (
            <Button variant="outline" size="sm" onClick={() => clearTooth(selected)}>
              <Trash2 className="h-4 w-4 mr-1.5" /> Borrar pieza
            </Button>
          ) : null
        }
      >
        {selected == null ? (
          <p className="text-sm text-muted-foreground">Aún no se ha seleccionado ninguna pieza.</p>
        ) : (
          <FormGrid>
            <div className="col-span-12">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {SURFACES.map(s => {
                  const tx = current.surfaces[s];
                  const meta = tx ? TX[tx] : null;
                  return (
                    <div key={s} className="rounded-md border p-2 bg-card flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-sm border"
                        style={{ background: meta?.color || "transparent" }}
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{SURFACE_LABEL[s]}</p>
                        <p className="text-xs font-medium truncate">{meta?.label || "—"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {current.surfaces.whole && (
                <div className="mt-2 rounded-md border p-2 bg-card flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm border" style={{ background: TX[current.surfaces.whole].color }} />
                  <span className="text-xs font-medium">Pieza completa: {TX[current.surfaces.whole].label}</span>
                </div>
              )}
            </div>
            <div className="col-span-12">
              <FormField label="Observaciones">
                <Textarea
                  rows={3}
                  placeholder="Notas clínicas para esta pieza"
                  value={current.notes || ""}
                  onChange={e => setTeeth(prev => ({
                    ...prev,
                    [selected]: { ...current, notes: e.target.value },
                  }))}
                />
              </FormField>
            </div>
          </FormGrid>
        )}
      </FormSection>
    </div>
  );
}

/* ──────────────── Sub-components ──────────────── */

function ArchPair({
  right, left, label, teeth, selected, setSelected, onPaint, wholeMode,
}: {
  right: number[];
  left: number[];
  label: string;
  teeth: Record<number, ToothState>;
  selected: number | null;
  setSelected: (n: number) => void;
  onPaint: (id: number, s: Surface | "whole") => void;
  wholeMode: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
      <div className="flex justify-center gap-3 md:gap-5 overflow-x-auto pb-1">
        <div className="flex gap-1">
          {right.map(n => (
            <Tooth
              key={n} id={n} state={teeth[n]} selected={selected === n}
              onSelect={() => setSelected(n)} onPaint={onPaint} wholeMode={wholeMode}
            />
          ))}
        </div>
        <div className="w-px bg-border self-stretch" />
        <div className="flex gap-1">
          {left.map(n => (
            <Tooth
              key={n} id={n} state={teeth[n]} selected={selected === n}
              onSelect={() => setSelected(n)} onPaint={onPaint} wholeMode={wholeMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Tooth({
  id, state, selected, onSelect, onPaint, wholeMode,
}: {
  id: number;
  state?: ToothState;
  selected: boolean;
  onSelect: () => void;
  onPaint: (id: number, s: Surface | "whole") => void;
  wholeMode: boolean;
}) {
  const surfaces = state?.surfaces || {};
  const wholeColor = surfaces.whole ? TX[surfaces.whole].color : null;

  const handleSurfaceClick = (e: React.MouseEvent, s: Surface) => {
    e.stopPropagation();
    onSelect();
    if (wholeMode) onPaint(id, "whole");
    else onPaint(id, s);
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col items-center text-[10px] transition-all",
        selected && "scale-110",
      )}
      aria-label={`Pieza ${id}`}
    >
      <span className={cn("mb-0.5 font-medium tabular-nums", selected ? "text-primary" : "text-muted-foreground")}>{id}</span>
      <div
        className={cn(
          "relative h-11 w-9 md:h-12 md:w-10 rounded-md border-2 bg-card overflow-hidden",
          selected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40",
        )}
        style={wholeColor ? { background: wholeColor } : undefined}
      >
        {/* 5 surfaces: O center + M D V L edges */}
        <SurfaceCell s="V" tx={surfaces.V} cls="absolute top-0 left-1.5 right-1.5 h-2" onClick={handleSurfaceClick} />
        <SurfaceCell s="L" tx={surfaces.L} cls="absolute bottom-0 left-1.5 right-1.5 h-2" onClick={handleSurfaceClick} />
        <SurfaceCell s="M" tx={surfaces.M} cls="absolute left-0 top-2 bottom-2 w-1.5" onClick={handleSurfaceClick} />
        <SurfaceCell s="D" tx={surfaces.D} cls="absolute right-0 top-2 bottom-2 w-1.5" onClick={handleSurfaceClick} />
        <SurfaceCell s="O" tx={surfaces.O} cls="absolute left-1.5 right-1.5 top-2 bottom-2" onClick={handleSurfaceClick} />
      </div>
    </button>
  );
}

function SurfaceCell({
  s, tx, cls, onClick,
}: {
  s: Surface;
  tx?: TxKey;
  cls: string;
  onClick: (e: React.MouseEvent, s: Surface) => void;
}) {
  return (
    <span
      onClick={e => onClick(e, s)}
      className={cn(cls, "cursor-pointer border border-border/60 hover:brightness-110")}
      style={tx ? { background: TX[tx].color } : undefined}
      title={SURFACE_LABEL[s]}
    />
  );
}

/* ──────────────── Legend (exported for potential reuse) ──────────────── */

export function OdontogramaLegend() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(TX) as TxKey[]).map(k => (
        <Badge key={k} variant="outline" className="gap-1.5 font-normal">
          <span className="h-2 w-2 rounded-sm" style={{ background: TX[k].color }} />
          {TX[k].label}
        </Badge>
      ))}
    </div>
  );
}
