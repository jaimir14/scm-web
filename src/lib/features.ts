/**
 * Central feature registry.
 * Each entry maps a unique feature key to its display metadata.
 * To add a new feature to the permissions system, just add a new entry here.
 */
export interface FeatureDefinition {
  key: string;
  name: string;
  description: string;
  module: string;
  route?: string; // primary route associated with this feature
}

export const FEATURE_REGISTRY: FeatureDefinition[] = [
  // --- Dashboard ---
  { key: "dashboard", name: "Dashboard Principal", description: "Panel de inicio con estadísticas generales", module: "General", route: "/dashboard" },

  // --- Citas ---
  { key: "citas", name: "Agenda de Citas", description: "Ver y gestionar la agenda de citas", module: "Citas", route: "/citas" },

  // --- Expediente ---
  { key: "expediente.buscar", name: "Buscar Expediente", description: "Buscar expedientes de pacientes", module: "Expediente", route: "/expediente/buscar" },
  { key: "expediente.crear", name: "Crear Expediente", description: "Crear nuevos expedientes de pacientes", module: "Expediente", route: "/expediente/nuevo" },

  // --- Mantenimientos ---
  { key: "mantenimientos.clinicas", name: "Mantenimiento Clínicas", description: "Gestionar catálogo de clínicas", module: "Mantenimientos", route: "/mantenimientos/clinicas" },
  { key: "mantenimientos.tipos_cita", name: "Mantenimiento Tipos de Cita", description: "Gestionar tipos de cita", module: "Mantenimientos", route: "/mantenimientos/tipos-cita" },
  { key: "mantenimientos.tratamientos", name: "Mantenimiento Tratamientos", description: "Gestionar catálogo de tratamientos", module: "Mantenimientos", route: "/mantenimientos/tratamientos" },

  // --- Reportes ---
  { key: "reportes.citas", name: "Reporte de Citas", description: "Generar reportes de citas", module: "Reportes", route: "/reportes/citas" },
  { key: "reportes.pacientes", name: "Reporte de Pacientes", description: "Generar reportes de pacientes", module: "Reportes", route: "/reportes/pacientes" },
  { key: "reportes.clinicas", name: "Reporte de Clínicas", description: "Generar reportes de clínicas", module: "Reportes", route: "/reportes/clinicas" },
  { key: "reportes.tratamientos", name: "Reporte de Tratamientos", description: "Generar reportes de tratamientos", module: "Reportes", route: "/reportes/tratamientos" },
  { key: "reportes.usuarios", name: "Reporte de Usuarios", description: "Generar reportes de usuarios", module: "Reportes", route: "/reportes/usuarios" },

  // --- Administración ---
  { key: "admin.bitacora", name: "Bitácora", description: "Ver registro de actividades del sistema", module: "Administración", route: "/admin/bitacora" },
  { key: "admin.configuracion", name: "Configuración", description: "Configuración general del sistema", module: "Administración", route: "/admin/configuracion" },

  // --- Portal Médico ---
  { key: "doctor.dashboard", name: "Dashboard Médico", description: "Panel de inicio del médico", module: "Portal Médico", route: "/doctor/dashboard" },
  { key: "doctor.agenda", name: "Agenda Médica", description: "Agenda personal del médico", module: "Portal Médico", route: "/doctor/agenda" },
  { key: "doctor.pacientes", name: "Pacientes del Médico", description: "Listado de pacientes del médico", module: "Portal Médico", route: "/doctor/pacientes" },
];

/**
 * Get all unique modules from the registry.
 */
export function getFeatureModules(): string[] {
  return [...new Set(FEATURE_REGISTRY.map(f => f.module))];
}

/**
 * Get features grouped by module.
 */
export function getFeaturesByModule(): Record<string, FeatureDefinition[]> {
  return FEATURE_REGISTRY.reduce((acc, f) => {
    if (!acc[f.module]) acc[f.module] = [];
    acc[f.module].push(f);
    return acc;
  }, {} as Record<string, FeatureDefinition[]>);
}

/**
 * Find a feature definition by key.
 */
export function getFeatureByKey(key: string): FeatureDefinition | undefined {
  return FEATURE_REGISTRY.find(f => f.key === key);
}

/**
 * Find a feature definition by route.
 */
export function getFeatureByRoute(route: string): FeatureDefinition | undefined {
  return FEATURE_REGISTRY.find(f => f.route === route);
}
