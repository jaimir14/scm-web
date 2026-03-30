import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, FolderOpen, UserCog,
  BarChart3, Shield, Settings, LogOut, ChevronDown,
  Stethoscope, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

type NavItem = {
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: { label: string; href: string }[];
};

const navigation: NavItem[] = [
  { label: "Inicio", icon: LayoutDashboard, href: "/" },
  { label: "Citas", icon: CalendarDays, href: "/citas" },
  {
    label: "Expediente", icon: FolderOpen, children: [
      { label: "Buscar Expediente", href: "/expediente/buscar" },
      { label: "Nuevo Expediente", href: "/expediente/nuevo" },
    ]
  },
  {
    label: "Mantenimientos", icon: Settings, children: [
      { label: "Clinicas", href: "/mantenimientos/clinicas" },
      { label: "Profesionales", href: "/mantenimientos/profesionales" },
      { label: "Usuarios", href: "/mantenimientos/usuarios" },
      { label: "Tipos de Cita", href: "/mantenimientos/tipos-cita" },
      { label: "Tratamientos", href: "/mantenimientos/tratamientos" },
    ]
  },
  {
    label: "Reportes", icon: BarChart3, children: [
      { label: "Citas", href: "/reportes/citas" },
      { label: "Pacientes", href: "/reportes/pacientes" },
      { label: "Clinicas", href: "/reportes/clinicas" },
      { label: "Tratamientos", href: "/reportes/tratamientos" },
      { label: "Usuarios", href: "/reportes/usuarios" },
    ]
  },
  {
    label: "Administracion", icon: Shield, children: [
      { label: "Bitacora", href: "/admin/bitacora" },
      { label: "Configuracion", href: "/admin/configuracion" },
    ]
  },
];

export default function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [openMenus, setOpenMenus] = useState<string[]>(["Expediente"]);
  const [collapsed, setCollapsed] = useState(false);

  const toggleMenu = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
    );
  };

  const isActive = (href?: string) => href && location.pathname === href;
  const isChildActive = (item: NavItem) =>
    item.children?.some(c => location.pathname.startsWith(c.href));

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className={cn(
      "flex flex-col bg-sidebar text-sidebar-foreground h-screen sticky top-0 transition-all duration-200 z-30",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-sidebar-primary" />
            <div>
              <h1 className="text-base font-bold text-sidebar-primary-foreground tracking-wide">SCM</h1>
              <p className="text-[10px] text-sidebar-foreground/60">Sistema Clinico Medico</p>
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-sidebar-accent">
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navigation.map(item => (
          <div key={item.label}>
            {item.href ? (
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive(item.href)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
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
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown className={cn("h-3 w-3 transition-transform", openMenus.includes(item.label) && "rotate-180")} />
                    </>
                  )}
                </button>
                {!collapsed && openMenus.includes(item.label) && item.children && (
                  <div className="ml-6 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        to={child.href}
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

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <UserCog className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.nombre || "Usuario"}</p>
              <p className="text-[10px] text-sidebar-foreground/60">{user?.rol || "Sin rol"}</p>
            </div>
            <ThemeToggle />
            <button onClick={handleLogout} className="p-1 hover:bg-sidebar-accent rounded">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
