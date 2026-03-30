import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDoctor } from "@/contexts/DoctorContext";
import { getAppointmentsForProfesional } from "@/data/mockDoctorData";
import { CalendarDays, Clock, MapPin, User, ChevronRight, Stethoscope, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const TODAY = "2026-03-30";

const statusColors: Record<string, string> = {
  confirmada: "bg-success text-success-foreground",
  pendiente: "bg-warning text-warning-foreground",
  completada: "bg-muted text-muted-foreground",
  cancelada: "bg-destructive text-destructive-foreground",
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { profesional } = useDoctor();

  const allAppointments = useMemo(
    () => profesional ? getAppointmentsForProfesional(profesional.id) : [],
    [profesional]
  );

  const todayAppointments = useMemo(
    () => allAppointments.filter(a => a.date === TODAY).sort((a, b) => a.time.localeCompare(b.time)),
    [allAppointments]
  );

  const upcomingAppointments = useMemo(
    () => allAppointments.filter(a => a.date > TODAY).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).slice(0, 5),
    [allAppointments]
  );

  const stats = [
    { label: "Citas Hoy", value: todayAppointments.length.toString(), icon: CalendarDays, color: "text-primary" },
    { label: "Confirmadas", value: todayAppointments.filter(a => a.status === "confirmada").length.toString(), icon: CalendarCheck, color: "text-success" },
    { label: "Pendientes", value: todayAppointments.filter(a => a.status === "pendiente").length.toString(), icon: Clock, color: "text-warning" },
    { label: "Total Semana", value: allAppointments.length.toString(), icon: Stethoscope, color: "text-primary" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Bienvenido, {profesional?.nombre}
        </h1>
        <p className="text-sm text-muted-foreground">{profesional?.especialidad} — {profesional?.clinica}</p>
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
                <p className="text-lg md:text-2xl font-bold text-foreground">{s.value}</p>
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
              <Badge variant="secondary" className="ml-auto">{todayAppointments.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hay citas para hoy</p>
            ) : (
              todayAppointments.map(apt => (
                <button
                  key={apt.id}
                  onClick={() => navigate(`/doctor/expediente/${apt.patientId}?appointmentId=${apt.id}`)}
                  className="w-full text-left border rounded-lg p-3 hover:bg-accent/50 transition-colors group flex items-center gap-3"
                >
                  <div className="text-center shrink-0 bg-primary/10 rounded-lg p-2 w-14">
                    <Clock className="h-3 w-3 mx-auto text-primary mb-0.5" />
                    <span className="text-xs font-semibold text-primary">{apt.time}</span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{apt.patientName}</span>
                      <Badge className={cn("text-[10px]", statusColors[apt.status])}>{apt.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{apt.type}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{apt.clinica}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </button>
              ))
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
              Próximas Citas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hay citas próximas</p>
            ) : (
              upcomingAppointments.map(apt => (
                <div key={apt.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors">
                  <span className="text-[10px] md:text-xs font-mono font-medium text-primary w-20">{apt.date}</span>
                  <span className="text-xs font-mono text-muted-foreground w-12">{apt.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-foreground truncate">{apt.patientName}</p>
                    <p className="text-[10px] text-muted-foreground">{apt.type} · {apt.clinica}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
