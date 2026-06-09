import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { User, Save, Loader2, ChevronDown, Calendar, Stethoscope, Activity, FileText, IdCard, Phone, MapPin, Building2, HeartPulse, ClipboardList, NotebookPen, Smile } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { usePatient, useCreatePatient, useUpdatePatient } from "@/services/patients.service";
import { usePatientConsultations } from "@/services/consultations.service";
import { useActiveClinics } from "@/services/clinics.service";
import { useDoctors } from "@/services/users.service";
import { ConsultationImages } from "@/components/ConsultationImages";
import { ConsultationFiles } from "@/components/ConsultationFiles";
import { PageHeader, FormSection, FormField as Field, FormGrid, FormPage, StickyFormActions } from "@/components/ui/form-section";
import { Odontograma } from "@/components/expediente/dental/Odontograma";
import { AntecedentesOdontologicos } from "@/components/expediente/dental/AntecedentesOdontologicos";
import { ConsultasOdontologicas } from "@/components/expediente/dental/ConsultasOdontologicas";
import { HistorialTratamientos } from "@/components/expediente/dental/HistorialTratamientos";
import { PlanTratamientoContrato } from "@/components/expediente/dental/PlanTratamientoContrato";
import { EstadoCuenta } from "@/components/expediente/dental/EstadoCuenta";
import { ImagenesClinicas } from "@/components/expediente/dental/ImagenesClinicas";
import type { Patient, CreatePatientInput } from "@/types";
import type { Consultation } from "@/types/consultation";

export default function ExpedienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "nuevo";

  const { data: patient, isLoading: patientLoading } = usePatient(isNew ? undefined : id);
  const { data: consultations, isLoading: consultationsLoading } = usePatientConsultations(isNew ? undefined : id);
  const { data: clinics } = useActiveClinics();
  const { data: professionals } = useDoctors();

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  const [form, setForm] = useState<Partial<CreatePatientInput>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dentalMode, setDentalMode] = useState(false);
  const [dentalRecord, setDentalRecord] = useState<{
    flags?: Record<string, boolean>;
    higieneOral?: string;
    alergias?: string;
    medicamentos?: string;
    enfermedades?: string;
    observaciones?: string;
  }>({});

  useEffect(() => {
    if (isNew) {
      setForm({});
      setErrors({});
      return;
    }
    if (patient) {
      setErrors({});
      setForm({
        clinicaId: patient.clinicaId,
        profesionalId: patient.profesionalId,
        tipoIdentificacion: patient.tipoIdentificacion as CreatePatientInput["tipoIdentificacion"],
        numeroIdentificacion: patient.numeroIdentificacion,
        nombre: patient.nombre,
        apellido1: patient.apellido1,
        apellido2: patient.apellido2 || "",
        sexo: (patient.sexo || "") as CreatePatientInput["sexo"],
        estadoCivil: (patient.estadoCivil || "") as CreatePatientInput["estadoCivil"],
        fechaNacimiento: patient.fechaNacimiento ? patient.fechaNacimiento.split('T')[0] : "",
        tipoSangre: patient.tipoSangre || "",
        direccion: patient.direccion || "",
        email: patient.email || "",
        telefonoCasa: patient.telefonoCasa || "",
        telefonoCelular: patient.telefonoCelular || "",
        telefonoTrabajo: patient.telefonoTrabajo || "",
        otroTelefono: patient.otroTelefono || "",
        ocupacion: patient.ocupacion || "",
        antecedentesPatologicos: patient.antecedentesPatologicos || "",
        antecedentesNoPatologicos: patient.antecedentesNoPatologicos || {},
        antecedentesQuirurgicos: patient.antecedentesQuirurgicos || "",
        antecedentesGinecoObstetricos: patient.antecedentesGinecoObstetricos || {},
        antecedentesHeredoFamiliares: patient.antecedentesHeredoFamiliares || "",
        antecedentesOtros: patient.antecedentesOtros || "",
        notas: patient.notas || "",
      });
    }
  }, [patient, isNew]);

  const updateField = (key: string, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const updateNonPathological = (key: string, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      antecedentesNoPatologicos: {
        ...prev.antecedentesNoPatologicos,
        [key]: checked,
      },
    }));
  };

  const updateGynecological = (key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      antecedentesGinecoObstetricos: {
        ...prev.antecedentesGinecoObstetricos,
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!form.nombre) newErrors.nombre = "Nombre es requerido";
    if (!form.apellido1) newErrors.apellido1 = "Apellido es requerido";
    if (!form.clinicaId) newErrors.clinicaId = "Clínica es requerida";
    if (!form.profesionalId) newErrors.profesionalId = "Médico es requerido";
    if (!form.tipoIdentificacion) newErrors.tipoIdentificacion = "Tipo de identificación es requerido";
    if (!form.numeroIdentificacion) newErrors.numeroIdentificacion = "Número de identificación es requerido";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Por favor complete los campos requeridos");
      return;
    }

    if (isNew) {
      createPatient.mutate(form as CreatePatientInput, {
        onSuccess: (data: Patient) => {
          toast.success("Expediente creado exitosamente");
          navigate(`/expediente/${data.id}`);
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Error al crear expediente");
        },
      });
    } else {
      updatePatient.mutate(
        { id: Number(id), data: form },
        {
          onSuccess: () => {
            toast.success("Expediente actualizado exitosamente");
          },
          onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Error al actualizar expediente");
          },
        }
      );
    }
  };

  const isSaving = createPatient.isPending || updatePatient.isPending;

  if (!isNew && patientLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const fullName = [form.nombre, form.apellido1, form.apellido2].filter(Boolean).join(" ").trim();
  const initials = `${(form.nombre?.[0] || "")}${(form.apellido1?.[0] || "")}`.toUpperCase() || "—";

  return (
    <div className="p-4 md:p-8 pb-40 md:pb-36">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Page header */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
          <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--primary-glow))] to-[hsl(var(--coral))]" />
          <div className="flex items-center gap-4 p-5 md:p-6">
            <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-dark))] text-primary-foreground flex items-center justify-center text-lg font-semibold shadow-[0_8px_22px_-10px_hsl(var(--primary)/0.55)] shrink-0 ring-4 ring-[hsl(var(--primary)/0.08)]">
              {initials}
              {dentalMode && (
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[hsl(var(--coral))] ring-2 ring-card flex items-center justify-center">
                  <Smile className="h-3 w-3 text-white" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] uppercase tracking-[0.14em] text-[hsl(var(--primary))] font-semibold">
                {isNew ? "Nuevo expediente" : `Expediente #${id}`}
                {dentalMode && <span className="ml-2 text-[hsl(var(--coral))]">· Odontológico</span>}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight truncate mt-0.5">
                {fullName || "Paciente sin nombre"}
              </h1>
            </div>
            <label className="hidden md:flex items-center gap-2.5 shrink-0 rounded-xl border border-border/70 bg-[hsl(var(--primary-soft)/0.4)] px-3.5 py-2 cursor-pointer hover:bg-[hsl(var(--primary-soft))] transition-colors">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary)/0.15)]">
                <Smile className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-foreground">Vista odontológica</span>
              <Switch checked={dentalMode} onCheckedChange={setDentalMode} />
            </label>
          </div>
          <label className="md:hidden flex items-center justify-between gap-2 border-t border-border/60 bg-[hsl(var(--primary-soft)/0.3)] px-5 py-3 cursor-pointer">
            <span className="flex items-center gap-2 text-sm text-foreground">
              <Smile className="h-4 w-4 text-[hsl(var(--primary))]" /> Vista odontológica
            </span>
            <Switch checked={dentalMode} onCheckedChange={setDentalMode} />
          </label>
        </div>

        <Tabs key={dentalMode ? "dental" : "medico"} defaultValue="datos" className="space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
              <TabsTrigger value="datos" className="text-xs sm:text-sm whitespace-nowrap">Datos Personales</TabsTrigger>
              {dentalMode ? (
                <>
                  <TabsTrigger value="historial-clinico" className="text-xs sm:text-sm whitespace-nowrap">Historial Clínico</TabsTrigger>
                  <TabsTrigger value="odontograma" className="text-xs sm:text-sm whitespace-nowrap">Diagrama Dental</TabsTrigger>
                  <TabsTrigger value="tratamientos" className="text-xs sm:text-sm whitespace-nowrap">Historial Tratamientos</TabsTrigger>
                </>
              ) : (
                <>
                  <TabsTrigger value="antecedentes" className="text-xs sm:text-sm whitespace-nowrap">Antecedentes</TabsTrigger>
                  <TabsTrigger value="padecimiento" className="text-xs sm:text-sm whitespace-nowrap">Padecimiento</TabsTrigger>
                </>
              )}
              <TabsTrigger value="notas" className="text-xs sm:text-sm whitespace-nowrap">Notas</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>



          {/* Tab 1: Datos Personales — redesigned with grouped sections */}
          <TabsContent value="datos" className="space-y-5">
            {/* Identificación */}
            <FormSection
              icon={IdCard}
              title="Identificación"
              description="Documento oficial del paciente"
            >
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-4">
                  <Field label="Tipo de identificación" required error={errors.tipoIdentificacion}>
                    <Select value={form.tipoIdentificacion || ""} onValueChange={v => updateField("tipoIdentificacion", v)}>
                      <SelectTrigger className={errors.tipoIdentificacion ? "border-destructive" : ""}>
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CEDULA">Cédula Nacional</SelectItem>
                        <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                        <SelectItem value="RESIDENCIA">Residencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="col-span-12 sm:col-span-8">
                  <Field label="Número de identificación" required error={errors.numeroIdentificacion}>
                    <Input
                      value={form.numeroIdentificacion || ""}
                      onChange={e => updateField("numeroIdentificacion", e.target.value)}
                      className={errors.numeroIdentificacion ? "border-destructive" : ""}
                      placeholder="Ej. 1-2345-6789"
                    />
                  </Field>
                </div>
              </div>
            </FormSection>

            {/* Información Personal */}
            <FormSection
              icon={User}
              title="Información personal"
              description="Datos básicos del paciente"
            >
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-4">
                  <Field label="Nombre" required error={errors.nombre}>
                    <Input value={form.nombre || ""} onChange={e => updateField("nombre", e.target.value)} className={errors.nombre ? "border-destructive" : ""} />
                  </Field>
                </div>
                <div className="col-span-12 sm:col-span-4">
                  <Field label="Primer apellido" required error={errors.apellido1}>
                    <Input value={form.apellido1 || ""} onChange={e => updateField("apellido1", e.target.value)} className={errors.apellido1 ? "border-destructive" : ""} />
                  </Field>
                </div>
                <div className="col-span-12 sm:col-span-4">
                  <Field label="Segundo apellido">
                    <Input value={form.apellido2 || ""} onChange={e => updateField("apellido2", e.target.value)} />
                  </Field>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Field label="Sexo">
                    <Select value={form.sexo || ""} onValueChange={v => updateField("sexo", v)}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MASCULINO">Masculino</SelectItem>
                        <SelectItem value="FEMENINO">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <Field label="Estado civil">
                    <Select value={form.estadoCivil || ""} onValueChange={v => updateField("estadoCivil", v)}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOLTERO">Soltero</SelectItem>
                        <SelectItem value="CASADO">Casado</SelectItem>
                        <SelectItem value="DIVORCIADO">Divorciado</SelectItem>
                        <SelectItem value="VIUDO">Viudo</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <Field label="Fecha de nacimiento">
                    <Input type="date" value={form.fechaNacimiento || ""} onChange={e => updateField("fechaNacimiento", e.target.value)} />
                  </Field>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <Field label="Tipo de sangre">
                    <Select value={form.tipoSangre || ""} onValueChange={v => updateField("tipoSangre", v)}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="col-span-12 sm:col-span-6">
                  <Field label="Ocupación">
                    <Input value={form.ocupacion || ""} onChange={e => updateField("ocupacion", e.target.value)} placeholder="Ej. Docente" />
                  </Field>
                </div>
              </div>
            </FormSection>

            {/* Contacto */}
            <FormSection
              icon={Phone}
              title="Contacto"
              description="Cómo contactar al paciente"
            >
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-6">
                  <Field label="Teléfono celular">
                    <Input value={form.telefonoCelular || ""} onChange={e => updateField("telefonoCelular", e.target.value)} placeholder="+506 8888 8888" />
                  </Field>
                </div>
                <div className="col-span-12 sm:col-span-6">
                  <Field label="Email">
                    <Input type="email" value={form.email || ""} onChange={e => updateField("email", e.target.value)} placeholder="paciente@correo.com" />
                  </Field>
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <Field label="Teléfono casa">
                    <Input value={form.telefonoCasa || ""} onChange={e => updateField("telefonoCasa", e.target.value)} />
                  </Field>
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <Field label="Teléfono trabajo">
                    <Input value={form.telefonoTrabajo || ""} onChange={e => updateField("telefonoTrabajo", e.target.value)} />
                  </Field>
                </div>
                <div className="col-span-12 sm:col-span-4">
                  <Field label="Otro teléfono">
                    <Input value={form.otroTelefono || ""} onChange={e => updateField("otroTelefono", e.target.value)} />
                  </Field>
                </div>
                <div className="col-span-12">
                  <Field label="Dirección">
                    <div className="relative">
                      <MapPin className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <Input className="pl-9" value={form.direccion || ""} onChange={e => updateField("direccion", e.target.value)} placeholder="Provincia, cantón, distrito, señas exactas" />
                    </div>
                  </Field>
                </div>
              </div>
            </FormSection>

            {/* Asignación clínica */}
            <FormSection
              icon={Building2}
              title="Asignación clínica"
              description="Clínica y médico responsable"
            >
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-6">
                  <Field label="Clínica" required error={errors.clinicaId}>
                    <Select value={form.clinicaId ? String(form.clinicaId) : ""} onValueChange={v => updateField("clinicaId", Number(v))}>
                      <SelectTrigger className={errors.clinicaId ? "border-destructive" : ""}><SelectValue placeholder="Seleccione clínica..." /></SelectTrigger>
                      <SelectContent>
                        {clinics?.map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="col-span-12 sm:col-span-6">
                  <Field label="Médico responsable" required error={errors.profesionalId}>
                    <Select value={form.profesionalId ? String(form.profesionalId) : ""} onValueChange={v => updateField("profesionalId", Number(v))}>
                      <SelectTrigger className={errors.profesionalId ? "border-destructive" : ""}><SelectValue placeholder="Seleccione médico..." /></SelectTrigger>
                      <SelectContent>
                        {professionals?.map(p => (<SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>
            </FormSection>
          </TabsContent>

          {/* Antecedentes — only in medical mode */}
          {!dentalMode && (
            <TabsContent value="antecedentes">
              <FormSection icon={HeartPulse} title="Antecedentes médicos" description="Historial clínico del paciente">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Antecedentes Personales Patológicos</Label>
                    <Textarea className="min-h-[120px]" placeholder="Ingrese antecedentes patológicos..." value={form.antecedentesPatologicos || ""} onChange={e => updateField("antecedentesPatologicos", e.target.value)} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Antecedentes Personales No Patológicos</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-md border bg-muted/30 p-3">
                      {["Tabaco", "Etilismo", "Ejercicio", "Transfusion", "Alergias", "Drogas"].map(item => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox id={item} checked={form.antecedentesNoPatologicos?.[item] || false} onCheckedChange={checked => updateNonPathological(item, !!checked)} />
                          <label htmlFor={item} className="text-sm">{item}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Antecedentes Quirúrgicos y Traumáticos</Label>
                    <Textarea className="min-h-[120px]" placeholder="Ingrese antecedentes quirúrgicos..." value={form.antecedentesQuirurgicos || ""} onChange={e => updateField("antecedentesQuirurgicos", e.target.value)} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Antecedentes Gineco-Obstétricos</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {["FUR", "Menopausia", "TRH", "Planificacion", "Patol. Mamas", "FUPAP", "IRS", "# CS", "Menarca"].map(f => (
                        <Field key={f} label={f}>
                          <Input className="h-9" value={form.antecedentesGinecoObstetricos?.[f] || ""} onChange={e => updateGynecological(f, e.target.value)} />
                        </Field>
                      ))}
                    </div>
                    <Label className="text-sm font-semibold mt-3 block">GPAC</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {["G", "P", "A", "C"].map(f => (
                        <Field key={f} label={f}>
                          <Input className="h-9" value={form.antecedentesGinecoObstetricos?.[f] || ""} onChange={e => updateGynecological(f, e.target.value)} />
                        </Field>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Antecedentes Heredo-Familiares</Label>
                    <Textarea className="min-h-[120px]" placeholder="Ingrese antecedentes familiares..." value={form.antecedentesHeredoFamiliares || ""} onChange={e => updateField("antecedentesHeredoFamiliares", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Otros</Label>
                    <Textarea className="min-h-[120px]" placeholder="Otros antecedentes..." value={form.antecedentesOtros || ""} onChange={e => updateField("antecedentesOtros", e.target.value)} />
                  </div>
                </div>
              </FormSection>
            </TabsContent>
          )}

          {/* Dental-only tabs */}
          {dentalMode && (
            <>
              <TabsContent value="historial-clinico">
                <AntecedentesOdontologicos value={dentalRecord} onChange={setDentalRecord} />
              </TabsContent>
              <TabsContent value="odontograma">
                <Odontograma />
              </TabsContent>
              <TabsContent value="tratamientos">
                <HistorialTratamientos patientName={fullName || "Paciente"} />
              </TabsContent>
            </>
          )}

          {/* Padecimiento — only in medical mode */}
          {!dentalMode && (
            <TabsContent value="padecimiento">
              <FormSection icon={ClipboardList} title="Historial de consultas" description="Consultas previas del paciente">
                <div className="flex items-center gap-2 mb-2">
                  {consultations && consultations.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {consultations.length} registro{consultations.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
                {consultationsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-24 w-full rounded-lg" />))}
                  </div>
                ) : consultations && consultations.length > 0 ? (
                  <div className="space-y-3">
                    {consultations.map((c, idx) => (
                      <ConsultationHistoryCard key={c.id} consultation={c} patientId={Number(id)} defaultOpen={idx === 0} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No hay consultas registradas para este paciente</p>
                  </div>
                )}
              </FormSection>
            </TabsContent>
          )}

          {/* Tab 4: Notas */}
          <TabsContent value="notas" className="space-y-5">
            <FormSection icon={NotebookPen} title="Notas clínicas generales" description="Notas generales del expediente">
              <Textarea className="min-h-[220px]" placeholder="Escriba notas relevantes del paciente..." value={form.notas || ""} onChange={e => updateField("notas", e.target.value)} />
            </FormSection>
            {dentalMode && (
              <FormSection icon={Smile} title="Notas odontológicas" description="Observaciones específicas del tratamiento dental">
                <Textarea className="min-h-[160px]" placeholder="Notas odontológicas…" />
              </FormSection>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-5xl px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          <p className="hidden sm:block text-xs text-muted-foreground">
            Los campos marcados con <span className="text-destructive">*</span> son obligatorios.
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" onClick={() => navigate(-1)} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isNew ? "Crear expediente" : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* PageHeader/FormSection/Field/StickyFormActions are now imported from
   @/components/ui/form-section to keep the design consistent across the app. */

/* ── Consultation History Card ── */

function ConsultationHistoryCard({
  consultation: c,
  patientId,
  defaultOpen = false,
}: {
  consultation: Consultation;
  patientId: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const vitalSigns = [
    { label: "Peso", value: c.peso, unit: "kg" },
    { label: "Talla", value: c.talla, unit: "m" },
    { label: "IMC", value: c.imc },
    { label: "Temp.", value: c.temperatura, unit: "°C" },
    { label: "P. Arterial", value: c.presionArterial },
    { label: "FC", value: c.frecuenciaCardiaca, unit: "bpm" },
    { label: "FR", value: c.frecuenciaRespiratoria, unit: "rpm" },
    { label: "SatO₂", value: c.satO2, unit: "%" },
  ].filter(v => v.value != null && v.value !== "" && v.value !== 0);

  const textSections = [
    { label: "Motivo de Consulta", value: c.motivoConsulta, icon: Stethoscope },
    { label: "Examen Físico", value: c.examenFisico, icon: Activity },
    { label: "Impresión Diagnóstica", value: c.impresionDiagnostica, icon: FileText },
    { label: "Indicaciones y Tratamientos", value: c.indicacionesTratamientos, icon: FileText },
  ].filter(s => s.value);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border rounded-lg bg-card overflow-hidden transition-shadow hover:shadow-sm">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center gap-3 p-3 md:p-4 text-left hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 shrink-0">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">{c.fecha}</span>
                {c.profesional?.nombre && (
                  <Badge variant="outline" className="text-[11px] font-normal">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    {c.profesional.nombre}
                  </Badge>
                )}
              </div>
              {c.motivoConsulta && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {c.motivoConsulta}
                </p>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t px-3 md:px-4 py-3 md:py-4 space-y-4">
            {/* Vital Signs */}
            {vitalSigns.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Signos Vitales</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {vitalSigns.map(v => (
                    <div key={v.label} className="bg-muted/50 rounded-md px-3 py-2">
                      <p className="text-[10px] text-muted-foreground">{v.label}</p>
                      <p className="text-sm font-medium text-foreground">
                        {v.value}
                        {v.unit && <span className="text-xs text-muted-foreground ml-0.5">{v.unit}</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Text sections */}
            {textSections.map(section => {
              const Icon = section.icon;
              return (
                <div key={section.label}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{section.label}</span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 rounded-md px-3 py-2">
                    {section.value}
                  </p>
                </div>
              );
            })}

            {/* Images */}
            <ConsultationImages
              consultaId={c.id}
              patientId={patientId}
              citaId={c.citaId ?? undefined}
              editable={false}
            />

            {/* Files (Lab Results) */}
            <ConsultationFiles
              consultaId={c.id}
              patientId={patientId}
              editable={false}
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

/* Field is imported from @/components/ui/form-section */
