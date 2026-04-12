import { useState, useMemo, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { usePatient } from "@/services/patients.service";
import { usePatientConsultations, useCreateConsultation, useUpdateConsultation } from "@/services/consultations.service";
import { useConsultationImages, useRequestPresignedUrl, useRegisterImage, useDeleteConsultationImage, uploadFileToSpaces } from "@/services/consultation-images.service";
import { ConsultationImages } from "@/components/ConsultationImages";
import { ConsultationFiles } from "@/components/ConsultationFiles";
import { useAppointments, useUpdateAppointmentStatus } from "@/services/appointments.service";
import type { Consultation, ConsultationImage } from "@/types";
import { toast } from "sonner";
import { ArrowLeft, User, Clock, Calendar, Save, Plus, Lock, FileText, ChevronDown, ChevronUp, Stethoscope, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="h-9 px-3 py-2 rounded-md border border-input bg-muted/50 text-sm text-foreground flex items-center">
        {value || "\u2014"}
      </div>
    </div>
  );
}

function VitalField({ label, value, editable, onChange, required, error }: { label: string; value: string; editable: boolean; onChange?: (v: string) => void; required?: boolean; error?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-muted-foreground">{label}{required && editable && <span className="text-destructive"> *</span>}</label>
      {editable ? (
        <Input className={cn("h-7 text-xs", error && "border-destructive")} value={value} onChange={e => onChange?.(e.target.value)} />
      ) : (
        <div className="h-7 px-2 py-1 rounded border border-input bg-muted/50 text-xs flex items-center">{value || "\u2014"}</div>
      )}
      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  );
}



function ConsultationCard({
  consultation,
  isToday,
  patientId,
  profesionalId,
  citaId,
}: {
  consultation: Consultation | null;
  isToday: boolean;
  patientId: number;
  profesionalId: number;
  citaId?: number;
}) {
  const createConsultation = useCreateConsultation();
  const updateConsultation = useUpdateConsultation();
  const updateAppointmentStatus = useUpdateAppointmentStatus();
  const [expanded, setExpanded] = useState(isToday);
  const [saving, setSaving] = useState(false);

  const emptyFields = {
    peso: "",
    talla: "",
    imc: "",
    temperatura: "",
    presionArterial: "",
    frecuenciaCardiaca: "",
    frecuenciaRespiratoria: "",
    satO2: "",
    motivoConsulta: "",
    examenFisico: "",
    impresionDiagnostica: "",
    indicacionesTratamientos: "",
  };

  const [editableFields, setEditableFields] = useState(
    consultation
      ? {
          peso: String(consultation.peso ?? ""),
          talla: String(consultation.talla ?? ""),
          imc: String(consultation.imc ?? ""),
          temperatura: String(consultation.temperatura ?? ""),
          presionArterial: consultation.presionArterial ?? "",
          frecuenciaCardiaca: String(consultation.frecuenciaCardiaca ?? ""),
          frecuenciaRespiratoria: String(consultation.frecuenciaRespiratoria ?? ""),
          satO2: String(consultation.satO2 ?? ""),
          motivoConsulta: consultation.motivoConsulta ?? "",
          examenFisico: consultation.examenFisico ?? "",
          impresionDiagnostica: consultation.impresionDiagnostica ?? "",
          indicacionesTratamientos: consultation.indicacionesTratamientos ?? "",
        }
      : emptyFields
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setEditableFields(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSave = async () => {
    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!editableFields.peso.trim()) newErrors.peso = "Peso es requerido";
    if (!editableFields.motivoConsulta.trim()) newErrors.motivoConsulta = "Motivo de consulta es requerido";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Complete los campos requeridos");
      return;
    }

    setSaving(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      if (consultation?.id) {
        await updateConsultation.mutateAsync({
          id: consultation.id,
          data: { ...editableFields },
        });
      } else {
        await createConsultation.mutateAsync({
          pacienteId: patientId,
          profesionalId: profesionalId,
          ...(citaId ? { citaId } : {}),
          fecha: today,
          ...editableFields,
        });
        if (citaId) {
          await updateAppointmentStatus.mutateAsync({
            id: citaId,
            data: { estado: "ATENDIDA" },
          });
        }
      }
      toast.success("Consulta guardada");
    } catch (err: any) {
      toast.error(err?.message || "Error al guardar la consulta");
    } finally {
      setSaving(false);
    }
  };

  const displayFields = isToday ? editableFields : {
    peso: String(consultation?.peso ?? ""),
    talla: String(consultation?.talla ?? ""),
    imc: String(consultation?.imc ?? ""),
    temperatura: String(consultation?.temperatura ?? ""),
    presionArterial: consultation?.presionArterial ?? "",
    frecuenciaCardiaca: String(consultation?.frecuenciaCardiaca ?? ""),
    frecuenciaRespiratoria: String(consultation?.frecuenciaRespiratoria ?? ""),
    satO2: String(consultation?.satO2 ?? ""),
    motivoConsulta: consultation?.motivoConsulta ?? "",
    examenFisico: consultation?.examenFisico ?? "",
    impresionDiagnostica: consultation?.impresionDiagnostica ?? "",
    indicacionesTratamientos: consultation?.indicacionesTratamientos ?? "",
  };

  const fecha = consultation?.fecha ? consultation.fecha.substring(0, 10) : format(new Date(), "yyyy-MM-dd");
  const hora = consultation?.createdAt ? new Date(consultation.createdAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }) : format(new Date(), "HH:mm");
  const medico = consultation?.profesional?.nombre ?? "";

  return (
    <div className={cn("border rounded-lg overflow-hidden", isToday ? "border-primary ring-1 ring-primary/20" : "border-border")}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-accent/30 transition-colors text-left"
      >
        <div className="flex items-center gap-2 shrink-0">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{fecha}</span>
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{hora}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs text-muted-foreground truncate block flex items-center gap-1">
            <Stethoscope className="h-3 w-3" /> {medico}
          </span>
        </div>
        {isToday && <Badge className="bg-primary text-primary-foreground text-[10px] shrink-0">Hoy</Badge>}
        {!isToday && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
        {expanded ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t p-3 md:p-4 space-y-4 bg-card">
          <div>
            <Label className="text-xs font-semibold mb-2 block">Signos Vitales</Label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {[
                { l: "Peso (kg)", k: "peso", req: true },
                { l: "Talla (m)", k: "talla" },
                { l: "IMC", k: "imc" },
                { l: "Temp.", k: "temperatura" },
                { l: "P. Arterial", k: "presionArterial" },
                { l: "FC", k: "frecuenciaCardiaca" },
                { l: "FR", k: "frecuenciaRespiratoria" },
                { l: "SatO2 %", k: "satO2" },
              ].map(v => (
                <VitalField
                  key={v.k}
                  label={v.l}
                  value={(displayFields as any)[v.k]}
                  editable={isToday}
                  required={v.req}
                  error={errors[v.k]}
                  onChange={isToday ? val => updateField(v.k, val) : undefined}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { l: "Motivo de Consulta", k: "motivoConsulta", req: true },
              { l: "Indicaciones y Tratamientos", k: "indicacionesTratamientos" },
              { l: "Examen Fisico", k: "examenFisico" },
              { l: "Impresion Diagnostica", k: "impresionDiagnostica" },
            ].map(f => (
              <div key={f.k} className="space-y-1">
                <Label className="text-xs font-semibold">
                  {f.l}{f.req && isToday && <span className="text-destructive"> *</span>}
                </Label>
                {isToday ? (
                  <>
                    <Textarea
                      className={cn("min-h-[80px]", errors[f.k] && "border-destructive")}
                      value={(displayFields as any)[f.k]}
                      onChange={e => updateField(f.k, e.target.value)}
                    />
                    {errors[f.k] && <p className="text-xs text-destructive">{errors[f.k]}</p>}
                  </>
                ) : (
                  <div className="min-h-[60px] p-2 rounded border border-input bg-muted/50 text-sm whitespace-pre-wrap">
                    {(displayFields as any)[f.k] || "\u2014"}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Consultation Images */}
          <ConsultationImages
            consultaId={consultation?.id}
            patientId={patientId}
            citaId={citaId}
            editable={isToday}
          />

          {/* Consultation Files (Lab Results) */}
          <ConsultationFiles
            consultaId={consultation?.id}
            patientId={patientId}
            editable={isToday}
          />

          {isToday && (
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                Guardar Consulta
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DoctorExpediente() {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const appointmentId = searchParams.get("appointmentId");

  const { data: patient, isLoading: loadingPatient } = usePatient(patientId);
  const { data: consultations = [], isLoading: loadingConsultations } = usePatientConsultations(patientId);

  const today = format(new Date(), "yyyy-MM-dd");

  // Normalize date strings from backend (ISO "2026-03-30T00:00:00.000Z" -> "2026-03-30")
  const normalizeDate = (d: string | undefined | null) => d ? d.substring(0, 10) : "";

  // Fetch today's appointments for this professional
  const { data: appointmentsToday = [] } = useAppointments({
    fecha: today,
    profesionalId: user?.id?.toString(),
  });

  // Find the specific appointment if provided via query param
  const appointment = appointmentId
    ? appointmentsToday.find(a => a.id === Number(appointmentId))
    : null;

  // Find the today appointment for this patient (use the specific one from query param, or the first match)
  const todayAppointment = appointment
    ?? appointmentsToday.find(a => a.pacienteId === Number(patientId)) ?? null;

  const fullHistory = useMemo(() => {
    const entries = [...consultations];
    // Show a new consultation card if there's a today appointment that has no linked consultation yet
    const appointmentHasConsultation = todayAppointment
      ? entries.some(e => e.citaId === todayAppointment.id)
      : false;
    const showNewToday = todayAppointment && !appointmentHasConsultation && user;
    return {
      entries: entries.sort((a, b) => normalizeDate(b.fecha).localeCompare(normalizeDate(a.fecha))),
      showNewToday,
    };
  }, [consultations, todayAppointment, user]);

  if (loadingPatient || loadingConsultations) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Paciente no encontrado.</p>
        <Button variant="link" onClick={() => navigate("/doctor/agenda")}>Volver a la agenda</Button>
      </div>
    );
  }

  const totalEntries = fullHistory.entries.length + (fullHistory.showNewToday ? 1 : 0);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Expediente del Paciente</h1>
      </div>

      <Tabs defaultValue="historial" className="space-y-4">
        <ScrollArea className="w-full">
          <TabsList className="bg-muted inline-flex w-auto min-w-full sm:min-w-0">
            <TabsTrigger value="historial" className="text-xs sm:text-sm whitespace-nowrap">Historial Clinico</TabsTrigger>
            <TabsTrigger value="datos" className="text-xs sm:text-sm whitespace-nowrap">Datos del Paciente</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value="datos">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" /> Informacion Personal
                <Badge variant="outline" className="ml-auto text-[10px]"><Lock className="h-3 w-3 mr-1" /> Solo lectura</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ReadOnlyField label="Nombre" value={`${patient.nombre} ${patient.apellido1}${patient.apellido2 ? ` ${patient.apellido2}` : ""}`} />
                <ReadOnlyField label="Identificacion" value={patient.numeroIdentificacion} />
                <ReadOnlyField label="Telefono" value={patient.telefonoCelular ?? patient.telefonoCasa ?? ""} />
                <ReadOnlyField label="Email" value={patient.email ?? ""} />
                <ReadOnlyField label="Fecha de Nacimiento" value={patient.fechaNacimiento ? patient.fechaNacimiento.split('T')[0] : ""} />
                <ReadOnlyField label="Sexo" value={patient.sexo ?? ""} />
                <ReadOnlyField label="Direccion" value={patient.direccion ?? ""} />
                <ReadOnlyField label="Tipo de Sangre" value={patient.tipoSangre ?? ""} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {totalEntries} {totalEntries === 1 ? "consulta" : "consultas"} registradas
            </p>

            {/* New today consultation card (if no existing one) */}
            {fullHistory.showNewToday && user && todayAppointment && (
              <ConsultationCard
                consultation={null}
                isToday={true}
                patientId={patient.id}
                profesionalId={user.id}
                citaId={todayAppointment.id}
              />
            )}

            {totalEntries === 0 && !fullHistory.showNewToday ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hay historial clinico para este paciente</p>
                </CardContent>
              </Card>
            ) : (
              fullHistory.entries.map(entry => (
                <ConsultationCard
                  key={entry.id}
                  consultation={entry}
                  isToday={normalizeDate(entry.fecha) === today}
                  patientId={patient.id}
                  profesionalId={user?.id ?? 0}
                  citaId={entry.citaId ?? undefined}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
