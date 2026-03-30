import { useState, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { patients, patientHistory, appointments, type HistoryEntry } from "@/data/mockDoctorData";
import { useDoctor } from "@/contexts/DoctorContext";
import { ArrowLeft, User, Clock, Calendar, Save, Plus, Lock, FileText, ChevronDown, ChevronUp, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const TODAY = "2026-03-30";

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="h-9 px-3 py-2 rounded-md border border-input bg-muted/50 text-sm text-foreground flex items-center">
        {value || "—"}
      </div>
    </div>
  );
}

function VitalField({ label, value, editable, onChange }: { label: string; value: string; editable: boolean; onChange?: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-muted-foreground">{label}</label>
      {editable ? (
        <Input className="h-7 text-xs" value={value} onChange={e => onChange?.(e.target.value)} />
      ) : (
        <div className="h-7 px-2 py-1 rounded border border-input bg-muted/50 text-xs flex items-center">{value || "—"}</div>
      )}
    </div>
  );
}

function HistoryCard({ entry, isToday }: { entry: HistoryEntry; isToday: boolean }) {
  const [expanded, setExpanded] = useState(isToday);
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState(entry.notas);
  const [editableEntry, setEditableEntry] = useState(entry);

  const updateField = (field: keyof HistoryEntry, value: string) => {
    setEditableEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveNote = () => {
    if (newNote.trim()) {
      const timestamp = format(new Date(), "dd/MM/yyyy HH:mm");
      const updated = notes ? `${notes}\n[${timestamp}] ${newNote}` : `[${timestamp}] ${newNote}`;
      setNotes(updated);
      setNewNote("");
    }
  };

  const displayEntry = isToday ? editableEntry : entry;

  return (
    <div className={cn("border rounded-lg overflow-hidden", isToday ? "border-primary ring-1 ring-primary/20" : "border-border")}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-accent/30 transition-colors text-left"
      >
        <div className="flex items-center gap-2 shrink-0">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{entry.fecha}</span>
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{entry.hora}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs text-muted-foreground truncate block flex items-center gap-1">
            <Stethoscope className="h-3 w-3" /> {entry.medico}
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
                { l: "Peso (kg)", k: "peso" as const },
                { l: "Talla (m)", k: "talla" as const },
                { l: "IMC", k: "imc" as const },
                { l: "Temp.", k: "temp" as const },
                { l: "P. Arterial", k: "presionArterial" as const },
                { l: "FC", k: "fc" as const },
                { l: "FR", k: "fr" as const },
                { l: "SatO2 %", k: "satO2" as const },
              ].map(v => (
                <VitalField
                  key={v.k}
                  label={v.l}
                  value={displayEntry[v.k]}
                  editable={isToday}
                  onChange={isToday ? val => updateField(v.k, val) : undefined}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { l: "Motivo de Consulta", k: "motivoConsulta" as const },
              { l: "Indicaciones y Tratamientos", k: "indicaciones" as const },
              { l: "Examen Físico", k: "examenFisico" as const },
              { l: "Impresión Diagnóstica", k: "impresionDiagnostica" as const },
            ].map(f => (
              <div key={f.k} className="space-y-1">
                <Label className="text-xs font-semibold">{f.l}</Label>
                {isToday ? (
                  <Textarea
                    className="min-h-[80px]"
                    value={displayEntry[f.k]}
                    onChange={e => updateField(f.k, e.target.value)}
                  />
                ) : (
                  <div className="min-h-[60px] p-2 rounded border border-input bg-muted/50 text-sm whitespace-pre-wrap">
                    {entry[f.k] || "—"}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t pt-3">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <FileText className="h-3 w-3" /> Notas
            </Label>
            {notes && (
              <div className="p-2 rounded bg-muted/50 border text-xs whitespace-pre-wrap text-muted-foreground">
                {notes}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Agregar nota..."
                className="text-xs h-8"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSaveNote()}
              />
              <Button size="sm" variant="outline" className="h-8 text-xs shrink-0" onClick={handleSaveNote}>
                <Plus className="h-3 w-3 mr-1" /> Nota
              </Button>
            </div>
          </div>

          {isToday && (
            <div className="flex justify-end pt-2">
              <Button size="sm">
                <Save className="h-3 w-3 mr-1" /> Guardar Consulta
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
  const { profesional } = useDoctor();
  const appointmentId = searchParams.get("appointmentId");

  const patient = patients.find(p => p.id === patientId);
  const history = patientHistory[patientId || ""] || [];
  const appointment = appointments.find(a => a.id === appointmentId);

  const fullHistory = useMemo(() => {
    const entries = [...history];
    const hasTodayEntry = entries.some(e => e.fecha === TODAY);
    if (!hasTodayEntry && appointment && appointment.date === TODAY && profesional) {
      entries.push({
        id: "new-today",
        fecha: TODAY,
        hora: appointment.time.replace(/(\d{2}):(\d{2})/, (_, h, m) => {
          const hr = parseInt(h);
          return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? "PM" : "AM"}`;
        }),
        profesionalId: profesional.id,
        medico: profesional.nombre,
        peso: "", talla: "", imc: "", temp: "",
        presionArterial: "", fc: "", fr: "", satO2: "",
        motivoConsulta: "", examenFisico: "",
        impresionDiagnostica: "", indicaciones: "", notas: "",
      });
    }
    return entries.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [history, appointment, profesional]);

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Paciente no encontrado.</p>
        <Button variant="link" onClick={() => navigate("/doctor/agenda")}>Volver a la agenda</Button>
      </div>
    );
  }

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
            <TabsTrigger value="historial" className="text-xs sm:text-sm whitespace-nowrap">Historial Clínico</TabsTrigger>
            <TabsTrigger value="datos" className="text-xs sm:text-sm whitespace-nowrap">Datos del Paciente</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value="datos">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" /> Información Personal
                <Badge variant="outline" className="ml-auto text-[10px]"><Lock className="h-3 w-3 mr-1" /> Solo lectura</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ReadOnlyField label="Nombre" value={`${patient.nombre} ${patient.apellido1} ${patient.apellido2}`} />
                <ReadOnlyField label="Identificación" value={patient.identificacion} />
                <ReadOnlyField label="Teléfono" value={patient.telefono} />
                <ReadOnlyField label="Email" value={patient.email} />
                <ReadOnlyField label="Fecha de Nacimiento" value={patient.fechaNacimiento} />
                <ReadOnlyField label="Sexo" value={patient.sexo} />
                <ReadOnlyField label="Dirección" value={patient.direccion} />
                <ReadOnlyField label="Tipo de Sangre" value={patient.tipoSangre} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {fullHistory.length} {fullHistory.length === 1 ? "consulta" : "consultas"} registradas
            </p>
            {fullHistory.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hay historial clínico para este paciente</p>
                </CardContent>
              </Card>
            ) : (
              fullHistory.map(entry => (
                <HistoryCard key={entry.id} entry={entry} isToday={entry.fecha === TODAY} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
