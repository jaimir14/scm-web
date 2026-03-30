import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, LogOut, Stethoscope, Menu, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useDoctor } from "@/contexts/DoctorContext";

function DoctorNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profesional, logout } = useDoctor();

  const links = [
    { label: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
    { label: "Mi Agenda", href: "/doctor/agenda", icon: CalendarDays },
  ];

  return (
    <>
      <nav className="flex-1 py-4 px-2 space-y-1">
        {links.map(l => (
          <Link
            key={l.href}
            to={l.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              location.pathname === l.href
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "hover:bg-sidebar-accent text-sidebar-foreground"
            )}
          >
            <l.icon className="h-4 w-4 shrink-0" />
            <span>{l.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{profesional?.nombre ?? "Doctor"}</p>
            <p className="text-[10px] text-sidebar-foreground/60">{profesional?.especialidad ?? ""}</p>
          </div>
          <ThemeToggle />
          <button onClick={() => { logout(); navigate("/doctor"); }} className="p-1 hover:bg-sidebar-accent rounded">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export default function DoctorLayout() {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const header = (
    <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
      <Stethoscope className="h-7 w-7 text-sidebar-primary" />
      <div>
        <h1 className="text-base font-bold text-sidebar-primary-foreground tracking-wide">Portal Médico</h1>
        <p className="text-[10px] text-sidebar-foreground/60">Sistema Clínico Médico</p>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-3 left-3 z-40 bg-background/80 backdrop-blur-sm shadow-md border">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground border-sidebar-border">
            {header}
            <div className="flex flex-col h-[calc(100%-65px)]">
              <DoctorNav onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <main className="pt-14 pb-4">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex flex-col bg-sidebar text-sidebar-foreground h-screen sticky top-0 w-56 z-30">
        {header}
        <DoctorNav />
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
