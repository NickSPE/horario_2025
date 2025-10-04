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

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"paciente" | "profesional">("paciente");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    password: "",
    licencia: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getSupabase();

      // Registrar usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre: formData.nombre,
            apellido: formData.apellido,
            dni: formData.dni,
            role: mode,
            ...(mode === "profesional" && { licencia: formData.licencia }),
          },
        },
      });

      if (error) throw error;

      toast({
        title: "¡Registro exitoso!",
        description: `Se ha enviado un email de confirmación a ${formData.email}. Revisa tu bandeja de entrada y spam.`,
        duration: 6000,
      });

      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate("/login");
      }, 4000);
    } catch (error: any) {
      console.error("Error de registro:", error);
      
      let errorMessage = error.message || "Ocurrió un error inesperado";
      
      // Mensajes más claros para errores comunes
      if (error.message?.includes("already registered") || error.message?.includes("User already registered")) {
        errorMessage = `Este correo (${formData.email}) ya está registrado. ¿Ya tienes una cuenta? Intenta iniciar sesión.`;
      } else if (error.message?.includes("Email rate limit exceeded")) {
        errorMessage = "Has intentado registrarte muchas veces. Espera unos minutos e intenta de nuevo.";
      } else if (error.message?.includes("Invalid email")) {
        errorMessage = "El correo electrónico no es válido. Verifica que esté bien escrito.";
      } else if (error.message?.includes("Password should be at least 6 characters")) {
        errorMessage = "La contraseña debe tener al menos 6 caracteres.";
      }
      
      toast({
        title: "Error al registrar",
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container py-16">
      <div className="max-w-3xl mx-auto grid gap-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Crea tu cuenta
          </h1>
          <p className="text-muted-foreground mt-2">
            Elige el tipo de registro que se ajusta a ti
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setMode("paciente")}
            className={`text-left rounded-lg border p-6 transition-colors ${mode === "paciente" ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
          >
            <h3 className="font-semibold text-lg">Paciente</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Recibe recordatorios personalizados y controla tus tomas.
            </p>
          </button>
          <button
            onClick={() => setMode("profesional")}
            className={`text-left rounded-lg border p-6 transition-colors ${mode === "profesional" ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
          >
            <h3 className="font-semibold text-lg">Profesional de salud</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona pacientes, tratamientos y alertas de adherencia.
            </p>
          </button>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              Registro de {mode === "paciente" ? "paciente" : "profesional"}
            </CardTitle>
            <CardDescription>Completa tus datos para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="nombre" className="text-sm font-medium">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Juan"
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="apellido" className="text-sm font-medium">
                    Apellido
                  </label>
                  <input
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Ej: Pérez"
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="dni" className="text-sm font-medium">
                  DNI/Cédula
                </label>
                <input
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  placeholder="Ej: 12345678-A"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  📧 Enviaremos un link de confirmación a este correo
                </p>
              </div>
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    className="h-10 w-full rounded-md border bg-background px-3 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    required
                    minLength={6}
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
                <p className="text-xs text-muted-foreground">
                  🔒 Mínimo 6 caracteres para mayor seguridad
                </p>
              </div>
              {mode === "profesional" && (
                <div className="grid gap-2">
                  <label htmlFor="licencia" className="text-sm font-medium">
                    Número de licencia
                  </label>
                  <input
                    id="licencia"
                    name="licencia"
                    value={formData.licencia}
                    onChange={handleChange}
                    placeholder="Ej: 12345ABC"
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    required
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
              
              <div className="mt-2 p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-900 dark:text-blue-100 font-medium">
                  ℹ️ Después de registrarte:
                </p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 mt-1 space-y-1 ml-4">
                  <li>• Recibirás un email de confirmación</li>
                  <li>• Revisa tu bandeja de entrada y spam</li>
                  <li>• Haz clic en el enlace para activar tu cuenta</li>
                  <li>• Una vez confirmado, podrás iniciar sesión</li>
                </ul>
              </div>
            </form>
            
            <p className="mt-4 text-xs text-center text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-primary hover:underline font-medium"
              >
                Inicia sesión aquí
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
