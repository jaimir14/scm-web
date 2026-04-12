import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useLogin } from "@/services/auth.service";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const loginMutation = useLogin();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !pass) {
      toast.error("Por favor ingrese usuario y contrasena");
      return;
    }

    loginMutation.mutate(
      { usuario: user, password: pass },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          toast.success("Bienvenido, " + data.user.nombre);
          // Admin users go to admin dashboard; everyone else to doctor portal
          if (data.user.esAdmin) {
            navigate("/dashboard");
          } else {
            navigate("/doctor/dashboard");
          }
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Error al iniciar sesion"
          );
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardContent className="pt-8 pb-6 px-5 sm:pt-10 sm:pb-8 sm:px-8">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
              <Stethoscope className="h-7 w-7 sm:h-8 sm:w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              S<span className="text-primary">C</span>M
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Sistema Clinico Medico</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">Usuario</Label>
              <Input
                id="user"
                value={user}
                onChange={e => setUser(e.target.value)}
                placeholder="Ingrese su usuario"
                disabled={loginMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass">Contraseña</Label>
              <div className="relative">
                <Input
                  id="pass"
                  type={showPass ? "text" : "password"}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  disabled={loginMutation.isPending}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={loginMutation.isPending}>
                {loginMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Aceptar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => { setUser(""); setPass(""); }}
                disabled={loginMutation.isPending}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
