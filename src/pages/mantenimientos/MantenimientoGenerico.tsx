import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, Loader2, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { UserPhotoUpload } from "@/components/UserPhotoUpload";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useClinics, useCreateClinic, useUpdateClinic, useDeleteClinic, useActiveClinics } from "@/services/clinics.service";

import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/services/users.service";
import { useAppointmentTypes, useCreateAppointmentType, useUpdateAppointmentType, useDeleteAppointmentType } from "@/services/appointment-types.service";
import { useTreatments, useCreateTreatment, useUpdateTreatment, useDeleteTreatment } from "@/services/treatments.service";

type ColumnDef = { key: string; label: string };
type FormFieldDef = {
  key: string;
  label: string;
  type?: string;
  options?: { value: string; label: string }[];
};

export default function MantenimientoGenerico({ tipo }: { tipo: string }) {
  // Always call all hooks unconditionally
  const clinicsQuery = useClinics();
  
  const usersQuery = useUsers();
  const appointmentTypesQuery = useAppointmentTypes();
  const treatmentsQuery = useTreatments();
  const activeClinicsQuery = useActiveClinics();

  const createClinic = useCreateClinic();
  const updateClinic = useUpdateClinic();
  const deleteClinic = useDeleteClinic();


  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const createAppointmentType = useCreateAppointmentType();
  const updateAppointmentType = useUpdateAppointmentType();
  const deleteAppointmentType = useDeleteAppointmentType();

  const createTreatment = useCreateTreatment();
  const updateTreatment = useUpdateTreatment();
  const deleteTreatment = useDeleteTreatment();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [active, setActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    setSearch("");
    setEditingItem(null);
    setFormData({});
  }, [tipo]);

  const clinicOptions = useMemo(() =>
    (activeClinicsQuery.data || []).map(c => ({ value: String(c.id), label: c.nombre })),
    [activeClinicsQuery.data]
  );

  // Resolve the active config based on tipo
  const config = useMemo(() => {
    const configs: Record<string, {
      title: string;
      columns: ColumnDef[];
      formFields: FormFieldDef[];
      mapToRow: (item: any) => Record<string, string>;
    }> = {
      clinicas: {
        title: "Clinicas",
        columns: [
          { key: "nombre", label: "Nombre" },
          { key: "direccion", label: "Direccion" },
          { key: "telefono", label: "Telefono" },
          { key: "estado", label: "Estado" },
        ],
        formFields: [
          { key: "nombre", label: "Nombre" },
          { key: "direccion", label: "Direccion" },
          { key: "telefono", label: "Telefono" },
          { key: "email", label: "Email", type: "email" },
        ],
        mapToRow: (item) => ({
          nombre: item.nombre || "",
          direccion: item.direccion || "",
          telefono: item.telefono || "",
          estado: item.activo ? "Activa" : "Inactiva",
        }),
      },
      usuarios: {
        title: "Usuarios",
        columns: [
          { key: "usuario", label: "Usuario" },
          { key: "nombre", label: "Nombre" },
          { key: "rol", label: "Rol" },
          { key: "estado", label: "Estado" },
        ],
        formFields: [
          { key: "usuario", label: "Usuario" },
          { key: "nombre", label: "Nombre completo" },
          { key: "rol", label: "Rol", type: "select", options: [
            { value: "ADMINISTRADOR", label: "Administrador" },
            { value: "MEDICO", label: "Medico" },
            { value: "RECEPCION", label: "Recepcion" },
            { value: "ENFERMERIA", label: "Enfermeria" },
          ]},
          { key: "password", label: "Contrasena", type: "password" },
        ],
        mapToRow: (item) => ({
          usuario: item.usuario || "",
          nombre: item.nombre || "",
          rol: item.rol || "",
          estado: (item.activo ?? item.estado) ? "Activo" : "Inactivo",
        }),
      },
      "tipos-cita": {
        title: "Tipos de Cita",
        columns: [
          { key: "nombre", label: "Nombre" },
          { key: "duracion", label: "Duracion (min)" },
          { key: "estado", label: "Estado" },
        ],
        formFields: [
          { key: "nombre", label: "Nombre" },
          { key: "duracion", label: "Duracion (minutos)", type: "number" },
        ],
        mapToRow: (item) => ({
          nombre: item.nombre || "",
          duracion: String(item.duracion || ""),
          estado: item.activo ? "Activo" : "Inactivo",
        }),
      },
      tratamientos: {
        title: "Tratamientos",
        columns: [
          { key: "codigo", label: "Codigo" },
          { key: "nombre", label: "Nombre" },
          { key: "categoria", label: "Categoria" },
          { key: "precio", label: "Precio" },
        ],
        formFields: [
          { key: "codigo", label: "Codigo" },
          { key: "nombre", label: "Nombre" },
          { key: "categoria", label: "Categoria", type: "select", options: [
            { value: "PREVENTIVO", label: "Preventivo" },
            { value: "CIRUGIA", label: "Cirugia" },
            { value: "RESTAURACION", label: "Restauracion" },
            { value: "ORTODONCIA", label: "Ortodoncia" },
          ]},
          { key: "precio", label: "Precio", type: "number" },
        ],
        mapToRow: (item) => ({
          codigo: item.codigo || "",
          nombre: item.nombre || "",
          categoria: item.categoria || "",
          precio: item.precio != null ? `${item.precio.toLocaleString()}` : "",
        }),
      },
    };
    return configs[tipo] || null;
  }, [tipo, clinicOptions]);

  // Resolve data/mutations based on tipo
  const dataQuery = tipo === "clinicas" ? clinicsQuery
    
    : tipo === "usuarios" ? usersQuery
    : tipo === "tipos-cita" ? appointmentTypesQuery
    : tipo === "tratamientos" ? treatmentsQuery
    : { data: undefined, isLoading: false };

  const getCreateMutation = () => {
    if (tipo === "clinicas") return createClinic;
    
    if (tipo === "usuarios") return createUser;
    if (tipo === "tipos-cita") return createAppointmentType;
    if (tipo === "tratamientos") return createTreatment;
    return null;
  };

  const getUpdateMutation = () => {
    if (tipo === "clinicas") return updateClinic;
    
    if (tipo === "usuarios") return updateUser;
    if (tipo === "tipos-cita") return updateAppointmentType;
    if (tipo === "tratamientos") return updateTreatment;
    return null;
  };

  const getDeleteMutation = () => {
    if (tipo === "clinicas") return deleteClinic;
    
    if (tipo === "usuarios") return deleteUser;
    if (tipo === "tipos-cita") return deleteAppointmentType;
    if (tipo === "tratamientos") return deleteTreatment;
    return null;
  };

  const cMutation = getCreateMutation();
  const uMutation = getUpdateMutation();
  const dMutation = getDeleteMutation();

  if (!config) return <div className="p-6">Mantenimiento no encontrado</div>;

  const items = (dataQuery.data as any[]) || [];
  const filtered = items.filter((item: any) => {
    const row = config.mapToRow(item);
    return Object.values(row).some(v =>
      String(v).toLowerCase().includes(search.toLowerCase())
    );
  });

  const openCreate = () => {
    setEditingItem(null);
    setFormData({});
    setActive(true);
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    const fd: Record<string, any> = {};
    config.formFields.forEach(f => {
      fd[f.key] = item[f.key] != null ? String(item[f.key]) : "";
    });
    setActive(item.activo !== false && item.estado !== false);
    setFormData(fd);
    setDialogOpen(true);
  };

  const handleSave = () => {
    const activeKey = tipo === "usuarios" || tipo === "tipos-cita" ? "estado" : "activo";
    const payload: Record<string, any> = { ...formData, [activeKey]: active };
    config.formFields.forEach(f => {
      if (f.type === "number" && payload[f.key]) {
        payload[f.key] = Number(payload[f.key]);
      }
      // Convert select fields that represent IDs (ending in "Id") to numbers
      if (f.type === "select" && f.key.endsWith("Id") && payload[f.key]) {
        payload[f.key] = Number(payload[f.key]);
      }
    });

    // Remove empty string values for optional fields when editing
    if (editingItem) {
      Object.keys(payload).forEach(key => {
        if (payload[key] === "" && key !== "activo") {
          delete payload[key];
        }
      });
    }

    if (editingItem) {
      uMutation?.mutate(
        { id: editingItem.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Registro actualizado");
            setDialogOpen(false);
          },
          onError: (err: Error) => toast.error(err.message || "Error al actualizar"),
        }
      );
    } else {
      cMutation?.mutate(payload as any, {
        onSuccess: () => {
          toast.success("Registro creado");
          setDialogOpen(false);
        },
        onError: (err: Error) => toast.error(err.message || "Error al crear"),
      });
    }
  };

  const handleDeleteItem = (item: any) => {
    if (!confirm("Esta seguro de eliminar este registro?")) return;
    dMutation?.mutate(item.id, {
      onSuccess: () => toast.success("Registro eliminado"),
      onError: (err: Error) => toast.error(err.message || "Error al eliminar"),
    });
  };

  const isSaving = cMutation?.isPending || uMutation?.isPending;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">{config.title}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size={isMobile ? "sm" : "default"} onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Nuevo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Editar" : "Nuevo"} registro - {config.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* User photo upload - only when editing an existing user */}
              {tipo === "usuarios" && editingItem && (
                <div className="flex justify-center pb-2">
                  <UserPhotoUpload userId={editingItem.id} hasPhoto={!!editingItem.fotografia} />
                </div>
              )}
              {config.formFields.map(f => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-sm">{f.label}</Label>
                  {f.type === "select" ? (
                    <Select
                      value={formData[f.key] || ""}
                      onValueChange={v => setFormData(prev => ({ ...prev, [f.key]: v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                      <SelectContent>
                        {f.options?.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : f.type === "password" ? (
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={formData[f.key] || ""}
                        onChange={e => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  ) : (
                    <Input
                      type={f.type || "text"}
                      value={formData[f.key] || ""}
                      onChange={e => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Switch id="active" checked={active} onCheckedChange={setActive} />
                <Label htmlFor="active">Activo</Label>
              </div>
              <div className="flex gap-3 justify-end">
                <Button onClick={handleSave} disabled={!!isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {isMobile ? (
            <div className="divide-y -mx-4">
              {dataQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((item: any) => {
                  const row = config.mapToRow(item);
                  return (
                    <div key={item.id} className="px-4 py-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-foreground">{row[config.columns[0].key]}</span>
                        <div className="flex gap-1">
                          <Button
                            size="icon" variant="ghost" className="h-7 w-7"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                            onClick={() => handleDeleteItem(item)}
                            disabled={dMutation?.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {config.columns.slice(1).map(c => (
                        <div key={c.key} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{c.label}</span>
                          <span>{row[c.key]}</span>
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  No se encontraron registros
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {config.columns.map(c => <TableHead key={c.key}>{c.label}</TableHead>)}
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataQuery.isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {config.columns.map(c => (
                        <TableCell key={c.key}><Skeleton className="h-4 w-24" /></TableCell>
                      ))}
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : filtered.length > 0 ? (
                  filtered.map((item: any) => {
                    const row = config.mapToRow(item);
                    return (
                      <TableRow key={item.id}>
                        {config.columns.map(c => (
                          <TableCell key={c.key}>{row[c.key]}</TableCell>
                        ))}
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="icon" variant="ghost" className="h-7 w-7"
                              onClick={() => openEdit(item)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                              onClick={() => handleDeleteItem(item)}
                              disabled={dMutation?.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={config.columns.length + 1} className="text-center py-8 text-muted-foreground">
                      No se encontraron registros
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
