import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FormSection } from "@/components/ui/form-section";
import { ConsultationImages } from "@/components/ConsultationImages";
import { ConsultationFiles } from "@/components/ConsultationFiles";
import {
  ClipboardList, Calendar, Stethoscope, ChevronDown, FileText, Activity,
} from "lucide-react";
import type { Consultation } from "@/types/consultation";

interface Props {
  consultations: Consultation[] | undefined;
  patientId: number;
  loading?: boolean;
}

export function ConsultasOdontologicas({ consultations, patientId, loading }: Props) {
  return (
    <FormSection
      icon={ClipboardList}
      title="Consultas odontológicas"
      description="Historial cronológico de procedimientos y hallazgos"
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : consultations && consultations.length > 0 ? (
        <div className="space-y-3">
          {consultations.map((c, i) => (
            <DentalConsultationCard key={c.id} c={c} patientId={patientId} defaultOpen={i === 0} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Sin consultas registradas</p>
        </div>
      )}
    </FormSection>
  );
}

function DentalConsultationCard({
  c, patientId, defaultOpen = false,
}: { c: Consultation; patientId: number; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  const sections = [
    { label: "Motivo de consulta", value: c.motivoConsulta, icon: Stethoscope },
    { label: "Diagnóstico / hallazgo", value: c.impresionDiagnostica, icon: FileText },
    { label: "Procedimiento realizado", value: c.indicacionesTratamientos, icon: Activity },
    { label: "Observaciones", value: c.examenFisico, icon: FileText },
  ].filter(s => s.value);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border rounded-lg bg-card overflow-hidden hover:shadow-sm transition-shadow">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center gap-3 p-3 md:p-4 text-left hover:bg-accent/50">
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 shrink-0">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">{c.fecha}</span>
                {c.profesional?.nombre && (
                  <Badge variant="outline" className="text-[11px] font-normal">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    {c.profesional.nombre}
                  </Badge>
                )}
              </div>
              {c.motivoConsulta && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.motivoConsulta}</p>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t px-3 md:px-4 py-3 md:py-4 space-y-4">
            {sections.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{s.label}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap bg-muted/30 rounded-md px-3 py-2">{s.value}</p>
                </div>
              );
            })}
            <ConsultationImages consultaId={c.id} patientId={patientId} citaId={c.citaId ?? undefined} editable={false} />
            <ConsultationFiles consultaId={c.id} patientId={patientId} editable={false} />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
