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
import { User, Save, Loader2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { usePatient, useCreatePatient, useUpdatePatient } from "@/services/patients.service";
import { usePatientConsultations, useCreateConsultation } from "@/services/consultations.service";
import { useActiveClinics } from "@/services/clinics.service";
import { useActiveProfessionals } from "@/services/professionals.service";
import type { Patient, CreatePatientInput } from "@/types";

export default function ExpedienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "nuevo";

  const { data: patient, isLoading: patientLoading } = usePatient(isNew ? undefined : id);
  const { data: consultations, isLoading: consultationsLoading } = usePatientConsultations(isNew ? undefined : id);
  const { data: clinics } = useActiveClinics();
  const { data: professionals } = useActiveProfessionals();

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  // Form state
  const [form, setForm] = useState<Partial<CreatePatientInput>>({});
  const [consultationForm, setConsultationForm] = useState<Record<string, string>>({});

  // Populate form when patient data loads
  useEffect(() => {
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

  const createConsultation = useCreateConsultation();

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

  const handleSaveConsultation = () => {
    if (!id) return;
    createConsultation.mutate(
      {
        pacienteId: Number(id),
        profesionalId: form.profesionalId || 0,
        fecha: consultationForm.fecha || new Date().toISOString().split("T")[0],
        
        peso: consultationForm.peso,
        talla: consultationForm.talla,
        imc: consultationForm.imc,
        temperatura: consultationForm.temperatura,
        presionArterial: consultationForm.presionArterial,
        frecuenciaCardiaca: consultationForm.frecuenciaCardiaca,
        frecuenciaRespiratoria: consultationForm.frecuenciaRespiratoria,
        saturacionOxigeno: consultationForm.saturacionOxigeno,
        motivoConsulta: consultationForm.motivoConsulta,
        examenFisico: consultationForm.examenFisico,
        indicaciones: consultationForm.indicaciones,
        impresionDiagnostica: consultationForm.impresionDiagnostica,
      },
      {
        onSuccess: () => {
          toast.success("Consulta registrada exitosamente");
          setConsultationForm({});
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Error al registrar consulta");
        },
      }
    );
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
        <Button variant="default" className="bg-primary" size="sm">
          <span className="text-sm">Precio Consulta</span>
        </Button>
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
                    <Input
                      value={form.numeroIdentificacion || ""}
                      onChange={e => updateField("numeroIdentificacion", e.target.value)}
                    />
                  </Field>
                  <Field label="Telefono Casa">
                    <Input
                      value={form.telefonoCasa || ""}
                      onChange={e => updateField("telefonoCasa", e.target.value)}
                    />
                  </Field>
                  <Field label="Nombre" required>
                    <Input
                      value={form.nombre || ""}
                      onChange={e => updateField("nombre", e.target.value)}
                    />
                  </Field>
                  <Field label="Telefono Celular">
                    <Input
                      value={form.telefonoCelular || ""}
                      onChange={e => updateField("telefonoCelular", e.target.value)}
                    />
                  </Field>
                  <Field label="Apellido 1" required>
                    <Input
                      value={form.apellido1 || ""}
                      onChange={e => updateField("apellido1", e.target.value)}
                    />
                  </Field>
                  <Field label="Telefono Trabajo">
                    <Input
                      value={form.telefonoTrabajo || ""}
                      onChange={e => updateField("telefonoTrabajo", e.target.value)}
                    />
                  </Field>
                  <Field label="Apellido 2">
                    <Input
                      value={form.apellido2 || ""}
                      onChange={e => updateField("apellido2", e.target.value)}
                    />
                  </Field>
                  <Field label="Otro Telefono">
                    <Input
                      value={form.otroTelefono || ""}
                      onChange={e => updateField("otroTelefono", e.target.value)}
                    />
                  </Field>
                  <Field label="Sexo">
                    <Select
                      value={form.sexo || ""}
                      onValueChange={v => updateField("sexo", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MASCULINO">Masculino</SelectItem>
                        <SelectItem value="FEMENINO">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Estado Civil">
                    <Select
                      value={form.estadoCivil || ""}
                      onValueChange={v => updateField("estadoCivil", v)}
                    >
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
                    <Input
                      value={form.direccion || ""}
                      onChange={e => updateField("direccion", e.target.value)}
                    />
                  </Field>
                  <Field label="Email" full>
                    <Input
                      type="email"
                      value={form.email || ""}
                      onChange={e => updateField("email", e.target.value)}
                    />
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
                    <Input
                      value={form.ocupacion || ""}
                      onChange={e => updateField("ocupacion", e.target.value)}
                    />
                  </Field>
                  <Field label="Fecha Nacimiento">
                    <Input
                      type="date"
                      value={form.fechaNacimiento || ""}
                      onChange={e => updateField("fechaNacimiento", e.target.value)}
                    />
                  </Field>
                  <Field label="Tipo de Sangre">
                    <Select
                      value={form.tipoSangre || ""}
                      onValueChange={v => updateField("tipoSangre", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                {/* Photo */}
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

        {/* Tab 3: Padecimiento Actual */}
        <TabsContent value="padecimiento">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {!isNew && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Checkbox id="ocultos" /><label htmlFor="ocultos" className="mr-4">Mostrar items ocultos</label>
                  <Button variant="outline" size="sm">Comparar</Button>
                </div>
              )}

              {/* New consultation form */}
              <div className="border rounded-lg p-3 md:p-4 space-y-4 bg-accent/20">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Field label="Fecha">
                    <Input
                      type="date"
                      value={consultationForm.fecha || new Date().toISOString().split("T")[0]}
                      onChange={e => setConsultationForm(prev => ({ ...prev, fecha: e.target.value }))}
                    />
                  </Field>
                  <Field label="Medico">
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
                  <Field label="Hora">
                    <Input
                      value={consultationForm.hora || new Date().toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })}
                      readOnly
                    />
                  </Field>
                  <div className="flex items-end">
                    <Checkbox id="ocultar" /><label htmlFor="ocultar" className="text-xs ml-1">Ocultar</label>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {[
                    { l: "Peso", k: "peso", u: "kg" }, { l: "Talla", k: "talla", u: "mts" },
                    { l: "IMC", k: "imc", u: "" }, { l: "Temp.", k: "temperatura", u: "" },
                    { l: "P. Arterial", k: "presionArterial", u: "" }, { l: "FC", k: "frecuenciaCardiaca", u: "" },
                    { l: "FR", k: "frecuenciaRespiratoria", u: "" }, { l: "SatO2", k: "saturacionOxigeno", u: "%" }
                  ].map(v => (
                    <div key={v.l} className="space-y-1">
                      <label className="text-[10px] text-muted-foreground">{v.l}</label>
                      <Input
                        className="h-7 text-xs"
                        value={consultationForm[v.k] || ""}
                        onChange={e => setConsultationForm(prev => ({ ...prev, [v.k]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 bg-warning/10 p-2 rounded">
                  <Badge variant="outline" className="text-xs">Total Img: 0</Badge>
                  <span className="text-xs">Gabinete/Lab</span>
                  <Select defaultValue="lab">
                    <SelectTrigger className="h-7 text-xs w-full sm:w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lab">Examen de Laboratorio (0)</SelectItem>
                      <SelectItem value="rx">Rayos X (0)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1 w-full sm:w-auto">
                    <Button size="sm" variant="secondary" className="h-7 text-xs flex-1 sm:flex-none">Agregar Imagenes</Button>
                    <Button size="sm" variant="secondary" className="h-7 text-xs flex-1 sm:flex-none">Ver Imagenes</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Motivo de Consulta</Label>
                    <Textarea
                      className="min-h-[80px] md:min-h-[100px]"
                      value={consultationForm.motivoConsulta || ""}
                      onChange={e => setConsultationForm(prev => ({ ...prev, motivoConsulta: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Indicaciones y Tratamientos</Label>
                    <Textarea
                      className="min-h-[80px] md:min-h-[100px]"
                      value={consultationForm.indicaciones || ""}
                      onChange={e => setConsultationForm(prev => ({ ...prev, indicaciones: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Examen Fisico</Label>
                    <Textarea
                      className="min-h-[80px] md:min-h-[100px]"
                      value={consultationForm.examenFisico || ""}
                      onChange={e => setConsultationForm(prev => ({ ...prev, examenFisico: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Impresion Diagnostica</Label>
                    <Textarea
                      className="min-h-[80px] md:min-h-[100px]"
                      value={consultationForm.impresionDiagnostica || ""}
                      onChange={e => setConsultationForm(prev => ({ ...prev, impresionDiagnostica: e.target.value }))}
                    />
                  </div>
                </div>

                {!isNew && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleSaveConsultation}
                      disabled={createConsultation.isPending}
                    >
                      {createConsultation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      Guardar Consulta
                    </Button>
                  </div>
                )}
              </div>

              {/* Previous consultations */}
              {!isNew && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Historial de Consultas</h3>
                  {consultationsLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : consultations && consultations.length > 0 ? (
                    consultations.map(c => (
                      <div key={c.id} className="border rounded-lg p-3 bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{c.fecha}</Badge>
                          <span className="text-xs text-muted-foreground">{c.profesional?.nombre}</span>
                        </div>
                        {c.motivoConsulta && (
                          <p className="text-xs"><strong>Motivo:</strong> {c.motivoConsulta}</p>
                        )}
                        {c.impresionDiagnostica && (
                          <p className="text-xs"><strong>Diagnostico:</strong> {c.impresionDiagnostica}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No hay consultas registradas</p>
                  )}
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
