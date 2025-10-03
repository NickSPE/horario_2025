import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PacienteCitas() {
  const [citas, setCitas] = useState<string[]>([
    "15/08/2024 10:00 - Dra. Ramírez",
  ]);
  const add = () =>
    setCitas((c) => [new Date().toLocaleString() + " - Dra. Ramírez", ...c]);
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Citas</h2>
        <Button onClick={add}>Nueva cita</Button>
      </div>
      <ul className="rounded-md border divide-y">
        {citas.map((c) => (
          <li key={c} className="p-3">
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}
