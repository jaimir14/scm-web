import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useUpdateAppointmentStatus,
  useDeleteAppointment,
} from "@/services/appointments.service";
import { useDoctors } from "@/services/users.service";
import { useActiveClinics } from "@/services/clinics.service";
import { useActiveAppointmentTypes } from "@/services/appointment-types.service";
import { useSearchPatients } from "@/services/patients.service";
import { useDebounce } from "@/hooks/use-debounce";
import type { Appointment } from "@/types";

const hours = Array.from({ length: 15 }, (_, i) => {
  const h = i + 8;
  return { label: `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`, hour: h };
});

export default function AgendaCitas() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [filterProfessionalId, setFilterProfessionalId] = useState("");
  const [filterClinicId, setFilterClinicId] = useState("");

  const dateStr = date ? format(date, "yyyy-MM-dd") : "";

  const { data: appointments, isLoading } = useAppointments({
    fecha: dateStr,
    profesionalId: filterProfessionalId && filterProfessionalId !== "all" ? filterProfessionalId : undefined,
    clinicaId: filterClinicId && filterClinicId !== "all" ? filterClinicId : undefined,
  });
  const { data: professionals } = useDoctors();
  const { data: clinics } = useActiveClinics();

  const updateStatus = useUpdateAppointmentStatus();
  const deleteAppointment = useDeleteAppointment();

  const handleMarkAttended = () => {
    if (!selectedAppointment) return;
    updateStatus.mutate(
      { id: selectedAppointment.id, data: { estado: "ATENDIDA" } },
      {
        onSuccess: () => {
          toast.success("Cita marcada como atendida");
          setSelectedAppointment(null);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Error"),
      }
    );
  };

  const handleCancel = () => {
    if (!selectedAppointment) return;
    updateStatus.mutate(
      { id: selectedAppointment.id, data: { estado: "CANCELADA" } },
      {
        onSuccess: () => {
          toast.success("Cita cancelada");
          setSelectedAppointment(null);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Error"),
      }
    );
  };

  const handleDelete = () => {
    if (!selectedAppointment) return;
    deleteAppointment.mutate(selectedAppointment.id, {
      onSuccess: () => {
        toast.success("Cita eliminada");
        setSelectedAppointment(null);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Error"),
    });
  };

  const handleClickAppointment = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setEditingAppointment(appt);
    setEditDialogOpen(true);
  };

  // Group appointments by hour for display
  const getAppointmentsAtHour = (hour: number) => {
    if (!appointments) return [];
    const hourStr = `${hour.toString().padStart(2, "0")}:`;
    return appointments.filter(a => a.horaInicio?.startsWith(hourStr));
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Agenda de Citas</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Nueva Cita</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Cita</DialogTitle>
            </DialogHeader>
            <CrearCitaForm onClose={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Cita</DialogTitle>
            </DialogHeader>
            {editingAppointment && (
              <EditarCitaForm
                appointment={editingAppointment}
                onClose={() => {
                  setEditDialogOpen(false);
                  setEditingAppointment(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        {/* Left panel */}
        <div className="w-80 space-y-4 shrink-0">
          <Card>
            <CardContent className="p-3">
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs text-muted-foreground">Datos de la Cita Seleccionada</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {selectedAppointment ? (
                <div className="space-y-1 text-xs">
                  <p><strong>Paciente:</strong> {selectedAppointment.paciente?.nombre} {selectedAppointment.paciente?.apellido1}</p>
                  <p><strong>Medico:</strong> {selectedAppointment.profesional?.nombre}</p>
                  <p><strong>Tipo:</strong> {selectedAppointment.tipoCita?.nombre}</p>
                  <p><strong>Hora:</strong> {selectedAppointment.horaInicio} - {selectedAppointment.horaFin}</p>
                  <p><strong>Estado:</strong> <Badge variant="outline" className="text-[10px]">{selectedAppointment.estado}</Badge></p>
                  {selectedAppointment.notas && <p><strong>Notas:</strong> {selectedAppointment.notas}</p>}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Haga clic en una cita para ver sus datos</p>
              )}
            </CardContent>
          </Card>
          <div className="space-y-2">
            <Button
              variant="outline" size="sm" className="w-full"
              onClick={handleMarkAttended}
              disabled={!selectedAppointment || updateStatus.isPending}
            >
              Atendida
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm" className="flex-1"
                onClick={handleCancel}
                disabled={!selectedAppointment || updateStatus.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive" size="sm" className="flex-1"
                onClick={handleDelete}
                disabled={!selectedAppointment || deleteAppointment.isPending}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar grid */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-3 p-3 border-b">
              <AgendaField label="Medico">
                <Select value={filterProfessionalId} onValueChange={setFilterProfessionalId}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {professionals?.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </AgendaField>
              <AgendaField label="Clinica">
                <Select value={filterClinicId} onValueChange={setFilterClinicId}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {clinics?.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </AgendaField>
            </div>

            <div className="overflow-auto max-h-[600px]">
              <table className="w-full border-collapse text-xs">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className="w-16 bg-muted p-2 border-b">Hora</th>
                    <th className="p-2 border-b bg-warning/20 font-bold text-left">
                      {date ? format(date, "dd/MM/yyyy") : ""}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2 border-r"><Skeleton className="h-4 w-12" /></td>
                        <td className="p-1"><Skeleton className="h-8 w-full" /></td>
                      </tr>
                    ))
                  ) : (
                    hours.map(({ label, hour }) => {
                      const appts = getAppointmentsAtHour(hour);
                      return (
                        <tr key={label} className="border-b">
                          <td className="p-2 text-right text-muted-foreground font-mono border-r whitespace-nowrap">{label}</td>
                          <td className="p-1 h-10">
                            <div className="flex gap-1">
                              {appts.map(appt => (
                                <div
                                  key={appt.id}
                                  className={`border rounded p-1 flex-1 cursor-pointer hover:bg-accent/30 transition-colors ${selectedAppointment?.id === appt.id
                                      ? "bg-primary/20 border-primary"
                                      : "bg-primary/10 border-primary/20"
                                    }`}
                                  onClick={() => handleClickAppointment(appt)}
                                >
                                  <p className="font-medium text-foreground">
                                    {appt.paciente?.nombre} {appt.paciente?.apellido1}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {appt.tipoCita?.nombre} - {appt.profesional?.nombre}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CrearCitaForm({ onClose }: { onClose: () => void }) {
  const [searchType, setSearchType] = useState("nombre");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: searchResults, isLoading: searching } = useSearchPatients(debouncedSearch, searchType);

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [profesionalId, setProfesionalId] = useState("");
  const [clinicaId, setClinicaId] = useState("");
  const [tipoCitaId, setTipoCitaId] = useState("");
  const [fecha, setFecha] = useState(format(new Date(), "yyyy-MM-dd"));
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFin, setHoraFin] = useState("08:30");
  const [notas, setNotas] = useState("");

  const { data: professionals } = useActiveProfessionals();
  const { data: clinics } = useActiveClinics();
  const { data: appointmentTypes } = useActiveAppointmentTypes();

  const createAppointment = useCreateAppointment();

  const handleCreate = () => {
    if (!selectedPatientId || !profesionalId || !clinicaId || !tipoCitaId) {
      toast.error("Por favor complete los campos requeridos");
      return;
    }

    createAppointment.mutate(
      {
        pacienteId: selectedPatientId,
        profesionalId: Number(profesionalId),
        clinicaId: Number(clinicaId),
        tipoCitaId: Number(tipoCitaId),
        fecha,
        horaInicio,
        horaFin,
        notas,
      },
      {
        onSuccess: () => {
          toast.success("Cita creada exitosamente");
          onClose();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Error al crear cita");
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={searchType} onValueChange={setSearchType}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="nombre">Nombre</SelectItem>
            <SelectItem value="cedula">Cedula</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Buscar paciente..."
          className="flex-1"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searching && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      <div className="border rounded-md p-3 bg-accent/20 min-h-[80px] max-h-[120px] overflow-y-auto">
        {selectedPatientName ? (
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{selectedPatientName}</p>
            <Button size="sm" variant="ghost" onClick={() => { setSelectedPatientId(null); setSelectedPatientName(""); }}>
              Cambiar
            </Button>
          </div>
        ) : searchResults && searchResults.length > 0 ? (
          <div className="space-y-1">
            {searchResults.map(p => (
              <div
                key={p.id}
                className="text-xs p-1 hover:bg-accent rounded cursor-pointer"
                onClick={() => {
                  setSelectedPatientId(p.id);
                  setSelectedPatientName(`${p.nombre} ${p.apellido1} ${p.apellido2 || ""}`);
                  setSearchQuery("");
                }}
              >
                {p.nombre} {p.apellido1} {p.apellido2 || ""} - {p.numeroIdentificacion}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {searchQuery ? "No se encontraron resultados" : "Busque un paciente para crear la cita"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AgendaField label="Medico">
          <Select value={profesionalId} onValueChange={setProfesionalId}>
            <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
            <SelectContent>
              {professionals?.map(p => (
                <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AgendaField>
        <AgendaField label="Clinica">
          <Select value={clinicaId} onValueChange={setClinicaId}>
            <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
            <SelectContent>
              {clinics?.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AgendaField>
        <AgendaField label="Tipo de Cita">
          <Select value={tipoCitaId} onValueChange={setTipoCitaId}>
            <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
            <SelectContent>
              {appointmentTypes?.map(t => (
                <SelectItem key={t.id} value={String(t.id)}>{t.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AgendaField>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <AgendaField label="Fecha">
          <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        </AgendaField>
        <AgendaField label="Hora Inicio">
          <Input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
        </AgendaField>
        <AgendaField label="Hora Fin">
          <Input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)} />
        </AgendaField>
      </div>

      <AgendaField label="Notas">
        <Textarea placeholder="Notas de la cita..." value={notas} onChange={e => setNotas(e.target.value)} />
      </AgendaField>

      <div className="flex gap-3 justify-end">
        <Button onClick={handleCreate} disabled={createAppointment.isPending}>
          {createAppointment.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
          Crear Cita
        </Button>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
      </div>
    </div>
  );
}

function EditarCitaForm({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const [profesionalId, setProfesionalId] = useState(String(appointment.profesionalId));
  const [clinicaId, setClinicaId] = useState(String(appointment.profesional?.clinicaId ?? ""));
  const [tipoCitaId, setTipoCitaId] = useState(String(appointment.tipoCitaId));
  const [fecha, setFecha] = useState(appointment.fecha);
  const [horaInicio, setHoraInicio] = useState(appointment.horaInicio);
  const [horaFin, setHoraFin] = useState(appointment.horaFin);
  const [notas, setNotas] = useState(appointment.notas || "");

  const { data: professionals } = useActiveProfessionals();
  const { data: clinics } = useActiveClinics();
  const { data: appointmentTypes } = useActiveAppointmentTypes();

  const updateAppointment = useUpdateAppointment();

  const handleUpdate = () => {
    if (!profesionalId || !clinicaId || !tipoCitaId) {
      toast.error("Por favor complete los campos requeridos");
      return;
    }

    updateAppointment.mutate(
      {
        id: appointment.id,
        data: {
          profesionalId: Number(profesionalId),
          clinicaId: Number(clinicaId),
          tipoCitaId: Number(tipoCitaId),
          fecha,
          horaInicio,
          horaFin,
          notas,
        },
      },
      {
        onSuccess: () => {
          toast.success("Cita actualizada exitosamente");
          onClose();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Error al actualizar cita");
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md p-3 bg-accent/20">
        <p className="text-sm font-medium">
          {appointment.paciente?.nombre} {appointment.paciente?.apellido1} {appointment.paciente?.apellido2 || ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AgendaField label="Medico">
          <Select value={profesionalId} onValueChange={setProfesionalId}>
            <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
            <SelectContent>
              {professionals?.map(p => (
                <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AgendaField>
        <AgendaField label="Clinica">
          <Select value={clinicaId} onValueChange={setClinicaId}>
            <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
            <SelectContent>
              {clinics?.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AgendaField>
        <AgendaField label="Tipo de Cita">
          <Select value={tipoCitaId} onValueChange={setTipoCitaId}>
            <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
            <SelectContent>
              {appointmentTypes?.map(t => (
                <SelectItem key={t.id} value={String(t.id)}>{t.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AgendaField>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <AgendaField label="Fecha">
          <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        </AgendaField>
        <AgendaField label="Hora Inicio">
          <Input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
        </AgendaField>
        <AgendaField label="Hora Fin">
          <Input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)} />
        </AgendaField>
      </div>

      <AgendaField label="Notas">
        <Textarea placeholder="Notas de la cita..." value={notas} onChange={e => setNotas(e.target.value)} />
      </AgendaField>

      <div className="flex gap-3 justify-end">
        <Button onClick={handleUpdate} disabled={updateAppointment.isPending}>
          {updateAppointment.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
          Guardar Cambios
        </Button>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
      </div>
    </div>
  );
}

function AgendaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
