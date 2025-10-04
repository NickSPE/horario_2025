import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  UserPlus, 
  Pill, 
  Bell, 
  Clock, 
  CheckCircle2, 
  Smartphone,
  Search,
  Settings,
  BarChart3,
  PlayCircle
} from "lucide-react";

export default function ComoFunciona() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <PlayCircle className="h-4 w-4 mr-2" />
              Guía paso a paso
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Tan simple que lo dominas en 5 minutos
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Comienza a gestionar tus medicamentos de forma profesional hoy mismo
            </p>
          </div>
        </div>
      </section>

      {/* Para Pacientes */}
      <section className="container py-12 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Para Pacientes</h2>
          <p className="text-muted-foreground text-lg">3 pasos para nunca olvidar una toma</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Paso 1 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">Crea tu cuenta</h3>
              <p className="text-muted-foreground text-lg mb-4">
                Regístrate en segundos con tu email. Selecciona "Paciente" como tipo de usuario.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Solo necesitas email y contraseña</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">No requiere tarjeta de crédito</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">100% gratis para siempre</span>
                </div>
              </div>
            </div>
            <Card className="order-1 md:order-2 border-2">
              <CardContent className="p-6">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                  <UserPlus className="h-16 w-16 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Paso 2 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-lg flex items-center justify-center">
                  <Pill className="h-16 w-16 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <div>
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">Agrega tu medicamento</h3>
              <p className="text-muted-foreground text-lg mb-4">
                Crea un recordatorio seleccionando el medicamento del catálogo.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Selecciona medicamento de la lista</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Elige intervalo (cada 4, 6, 8, 12 o 24 horas)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Personaliza dosis y total de pastillas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">Recibe alertas y marca tomas</h3>
              <p className="text-muted-foreground text-lg mb-4">
                El temporizador empieza inmediatamente. Te avisaremos cuando sea hora de tomar.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Notificación con sonido + vibración</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Ve el temporizador en tiempo real</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Click en "Marcar como tomado" y listo</span>
                </div>
              </div>
            </div>
            <Card className="order-1 md:order-2 border-2">
              <CardContent className="p-6">
                <div className="aspect-video bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg flex items-center justify-center">
                  <Bell className="h-16 w-16 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Para Profesionales */}
      <section className="container py-12 md:py-20 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Para Profesionales</h2>
          <p className="text-muted-foreground text-lg">Asigna y monitorea en 3 pasos</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Paso 1 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-600 text-white text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">Busca tu paciente</h3>
              <p className="text-muted-foreground text-lg mb-4">
                Ve a "Horarios" y busca por DNI, nombre o email del paciente.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Búsqueda automática mientras escribes</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Filtra por DNI para resultados exactos</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Ve si ya está asignado</span>
                </div>
              </div>
            </div>
            <Card className="order-1 md:order-2 border-2">
              <CardContent className="p-6">
                <div className="aspect-video bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 rounded-lg flex items-center justify-center">
                  <Search className="h-16 w-16 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Paso 2 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="aspect-video bg-gradient-to-br from-violet-500/20 to-violet-500/5 rounded-lg flex items-center justify-center">
                  <Settings className="h-16 w-16 text-violet-600" />
                </div>
              </CardContent>
            </Card>
            <div>
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-600 text-white text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">Configura el recordatorio</h3>
              <p className="text-muted-foreground text-lg mb-4">
                Click en "Asignar y Crear Recordatorio" para abrir el formulario.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Selecciona medicamento del catálogo</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Define intervalo y dosis personalizada</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Agrega notas para el paciente</span>
                </div>
              </div>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-600 text-white text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">Monitorea el progreso</h3>
              <p className="text-muted-foreground text-lg mb-4">
                En "Mis Pacientes" ve el progreso de cada uno en tiempo real.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Tomas completadas vs totales</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Filtros: Todos / Al día / Atrasados</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Última toma y próxima programada</span>
                </div>
              </div>
            </div>
            <Card className="order-1 md:order-2 border-2">
              <CardContent className="p-6">
                <div className="aspect-video bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-16 w-16 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Características adicionales */}
      <section className="container py-12 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Características Avanzadas</h2>
          <p className="text-muted-foreground text-lg">Funcionalidades que marcan la diferencia</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="text-center p-6">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mb-2">Temporizador Visual</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ve el tiempo restante segundo a segundo con barra de progreso
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mb-2">Notificaciones Push</CardTitle>
            <p className="text-sm text-muted-foreground">
              Funciona con el navegador cerrado gracias a Service Workers
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mb-2">Historial Completo</CardTitle>
            <p className="text-sm text-muted-foreground">
              Registra automáticamente cada toma con hora exacta
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container py-12 md:py-20">
        <div className="rounded-2xl border-2 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 md:p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Crea tu cuenta gratis y mejora tu adherencia desde hoy
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="text-base h-14 px-8">
              <Link to="/registro">Crear cuenta gratis</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base h-14 px-8">
              <Link to="/funciones">Ver todas las funciones</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Espaciado para barra móvil */}
      <div className="md:hidden h-20" />
    </div>
  );
}
