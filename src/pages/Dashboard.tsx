import { CalendarDays, Users, FolderOpen, Building2, Activity, Clock, ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useDashboardStats, useUpcomingAppointments, useRecentActivity } from "@/services/dashboard.service";
import { formatNumber } from "@/lib/formatters";
import { useAuth } from "@/contexts/AuthContext";

const statConfig = [
  {
    key: "citasHoy" as const,
    label: "Citas Hoy",
    icon: CalendarDays,
    href: "/citas",
    tone: "primary",
    delta: "+12%",
  },
  {
    key: "pacientes" as const,
    label: "Pacientes",
    icon: Users,
    href: "/expediente/buscar",
    tone: "info",
    delta: "+4.2%",
  },
  {
    key: "expedientes" as const,
    label: "Expedientes",
    icon: FolderOpen,
    href: "/expediente/buscar",
    tone: "warning",
    delta: "+8.1%",
  },
  {
    key: "clinicas" as const,
    label: "Clínicas",
    icon: Building2,
    href: "/mantenimientos/clinicas",
    tone: "success",
    delta: "0%",
  },
] as const;

const toneStyles: Record<string, { ring: string; text: string; bg: string; iconBg: string; dot: string; accent: string }> = {
  primary: { ring: "ring-[hsl(var(--primary)/0.15)]", text: "text-[hsl(var(--primary-dark))]", bg: "bg-[hsl(var(--primary-soft))]", iconBg: "bg-white", dot: "bg-primary", accent: "from-[hsl(var(--primary)/0.10)] to-transparent" },
  info:    { ring: "ring-sky-200",                     text: "text-sky-700",                    bg: "bg-sky-50",                        iconBg: "bg-white", dot: "bg-sky-500", accent: "from-sky-100/60 to-transparent" },
  warning: { ring: "ring-amber-200",                   text: "text-amber-700",                  bg: "bg-amber-50",                      iconBg: "bg-white", dot: "bg-warning", accent: "from-amber-100/60 to-transparent" },
  success: { ring: "ring-emerald-200",                 text: "text-emerald-700",                bg: "bg-emerald-50",                    iconBg: "bg-white", dot: "bg-success", accent: "from-emerald-100/60 to-transparent" },
};


export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: upcoming, isLoading: upcomingLoading, isError: upcomingError } = useUpcomingAppointments();
  const { data: activity, isLoading: activityLoading, isError: activityError } = useRecentActivity();

  const firstName = (user?.nombre ?? "Doctor").split(" ")[0];
  const now = new Date();
  const fechaLarga = now.toLocaleDateString("es-CR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-full bg-gradient-hero">
      <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1600px] mx-auto">
        {/* Hero header */}
        <header className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="absolute inset-0 bg-gradient-mint opacity-[0.08] pointer-events-none" />
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Panel · {fechaLarga}
              </div>
              <h1 className="mt-3 font-display text-3xl md:text-5xl tracking-tight text-foreground">
                Hola, <span className="text-gradient-mint">{firstName}</span>.
              </h1>
              <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-xl">
                Aquí está el resumen de hoy en tu clínica. Todo en orden, listo para empezar.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/citas"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow hover:brightness-110 transition"
              >
                <CalendarDays className="h-4 w-4" />
                Ir a la agenda
              </Link>
              <Link
                to="/expediente/nuevo"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 backdrop-blur px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                Nuevo expediente
              </Link>
            </div>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {statConfig.map(s => {
            const t = toneStyles[s.tone];
            return (
              <Link key={s.label} to={s.href} className="group">
                <Card className="relative overflow-hidden border-border/60 bg-card hover:border-primary/30 transition-all hover:shadow-elegant hover:-translate-y-1 duration-300">
                  <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-[0.08] group-hover:opacity-20 transition-opacity" style={{ background: `hsl(var(--primary))` }} />
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-2xl ${t.bg} ${t.text} ring-1 ${t.ring} ${t.glow}`}>
                        <s.icon className="h-5 w-5" strokeWidth={2.25} />
                      </div>

                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition" />
                    </div>
                    <div className="mt-4">
                      {statsLoading ? (
                        <>
                          <Skeleton className="h-8 w-20 mb-2" />
                          <Skeleton className="h-3 w-16" />
                        </>
                      ) : (
                        <>
                          <p className="font-display text-3xl md:text-4xl tracking-tight text-foreground tabular-nums">
                            {stats ? formatNumber(stats[s.key] ?? 0) : "0"}
                          </p>
                          <div className="mt-1.5 flex items-center justify-between">
                            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{s.label}</p>
                            <span className={`text-[10px] font-mono ${t.text} flex items-center gap-1`}>
                              <TrendingUp className="h-3 w-3" />
                              {s.delta}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>

        {/* Main grid */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          {/* Upcoming - 3 cols */}
          <Card className="lg:col-span-3 border-border/70">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="font-display text-base md:text-lg flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-4 w-4" />
                </span>
                Próximas citas
              </CardTitle>
              <Link to="/citas" className="text-xs font-mono uppercase tracking-wider text-primary hover:underline">
                Ver todo →
              </Link>
            </CardHeader>
            <CardContent className="space-y-1">
              {upcomingError ? (
                <p className="text-sm text-destructive text-center py-6">Error al cargar las citas</p>
              ) : upcomingLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-4 w-14" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                ))
              ) : upcoming && upcoming.length > 0 ? (
                upcoming.map((a, i) => (
                  <div
                    key={a.id || i}
                    className="group flex items-center gap-3 md:gap-4 p-2.5 md:p-3 rounded-xl hover:bg-accent/60 transition-colors border border-transparent hover:border-border"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[56px] py-1.5 rounded-lg bg-primary/10 text-primary">
                      <span className="font-mono text-sm font-bold leading-none">{a.hora}</span>
                      <span className="text-[9px] font-mono uppercase tracking-wider mt-1 opacity-70">hoy</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{a.paciente}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        <span className="font-mono">{a.medico}</span> · {a.tipo}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No hay citas próximas</p>
              )}
            </CardContent>
          </Card>

          {/* Activity - 2 cols */}
          <Card className="lg:col-span-2 border-border/70 bg-gradient-soft">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base md:text-lg flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Activity className="h-4 w-4" />
                </span>
                Actividad reciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0.5">
              {activityError ? (
                <p className="text-sm text-destructive text-center py-6">Error al cargar la actividad</p>
              ) : activityLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-2">
                    <Skeleton className="h-2 w-2 rounded-full mt-2" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))
              ) : activity && activity.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                  {activity.map((a, i) => (
                    <div key={a.id || i} className="relative flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/40 transition-colors">
                      <div className="relative z-10 mt-1.5 h-3.5 w-3.5 rounded-full bg-background border-2 border-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{a.accion}</p>
                        <p className="text-xs text-muted-foreground truncate">{a.detalle}</p>
                        <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">{a.hora}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No hay actividad reciente</p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
