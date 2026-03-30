import { CalendarDays, Users, FolderOpen, Building2, Activity, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useDashboardStats, useUpcomingAppointments, useRecentActivity } from "@/services/dashboard.service";

const statConfig = [
  { key: "citasHoy" as const, label: "Citas Hoy", icon: CalendarDays, color: "text-primary", href: "/citas" },
  { key: "pacientes" as const, label: "Pacientes", icon: Users, color: "text-success", href: "/expediente/buscar" },
  { key: "expedientes" as const, label: "Expedientes", icon: FolderOpen, color: "text-warning", href: "/expediente/buscar" },
  { key: "clinicas" as const, label: "Clinicas", icon: Building2, color: "text-primary", href: "/mantenimientos/clinicas" },
];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats();
  const { data: upcoming, isLoading: upcomingLoading, isError: upcomingError } = useUpcomingAppointments();
  const { data: activity, isLoading: activityLoading, isError: activityError } = useRecentActivity();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel Principal</h1>
        <p className="text-sm text-muted-foreground">Bienvenido al Sistema Clinico Medico</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statConfig.map(s => (
          <Link key={s.label} to={s.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`p-3 rounded-lg bg-accent ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  {statsLoading ? (
                    <>
                      <Skeleton className="h-7 w-16 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-foreground">
                        {stats ? stats[s.key]?.toLocaleString() : "0"}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Proximas Citas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingError ? (
              <p className="text-sm text-destructive text-center py-4">Error al cargar las citas</p>
            ) : upcomingLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-4 w-12" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : upcoming && upcoming.length > 0 ? (
              upcoming.map((a, i) => (
                <div key={a.id || i} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors">
                  <span className="text-xs font-mono font-medium text-primary w-12">{a.hora}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.paciente}</p>
                    <p className="text-xs text-muted-foreground">{a.medico} - {a.tipo}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No hay citas proximas</p>
            )}
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activityError ? (
              <p className="text-sm text-destructive text-center py-4">Error al cargar la actividad</p>
            ) : activityLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-4 w-12" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))
            ) : activity && activity.length > 0 ? (
              activity.map((a, i) => (
                <div key={a.id || i} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors">
                  <span className="text-xs font-mono text-muted-foreground w-12">{a.hora}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{a.accion}</p>
                    <p className="text-xs text-muted-foreground">{a.detalle}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No hay actividad reciente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
