import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Bell, CheckCircle2, Clock, Pill, Users } from "lucide-react";
import { Link } from "react-router-dom";


export default function Index() {

  const { user } = useAuth();
  if (user) {
    // Redirigir según el rol del usuario
    const dashboardPath = user.role === "profesional" ? "/dashboard/profesional" : "/dashboard/paciente";
    window.location.href = dashboardPath;
    return null; // Evitar renderizado adicional
  }


  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section con imagen de fondo */}
      <section className="relative overflow-hidden min-h-[85vh] md:min-h-[90vh] flex items-center">
        {/* Imagen de fondo */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/image/horario_medico_index.jpg)' }}
        />
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

        <div className="container relative py-20 md:py-28 lg:py-36 z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8">
            <Badge variant="secondary" className="text-sm px-4 py-2 bg-white/90 text-primary border-0 shadow-lg">
              <Bell className="h-4 w-4 mr-2" />
              Recordatorios inteligentes para tu salud
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-white drop-shadow-2xl">
              Nunca olvides tomar tus medicamentos
            </h1>

            <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-lg font-medium">
              Sistema profesional de recordatorios médicos. Para pacientes que cuidan su salud y profesionales que cuidan a sus pacientes.
            </p>

            {/* Botones principales - ocultos en móvil, mostrados en desktop */}
            <div className="hidden md:flex flex-wrap justify-center gap-4 pt-4">
              <Button asChild size="lg" className="text-base h-14 px-8 shadow-xl">
                <Link to="/registro">
                  <Users className="mr-2 h-5 w-5" />
                  Comenzar gratis
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base h-14 px-8 bg-white/90 hover:bg-white border-2 shadow-xl">
                <Link to="/login">Iniciar sesión</Link>
              </Button>
            </div>

            {/* Características destacadas */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-4 text-sm md:text-base">
              <div className="flex items-center gap-2 text-white drop-shadow-md">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span className="font-semibold">Alarmas precisas</span>
              </div>
              <div className="flex items-center gap-2 text-white drop-shadow-md">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span className="font-semibold">Seguimiento completo</span>
              </div>
              <div className="flex items-center gap-2 text-white drop-shadow-md">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <span className="font-semibold">100% privado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de beneficios */}
      <section className="container py-12 md:py-20">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-muted-foreground mt-3 text-base md:text-lg max-w-2xl mx-auto">
            Diseñado para facilitar la adherencia al tratamiento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Pill className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Recordatorios Inteligentes</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Notificaciones con sonido y vibración. Te recordamos cada toma a la hora exacta, incluso con el navegador cerrado.
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Control de Progreso</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Ve cuántas tomas te quedan, cuándo es la próxima y el historial completo de tu tratamiento.
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Panel Profesional</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Los profesionales pueden asignar recordatorios a sus pacientes y monitorear su adherencia en tiempo real.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="container py-12 md:py-20">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Tan fácil como 1, 2, 3
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="text-xl font-semibold">Regístrate</h3>
            <p className="text-muted-foreground">
              Crea tu cuenta como paciente o profesional en segundos
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="text-xl font-semibold">Configura</h3>
            <p className="text-muted-foreground">
              Añade medicamentos, horarios y dosis. Activa las notificaciones
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="text-xl font-semibold">Recibe alertas</h3>
            <p className="text-muted-foreground">
              Notificaciones claras que no podrás ignorar. Marca cada toma completada
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container py-12 md:py-20">
        <div className="rounded-2xl border-2 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comienza a cuidar tu salud hoy
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Únete a miles de pacientes que mejoraron su adherencia al tratamiento
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="text-base h-14 px-8">
              <Link to="/registro">Crear cuenta gratis</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base h-14 px-8">
              <Link to="/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
