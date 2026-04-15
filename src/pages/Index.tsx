import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { motion } from "framer-motion";
import {
  CalendarDays,
  ClipboardList,
  Users,
  ShieldCheck,
  BarChart3,
  Stethoscope,
  Building2,
  Moon,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Star,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: ClipboardList,
    title: "Expedientes Digitales",
    desc: "Historial clínico completo de cada paciente: datos personales, antecedentes, tratamientos y notas por consulta. Todo en un solo lugar.",
  },
  {
    icon: CalendarDays,
    title: "Agenda de Citas",
    desc: "Calendario visual para agendar, reprogramar y gestionar citas. Vista por día, semana o mes con filtros por profesional.",
  },
  {
    icon: Stethoscope,
    title: "Portal Médico",
    desc: "Acceso exclusivo para doctores: dashboard con citas del día, historial del paciente y registro de notas clínicas en tiempo real.",
  },
  {
    icon: Users,
    title: "Gestión de Usuarios",
    desc: "Administre roles de acceso: administradores, recepcionistas y médicos. Cada uno ve solo lo que necesita.",
  },
  {
    icon: BarChart3,
    title: "Reportes y Estadísticas",
    desc: "Informes de citas, pacientes, clínicas y tratamientos con filtros avanzados. Exporte datos para análisis.",
  },
  {
    icon: ShieldCheck,
    title: "Bitácora de Actividad",
    desc: "Registro detallado de cada acción en el sistema. Auditoría completa para cumplimiento normativo.",
  },
  {
    icon: Building2,
    title: "Multi-Clínica",
    desc: "Administre múltiples sedes desde una sola plataforma. Catálogos de clínicas, profesionales y tipos de cita centralizados.",
  },
  {
    icon: Moon,
    title: "Modo Oscuro",
    desc: "Interfaz adaptable con modo claro y oscuro para mayor comodidad visual durante jornadas extendidas.",
  },
  {
    icon: Smartphone,
    title: "Diseño Responsivo",
    desc: "Acceda desde computadora, tablet o celular. La interfaz se adapta automáticamente a cualquier dispositivo.",
  },
];

const benefits = [
  "Elimine el papeleo y los expedientes físicos",
  "Reduzca las citas perdidas con una agenda clara",
  "Acceso seguro desde cualquier dispositivo",
  "Implemente en días, no en meses",
  "Soporte local en Costa Rica",
  "Sin instalación: 100% en la nube",
];

const testimonials = [
  {
    name: "Dra. María Fernández",
    role: "Odontóloga, San José",
    text: "Desde que implementamos el sistema, la gestión de citas se redujo a la mitad del tiempo. Mis pacientes están más satisfechos.",
    stars: 5,
  },
  {
    name: "Dr. Carlos Méndez",
    role: "Director Clínico, Heredia",
    text: "La bitácora y los reportes nos dan total visibilidad. Ahora tomo decisiones basadas en datos reales.",
    stars: 5,
  },
  {
    name: "Licda. Ana Rojas",
    role: "Administradora, Alajuela",
    text: "El portal del doctor simplificó la comunicación con nuestro equipo médico. Todo el historial a un clic.",
    stars: 5,
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">Medikal</span>
          </div>
          <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#funcionalidades" className="transition-colors hover:text-foreground">Funcionalidades</a>
            <a href="#beneficios" className="transition-colors hover:text-foreground">Beneficios</a>
            <a href="#testimonios" className="transition-colors hover:text-foreground">Testimonios</a>
            <a href="#contacto" className="transition-colors hover:text-foreground">Contacto</a>
          </div>
          <div className="flex items-center gap-2">

            <Button size="sm" asChild>
              <a href="#contacto">Solicitar Demo</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
                🇨🇷 Diseñado para clínicas en Costa Rica
              </Badge>
            </motion.div>
            <motion.h1
              className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl"
              initial="hidden" animate="visible" variants={fadeUp} custom={1}
            >
              Gestione su clínica{" "}
              <span className="text-primary">de forma inteligente</span>
            </motion.h1>
            <motion.p
              className="mb-8 text-lg text-muted-foreground md:text-xl"
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
            >
              Expedientes digitales, agenda de citas, portal médico y reportes.
              Todo lo que su consultorio necesita en una plataforma web moderna, segura y fácil de usar.
            </motion.p>
            <motion.div
              className="flex flex-col items-center justify-center gap-3 sm:flex-row"
              initial="hidden" animate="visible" variants={fadeUp} custom={3}
            >
              <Button size="lg" className="gap-2 text-base" asChild>
                <a href="#contacto">
                  Solicitar Demo Gratuita <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <a href="#funcionalidades">Conocer Funcionalidades</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Todo lo que necesita, en un solo sistema
            </h2>
            <p className="text-muted-foreground">
              Herramientas diseñadas para el día a día de clínicas y consultorios médicos.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="border-t py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                ¿Por qué elegir <span className="text-primary">Medikal</span>?
              </h2>
              <p className="mb-8 text-muted-foreground">
                Desarrollado pensando en las necesidades reales de clínicas costarricenses.
                Simplifique su operación y enfóquese en lo que importa: sus pacientes.
              </p>
              <ul className="space-y-4">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm font-medium">{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <a href="#contacto">Empezar Ahora</a>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: "500+", label: "Pacientes gestionados" },
                { val: "99.9%", label: "Disponibilidad" },
                { val: "3 min", label: "Tiempo promedio de registro" },
                { val: "24/7", label: "Acceso desde cualquier lugar" },
              ].map((s) => (
                <Card key={s.label} className="text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-primary">{s.val}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-muted-foreground">
              Profesionales de la salud en Costa Rica ya confían en Medikal.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="mb-3 flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="mb-4 text-sm italic leading-relaxed text-muted-foreground">
                      "{t.text}"
                    </p>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section id="contacto" className="border-t py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                Solicite su demostración gratuita
              </h2>
              <p className="text-muted-foreground">
                Contáctenos y le mostraremos cómo Medikal puede transformar la gestión de su clínica.
              </p>
            </div>
            <Card>
              <CardContent className="p-6 md:p-8">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("¡Gracias! Nos pondremos en contacto pronto.");
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Nombre completo</label>
                      <input
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2"
                        placeholder="Dr. Juan Pérez"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Clínica / Consultorio</label>
                      <input
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2"
                        placeholder="Clínica Dental Sonrisa"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Correo electrónico</label>
                      <input
                        type="email"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2"
                        placeholder="correo@clinica.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Teléfono</label>
                      <input
                        type="tel"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2"
                        placeholder="+506 8888-8888"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Mensaje (opcional)</label>
                    <textarea
                      rows={3}
                      className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2"
                      placeholder="Cuéntenos sobre su clínica y qué necesita..."
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full text-base">
                    Solicitar Demo Gratuita
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="mt-10 grid gap-6 text-center sm:grid-cols-3">
              <div className="flex flex-col items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">info@clinicapro.cr</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">+506 2222-3333</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">San José, Costa Rica</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <span className="font-bold">Medikal</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Medikal. Todos los derechos reservados. Hecho en Costa Rica 🇨🇷
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
