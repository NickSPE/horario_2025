import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Pill, 
  Clock, 
  Users, 
  Bell, 
  BarChart3, 
  Shield, 
  Smartphone,
  Calendar,
  History,
  CheckCircle2,
  Settings,
  Wifi
} from "lucide-react";

export default function Funciones() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Settings className="h-4 w-4 mr-2" />
              Funcionalidades completas
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Todo lo que necesitas para nunca olvidar
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Gestión profesional de medicamentos con tecnología de última generación
            </p>
          </div>
        </div>
      </section>

      {/* Para Pacientes */}
      <section className="container py-12 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Para Pacientes</h2>
          <p className="text-muted-foreground text-lg">Toma el control de tu tratamiento</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Alarmas Inteligentes</CardTitle>
              <CardDescription>Notificaciones que no puedes ignorar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Sonido personalizado + vibración</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Funciona con navegador cerrado</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Repetición automática si no marcas</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Temporizador en Tiempo Real</CardTitle>
              <CardDescription>Ve el tiempo restante en cada momento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Cuenta regresiva segundo a segundo</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Barra de progreso visual</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Alerta roja cuando es hora de tomar</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Control de Progreso</CardTitle>
              <CardDescription>Seguimiento completo del tratamiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Contador de tomas completadas</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Tomas restantes calculadas</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Finalización automática al terminar</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center mb-4">
                <Pill className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>Gestión de Medicamentos</CardTitle>
              <CardDescription>Base de datos completa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Catálogo completo de medicamentos</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Dosis recomendada pre-cargada</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Personaliza dosis según indicación</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-pink-100 dark:bg-pink-950 flex items-center justify-center mb-4">
                <History className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <CardTitle>Historial Detallado</CardTitle>
              <CardDescription>Registra cada toma automáticamente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Hora programada vs hora real</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Adherencia calculada automáticamente</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Exporta tu historial médico</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center mb-4">
                <Wifi className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <CardTitle>Modo Offline</CardTitle>
              <CardDescription>Funciona sin internet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Service Worker activado</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Notificaciones programadas localmente</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Sincronización al reconectar</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Para Profesionales */}
      <section className="container py-12 md:py-20 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Para Profesionales</h2>
          <p className="text-muted-foreground text-lg">Mejora la adherencia de tus pacientes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="border-2">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Gestión de Pacientes</CardTitle>
              <CardDescription>Control centralizado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Búsqueda rápida por DNI</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Asignación con un solo click</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Vista completa de pacientes asignados</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-violet-100 dark:bg-violet-950 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <CardTitle>Asignación de Recordatorios</CardTitle>
              <CardDescription>Crea tratamientos para pacientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Selecciona medicamento del catálogo</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Define intervalo y dosis</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>El paciente lo ve automáticamente</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle>Monitoreo en Tiempo Real</CardTitle>
              <CardDescription>Ve el progreso de cada paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Tomas completadas vs pendientes</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Filtros: Al día / Atrasados</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Alertas de baja adherencia</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seguridad y Privacidad */}
      <section className="container py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Seguridad Garantizada</h2>
            <p className="text-muted-foreground text-lg">Tus datos médicos están protegidos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Encriptación de extremo a extremo
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Toda la información médica está cifrada usando estándares bancarios
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  RLS (Row Level Security)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Solo tú y tus profesionales asignados pueden ver tus datos
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Cumplimiento HIPAA
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Cumplimos con las normativas internacionales de privacidad médica
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Hosting seguro
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Infraestructura en Supabase con respaldos automáticos diarios
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container py-12 md:py-20">
        <div className="rounded-2xl border-2 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 md:p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para mejorar tu adherencia?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Únete hoy y nunca más olvides tomar tus medicamentos
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="text-base h-14 px-8">
              <Link to="/registro">Comenzar gratis</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base h-14 px-8">
              <Link to="/como-funciona">Ver cómo funciona</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Espaciado para barra móvil */}
      <div className="md:hidden h-20" />
    </div>
  );
}
