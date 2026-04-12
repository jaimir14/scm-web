import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Filter, Printer, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useAppointmentsReport,
  usePatientsReport,
  useClinicsReport,
  useTreatmentsReport,
  useUsersReport,
  type ReportFilters,
} from "@/services/reports.service";
import { useActiveProfessionals } from "@/services/professionals.service";
import { useActiveClinics } from "@/services/clinics.service";
import { useActiveRoles } from "@/services/roles.service";

type FilterDef = {
  key: string;
  label: string;
  type: string;
  options?: { value: string; label: string }[];
};

type ReporteConfig = {
  title: string;
  filters: FilterDef[];
  columns: { key: string; label: string }[];
};

export default function ReporteGenerico({ tipo }: { tipo: string }) {
  const { data: professionals } = useActiveProfessionals();
  const { data: clinics } = useActiveClinics();
  const { data: roles } = useActiveRoles();
  const isMobile = useIsMobile();

  const [filters, setFilters] = useState<ReportFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>({});
  const [hasFiltered, setHasFiltered] = useState(false);
  const [showFilters, setShowFilters] = useState(!isMobile);

  // Call all hooks unconditionally
  const appointmentsReport = useAppointmentsReport(appliedFilters, hasFiltered && tipo === "citas");
  const patientsReport = usePatientsReport(appliedFilters, hasFiltered && tipo === "pacientes");
  const clinicsReport = useClinicsReport(appliedFilters, hasFiltered && tipo === "clinicas");
  const treatmentsReport = useTreatmentsReport(appliedFilters, hasFiltered && tipo === "tratamientos");
  const usersReport = useUsersReport(appliedFilters, hasFiltered && tipo === "usuarios");

  const reportQueries: Record<string, { data: any; isLoading: boolean }> = {
    citas: appointmentsReport,
    pacientes: patientsReport,
    clinicas: clinicsReport,
    tratamientos: treatmentsReport,
    usuarios: usersReport,
  };

  const activeReport = reportQueries[tipo] || { data: undefined, isLoading: false };

  const profOptions = [
    { value: "all", label: "Todos" },
    ...(professionals || []).map(p => ({ value: String(p.id), label: p.nombre })),
  ];

  const clinicOptions = [
    { value: "all", label: "Todas" },
    ...(clinics || []).map(c => ({ value: String(c.id), label: c.nombre })),
  ];

  const configs: Record<string, ReporteConfig> = {
    citas: {
      title: "Reporte de Citas",
      filters: [
        { key: "desde", label: "Desde", type: "date" },
        { key: "hasta", label: "Hasta", type: "date" },
        { key: "profesionalId", label: "Medico", type: "select", options: profOptions },
        { key: "clinicaId", label: "Clinica", type: "select", options: clinicOptions },
        { key: "estado", label: "Estado", type: "select", options: [
          { value: "all", label: "Todos" },
          { value: "ATENDIDA", label: "Atendida" },
          { value: "PENDIENTE", label: "Pendiente" },
          { value: "CANCELADA", label: "Cancelada" },
        ]},
      ],
      columns: [
        { key: "fecha", label: "Fecha" }, { key: "hora", label: "Hora" },
        { key: "paciente", label: "Paciente" }, { key: "medico", label: "Medico" },
        { key: "tipo", label: "Tipo" }, { key: "estado", label: "Estado" },
      ],
    },
    pacientes: {
      title: "Reporte de Pacientes",
      filters: [
        { key: "clinicaId", label: "Clinica", type: "select", options: clinicOptions },
        { key: "profesionalId", label: "Medico", type: "select", options: profOptions },
        { key: "sexo", label: "Sexo", type: "select", options: [
          { value: "all", label: "Todos" },
          { value: "MASCULINO", label: "Masculino" },
          { value: "FEMENINO", label: "Femenino" },
        ]},
      ],
      columns: [
        { key: "nombre", label: "Nombre" }, { key: "cedula", label: "Cedula" },
        { key: "telefono", label: "Telefono" }, { key: "clinica", label: "Clinica" },
        { key: "medico", label: "Medico" }, { key: "ultimaVisita", label: "Ultima Visita" },
      ],
    },
    clinicas: {
      title: "Reporte de Clinicas",
      filters: [
        { key: "estado", label: "Estado", type: "select", options: [
          { value: "all", label: "Todas" },
          { value: "true", label: "Activa" },
          { value: "false", label: "Inactiva" },
        ]},
      ],
      columns: [
        { key: "nombre", label: "Nombre" }, { key: "direccion", label: "Direccion" },
        { key: "telefono", label: "Telefono" }, { key: "medicos", label: "Medicos" },
        { key: "pacientes", label: "Pacientes" }, { key: "estado", label: "Estado" },
      ],
    },
    tratamientos: {
      title: "Reporte de Tratamientos",
      filters: [
        { key: "desde", label: "Desde", type: "date" },
        { key: "hasta", label: "Hasta", type: "date" },
        { key: "categoria", label: "Categoria", type: "select", options: [
          { value: "all", label: "Todas" },
          { value: "PREVENTIVO", label: "Preventivo" },
          { value: "CIRUGIA", label: "Cirugia" },
          { value: "RESTAURACION", label: "Restauracion" },
          { value: "ORTODONCIA", label: "Ortodoncia" },
        ]},
      ],
      columns: [
        { key: "codigo", label: "Codigo" }, { key: "tratamiento", label: "Tratamiento" },
        { key: "categoria", label: "Categoria" }, { key: "cantidad", label: "Cantidad" },
        { key: "ingresos", label: "Ingresos" },
      ],
    },
    usuarios: {
      title: "Reporte de Usuarios",
      filters: [
        { key: "rol", label: "Rol", type: "select", options: [
          { value: "all", label: "Todos" },
          { value: "ADMINISTRADOR", label: "Administrador" },
          { value: "MEDICO", label: "Medico" },
          { value: "RECEPCION", label: "Recepcion" },
          { value: "ENFERMERIA", label: "Enfermeria" },
        ]},
        { key: "estado", label: "Estado", type: "select", options: [
          { value: "all", label: "Todos" },
          { value: "true", label: "Activo" },
          { value: "false", label: "Inactivo" },
        ]},
      ],
      columns: [
        { key: "usuario", label: "Usuario" }, { key: "nombre", label: "Nombre" },
        { key: "rol", label: "Rol" }, { key: "ultimoAcceso", label: "Ultimo Acceso" },
        { key: "estado", label: "Estado" },
      ],
    },
  };

  const config = configs[tipo];
  if (!config) return <div className="p-6">Reporte no encontrado</div>;

  const handleFilter = () => {
    setAppliedFilters({ ...filters });
    setHasFiltered(true);
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value === "all" ? undefined : (value || undefined) }));
  };

  // Transform raw backend data to flat display strings matching column keys
  const transformData = (raw: any[]): Record<string, string>[] => {
    if (!raw || raw.length === 0) return [];

    switch (tipo) {
      case "citas":
        return raw.map((r: any) => ({
          fecha: r.fecha ? new Date(r.fecha).toLocaleDateString() : "",
          hora: r.horaInicio || "",
          paciente: r.paciente
            ? `${r.paciente.nombre} ${r.paciente.apellido1 || ""}`.trim()
            : "",
          medico: r.profesional?.nombre || "",
          tipo: r.tipoCita?.nombre || "",
          estado: r.estado || "",
        }));

      case "pacientes":
        return raw.map((r: any) => ({
          nombre: `${r.nombre} ${r.apellido1 || ""} ${r.apellido2 || ""}`.trim(),
          cedula: r.numeroIdentificacion || "",
          telefono: r.telefonoCelular || r.telefonoCasa || "",
          clinica: r.clinica?.nombre || "",
          medico: r.profesional?.nombre || "",
          ultimaVisita: r.updatedAt
            ? new Date(r.updatedAt).toLocaleDateString()
            : "",
        }));

      case "clinicas":
        return raw.map((r: any) => ({
          nombre: r.nombre || "",
          direccion: r.direccion || "",
          telefono: r.telefono || "",
          medicos: String(r._count?.professionals ?? r.professionals?.length ?? "-"),
          pacientes: String(r._count?.patients ?? r.patients?.length ?? "-"),
          estado: r.estado ? "Activa" : "Inactiva",
        }));

      case "tratamientos":
        return raw.map((r: any) => ({
          codigo: r.codigo || "",
          tratamiento: r.nombre || "",
          categoria: r.categoria || "",
          cantidad: "-",
          ingresos: r.precio != null ? `₡${Number(r.precio).toLocaleString()}` : "-",
        }));

      case "usuarios":
        return raw.map((r: any) => ({
          usuario: r.usuario || "",
          nombre: r.nombre || "",
          rol: r.rol || "",
          ultimoAcceso: r.ultimoAcceso
            ? new Date(r.ultimoAcceso).toLocaleString()
            : "Nunca",
          estado: r.estado ? "Activo" : "Inactivo",
        }));

      default:
        return raw;
    }
  };

  const reportData = transformData(activeReport.data as any[] || []);
  const isLoading = activeReport.isLoading;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">{config.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Imprimir</span></Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Exportar</span></Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mb-3"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-1" /> Filtros {showFilters ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
          )}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-end gap-3 mb-4">
              {config.filters.map(f => (
                <div key={f.key} className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                  {f.type === "select" ? (
                    <Select
                      value={filters[f.key] || "all"}
                      onValueChange={v => updateFilter(f.key, v)}
                    >
                      <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                      <SelectContent>
                        {f.options?.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={f.type}
                      className="w-full md:w-40"
                      value={filters[f.key] || ""}
                      onChange={e => updateFilter(f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
              <Button size="sm" className="w-full sm:w-auto" onClick={handleFilter} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Filter className="h-4 w-4 mr-1" />}
                Filtrar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isMobile ? (
            <div className="divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-3 space-y-1">
                    {config.columns.map(c => (
                      <div key={c.key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground text-xs">{c.label}</span>
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                ))
              ) : reportData.length > 0 ? (
                reportData.map((row, i) => (
                  <div key={i} className="p-3 space-y-1">
                    {config.columns.map(c => (
                      <div key={c.key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground text-xs">{c.label}</span>
                        <span className="text-foreground text-xs font-medium">{row[c.key]}</span>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {hasFiltered ? "No se encontraron resultados" : "Aplique filtros para generar el reporte"}
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {config.columns.map(c => <TableHead key={c.key}>{c.label}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {config.columns.map(c => (
                          <TableCell key={c.key}><Skeleton className="h-4 w-24" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : reportData.length > 0 ? (
                    reportData.map((row, i) => (
                      <TableRow key={i}>
                        {config.columns.map(c => <TableCell key={c.key}>{row[c.key]}</TableCell>)}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={config.columns.length} className="text-center py-8 text-muted-foreground">
                        {hasFiltered ? "No se encontraron resultados" : "Aplique filtros para generar el reporte"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="p-3 border-t text-xs text-muted-foreground">
            Mostrando {reportData.length} registros
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
