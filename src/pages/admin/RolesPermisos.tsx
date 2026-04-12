import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Plus, Pencil, Trash2, Shield, ChevronDown, ChevronRight, Loader2, Save, Lock
} from "lucide-react";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useRoleFeatures,
  useAssignRoleFeatures,
} from "@/services/roles.service";
import { getFeaturesByModule, FEATURE_REGISTRY } from "@/lib/features";
import type { Role } from "@/types";

export default function RolesPermisos() {
  const isMobile = useIsMobile();
  const rolesQuery = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [roleActive, setRoleActive] = useState(true);

  const roles = (rolesQuery.data ?? []) as Role[];
  const selectedRole = roles.find(r => r.id === selectedRoleId) ?? null;

  // Auto-select first role
  useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const openCreateRole = () => {
    setEditingRole(null);
    setRoleName("");
    setRoleDesc("");
    setRoleActive(true);
    setRoleDialogOpen(true);
  };

  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.nombre);
    setRoleDesc(role.descripcion ?? "");
    setRoleActive(role.activo);
    setRoleDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (!roleName.trim()) {
      toast.error("El nombre del rol es requerido");
      return;
    }

    const payload = {
      nombre: roleName.trim(),
      descripcion: roleDesc.trim() || undefined,
      activo: roleActive,
    };

    if (editingRole) {
      updateRole.mutate({ id: editingRole.id, data: payload }, {
        onSuccess: () => {
          toast.success("Rol actualizado");
          setRoleDialogOpen(false);
        },
        onError: (err) => toast.error(err.message || "Error al actualizar"),
      });
    } else {
      createRole.mutate(payload, {
        onSuccess: (newRole) => {
          toast.success("Rol creado");
          setRoleDialogOpen(false);
          setSelectedRoleId((newRole as any).id);
        },
        onError: (err) => toast.error(err.message || "Error al crear"),
      });
    }
  };

  const handleDeleteRole = (role: Role) => {
    if (role.esAdmin) {
      toast.error("No se puede eliminar el rol de administrador");
      return;
    }
    if (!confirm(`¿Está seguro de eliminar el rol "${role.nombre}"?`)) return;
    deleteRole.mutate(role.id, {
      onSuccess: () => {
        toast.success("Rol eliminado");
        if (selectedRoleId === role.id) setSelectedRoleId(null);
      },
      onError: (err) => toast.error(err.message || "Error al eliminar"),
    });
  };

  const isSavingRole = createRole.isPending || updateRole.isPending;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Roles y Permisos</h1>
      </div>

      <div className={isMobile ? "space-y-4" : "grid grid-cols-[320px_1fr] gap-6"}>
        {/* Left Panel: Roles List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Roles</CardTitle>
              <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={openCreateRole}>
                    <Plus className="h-4 w-4 mr-1" /> Nuevo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingRole ? "Editar" : "Nuevo"} Rol</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label>Nombre</Label>
                      <Input
                        value={roleName}
                        onChange={e => setRoleName(e.target.value)}
                        placeholder="Ej: Recepcionista"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Descripción</Label>
                      <Textarea
                        value={roleDesc}
                        onChange={e => setRoleDesc(e.target.value)}
                        placeholder="Descripción opcional del rol"
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={roleActive} onCheckedChange={setRoleActive} />
                      <Label>Activo</Label>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button onClick={handleSaveRole} disabled={isSavingRole}>
                        {isSavingRole && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                        Guardar
                      </Button>
                      <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancelar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {rolesQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : roles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No hay roles creados</p>
            ) : (
              <div className="space-y-1">
                {roles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                      selectedRoleId === role.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-muted"
                    }`}
                  >
                    {role.esAdmin ? (
                      <Lock className="h-4 w-4 shrink-0 text-amber-500" />
                    ) : (
                      <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{role.nombre}</p>
                      {role.descripcion && (
                        <p className="text-xs text-muted-foreground truncate">{role.descripcion}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!role.activo && <Badge variant="secondary" className="text-[10px]">Inactivo</Badge>}
                      {!role.esAdmin && (
                        <>
                          <Button
                            size="icon" variant="ghost" className="h-7 w-7"
                            onClick={e => { e.stopPropagation(); openEditRole(role); }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                            onClick={e => { e.stopPropagation(); handleDeleteRole(role); }}
                            disabled={deleteRole.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel: Feature Assignments */}
        {selectedRole ? (
          <FeatureAssignmentPanel role={selectedRole} />
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-20 text-muted-foreground">
              <p>Seleccione un rol para gestionar sus permisos</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// --- Feature Assignment Panel ---

function FeatureAssignmentPanel({ role }: { role: Role }) {
  const featuresQuery = useRoleFeatures(role.id);
  const assignFeatures = useAssignRoleFeatures();
  const [localFeatures, setLocalFeatures] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isDirty, setIsDirty] = useState(false);

  const featuresByModule = getFeaturesByModule();

  // Sync from server
  useEffect(() => {
    if (featuresQuery.data) {
      setLocalFeatures(new Set(featuresQuery.data));
      setIsDirty(false);
    }
  }, [featuresQuery.data]);

  // Expand all modules by default
  useEffect(() => {
    setExpandedModules(new Set(Object.keys(featuresByModule)));
  }, []);

  const toggleFeature = (key: string) => {
    setLocalFeatures(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setIsDirty(true);
  };

  const toggleModule = (module: string) => {
    const moduleFeatures = featuresByModule[module];
    const allSelected = moduleFeatures.every(f => localFeatures.has(f.key));
    setLocalFeatures(prev => {
      const next = new Set(prev);
      moduleFeatures.forEach(f => {
        if (allSelected) next.delete(f.key);
        else next.add(f.key);
      });
      return next;
    });
    setIsDirty(true);
  };

  const toggleExpandModule = (module: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(module)) next.delete(module);
      else next.add(module);
      return next;
    });
  };

  const handleSave = () => {
    assignFeatures.mutate(
      { rolId: role.id, featureKeys: Array.from(localFeatures) },
      {
        onSuccess: () => {
          toast.success("Permisos actualizados");
          setIsDirty(false);
        },
        onError: (err) => toast.error(err.message || "Error al guardar permisos"),
      }
    );
  };

  const totalFeatures = FEATURE_REGISTRY.length;
  const selectedCount = localFeatures.size;

  if (role.esAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-amber-500" />
            {role.nombre}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <Lock className="h-12 w-12 text-amber-500/40" />
            <p className="text-muted-foreground">
              El rol de Administrador tiene acceso completo a todas las funcionalidades del sistema.
            </p>
            <p className="text-xs text-muted-foreground">
              Este rol no puede ser modificado ni eliminado. Además, es el único que puede gestionar usuarios, roles y permisos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              Permisos de: <span className="text-primary">{role.nombre}</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedCount} de {totalFeatures} funcionalidades habilitadas
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || assignFeatures.isPending}
          >
            {assignFeatures.isPending ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Guardar Cambios
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {featuresQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(featuresByModule).map(([module, features]) => {
              const isExpanded = expandedModules.has(module);
              const moduleSelected = features.filter(f => localFeatures.has(f.key)).length;
              const allSelected = moduleSelected === features.length;
              const someSelected = moduleSelected > 0 && !allSelected;

              return (
                <div key={module} className="border rounded-lg overflow-hidden">
                  {/* Module Header */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                    <button
                      onClick={() => toggleExpandModule(module)}
                      className="shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <Checkbox
                      checked={allSelected}
                      // @ts-ignore indeterminate is valid
                      data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                      onCheckedChange={() => toggleModule(module)}
                      className={someSelected ? "opacity-70" : ""}
                    />
                    <button
                      onClick={() => toggleExpandModule(module)}
                      className="flex-1 text-left"
                    >
                      <span className="text-sm font-medium">{module}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({moduleSelected}/{features.length})
                      </span>
                    </button>
                  </div>

                  {/* Features */}
                  {isExpanded && (
                    <div className="divide-y">
                      {features.map(feature => (
                        <label
                          key={feature.key}
                          className="flex items-start gap-3 px-4 py-3 pl-12 hover:bg-muted/20 transition-colors cursor-pointer"
                        >
                          <Checkbox
                            checked={localFeatures.has(feature.key)}
                            onCheckedChange={() => toggleFeature(feature.key)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{feature.name}</p>
                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
