import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, FolderOpen, Building2, Users, UserCog,
  FileText, BarChart3, Shield, Activity, Settings, LogOut, ChevronDown,
  Stethoscope, ListChecks, ClipboardList, Menu, X, KeyRound
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";

type NavItem = {
  label: string;
  icon: React.ElementType;
  href?: string;
  permission?: string; // feature key required
  adminOnly?: boolean;
  children?: { label: string; href: string; permission?: string; adminOnly?: boolean }[];
};

const navigation: NavItem[] = [
  { label: "Inicio", icon: LayoutDashboard, href: "/dashboard", permission: "dashboard" },
  { label: "Portal Médico", icon: Stethoscope, href: "/doctor/dashboard", permission: "doctor.dashboard" },
  { label: "Citas", icon: CalendarDays, href: "/citas", permission: "citas" },
  {
    label: "Expediente", icon: FolderOpen, children: [
      { label: "Buscar Expediente", href: "/expediente/buscar", permission: "expediente.buscar" },
      { label: "Nuevo Expediente", href: "/expediente/nuevo", permission: "expediente.crear" },
    ]
  },
  {
    label: "Mantenimientos", icon: Settings, children: [
      { label: "Clínicas", href: "/mantenimientos/clinicas", permission: "mantenimientos.clinicas" },
      { label: "Usuarios", href: "/mantenimientos/usuarios", adminOnly: true },
      { label: "Tipos de Cita", href: "/mantenimientos/tipos-cita", permission: "mantenimientos.tipos_cita" },
      { label: "Tratamientos", href: "/mantenimientos/tratamientos", permission: "mantenimientos.tratamientos" },
    ]
  },
  {
    label: "Reportes", icon: BarChart3, children: [
      { label: "Citas", href: "/reportes/citas", permission: "reportes.citas" },
      { label: "Pacientes", href: "/reportes/pacientes", permission: "reportes.pacientes" },
      { label: "Clínicas", href: "/reportes/clinicas", permission: "reportes.clinicas" },
      { label: "Tratamientos", href: "/reportes/tratamientos", permission: "reportes.tratamientos" },
      { label: "Usuarios", href: "/reportes/usuarios", permission: "reportes.usuarios" },
    ]
  },
  {
    label: "Administración", icon: Shield, children: [
      { label: "Bitácora", href: "/admin/bitacora", permission: "admin.bitacora" },
      { label: "Configuración", href: "/admin/configuracion", permission: "admin.configuracion" },
      { label: "Roles y Permisos", href: "/admin/roles", adminOnly: true },
    ]
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { hasPermission, isAdmin } = usePermissions();
  const [openMenus, setOpenMenus] = useState<string[]>(["Expediente"]);

  const toggleMenu = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
    );
  };

  const isActive = (href?: string) => href && location.pathname === href;
  const isChildActive = (item: NavItem) =>
    item.children?.some(c => location.pathname.startsWith(c.href));

  const canAccess = (item: { permission?: string; adminOnly?: boolean }) => {
    if (item.adminOnly) return isAdmin;
    if (item.permission) return hasPermission(item.permission);
    return true;
  };

  // Filter nav items based on permissions
  const visibleNavigation = navigation
    .map(item => {
      if (item.children) {
        const visibleChildren = item.children.filter(canAccess);
        if (visibleChildren.length === 0) return null;
        return { ...item, children: visibleChildren };
      }
      if (!canAccess(item)) return null;
      return item;
    })
    .filter(Boolean) as NavItem[];

  return (
    <>
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {visibleNavigation.map(item => (
          <div key={item.label}>
            {item.href ? (
              <Link
                to={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive(item.href)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            ) : (
              <>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full transition-colors",
                    isChildActive(item)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform", openMenus.includes(item.label) && "rotate-180")} />
                </button>
                {openMenus.includes(item.label) && item.children && (
                  <div className="ml-6 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        to={child.href}
                        onClick={onNavigate}
                        className={cn(
                          "block px-2 py-1.5 rounded text-xs transition-colors",
                          location.pathname === child.href
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "hover:bg-sidebar-accent text-sidebar-foreground/80"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
            <UserCog className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.nombre ?? "Usuario"}</p>
            <p className="text-[10px] text-sidebar-foreground/60">{user?.rol ?? ""}</p>
          </div>
          <ThemeToggle />
          <button onClick={() => logout()} className="p-1 hover:bg-sidebar-accent rounded">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export default function AppSidebar() {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { hasPermission, isAdmin } = usePermissions();

  // For collapsed mode, filter navigation items too
  const canAccess = (item: { permission?: string; adminOnly?: boolean }) => {
    if (item.adminOnly) return isAdmin;
    if (item.permission) return hasPermission(item.permission);
    return true;
  };

  const visibleNavigation = navigation
    .map(item => {
      if (item.children) {
        const visibleChildren = item.children.filter(canAccess);
        if (visibleChildren.length === 0) return null;
        return { ...item, children: visibleChildren };
      }
      if (!canAccess(item)) return null;
      return item;
    })
    .filter(Boolean) as NavItem[];

  if (isMobile) {
    return (
      <>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-3 left-3 z-40 bg-background/80 backdrop-blur-sm shadow-md border"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground border-sidebar-border">
            <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
              <Stethoscope className="h-7 w-7 text-sidebar-primary" />
              <div>
                <h1 className="text-base font-bold text-sidebar-primary-foreground tracking-wide">SCM</h1>
                <p className="text-[10px] text-sidebar-foreground/60">Sistema Clínico Médico</p>
              </div>
            </div>
            <div className="flex flex-col h-[calc(100%-65px)]">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <aside className={cn(
      "flex flex-col bg-sidebar text-sidebar-foreground h-screen sticky top-0 transition-all duration-200 z-30",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-sidebar-primary" />
            <div>
              <h1 className="text-base font-bold text-sidebar-primary-foreground tracking-wide">SCM</h1>
              <p className="text-[10px] text-sidebar-foreground/60">Sistema Clínico Médico</p>
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-sidebar-accent">
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      {collapsed ? (
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {visibleNavigation.map(item => (
            <div key={item.label}>
              {item.href ? (
                <Link to={item.href} className="flex items-center justify-center p-2 rounded-md hover:bg-sidebar-accent">
                  <item.icon className="h-4 w-4" />
                </Link>
              ) : (
                <button onClick={() => { }} className="flex items-center justify-center p-2 rounded-md hover:bg-sidebar-accent w-full">
                  <item.icon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </nav>
      ) : (
        <SidebarContent />
      )}
    </aside>
  );
}
