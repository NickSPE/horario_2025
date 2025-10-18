import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getSupabase();

      // Iniciar sesión con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Obtener el rol del usuario desde metadata
      const userRole = data.user?.user_metadata?.role;

      toast({
        title: "¡Bienvenido!",
        description: `Has iniciado sesión correctamente, ${data.user?.user_metadata?.nombre || 'Usuario'}`,
      });

      // Redirigir según el rol
      if (userRole === "paciente") {
        navigate("/dashboard/paciente");
      } else if (userRole === "profesional") {
        navigate("/dashboard/profesional");
      } else {
        // Si no tiene rol, redirigir a paciente por defecto
        navigate("/dashboard/paciente");
      }
    } catch (error: any) {
      // Mensaje de error mejorado
      let errorMessage = error.message || "Verifica tus credenciales";
      
      // Detectar error de email no confirmado
      if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.";
      } else if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Email o contraseña incorrectos. Verifica tus datos.";
      }

      toast({
        title: "Error al iniciar sesión",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container py-16 grid place-items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>
            Accede a tu cuenta de Horario Médico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className="h-10 w-full rounded-md border bg-background px-3 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-900 dark:text-amber-100">
                ⚠️ <strong>Importante:</strong> Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Ingresar"}
            </Button>
          </form>
          <p className="mt-4 text-xs text-center text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <button
              onClick={() => navigate("/registro")}
              className="text-primary hover:underline"
            >
              Regístrate aquí
            </button>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
