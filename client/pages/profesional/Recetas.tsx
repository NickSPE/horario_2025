import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getJSON } from "@/lib/storage";

interface Receta {
  id: number;
  paciente: string;
  medicamento: string;
  categoria?: string;
  dosis: string;
  indicaciones: string;
  dias: number;
}

const CATALOG_KEY = "medCatalog";

export default function ProfesionalRecetas() {
  const [recetas, setRecetas] = useState<Receta[]>([]);

  // Catalog from localStorage (managed in Medicamentos)
  const categories = getJSON<{ id: string; name: string }[]>(
    CATALOG_KEY + ":categories",
    [],
  );
  const meds = getJSON<{ id: string; name: string; categoryId: string }[]>(
    CATALOG_KEY + ":meds",
    [],
  );

  // Dialog state
  const [open, setOpen] = useState(false);
  const [paciente, setPaciente] = useState("");
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [medId, setMedId] = useState<string>("");
  const [dosis, setDosis] = useState("");
  const [indic, setIndic] = useState("");
  const [dias, setDias] = useState(7);

  const medsFiltered = useMemo(
    () => meds.filter((m) => !categoriaId || m.categoryId === categoriaId),
    [meds, categoriaId],
  );

  const add = () => setOpen(true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const med = meds.find((m) => m.id === medId)?.name || "Medicamento";
    const cat = categories.find((c) => c.id === categoriaId)?.name;
    const nueva: Receta = {
      id: Date.now(),
      paciente: paciente || "Paciente",
      medicamento: med,
      categoria: cat,
      dosis: dosis || "",
      indicaciones: indic || "",
      dias,
    };
    setRecetas([nueva, ...recetas]);
    setOpen(false);
    setPaciente("");
    setCategoriaId("");
    setMedId("");
    setDosis("");
    setIndic("");
    setDias(7);
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recetas</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={add}>Nueva receta</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva receta</DialogTitle>
            </DialogHeader>
            <form className="grid gap-3" onSubmit={submit}>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Paciente</label>
                <input
                  value={paciente}
                  onChange={(e) => setPaciente(e.target.value)}
                  placeholder="Nombre del paciente"
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Categoría</label>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Selecciona</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Medicamento</label>
                <select
                  value={medId}
                  onChange={(e) => setMedId(e.target.value)}
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Selecciona</option>
                  {medsFiltered.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Dosis</label>
                <input
                  value={dosis}
                  onChange={(e) => setDosis(e.target.value)}
                  placeholder="Ej: 500mg cada 8h"
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Indicaciones</label>
                <input
                  value={indic}
                  onChange={(e) => setIndic(e.target.value)}
                  placeholder="Instrucciones adicionales"
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                />
              </div>
              <div className="grid gap-1 max-w-xs">
                <label className="text-sm font-medium">Duración (días)</label>
                <input
                  type="number"
                  min={1}
                  value={dias}
                  onChange={(e) => setDias(parseInt(e.target.value || "0"))}
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                />
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={!medId}>
                  Guardar receta
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3">
        {recetas.map((r) => (
          <div key={r.id} className="rounded-md border p-4">
            <p className="font-medium">
              {r.paciente} — {r.medicamento}
              {r.categoria ? ` (${r.categoria})` : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {r.dosis} {r.indicaciones ? `· ${r.indicaciones}` : ""} · {r.dias}{" "}
              días
            </p>
          </div>
        ))}
        {recetas.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aún no hay recetas. Usa “Nueva receta”.
          </p>
        )}
      </div>
    </div>
  );
}
