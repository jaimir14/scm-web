import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BuscarExpediente from "./pages/expediente/BuscarExpediente";
import ExpedienteDetalle from "./pages/expediente/ExpedienteDetalle";
import AgendaCitas from "./pages/citas/AgendaCitas";
import MantenimientoGenerico from "./pages/mantenimientos/MantenimientoGenerico";
import ReporteGenerico from "./pages/reportes/ReporteGenerico";
import Bitacora from "./pages/admin/Bitacora";
import Configuracion from "./pages/admin/Configuracion";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/citas" element={<AgendaCitas />} />
              <Route path="/expediente/buscar" element={<BuscarExpediente />} />
              <Route path="/expediente/nuevo" element={<ExpedienteDetalle />} />
              <Route path="/expediente/:id" element={<ExpedienteDetalle />} />
              <Route path="/mantenimientos/clinicas" element={<MantenimientoGenerico tipo="clinicas" />} />
              
              <Route path="/mantenimientos/usuarios" element={<MantenimientoGenerico tipo="usuarios" />} />
              <Route path="/mantenimientos/tipos-cita" element={<MantenimientoGenerico tipo="tipos-cita" />} />
              <Route path="/mantenimientos/tratamientos" element={<MantenimientoGenerico tipo="tratamientos" />} />
              <Route path="/reportes/citas" element={<ReporteGenerico tipo="citas" />} />
              <Route path="/reportes/pacientes" element={<ReporteGenerico tipo="pacientes" />} />
              <Route path="/reportes/clinicas" element={<ReporteGenerico tipo="clinicas" />} />
              <Route path="/reportes/tratamientos" element={<ReporteGenerico tipo="tratamientos" />} />
              <Route path="/reportes/usuarios" element={<ReporteGenerico tipo="usuarios" />} />
              <Route path="/admin/bitacora" element={<Bitacora />} />
              <Route path="/admin/configuracion" element={<Configuracion />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
