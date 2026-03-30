import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Save, Loader2 } from "lucide-react";
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
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Configuracion del Sistema</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Nombre del Sistema</Label>
              <Input
                value={form.nombreSistema || ""}
                onChange={e => setForm(prev => ({ ...prev, nombreSistema: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Zona Horaria</Label>
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
            </div>
            <div className="space-y-1">
              <Label>Formato de Fecha</Label>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Citas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Duracion por defecto (min)</Label>
              <Input
                type="number"
                value={form.duracionCitaDefecto || ""}
                onChange={e => setForm(prev => ({ ...prev, duracionCitaDefecto: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Hora inicio jornada</Label>
              <Input
                type="time"
                value={form.horaInicioJornada || ""}
                onChange={e => setForm(prev => ({ ...prev, horaInicioJornada: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Hora fin jornada</Label>
              <Input
                type="time"
                value={form.horaFinJornada || ""}
                onChange={e => setForm(prev => ({ ...prev, horaFinJornada: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.restriccionHorario || false}
                onCheckedChange={v => setForm(prev => ({ ...prev, restriccionHorario: v }))}
              />
              <Label>Restriccion de horario</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Seguridad</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.registrarBitacora || false}
                onCheckedChange={v => setForm(prev => ({ ...prev, registrarBitacora: v }))}
              />
              <Label>Registrar en bitacora</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={(form.cambioPasswordDias || 0) > 0}
                onCheckedChange={v => setForm(prev => ({ ...prev, cambioPasswordDias: v ? 90 : 0 }))}
              />
              <Label>Requerir cambio de contrasena cada 90 dias</Label>
            </div>
            <div className="space-y-1">
              <Label>Tiempo de inactividad (min)</Label>
              <Input
                type="number"
                value={form.tiempoInactividad || ""}
                onChange={e => setForm(prev => ({ ...prev, tiempoInactividad: Number(e.target.value) }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Notificaciones</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.enviarRecordatorioEmail || false}
                onCheckedChange={v => setForm(prev => ({ ...prev, enviarRecordatorioEmail: v }))}
              />
              <Label>Enviar recordatorio de citas por email</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.notificarMedicoCitas || false}
                onCheckedChange={v => setForm(prev => ({ ...prev, notificarMedicoCitas: v }))}
              />
              <Label>Notificar al medico de nuevas citas</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={handleSave} disabled={updateConfig.isPending}>
          {updateConfig.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar Configuracion
        </Button>
      </div>
    </div>
  );
}
