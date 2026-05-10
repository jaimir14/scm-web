import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSection, FormGrid, FormField } from "@/components/ui/form-section";
import {
  HeartPulse, ShieldAlert, Activity, Smile, Stethoscope, AlertTriangle, Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ──────────────── Catalog of clinical questions ──────────────── */

interface Question {
  id: string;
  label: string;
  /** Highlight as a critical alert when answered "Sí". */
  critical?: boolean;
}
interface Category {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  questions: Question[];
}

const CATEGORIES: Category[] = [
  {
    id: "cardio",
    title: "Condiciones cardiovasculares",
    description: "Riesgos cardíacos y de presión arterial",
    icon: HeartPulse,
    questions: [
      { id: "angina",        label: "Angina de pecho", critical: true },
      { id: "infarto",       label: "Enfermedad o ataque del corazón", critical: true },
      { id: "falla_cardiaca",label: "Falla cardíaca", critical: true },
      { id: "fiebre_reuma",  label: "Fiebre reumática" },
      { id: "marcapaso",     label: "Marcapaso", critical: true },
      { id: "op_corazon",    label: "Operación del corazón", critical: true },
      { id: "hipertension",  label: "Hipertensión arterial" },
    ],
  },
  {
    id: "alergias",
    title: "Alergias y medicamentos",
    description: "Sensibilidad a fármacos y sustancias comunes",
    icon: ShieldAlert,
    questions: [
      { id: "alergias",      label: "Alergias o urticaria", critical: true },
      { id: "alergia_pen",   label: "Alergia a penicilina", critical: true },
      { id: "alergia_asp",   label: "Alergia a aspirina o codeína", critical: true },
      { id: "alergia_anest", label: "Alergia a anestésicos", critical: true },
      { id: "medicamentos",  label: "Toma medicamentos actualmente" },
    ],
  },
  {
    id: "sistemicas",
    title: "Enfermedades sistémicas",
    description: "Condiciones crónicas o de relevancia clínica",
    icon: Activity,
    questions: [
      { id: "diabetes",  label: "Diabetes", critical: true },
      { id: "anemia",    label: "Anemia" },
      { id: "asma",      label: "Asma" },
      { id: "artritis",  label: "Artritis" },
      { id: "epilepsia", label: "Epilepsia o convulsiones", critical: true },
      { id: "hepatitis", label: "Hepatitis", critical: true },
      { id: "hemofilia", label: "Hemofilia", critical: true },
      { id: "glaucoma",  label: "Glaucoma" },
      { id: "embarazo",  label: "Embarazo", critical: true },
    ],
  },
  {
    id: "bucal",
    title: "Bucales y mandibulares",
    description: "Hábitos y síntomas dentales",
    icon: Smile,
    questions: [
      { id: "bruxismo",   label: "Bruxismo" },
      { id: "sangrado",   label: "Sangrado de encías" },
      { id: "sensib",     label: "Sensibilidad dental" },
      { id: "dolor_mand", label: "Dolor en la mandíbula" },
      { id: "protesis",   label: "Uso de prótesis" },
      { id: "ortodoncia", label: "Ortodoncia previa" },
    ],
  },
  {
    id: "quirurgicos",
    title: "Antecedentes quirúrgicos",
    description: "Cirugías o procedimientos previos relevantes",
    icon: Stethoscope,
    questions: [
      { id: "cirugia_reciente", label: "Cirugía en los últimos 12 meses" },
      { id: "transfusion",      label: "Transfusiones de sangre" },
      { id: "anest_general",    label: "Reacción a anestesia general" },
    ],
  },
  {
    id: "otros",
    title: "Otros riesgos clínicos",
    description: "Hábitos y condiciones adicionales",
    icon: AlertTriangle,
    questions: [
      { id: "tabaco",      label: "Tabaquismo" },
      { id: "alcohol",     label: "Consumo de alcohol" },
      { id: "drogadiccion",label: "Drogadicción" },
      { id: "nerviosismo", label: "Nerviosismo o ansiedad" },
    ],
  },
];

/* ──────────────── Types & component ──────────────── */

interface Answer { yes: boolean; note?: string; }

interface DentalRecord {
  /** Legacy shape kept for compatibility with existing parent state. */
  flags?: Record<string, boolean>;
  /** New questionnaire shape: id → { yes, note }. */
  answers?: Record<string, Answer>;
  higieneOral?: string;
  alergias?: string;
  medicamentos?: string;
  enfermedades?: string;
  observaciones?: string;
}

interface Props {
  value: DentalRecord;
  onChange: (next: DentalRecord) => void;
}

export function AntecedentesOdontologicos({ value, onChange }: Props) {
  const answers = value.answers || {};

  const setAnswer = (id: string, patch: Partial<Answer>) => {
    onChange({
      ...value,
      answers: { ...answers, [id]: { yes: false, ...answers[id], ...patch } },
    });
  };

  const setField = <K extends keyof DentalRecord>(k: K, v: DentalRecord[K]) =>
    onChange({ ...value, [k]: v });

  const alerts = useMemo(() => {
    const out: { label: string; critical: boolean }[] = [];
    for (const cat of CATEGORIES) {
      for (const q of cat.questions) {
        if (answers[q.id]?.yes) out.push({ label: q.label, critical: !!q.critical });
      }
    }
    return out;
  }, [answers]);

  return (
    <div className="space-y-5">
      {/* Resumen de alertas */}
      <FormSection
        icon={Sparkles}
        title="Historial clínico odontológico"
        description="Cuestionario de evaluación previa a cualquier tratamiento dental"
        actions={
          alerts.length > 0 ? (
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5",
                alerts.some(a => a.critical)
                  ? "bg-destructive/10 border-destructive text-destructive"
                  : "bg-warning/15 border-warning",
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {alerts.length} alerta{alerts.length !== 1 ? "s" : ""} clínica{alerts.length !== 1 ? "s" : ""}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 bg-success/10 border-success">
              Sin alertas
            </Badge>
          )
        }
      >
        {alerts.length > 0 ? (
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
              Condiciones marcadas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {alerts.map(a => (
                <Badge
                  key={a.label}
                  variant="outline"
                  className={cn(
                    "font-normal",
                    a.critical
                      ? "bg-destructive/10 border-destructive text-destructive"
                      : "bg-warning/15 border-warning",
                  )}
                >
                  {a.critical && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {a.label}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aún no se ha respondido el cuestionario. Marque las condiciones aplicables al paciente.
          </p>
        )}
      </FormSection>

      {/* Categorías */}
      {CATEGORIES.map(cat => (
        <FormSection key={cat.id} icon={cat.icon} title={cat.title} description={cat.description}>
          <div className="space-y-2">
            {cat.questions.map(q => {
              const a = answers[q.id];
              const isYes = !!a?.yes;
              const isAlert = isYes && q.critical;
              return (
                <div
                  key={q.id}
                  className={cn(
                    "rounded-md border p-3 transition-colors",
                    isAlert
                      ? "bg-destructive/5 border-destructive/40"
                      : isYes
                      ? "bg-warning/10 border-warning/40"
                      : "bg-card hover:bg-accent/30",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {isAlert && <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                      <span className="text-sm font-medium truncate">{q.label}</span>
                      {q.critical && (
                        <Badge variant="outline" className="text-[10px] font-normal h-5 border-destructive/40 text-destructive">
                          Crítico
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("text-xs", isYes ? "text-foreground font-medium" : "text-muted-foreground")}>
                        {isYes ? "Sí" : "No"}
                      </span>
                      <Switch
                        checked={isYes}
                        onCheckedChange={v => setAnswer(q.id, { yes: v })}
                      />
                    </div>
                  </div>
                  {isYes && (
                    <Input
                      className="mt-2 h-8 text-sm"
                      placeholder="Comentario opcional…"
                      value={a?.note || ""}
                      onChange={e => setAnswer(q.id, { note: e.target.value })}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </FormSection>
      ))}

      {/* Datos clínicos complementarios */}
      <FormSection icon={Sparkles} title="Datos clínicos complementarios" description="Higiene oral y observaciones generales">
        <FormGrid>
          <div className="col-span-12 sm:col-span-6">
            <FormField label="Higiene oral" hint="Frecuencia de cepillado, hilo dental, enjuague">
              <Input
                value={value.higieneOral || ""}
                onChange={e => setField("higieneOral", e.target.value)}
                placeholder="Ej. 2 veces al día, hilo dental ocasional"
              />
            </FormField>
          </div>
          <div className="col-span-12 sm:col-span-6">
            <FormField label="Medicamentos actuales">
              <Input
                value={value.medicamentos || ""}
                onChange={e => setField("medicamentos", e.target.value)}
                placeholder="Listar medicamentos"
              />
            </FormField>
          </div>
          <div className="col-span-12">
            <FormField label="Observaciones odontológicas">
              <Textarea
                rows={3}
                value={value.observaciones || ""}
                onChange={e => setField("observaciones", e.target.value)}
              />
            </FormField>
          </div>
        </FormGrid>
      </FormSection>
    </div>
  );
}
