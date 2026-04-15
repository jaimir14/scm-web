import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointments } from "@/services/appointments.service";
import { CalendarDays, Clock, MapPin, User, ChevronRight, Stethoscope, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { todayStr, formatTime, formatDateTime } from "@/lib/formatters";

const statusColors: Record<string, string> = {
  PENDIENTE: "bg-warning text-warning-foreground",
  ATENDIDA: "bg-muted text-muted-foreground",
  CANCELADA: "bg-destructive text-destructive-foreground",
};

const statusLabels: Record<string, string> = {
  PENDIENTE: "pendiente",
  ATENDIDA: "atendida",
  CANCELADA: "cancelada",
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const today = todayStr();

  const { data: todayAppointments = [], isLoading: loadingToday } = useAppointments({
    fecha: today,
    profesionalId: user?.id?.toString(),
  });

  const { data: allAppointments = [], isLoading: loadingAll } = useAppointments({
    profesionalId: user?.id?.toString(),
  });

  const sortedToday = useMemo(
    () => [...todayAppointments].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
    [todayAppointments]
  );

  const upcomingAppointments = useMemo(
    () =>
      allAppointments
        .filter(a => a.fecha > today)
        .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.horaInicio.localeCompare(b.horaInicio))
        .slice(0, 5),
    [allAppointments, today]
  );

  const stats = [
    { label: "Citas Hoy", value: sortedToday.length.toString(), icon: CalendarDays, color: "text-primary" },
    { label: "Pendientes", value: sortedToday.filter(a => a.estado === "PENDIENTE").length.toString(), icon: Clock, color: "text-warning" },
    { label: "Atendidas", value: sortedToday.filter(a => a.estado === "ATENDIDA").length.toString(), icon: CalendarCheck, color: "text-success" },
    { label: "Total Proximas", value: upcomingAppointments.length.toString(), icon: Stethoscope, color: "text-primary" },
  ];

  const isLoading = loadingToday || loadingAll;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Bienvenido, {user?.nombre}
        </h1>
        <p className="text-sm text-muted-foreground">
          {user?.especialidad ?? ""}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-3 md:p-5">
              <div className={`p-2 rounded-lg bg-accent ${s.color}`}>
                <s.icon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  <p className="text-lg md:text-2xl font-bold text-foreground">{s.value}</p>
                )}
                <p className="text-[10px] md:text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's appointments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Citas de Hoy
              <Badge variant="secondary" className="ml-auto">{sortedToday.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : sortedToday.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hay citas para hoy</p>
            ) : (
              sortedToday.map(apt => {
                const patientName = apt.paciente
                  ? `${apt.paciente.nombre} ${apt.paciente.apellido1}${apt.paciente.apellido2 ? ` ${apt.paciente.apellido2}` : ""}`
                  : "Paciente";
                return (
                  <button
                    key={apt.id}
                    onClick={() => navigate(`/doctor/expediente/${apt.pacienteId}?appointmentId=${apt.id}`)}
                    className="w-full text-left border rounded-lg p-3 hover:bg-accent/50 transition-colors group flex items-center gap-3"
                  >
                    <div className="text-center shrink-0 bg-primary/10 rounded-lg p-2 w-26">
                      <Clock className="h-3 w-3 mx-auto text-primary mb-0.5" />
                      <span className="text-xs font-semibold text-primary">{formatTime(apt.horaInicio)}</span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground">{patientName}</span>
                        <Badge className={cn("text-[10px]", statusColors[apt.estado] ?? "")}>
                          {statusLabels[apt.estado] ?? apt.estado}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />{apt.tipoCita?.nombre ?? "Consulta"}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{apt.clinica?.nombre ?? ""}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </button>
                );
              })
            )}
            <Button variant="outline" className="w-full mt-2" size="sm" onClick={() => navigate("/doctor/agenda")}>
              Ver agenda completa
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Proximas Citas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hay citas proximas</p>
            ) : (
              upcomingAppointments.map(apt => {
                const patientName = apt.paciente
                  ? `${apt.paciente.nombre} ${apt.paciente.apellido1}${apt.paciente.apellido2 ? ` ${apt.paciente.apellido2}` : ""}`
                  : "Paciente";
                return (
                  <div key={apt.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors">
                    <span className="text-[10px] md:text-xs font-mono font-medium text-primary w-50">{formatDateTime(apt.fecha, apt.horaInicio)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-foreground truncate">{patientName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {apt.tipoCita?.nombre ?? "Consulta"} · {apt.clinica?.nombre ?? ""}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
