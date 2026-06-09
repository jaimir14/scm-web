import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, FolderOpen, Building2, Users, UserCog,
  FileText, BarChart3, Shield, Activity, Settings, LogOut, ChevronDown,
  Stethoscope, ListChecks, ClipboardList, Menu, X, KeyRound, Wallet, FileSignature
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
  permission?: string;
  adminOnly?: boolean;
  doctorOnly?: boolean;
  children?: { label: string; href: string; permission?: string; adminOnly?: boolean; doctorOnly?: boolean }[];
};

const navigation: NavItem[] = [
  { label: "Inicio", icon: LayoutDashboard, href: "/dashboard", permission: "dashboard" },
  { label: "Portal Médico", icon: Stethoscope, href: "/doctor/dashboard", permission: "doctor.dashboard", doctorOnly: true },
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
      { label: "Contratos", href: "/mantenimientos/contratos", permission: "contratos.ver" },
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

  const canAccess = (item: { permission?: string; adminOnly?: boolean; doctorOnly?: boolean }) => {
    if (item.doctorOnly && user?.rol !== "Médico") return false;
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

  return (
    <>
      <nav className="relative flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {visibleNavigation.map(item => (
          <div key={item.label}>
            {item.href ? (
              <Link
                to={item.href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all",
                  isActive(item.href)
                    ? "bg-white text-[hsl(var(--primary-dark))] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)]"
                    : "text-white/75 hover:bg-white/[0.08] hover:text-white"
                )}
              >
                {isActive(item.href) && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[hsl(var(--coral))]" />
                )}
                <span className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                  isActive(item.href)
                    ? "bg-[hsl(var(--primary-soft))] text-[hsl(var(--primary))]"
                    : "bg-white/[0.06] text-white/80 group-hover:bg-[hsl(var(--primary-glow)/0.18)] group-hover:text-[hsl(var(--primary-glow))]"
                )}>
                  <item.icon className="h-[15px] w-[15px]" />
                </span>
                <span className="tracking-tight">{item.label}</span>
                {isActive(item.href) && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[hsl(var(--coral))] shadow-[0_0_8px_hsl(var(--coral)/0.6)]" />
                )}
              </Link>
            ) : (
              <>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium w-full transition-all",
                    isChildActive(item)
                      ? "bg-white/[0.09] text-white"
                      : "text-white/75 hover:bg-white/[0.08] hover:text-white"
                  )}
                >
                  <span className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                    isChildActive(item)
                      ? "bg-[hsl(var(--primary-glow)/0.2)] text-[hsl(var(--primary-glow))]"
                      : "bg-white/[0.06] text-white/80 group-hover:bg-[hsl(var(--primary-glow)/0.18)] group-hover:text-[hsl(var(--primary-glow))]"
                  )}>
                    <item.icon className="h-[15px] w-[15px]" />
                  </span>
                  <span className="flex-1 text-left tracking-tight">{item.label}</span>
                  <ChevronDown className={cn("h-3.5 w-3.5 opacity-50 transition-transform", openMenus.includes(item.label) && "rotate-180 opacity-80")} />
                </button>
                {openMenus.includes(item.label) && item.children && (
                  <div className="ml-[22px] mt-1 mb-1 space-y-0.5 border-l border-white/10 pl-3">
                    {item.children.map(child => {
                      const active = location.pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={onNavigate}
                          className={cn(
                            "relative block px-3 py-1.5 rounded-lg text-[12.5px] transition-all",
                            active
                              ? "bg-white text-[hsl(var(--primary-dark))] font-medium shadow-sm"
                              : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                          )}
                        >
                          {active && (
                            <span className="absolute -left-[14px] top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-[hsl(var(--coral))]" />
                          )}
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>


      <div className="relative p-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[hsl(var(--coral))] to-[hsl(var(--primary-glow))] flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/20">
            <UserCog className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-white">{user?.nombre ?? "Usuario"}</p>
            <p className="text-[10px] text-white/60 truncate">{user?.rol ?? ""}</p>
          </div>
          <ThemeToggle />
          <button onClick={() => logout()} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-[hsl(var(--coral))]" title="Cerrar sesión">
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
  const { user } = useAuth();

  const canAccess = (item: { permission?: string; adminOnly?: boolean; doctorOnly?: boolean }) => {
    if (item.doctorOnly && user?.rol !== "Médico") return false;
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
          <SheetContent side="left" className="w-64 p-0 bg-gradient-sidebar text-white border-r-0">
            <div className="flex items-center gap-2.5 p-4 border-b border-white/10">
              <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-md">
                <Stethoscope className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-wide">SCM</h1>
                <p className="text-[10px] text-white/60">Sistema Clínico Médico</p>
              </div>
            </div>
            <div className="flex flex-col h-[calc(100%-73px)]">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <aside className={cn(
      "flex flex-col bg-gradient-sidebar text-white h-screen sticky top-0 transition-all duration-200 z-30 border-r-0 relative overflow-hidden",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full bg-[hsl(var(--primary-glow)/0.15)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 -right-20 h-64 w-64 rounded-full bg-[hsl(var(--coral)/0.12)] blur-3xl" />
      <div className="relative flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-md">
              <Stethoscope className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide">SCM</h1>
              <p className="text-[10px] text-white/60">Sistema Clínico Médico</p>
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors">
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      {collapsed ? (
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {visibleNavigation.map(item => (
            <div key={item.label}>
              {item.href ? (
                <Link to={item.href} className="flex items-center justify-center p-2 rounded-md hover:bg-white/10">
                  <item.icon className="h-4 w-4 text-white/85" />
                </Link>
              ) : (
                <button onClick={() => { }} className="flex items-center justify-center p-2 rounded-md hover:bg-white/10 w-full">
                  <item.icon className="h-4 w-4 text-white/85" />
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
