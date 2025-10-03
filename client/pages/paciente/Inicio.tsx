import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PacienteInicio() {
  return (
    <div className="grid gap-8">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold">Panel de control</h1>
        <p className="text-muted-foreground">Bienvenido de nuevo, Sofía.</p>
      </header>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receta #1 - Amoxicilina 500mg</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Tomar 1 cápsula cada 8 horas durante 7 días.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Receta #2 - Ibuprofeno 200mg</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Tomar 1 tableta cada 6 horas según dolencia.
          </CardContent>
        </Card>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Recordatorios de Medicamentos</h2>
        <div className="mt-3 grid gap-3">
          <div className="rounded-md border p-3 flex items-center justify-between">
            <div>
              <p className="font-medium">Amoxicilina</p>
              <p className="text-sm text-muted-foreground">
                Próxima dosis: 10:00 AM
              </p>
            </div>
            <button
              className="text-sm text-primary underline"
              onClick={() => alert("Marcado como tomado")}
            >
              Marcar tomado
            </button>
          </div>
          <div className="rounded-md border p-3 flex items-center justify-between">
            <div>
              <p className="font-medium">Ibuprofeno</p>
              <p className="text-sm text-muted-foreground">
                Próxima dosis: 12:00 PM
              </p>
            </div>
            <button
              className="text-sm text-primary underline"
              onClick={() => alert("Marcado como tomado")}
            >
              Marcar tomado
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
