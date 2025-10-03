import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface Row {
  id: number;
  fecha: string;
  paciente: string;
  medicamento: string;
  dosis: string;
  estado: "Activa" | "Completada";
}

export default function ProfesionalInicio() {
  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      fecha: "15/07/2024",
      paciente: "Carlos Mendoza",
      medicamento: "Paracetamol",
      dosis: "500mg cada 8 horas",
      estado: "Activa",
    },
    {
      id: 2,
      fecha: "10/07/2024",
      paciente: "Ana López",
      medicamento: "Ibuprofeno",
      dosis: "400mg cada 6 horas",
      estado: "Completada",
    },
    {
      id: 3,
      fecha: "05/07/2024",
      paciente: "Luis García",
      medicamento: "Amoxicilina",
      dosis: "250mg cada 12 horas",
      estado: "Activa",
    },
    {
      id: 4,
      fecha: "01/07/2024",
      paciente: "María Torres",
      medicamento: "Omeprazol",
      dosis: "20mg una vez al día",
      estado: "Completada",
    },
    {
      id: 5,
      fecha: "25/06/2024",
      paciente: "Jorge Pérez",
      medicamento: "Metformina",
      dosis: "850mg dos veces al día",
      estado: "Activa",
    },
  ]);

  const addReceta = () => {
    setRows((r) => [
      {
        id: Date.now(),
        fecha: new Date().toLocaleDateString(),
        paciente: "Nuevo Paciente",
        medicamento: "Nueva receta",
        dosis: "500mg",
        estado: "Activa",
      },
      ...r,
    ]);
  };

  const toggleEstado = (id: number) => {
    setRows((r) =>
      r.map((row) =>
        row.id === id
          ? {
              ...row,
              estado: row.estado === "Activa" ? "Completada" : "Activa",
            }
          : row,
      ),
    );
  };

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold">
          Panel de Control del Doctor
        </h1>
        <p className="text-muted-foreground">
          Bienvenida, Dra. Ramírez. Aquí puede gestionar sus recetas y
          videollamadas.
        </p>
        <div className="mt-4 flex gap-3">
          <Button onClick={addReceta}>Nueva Receta</Button>
          <Button
            variant="secondary"
            onClick={() => alert("Iniciando videollamada...")}
          >
            Iniciar Videollamada
          </Button>
        </div>
      </header>

      <div className="rounded-lg border">
        <div className="p-4 font-semibold">Historial de Recetas</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent/50 text-muted-foreground">
              <tr>
                <th className="text-left p-3">Fecha</th>
                <th className="text-left p-3">Paciente</th>
                <th className="text-left p-3">Medicamento</th>
                <th className="text-left p-3">Dosis</th>
                <th className="text-left p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">{row.fecha}</td>
                  <td className="p-3 font-medium">{row.paciente}</td>
                  <td className="p-3">{row.medicamento}</td>
                  <td className="p-3">{row.dosis}</td>
                  <td className="p-3">
                    <button onClick={() => toggleEstado(row.id)}>
                      <Badge
                        variant={
                          row.estado === "Activa" ? "secondary" : "outline"
                        }
                      >
                        {row.estado}
                      </Badge>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
