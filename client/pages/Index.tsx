import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="bg-gradient-to-b from-primary/5 to-background">
      <section className="container py-16 md:py-24 grid items-center gap-10 md:grid-cols-2">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
            Nuevo
            <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
            Recordatorios inteligentes
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
            Horario Médico: tus medicamentos, a tiempo y en la dosis correcta
          </h1>
          <p className="text-muted-foreground text-lg max-w-prose">
            Sistema médico de alarmas y recordatorios para pacientes y
            profesionales de salud. Crea tu plan, recibe notificaciones y mejora
            la adherencia.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/registro">Comenzar gratis</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Sincroniza horarios
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Alertas en tiempo real
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Privacidad primero
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="relative rounded-2xl border bg-card p-6 shadow-sm">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Registro paciente</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Recibe recordatorios de tomas, dosis y stock.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Registro profesional
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Gestiona pacientes y recibe alertas de adherencia.
                </CardContent>
              </Card>
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Próximas tomas</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  08:00 – Metformina (2)
                  <br />
                  14:00 – Atorvastatina (1)
                  <br />
                  20:30 – Losartán (1)
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="funciones" className="container py-14 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Pensado para pacientes y profesionales
        </h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recordatorios confiables</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Notificaciones puntuales, repetición inteligente y registro de
              dosis.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Plan de medicación</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Define dosis, horarios y duración. Te avisamos cuando se acabe.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Panel profesional</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Seguimiento de pacientes, adherencia y alertas por omisiones.
            </CardContent>
          </Card>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/registro">Registrarse como paciente</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/registro">Registrarse como profesional</Link>
          </Button>
        </div>
      </section>

      <section id="como-funciona" className="container py-14 md:py-20">
        <div className="rounded-xl border p-8 grid md:grid-cols-3 gap-6 bg-gradient-to-tr from-primary/5 to-accent">
          <div>
            <h3 className="font-semibold text-lg">1. Regístrate</h3>
            <p className="text-sm text-muted-foreground">
              Elige paciente o profesional y crea tu cuenta.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">2. Configura</h3>
            <p className="text-sm text-muted-foreground">
              Añade medicamentos, horarios y dosis en minutos.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">3. Recibe alertas</h3>
            <p className="text-sm text-muted-foreground">
              Notificaciones claras para no olvidar ninguna toma.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
