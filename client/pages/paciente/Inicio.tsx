import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Tile = ({ to, title, icon }: { to: string; title: string; icon: string }) => (
  <Link
    to={to}
    className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] grid place-items-center text-center"
  >
    <div className="h-16 w-16 rounded-full bg-primary/10 text-primary grid place-items-center text-3xl mb-3">
      {icon}
    </div>
    <span className="text-base font-medium">{title}</span>
  </Link>
);

export default function PacienteInicio() {
  return (
    <div className="grid gap-6">
      {/* Encabezado común */}
      <header className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold">Panel de Control</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Accede a tus servicios de salud de forma rápida y sencilla.
        </p>
      </header>

      {/* Vista móvil: tiles grandes y fáciles de tocar (como la imagen) */}
      <section className="grid grid-cols-2 gap-4 md:hidden">
        <Tile to="/dashboard/paciente/citas" title="Mis Citas" icon="📅" />
        <Tile to="/dashboard/paciente/recetas" title="Recetas" icon="📋" />
        <Tile to="/dashboard/paciente/medicamentos" title="Medicamentos" icon="💊" />
        <Tile to="/dashboard/paciente/recordatorios" title="Recordatorios" icon="⏰" />
        <Tile to="/dashboard/paciente/mensajes" title="Mensajes" icon="✉️" />
        <Tile to="/dashboard/paciente/perfil" title="Mi Perfil" icon="�" />
      </section>

      {/* Vista escritorio/tablet: tarjetas detalladas (formato original) */}
      <section className="hidden md:grid gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
        <div>
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
        </div>
      </section>
    </div>
  );
}
