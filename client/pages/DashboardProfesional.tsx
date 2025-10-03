import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardProfesional() {
  return (
    <section className="container py-10 grid gap-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Panel del profesional
        </h1>
        <p className="text-muted-foreground">Estado de pacientes y alertas</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pacientes con baja adherencia</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm">
              <li>Juan Pérez – 62%</li>
              <li>María Gómez – 70%</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Próximas revisiones</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Mié 10:00 – Ana López</p>
            <p>Jue 12:30 – Pedro Ramos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alertas recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>3 alertas por dosis omitidas en las últimas 24h</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
