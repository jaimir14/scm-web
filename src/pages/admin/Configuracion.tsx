import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PageHeader,
  FormSection,
  FormField,
  FormGrid,
  FormPage,
  StickyFormActions,
} from "@/components/ui/form-section";
import {
  Settings,
  Save,
  Loader2,
  SlidersHorizontal,
  CalendarClock,
  ShieldCheck,
  BellRing,
} from "lucide-react";
import { toast } from "sonner";
import { useConfig, useUpdateConfig } from "@/services/config.service";
import type { SystemConfig } from "@/types";

export default function Configuracion() {
  const { data: config, isLoading } = useConfig();
  const updateConfig = useUpdateConfig();

  const [form, setForm] = useState<SystemConfig>({});

  useEffect(() => {
    if (config) {
      setForm(config);
    }
  }, [config]);

  const handleSave = () => {
    updateConfig.mutate(form, {
      onSuccess: () => {
        toast.success("Configuracion guardada exitosamente");
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Error al guardar configuracion");
      },
    });
  };

  if (isLoading) {
    return (
      <FormPage>
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      </FormPage>
    );
  }

  return (
    <>
      <FormPage hasStickyActions>
        <PageHeader
          icon={Settings}
          eyebrow="Administración"
          title="Configuración del sistema"
          description="Ajustes generales que afectan a toda la clínica"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <FormSection
            icon={SlidersHorizontal}
            title="General"
            description="Identidad y formato regional"
          >
            <FormGrid>
              <div className="col-span-12">
                <FormField label="Nombre del sistema">
                  <Input
                    value={form.nombreSistema || ""}
                    onChange={e => setForm(prev => ({ ...prev, nombreSistema: e.target.value }))}
                    placeholder="Ej. ClínicaPro"
                  />
                </FormField>
              </div>
              <div className="col-span-12 sm:col-span-7">
                <FormField label="Zona horaria">
                  <Select
                    value={form.zonaHoraria || ""}
                    onValueChange={v => setForm(prev => ({ ...prev, zonaHoraria: v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america_costa_rica">America/Costa Rica (UTC-6)</SelectItem>
                      <SelectItem value="america_panama">America/Panama (UTC-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <div className="col-span-12 sm:col-span-5">
                <FormField label="Formato de fecha">
                  <Select
                    value={form.formatoFecha || ""}
                    onValueChange={v => setForm(prev => ({ ...prev, formatoFecha: v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </FormGrid>
          </FormSection>

          <FormSection
            icon={CalendarClock}
            title="Citas"
            description="Duración y jornada laboral"
          >
            <FormGrid>
              <div className="col-span-12">
                <FormField label="Duración por defecto (min)">
                  <Input
                    type="number"
                    value={form.duracionCitaDefecto || ""}
                    onChange={e => setForm(prev => ({ ...prev, duracionCitaDefecto: Number(e.target.value) }))}
                  />
                </FormField>
              </div>
              <div className="col-span-6">
                <FormField label="Hora inicio jornada">
                  <Input
                    type="time"
                    value={form.horaInicioJornada || ""}
                    onChange={e => setForm(prev => ({ ...prev, horaInicioJornada: e.target.value }))}
                  />
                </FormField>
              </div>
              <div className="col-span-6">
                <FormField label="Hora fin jornada">
                  <Input
                    type="time"
                    value={form.horaFinJornada || ""}
                    onChange={e => setForm(prev => ({ ...prev, horaFinJornada: e.target.value }))}
                  />
                </FormField>
              </div>
              <div className="col-span-12">
                <ToggleRow
                  label="Restricción de horario"
                  description="Impedir agendar citas fuera de la jornada laboral"
                  checked={form.restriccionHorario || false}
                  onCheckedChange={v => setForm(prev => ({ ...prev, restriccionHorario: v }))}
                />
              </div>
            </FormGrid>
          </FormSection>

          <FormSection
            icon={ShieldCheck}
            title="Seguridad"
            description="Políticas de acceso y auditoría"
          >
            <div className="space-y-3">
              <ToggleRow
                label="Registrar en bitácora"
                description="Guarda cada acción relevante para auditoría"
                checked={form.registrarBitacora || false}
                onCheckedChange={v => setForm(prev => ({ ...prev, registrarBitacora: v }))}
              />
              <ToggleRow
                label="Cambio de contraseña cada 90 días"
                description="Solicita renovación periódica de contraseñas"
                checked={(form.cambioPasswordDias || 0) > 0}
                onCheckedChange={v => setForm(prev => ({ ...prev, cambioPasswordDias: v ? 90 : 0 }))}
              />
              <FormField label="Tiempo de inactividad (min)" hint="Cierre automático de sesión por inactividad">
                <Input
                  type="number"
                  value={form.tiempoInactividad || ""}
                  onChange={e => setForm(prev => ({ ...prev, tiempoInactividad: Number(e.target.value) }))}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection
            icon={BellRing}
            title="Notificaciones"
            description="Avisos automáticos por correo"
          >
            <div className="space-y-3">
              <ToggleRow
                label="Recordatorio de citas por email"
                description="Envía un correo al paciente antes de la cita"
                checked={form.enviarRecordatorioEmail || false}
                onCheckedChange={v => setForm(prev => ({ ...prev, enviarRecordatorioEmail: v }))}
              />
              <ToggleRow
                label="Notificar al médico de nuevas citas"
                description="Avisa al profesional cuando se agenda una cita"
                checked={form.notificarMedicoCitas || false}
                onCheckedChange={v => setForm(prev => ({ ...prev, notificarMedicoCitas: v }))}
              />
            </div>
          </FormSection>
        </div>
      </FormPage>

      <StickyFormActions hint="Los cambios aplican inmediatamente al guardar.">
        <Button onClick={handleSave} disabled={updateConfig.isPending}>
          {updateConfig.isPending
            ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            : <Save className="h-4 w-4 mr-2" />}
          Guardar configuración
        </Button>
      </StickyFormActions>
    </>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5 shrink-0" />
    </div>
  );
}
