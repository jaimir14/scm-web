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
  Mic2,
  Bot,
  Zap,
  MessageSquareText,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const aiFeatures = [
  {
    icon: Mic2,
    title: "Dictado Inteligente de Consultas",
    badge: "IA · Voz a Texto",
    desc: "Durante la consulta, el médico habla con naturalidad y nuestra IA transcribe y llena automáticamente los campos del expediente: motivo de consulta, diagnóstico, tratamiento, medicamentos y notas clínicas. Sin teclear, sin interrumpir la atención al paciente.",
    howItWorks: [
      "El doctor activa el micrófono al inicio de la consulta",
      "La IA procesa el audio en tiempo real con reconocimiento médico especializado",
      "Los datos se clasifican y distribuyen en los campos correctos del formulario",
      "El médico revisa y confirma en segundos antes de guardar",
    ],
    highlight: "Ahorre hasta 15 minutos por consulta eliminando el ingreso manual de datos",
  },
  {
    icon: Bot,
    title: "Asistente IA para el Doctor",
    badge: "IA · Asistente Virtual",
    desc: "Un asistente inteligente siempre disponible que recuerda eventos próximos en la agenda, notifica citas urgentes, responde preguntas sobre historial de pacientes y sugiere acciones basadas en el contexto clínico del día.",
    howItWorks: [
      "Consulte por voz o chat: \"¿Cuándo es mi próxima cita con Juan Pérez?\"",
      "Reciba alertas proactivas antes de citas importantes o seguimientos pendientes",
      "Pregunte sobre el historial del paciente sin navegar por el sistema",
      "El bot aprende los patrones del médico para anticipar sus necesidades",
    ],
    highlight: "Disponible 24/7 desde cualquier dispositivo, como un asistente personal médico",
  },
];

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
            <a href="#ia" className="transition-colors hover:text-foreground">IA Médica</a>
            <a href="#funcionalidades" className="transition-colors hover:text-foreground">Funcionalidades</a>
            <a href="#beneficios" className="transition-colors hover:text-foreground">Beneficios</a>
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

      {/* AI Spotlight */}
      <section id="ia" className="border-t py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/5 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-4">
          <motion.div
            className="mx-auto mb-16 max-w-3xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm gap-2">
              <Zap className="h-3.5 w-3.5" />
              Inteligencia Artificial Médica
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
              Las funciones que{" "}
              <span className="text-primary">cambian todo</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Tecnología de vanguardia diseñada para que los médicos dediquen su tiempo a lo que importa:
              sus pacientes, no el papeleo.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            {aiFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="h-full border-primary/20 bg-gradient-to-br from-background to-primary/5 transition-all hover:shadow-xl hover:border-primary/40">
                  <CardContent className="p-8">
                    <div className="mb-5 flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 ring-2 ring-primary/20">
                        <f.icon className="h-7 w-7 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs font-medium">{f.badge}</Badge>
                    </div>
                    <h3 className="mb-3 text-2xl font-bold tracking-tight">{f.title}</h3>
                    <p className="mb-6 text-base leading-relaxed text-muted-foreground">{f.desc}</p>

                    <div className="mb-6 space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">¿Cómo funciona?</p>
                      {f.howItWorks.map((step, j) => (
                        <div key={j} className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                            {j + 1}
                          </div>
                          <span className="text-sm text-muted-foreground">{step}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-start gap-3 rounded-lg bg-primary/10 px-4 py-3">
                      <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm font-medium text-primary">{f.highlight}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={2}
          >
            <Button size="lg" className="gap-2 text-base" asChild>
              <a href="#contacto">
                Quiero probar estas funciones <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </motion.div>
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
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
                    const originalText = submitBtn.textContent;
                    submitBtn.textContent = "Enviando...";
                    submitBtn.disabled = true;
                    const banner = form.querySelector<HTMLDivElement>('[data-form-banner]')!;
                    banner.setAttribute('hidden', '');
                    try {
                      const formData = new FormData(form);
                      formData.append("access_key", import.meta.env.VITE_WEB3FORMS_ACCESS_KEY);
                      const response = await fetch("https://api.web3forms.com/submit", {
                        method: "POST",
                        body: formData,
                      });
                      const data = await response.json();
                      if (response.ok) {
                        banner.className = "flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300";
                        banner.innerHTML = '<svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>¡Mensaje enviado! Nos pondremos en contacto a la brevedad.</span>';
                        banner.removeAttribute('hidden');
                        form.reset();
                      } else {
                        banner.className = "flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300";
                        banner.innerHTML = '<svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>Error al enviar: ' + data.message + '</span>';
                        banner.removeAttribute('hidden');
                      }
                    } catch {
                      banner.className = "flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300";
                      banner.innerHTML = '<svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>Ocurrió un error. Por favor intente de nuevo.</span>';
                      banner.removeAttribute('hidden');
                    } finally {
                      submitBtn.textContent = originalText;
                      submitBtn.disabled = false;
                    }
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Nombre completo</label>
                      <input
                        name="name"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2"
                        placeholder="Dr. Juan Pérez"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Clínica / Consultorio</label>
                      <input
                        name="clinic"
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
                        name="email"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2"
                        placeholder="correo@clinica.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Teléfono</label>
                      <input
                        type="tel"
                        name="phone"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2"
                        placeholder="+506 8888-8888"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Mensaje (opcional)</label>
                    <textarea
                      name="message"
                      rows={3}
                      className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2"
                      placeholder="Cuéntenos sobre su clínica y qué necesita..."
                    />
                  </div>
                  <div data-form-banner hidden />
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
