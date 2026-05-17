import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/ui/form-section";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpedientesPaginator } from "@/components/ExpedientesPaginator";
import { CreateContratoDialog } from "@/pages/mantenimientos/CreateContratoDialog";
import { ContratoDetailView } from "@/pages/mantenimientos/ContratoDetailView";
import { usePermissions } from "@/contexts/PermissionContext";
import { useContratos, useDeleteContrato } from "@/services/contratos.service";
import type { EstadoContrato } from "@/types/contrato";
import { ESTADO_CONTRATO_VARIANT } from "@/types/contrato";
import { FileSignature, Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formatters";

// ─── Helpers ───────────────────────────────────────────────────────────────

const formatDate = (d: string) => new Date(d).toLocaleDateString("es-CR");

// ─── Root ──────────────────────────────────────────────────────────────────

export default function ContratosPage() {
  const { id } = useParams<{ id?: string }>();
  return id ? <ContratoDetailView id={id} /> : <ContratoListView />;
}

// ─── List View ─────────────────────────────────────────────────────────────

function ContratoListView() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<EstadoContrato | "">("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearch = (v: string) => {
    setQInput(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQ(v);
      setPage(1);
    }, 300);
  };

  const { data, isLoading } = useContratos({
    q: q || undefined,
    estado: estadoFilter || undefined,
    page,
    limit,
  });

  const deleteContrato = useDeleteContrato();

  const contratos = data?.data ?? [];
  const meta = data?.meta;

  const handleDelete = (id: string) => {
    deleteContrato.mutate(id, {
      onSuccess: () => {
        toast.success("Contrato eliminado");
        setDeleteId(null);
      },
      onError: (err: Error) => toast.error(err.message || "Error al eliminar"),
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <PageHeader
        icon={FileSignature}
        eyebrow="Mantenimientos"
        title="Contratos"
        description="Gestione los contratos de tratamiento de los pacientes"
        actions={
          hasPermission("contratos.crear") ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Nuevo Contrato
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por N° contrato o paciente..."
                value={qInput}
                onChange={e => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={estadoFilter || "all"}
              onValueChange={v => { setEstadoFilter(v === "all" ? "" : v as EstadoContrato); setPage(1); }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {(Object.entries(ESTADO_CONTRATO_VARIANT) as [EstadoContrato, { label: string; cls: string }][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Contrato</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Dentista</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Pagado</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : contratos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No se encontraron contratos
                    </TableCell>
                  </TableRow>
                ) : (
                  contratos.map(c => {
                    const v = ESTADO_CONTRATO_VARIANT[c.estado];
                    return (
                      <TableRow
                        key={c.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/mantenimientos/contratos/${c.id}`)}
                      >
                        <TableCell className="font-mono font-medium">{c.numero}</TableCell>
                        <TableCell>{c.paciente.nombre} {c.paciente.apellido1}</TableCell>
                        <TableCell>{c.dentista.nombre}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(c.fecha)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(c.montoTotal, c.moneda)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(c.montoPagado, c.moneda)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(c.saldo, c.moneda)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={v.cls}>{v.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => navigate(`/mantenimientos/contratos/${c.id}`)}>
                              <FileSignature className="h-4 w-4" />
                            </Button>
                            {c.estado === "BORRADOR" && hasPermission("contratos.eliminar") && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => setDeleteId(c.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-3 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              ))
            ) : contratos.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No se encontraron contratos</div>
            ) : (
              contratos.map(c => {
                const v = ESTADO_CONTRATO_VARIANT[c.estado];
                return (
                  <div key={c.id} className="py-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-medium text-sm">{c.numero}</span>
                      <Badge variant="outline" className={v.cls}>{v.label}</Badge>
                    </div>
                    <p className="text-sm">{c.paciente.nombre} {c.paciente.apellido1}</p>
                    <p className="text-xs text-muted-foreground">
                      Saldo: {formatCurrency(c.saldo, c.moneda)}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/mantenimientos/contratos/${c.id}`)}>
                      Ver
                    </Button>
                  </div>
                );
              })
            )}
          </div>

          {meta && meta.totalPages > 0 && (
            <ExpedientesPaginator
              page={page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={v => { setLimit(v); setPage(1); }}
            />
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <CreateContratoDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={id => navigate(`/mantenimientos/contratos/${id}`)}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar contrato</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el contrato. Solo los contratos en estado Borrador pueden eliminarse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
