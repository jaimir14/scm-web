import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useDoctor } from "@/contexts/DoctorContext";
import { usuarios } from "@/data/mockDoctorData";

export default function DoctorLogin() {
  const navigate = useNavigate();
  const { login } = useDoctor();
  const [showPass, setShowPass] = useState(false);
  const [username, setUsername] = useState("dgarcia");
  const [error, setError] = useState("");

  const doctorUsers = usuarios.filter(u => u.rol === "Médico");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (login(username)) {
      navigate("/doctor/dashboard");
    } else {
      setError("Usuario no encontrado o no es un profesional médico.");
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
            <h1 className="text-xl font-bold text-foreground">Portal Médico</h1>
            <p className="text-sm text-muted-foreground">Ingrese con sus credenciales</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Usuario</label>
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ej: dgarcia"
              />
              <p className="text-[10px] text-muted-foreground">
                Usuarios disponibles: {doctorUsers.map(u => u.usuario).join(", ")}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Contraseña</label>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} defaultValue="123456" />
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
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">Ingresar</Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            <a href="/login" className="text-primary hover:underline">Ir al panel administrativo</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
