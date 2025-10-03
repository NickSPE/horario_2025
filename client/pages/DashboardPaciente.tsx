import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPaciente() {
  return (
    <section className="container py-10 grid gap-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Tu horario de hoy
        </h1>
        <p className="text-muted-foreground">Recordatorios y próximas tomas</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>08:00 - Metformina</CardTitle>
          </CardHeader>
          <CardContent>
            <p>2 tabletas después del desayuno</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>14:00 - Atorvastatina</CardTitle>
          </CardHeader>
          <CardContent>
            <p>1 tableta con agua</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>20:30 - Losartán</CardTitle>
          </CardHeader>
          <CardContent>
            <p>1 tableta antes de dormir</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
