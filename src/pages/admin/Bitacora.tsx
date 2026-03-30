import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Filter, Download, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuditLog } from "@/services/audit-log.service";
import { useUsers } from "@/services/users.service";
import type { AuditLogFilters } from "@/types";

const actionColor: Record<string, string> = {
  "Inicio de sesion": "bg-primary/10 text-primary",
  "LOGIN": "bg-primary/10 text-primary",
  "INICIO_SESION": "bg-primary/10 text-primary",
  "Creacion": "bg-success/10 text-success",
  "CREATE": "bg-success/10 text-success",
  "CREACION": "bg-success/10 text-success",
  "Actualizacion": "bg-warning/10 text-warning",
  "UPDATE": "bg-warning/10 text-warning",
  "ACTUALIZACION": "bg-warning/10 text-warning",
  "Eliminacion": "bg-destructive/10 text-destructive",
  "DELETE": "bg-destructive/10 text-destructive",
  "ELIMINACION": "bg-destructive/10 text-destructive",
  "Consulta": "bg-muted text-muted-foreground",
  "READ": "bg-muted text-muted-foreground",
  "CONSULTA": "bg-muted text-muted-foreground",
};

export default function Bitacora() {
  const isMobile = useIsMobile();
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<AuditLogFilters>({});

  const { data: logs, isLoading } = useAuditLog(appliedFilters);
  const { data: users } = useUsers();

  const handleFilter = () => {
    setAppliedFilters({ ...filters });
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Bitacora de Actividad</h1>
        </div>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Exportar</Button>
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
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Desde</label>
                <Input
                  type="date"
                  className="w-full md:w-40"
                  value={filters.desde || ""}
                  onChange={e => setFilters(prev => ({ ...prev, desde: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Hasta</label>
                <Input
                  type="date"
                  className="w-full md:w-40"
                  value={filters.hasta || ""}
                  onChange={e => setFilters(prev => ({ ...prev, hasta: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Usuario</label>
                <Select
                  value={filters.usuarioId || "all"}
                  onValueChange={v => setFilters(prev => ({ ...prev, usuarioId: v === "all" ? undefined : v }))}
                >
                  <SelectTrigger className="w-full md:w-36"><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {users?.map(u => (
                      <SelectItem key={u.id} value={String(u.id)}>{u.usuario}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Modulo</label>
                <Select
                  value={filters.modulo || "all"}
                  onValueChange={v => setFilters(prev => ({ ...prev, modulo: v === "all" ? undefined : v }))}
                >
                  <SelectTrigger className="w-full md:w-36"><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Sistema">Sistema</SelectItem>
                    <SelectItem value="Expediente">Expediente</SelectItem>
                    <SelectItem value="Citas">Citas</SelectItem>
                    <SelectItem value="Reportes">Reportes</SelectItem>
                    <SelectItem value="Usuarios">Usuarios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Accion</label>
                <Select
                  value={filters.accion || ""}
                  onValueChange={v => setFilters(prev => ({ ...prev, accion: v === "all" ? undefined : v }))}
                >
                  <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="INICIO_SESION">Inicio de Sesion</SelectItem>
                    <SelectItem value="CREACION">Creacion</SelectItem>
                    <SelectItem value="ACTUALIZACION">Actualizacion</SelectItem>
                    <SelectItem value="ELIMINACION">Eliminacion</SelectItem>
                    <SelectItem value="CONSULTA">Consulta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="p-3 space-y-1.5">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))
              ) : logs && logs.length > 0 ? (
                logs.map((log, i) => (
                  <div key={log.id || i} className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{log.usuario}</span>
                      <Badge variant="secondary" className={`text-[10px] ${actionColor[log.accion] || ""}`}>
                        {log.accion}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{log.detalle}</p>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{log.modulo}</span>
                      <span className="font-mono">{log.fecha}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron registros
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha / Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Accion</TableHead>
                    <TableHead>Modulo</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      </TableRow>
                    ))
                  ) : logs && logs.length > 0 ? (
                    logs.map((log, i) => (
                      <TableRow key={log.id || i}>
                        <TableCell className="font-mono text-xs">{log.fecha}</TableCell>
                        <TableCell className="font-medium">{log.usuario}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={actionColor[log.accion] || ""}>
                            {log.accion}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.modulo}</TableCell>
                        <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{log.detalle}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No se encontraron registros
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="p-3 border-t text-xs text-muted-foreground">
            Mostrando {logs?.length || 0} registros
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
