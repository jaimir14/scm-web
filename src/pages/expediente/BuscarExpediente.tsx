import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, CalendarClock, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchPatients } from "@/services/patients.service";
import { usePatientAppointments } from "@/services/appointments.service";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDateDisplay } from "@/lib/formatters";
import type { Patient, Appointment } from "@/types";

export default function BuscarExpediente() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState("nombre");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [appointmentsPatient, setAppointmentsPatient] = useState<Patient | null>(null);

  const { data: results, isLoading } = useSearchPatients(debouncedQuery, searchType);
  const isMobile = useIsMobile();

  const openAppointments = (e: React.MouseEvent, p: Patient) => {
    e.stopPropagation();
    setAppointmentsPatient(p);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl md:text-2xl font-bold text-foreground">Busqueda de Expediente</h1>

      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Buscar por</label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nombre">Nombre</SelectItem>
                  <SelectItem value="cedula">Cedula</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Paciente</label>
              <Input
                placeholder="Digite un texto para buscar..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isMobile ? (
            <div className="divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-3 space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))
              ) : results && results.length > 0 ? (
                results.map(p => (
                  <div
                    key={p.id}
                    className="p-3 hover:bg-accent/50 cursor-pointer active:bg-accent/70"
                    onClick={() => navigate(`/expediente/${p.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-foreground">
                          {p.nombre} {p.apellido1} {p.apellido2 || ""}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {p.numeroIdentificacion} · {p.telefonoCelular || p.telefonoCasa || ""}
                        </p>
                        <p className="text-xs text-muted-foreground">{p.clinica?.nombre || ""}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={(e) => openAppointments(e, p)}
                      >
                        <CalendarClock className="h-3.5 w-3.5 mr-1" />
                        Citas
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  {query ? "No se encontraron resultados" : "Ingrese un termino de busqueda"}
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cedula</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Clinica</TableHead>
                  <TableHead className="w-32 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : results && results.length > 0 ? (
                  results.map(p => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => navigate(`/expediente/${p.id}`)}
                    >
                      <TableCell className="font-medium">
                        {p.nombre} {p.apellido1} {p.apellido2 || ""}
                      </TableCell>
                      <TableCell>{p.numeroIdentificacion}</TableCell>
                      <TableCell>{p.telefonoCelular || p.telefonoCasa || ""}</TableCell>
                      <TableCell>{p.clinica?.nombre || ""}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => openAppointments(e, p)}
                        >
                          <CalendarClock className="h-3.5 w-3.5 mr-1" />
                          Citas
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {query ? "No se encontraron resultados" : "Ingrese un termino de busqueda"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PatientAppointmentsDialog
        patient={appointmentsPatient}
        onClose={() => setAppointmentsPatient(null)}
        onOpenAppointment={(appt) => {
          const fecha = (appt.fecha || "").split("T")[0];
          navigate(`/citas?date=${fecha}&appointmentId=${appt.id}`);
        }}
      />
    </div>
  );
}

function PatientAppointmentsDialog({
  patient,
  onClose,
  onOpenAppointment,
}: {
  patient: Patient | null;
  onClose: () => void;
  onOpenAppointment: (appt: Appointment) => void;
}) {
  const { data: appointments, isLoading } = usePatientAppointments(patient?.id);

  // Sort: most-future-first then descending into past
  const sorted = (appointments ?? []).slice().sort((a, b) => {
    const aKey = `${(a.fecha || "").split("T")[0]} ${a.horaInicio || ""}`;
    const bKey = `${(b.fecha || "").split("T")[0]} ${b.horaInicio || ""}`;
    return bKey.localeCompare(aKey);
  });

  const today = new Date().toISOString().split("T")[0];

  const statusVariant = (estado: string) => {
    if (estado === "ATENDIDA") return "secondary";
    if (estado === "CANCELADA") return "destructive";
    return "default";
  };

  return (
    <Dialog open={!!patient} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Citas del paciente</DialogTitle>
          <DialogDescription>
            {patient ? `${patient.nombre} ${patient.apellido1} ${patient.apellido2 || ""}` : ""}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Este paciente no tiene citas registradas.
          </p>
        ) : (
          <div className="divide-y border rounded-md">
            {sorted.map((appt) => {
              const fecha = (appt.fecha || "").split("T")[0];
              const isFuture = fecha >= today;
              return (
                <div
                  key={appt.id}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-accent/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">
                        {fecha ? formatDateDisplay(new Date(`${fecha}T00:00:00`)) : ""}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {appt.horaInicio} - {appt.horaFin}
                      </span>
                      <Badge variant={statusVariant(appt.estado) as any} className="text-[10px]">
                        {appt.estado}
                      </Badge>
                      {isFuture && (
                        <Badge variant="outline" className="text-[10px]">Futura</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {appt.tipoCita?.nombre || ""}
                      {appt.profesional?.nombre ? ` · ${appt.profesional.nombre}` : ""}
                      {appt.clinica?.nombre ? ` · ${appt.clinica.nombre}` : ""}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenAppointment(appt)}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Abrir
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
