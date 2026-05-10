import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FormSection, FormGrid, FormField } from "@/components/ui/form-section";
import { Sparkles } from "lucide-react";

const FLAGS = [
  "Bruxismo",
  "Sangrado de encías",
  "Sensibilidad dental",
  "Dolor mandibular",
  "Uso de prótesis",
  "Ortodoncia previa",
];

interface DentalRecord {
  flags?: Record<string, boolean>;
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
  const setFlag = (k: string, v: boolean) =>
    onChange({ ...value, flags: { ...value.flags, [k]: v } });

  const set = <K extends keyof DentalRecord>(k: K, v: DentalRecord[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <FormSection
      icon={Sparkles}
      title="Antecedentes odontológicos"
      description="Hábitos y condiciones relevantes para tratamientos dentales"
    >
      <FormGrid>
        <div className="col-span-12">
          <FormField label="Hábitos y condiciones">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 rounded-md border bg-muted/30 p-3">
              {FLAGS.map(f => (
                <label key={f} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={!!value.flags?.[f]}
                    onCheckedChange={c => setFlag(f, !!c)}
                  />
                  {f}
                </label>
              ))}
            </div>
          </FormField>
        </div>

        <div className="col-span-12 sm:col-span-6">
          <FormField label="Higiene oral" hint="Frecuencia de cepillado, uso de hilo, enjuague, etc.">
            <Input value={value.higieneOral || ""} onChange={e => set("higieneOral", e.target.value)} placeholder="Ej. 2 veces al día, hilo dental ocasional" />
          </FormField>
        </div>
        <div className="col-span-12 sm:col-span-6">
          <FormField label="Alergias relevantes">
            <Input value={value.alergias || ""} onChange={e => set("alergias", e.target.value)} placeholder="Anestésicos, látex, antibióticos…" />
          </FormField>
        </div>

        <div className="col-span-12 sm:col-span-6">
          <FormField label="Medicamentos actuales">
            <Textarea rows={3} value={value.medicamentos || ""} onChange={e => set("medicamentos", e.target.value)} />
          </FormField>
        </div>
        <div className="col-span-12 sm:col-span-6">
          <FormField label="Enfermedades sistémicas relevantes">
            <Textarea rows={3} value={value.enfermedades || ""} onChange={e => set("enfermedades", e.target.value)} placeholder="Diabetes, hipertensión, cardiopatías…" />
          </FormField>
        </div>

        <div className="col-span-12">
          <FormField label="Observaciones odontológicas">
            <Textarea rows={3} value={value.observaciones || ""} onChange={e => set("observaciones", e.target.value)} />
          </FormField>
        </div>
      </FormGrid>
    </FormSection>
  );
}
