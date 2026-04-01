import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointments } from "@/services/appointments.service";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Clock, MapPin, User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Appointment } from "@/types";

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

export default function DoctorAgenda() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(!isMobile);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // Fetch appointments for the selected date
  const { data: dayAppointments = [], isLoading: loadingDay } = useAppointments({
    fecha: dateStr,
    profesionalId: user?.id?.toString(),
  });

  // Fetch all appointments for this professional (to highlight calendar dates)
  const { data: allAppointments = [] } = useAppointments({
    profesionalId: user?.id?.toString(),
  });

  const sortedDay = useMemo(
    () => [...dayAppointments].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
    [dayAppointments]
  );

  const datesWithAppointments = useMemo(
    () => [...new Set(allAppointments.map(a => a.fecha))],
    [allAppointments]
  );

  const handleAppointmentClick = (apt: Appointment) => {
    navigate(`/doctor/expediente/${apt.pacienteId}?appointmentId=${apt.id}`);
  };

  const getPatientName = (apt: Appointment) =>
    apt.paciente
      ? `${apt.paciente.nombre} ${apt.paciente.apellido1}${apt.paciente.apellido2 ? ` ${apt.paciente.apellido2}` : ""}`
      : "Paciente";

  // Calculate duration in minutes from horaInicio and horaFin
  const getDuration = (apt: Appointment) => {
    if (!apt.horaInicio || !apt.horaFin) return null;
    const [h1, m1] = apt.horaInicio.split(":").map(Number);
    const [h2, m2] = apt.horaFin.split(":").map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
        <CalendarDays className="h-6 w-6 text-primary" />
        Mi Agenda
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
        {isMobile ? (
          <Collapsible open={calendarOpen} onOpenChange={setCalendarOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between mb-2">
                <span>{format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
                <CalendarDays className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="mb-4">
                <CardContent className="p-2 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={d => { if (d) { setSelectedDate(d); setCalendarOpen(false); } }}
                    locale={es}
                    modifiers={{ hasAppointment: datesWithAppointments.map(d => new Date(d + "T12:00:00")) }}
                    modifiersClassNames={{ hasAppointment: "font-bold text-primary" }}
                  />
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <Card className="h-fit">
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={d => d && setSelectedDate(d)}
                locale={es}
                modifiers={{ hasAppointment: datesWithAppointments.map(d => new Date(d + "T12:00:00")) }}
                modifiersClassNames={{ hasAppointment: "font-bold text-primary" }}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Citas — {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
              <Badge variant="secondary" className="ml-auto">{sortedDay.length} citas</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingDay ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : sortedDay.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay citas para este dia</p>
              </div>
            ) : (
              sortedDay.map(apt => {
                const duration = getDuration(apt);
                return (
                  <button
                    key={apt.id}
                    onClick={() => handleAppointmentClick(apt)}
                    className="w-full text-left border rounded-lg p-3 md:p-4 hover:bg-accent/50 transition-colors group flex items-center gap-3"
                  >
                    <div className="text-center shrink-0 bg-primary/10 rounded-lg p-2 w-14">
                      <Clock className="h-3 w-3 mx-auto text-primary mb-0.5" />
                      <span className="text-xs font-semibold text-primary">{apt.horaInicio.slice(0, 5)}</span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground">{getPatientName(apt)}</span>
                        <Badge className={cn("text-[10px]", statusColors[apt.estado] ?? "")}>
                          {statusLabels[apt.estado] ?? apt.estado}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />{apt.tipoCita?.nombre ?? "Consulta"}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{apt.clinica?.nombre ?? ""}
                        </span>
                        {duration && <span>{duration} min</span>}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
