import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLogin } from "@/services/auth.service";

export default function DoctorLogin() {
  const navigate = useNavigate();
  const auth = useAuth();
  const loginMutation = useLogin();
  const [showPass, setShowPass] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // If already authenticated as MEDICO, redirect
  if (auth.isAuthenticated && auth.user?.rol === "MEDICO") {
    navigate("/doctor/dashboard", { replace: true });
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Ingrese usuario y contrasena.");
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({ usuario: username, password });
      if (result.user.rol !== "MEDICO") {
        setError("Solo medicos pueden acceder al portal.");
        return;
      }
      auth.login(result.token, result.user);
      navigate("/doctor/dashboard");
    } catch (err: any) {
      setError(err?.message || "Credenciales invalidas.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardContent className="pt-8 pb-6 px-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Stethoscope className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Portal Medico</h1>
            <p className="text-sm text-muted-foreground">Ingrese con sus credenciales</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Usuario</label>
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ej: dgarcia"
                autoComplete="username"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Contrasena</label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Ingrese su contrasena"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ingresar
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            <a href="/login" className="text-primary hover:underline">Ir al panel administrativo</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
