import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ProfesionalPacientes() {
  const [pacientes, setPacientes] = useState<string[]>([
    "Carlos Mendoza",
    "Ana López",
    "Luis García",
  ]);
  const [nombre, setNombre] = useState("");
  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Pacientes</h2>
      <div className="flex gap-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nuevo paciente"
          className="h-10 w-full max-w-sm rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <Button
          onClick={() => {
            if (nombre.trim()) {
              setPacientes([nombre.trim(), ...pacientes]);
              setNombre("");
            }
          }}
        >
          Agregar
        </Button>
      </div>
      <ul className="divide-y rounded-md border">
        {pacientes.map((p) => (
          <li key={p} className="p-3 flex items-center justify-between">
            <span>{p}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => alert(`Abrir ficha de ${p}`)}
            >
              Ver
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
