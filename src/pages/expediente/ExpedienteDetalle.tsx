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
import { User, Save, Loader2, ChevronDown, Calendar, Stethoscope, Activity, FileText } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { usePatient, useCreatePatient, useUpdatePatient } from "@/services/patients.service";
import { usePatientConsultations } from "@/services/consultations.service";
import { useActiveClinics } from "@/services/clinics.service";
import { useDoctors } from "@/services/users.service";
import { ConsultationImages } from "@/components/ConsultationImages";
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

  useEffect(() => {
    if (isNew) {
      setForm({});
      return;
    }
    if (patient) {
      setForm({
        clinicaId: patient.clinicaId,
        profesionalId: patient.profesionalId,
        tipoIdentificacion: patient.tipoIdentificacion,
        numeroIdentificacion: patient.numeroIdentificacion,
        nombre: patient.nombre,
        apellido1: patient.apellido1,
        apellido2: patient.apellido2 || "",
        sexo: patient.sexo || "",
        estadoCivil: patient.estadoCivil || "",
        fechaNacimiento: patient.fechaNacimiento || "",
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
  }, [patient]);

  const updateField = (key: string, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }));
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
    if (!form.nombre || !form.apellido1 || !form.clinicaId || !form.profesionalId || !form.tipoIdentificacion || !form.numeroIdentificacion) {
      toast.error("Por favor complete los campos requeridos (nombre, apellido, clinica, medico, tipo y numero de identificacion)");
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

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Expediente</h1>
      </div>

      <Tabs defaultValue="datos" className="space-y-4">
        <ScrollArea className="w-full">
          <TabsList className="bg-muted inline-flex w-auto min-w-full sm:min-w-0">
            <TabsTrigger value="datos" className="text-xs sm:text-sm whitespace-nowrap">Datos Personales</TabsTrigger>
            <TabsTrigger value="antecedentes" className="text-xs sm:text-sm whitespace-nowrap">Antecedentes</TabsTrigger>
            <TabsTrigger value="padecimiento" className="text-xs sm:text-sm whitespace-nowrap">Padecimiento</TabsTrigger>
            <TabsTrigger value="notas" className="text-xs sm:text-sm whitespace-nowrap">Notas</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Tab 1: Datos Personales */}
        <TabsContent value="datos">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Clinica" required>
                    <Select
                      value={form.clinicaId ? String(form.clinicaId) : ""}
                      onValueChange={v => updateField("clinicaId", Number(v))}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                      <SelectContent>
                        {clinics?.map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Tipo Identificacion" required>
                    <Select
                      value={form.tipoIdentificacion || ""}
                      onValueChange={v => updateField("tipoIdentificacion", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CEDULA">Cedula Nacional</SelectItem>
                        <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                        <SelectItem value="RESIDENCIA">Residencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Numero de Identificacion" required>
                    <Input value={form.numeroIdentificacion || ""} onChange={e => updateField("numeroIdentificacion", e.target.value)} />
                  </Field>
                  <Field label="Telefono Casa">
                    <Input value={form.telefonoCasa || ""} onChange={e => updateField("telefonoCasa", e.target.value)} />
                  </Field>
                  <Field label="Nombre" required>
                    <Input value={form.nombre || ""} onChange={e => updateField("nombre", e.target.value)} />
                  </Field>
                  <Field label="Telefono Celular">
                    <Input value={form.telefonoCelular || ""} onChange={e => updateField("telefonoCelular", e.target.value)} />
                  </Field>
                  <Field label="Apellido 1" required>
                    <Input value={form.apellido1 || ""} onChange={e => updateField("apellido1", e.target.value)} />
                  </Field>
                  <Field label="Telefono Trabajo">
                    <Input value={form.telefonoTrabajo || ""} onChange={e => updateField("telefonoTrabajo", e.target.value)} />
                  </Field>
                  <Field label="Apellido 2">
                    <Input value={form.apellido2 || ""} onChange={e => updateField("apellido2", e.target.value)} />
                  </Field>
                  <Field label="Otro Telefono">
                    <Input value={form.otroTelefono || ""} onChange={e => updateField("otroTelefono", e.target.value)} />
                  </Field>
                  <Field label="Sexo">
                    <Select value={form.sexo || ""} onValueChange={v => updateField("sexo", v)}>
                      <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MASCULINO">Masculino</SelectItem>
                        <SelectItem value="FEMENINO">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Estado Civil">
                    <Select value={form.estadoCivil || ""} onValueChange={v => updateField("estadoCivil", v)}>
                      <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOLTERO">Soltero</SelectItem>
                        <SelectItem value="CASADO">Casado</SelectItem>
                        <SelectItem value="DIVORCIADO">Divorciado</SelectItem>
                        <SelectItem value="VIUDO">Viudo</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Direccion" full>
                    <Input value={form.direccion || ""} onChange={e => updateField("direccion", e.target.value)} />
                  </Field>
                  <Field label="Email" full>
                    <Input type="email" value={form.email || ""} onChange={e => updateField("email", e.target.value)} />
                  </Field>
                  <Field label="Medico" required>
                    <Select
                      value={form.profesionalId ? String(form.profesionalId) : ""}
                      onValueChange={v => updateField("profesionalId", Number(v))}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                      <SelectContent>
                        {professionals?.map(p => (
                          <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Ocupacion">
                    <Input value={form.ocupacion || ""} onChange={e => updateField("ocupacion", e.target.value)} />
                  </Field>
                  <Field label="Fecha Nacimiento">
                    <Input type="date" value={form.fechaNacimiento || ""} onChange={e => updateField("fechaNacimiento", e.target.value)} />
                  </Field>
                  <Field label="Tipo de Sangre">
                    <Select value={form.tipoSangre || ""} onValueChange={v => updateField("tipoSangre", v)}>
                      <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="flex flex-row lg:flex-col items-center gap-3">
                  <div className="w-24 h-28 lg:w-36 lg:h-40 bg-muted rounded-lg flex items-center justify-center border shrink-0">
                    <User className="h-10 w-10 lg:h-16 lg:w-16 text-muted-foreground/40" />
                  </div>
                  <Button variant="outline" size="sm">Cambiar Fotografia</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Antecedentes */}
        <TabsContent value="antecedentes">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Antecedentes Personales Patologicos</Label>
                  <Textarea
                    className="min-h-[100px] lg:min-h-[120px]"
                    placeholder="Ingrese antecedentes patologicos..."
                    value={form.antecedentesPatologicos || ""}
                    onChange={e => updateField("antecedentesPatologicos", e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Antecedentes Personales No Patologicos</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                    {["Tabaco", "Etilismo", "Ejercicio", "Transfusion", "Alergias", "Drogas"].map(item => (
                      <div key={item} className="flex items-center gap-2">
                        <Checkbox
                          id={item}
                          checked={form.antecedentesNoPatologicos?.[item] || false}
                          onCheckedChange={checked => updateNonPathological(item, !!checked)}
                        />
                        <label htmlFor={item} className="text-sm">{item}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Antecedentes Quirurgicos y Traumaticos</Label>
                  <Textarea
                    className="min-h-[100px] lg:min-h-[120px]"
                    placeholder="Ingrese antecedentes quirurgicos..."
                    value={form.antecedentesQuirurgicos || ""}
                    onChange={e => updateField("antecedentesQuirurgicos", e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Antecedentes Gineco-Obstetricos</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {["FUR", "Menopausia", "TRH", "Planificacion", "Patol. Mamas", "FUPAP", "IRS", "# CS", "Menarca"].map(f => (
                      <Field key={f} label={f}>
                        <Input
                          className="h-8"
                          value={form.antecedentesGinecoObstetricos?.[f] || ""}
                          onChange={e => updateGynecological(f, e.target.value)}
                        />
                      </Field>
                    ))}
                  </div>
                  <Label className="text-sm font-semibold mt-3">GPAC</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {["G", "P", "A", "C"].map(f => (
                      <Field key={f} label={f}>
                        <Input
                          className="h-8"
                          value={form.antecedentesGinecoObstetricos?.[f] || ""}
                          onChange={e => updateGynecological(f, e.target.value)}
                        />
                      </Field>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Antecedentes Heredo-Familiares</Label>
                  <Textarea
                    className="min-h-[100px] lg:min-h-[120px]"
                    placeholder="Ingrese antecedentes familiares..."
                    value={form.antecedentesHeredoFamiliares || ""}
                    onChange={e => updateField("antecedentesHeredoFamiliares", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Otros</Label>
                  <Textarea
                    className="min-h-[100px] lg:min-h-[120px]"
                    placeholder="Otros antecedentes..."
                    value={form.antecedentesOtros || ""}
                    onChange={e => updateField("antecedentesOtros", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Padecimiento Actual - READ ONLY history */}
        <TabsContent value="padecimiento">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">Historial de Consultas</h3>
                {consultations && consultations.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {consultations.length} registro{consultations.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              {consultationsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                  ))}
                </div>
              ) : consultations && consultations.length > 0 ? (
                <div className="space-y-3">
                  {consultations.map((c, idx) => (
                    <ConsultationHistoryCard
                      key={c.id}
                      consultation={c}
                      patientId={Number(id)}
                      defaultOpen={idx === 0}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No hay consultas registradas para este paciente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Notas */}
        <TabsContent value="notas">
          <Card>
            <CardContent className="pt-6">
              <Textarea
                className="min-h-[300px] md:min-h-[400px]"
                placeholder="Notas del paciente..."
                value={form.notas || ""}
                onChange={e => updateField("notas", e.target.value)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center pt-2">
        <Button size="lg" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar Expediente
        </Button>
      </div>
    </div>
  );
}

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
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function Field({ label, children, required, full }: { label: string; children: React.ReactNode; required?: boolean; full?: boolean }) {
  return (
    <div className={`space-y-1 ${full ? "sm:col-span-2" : ""}`}>
      <label className="text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
