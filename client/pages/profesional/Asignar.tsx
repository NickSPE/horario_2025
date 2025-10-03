import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase";

interface Patient {
  id: string;
  name: string | null;
  email: string | null;
}

export default function ProfesionalAsignar() {
  const [term, setTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Medication form
  const [drug, setDrug] = useState("");
  const [dose, setDose] = useState("");
  const [times, setTimes] = useState("08:00, 20:00");
  const [days, setDays] = useState(7);

  const supabaseReady = useMemo(() => {
    try {
      getSupabase();
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!supabaseReady || term.trim().length < 2) return;
    const run = async () => {
      setError(null);
      try {
        const supabase = getSupabase();
        const { data, error: err } = await supabase
          .from("patients")
          .select("id, name, email")
          .or(`name.ilike.%${term}%,email.ilike.%${term}%`)
          .limit(10);
        if (err) throw err;
        setPatients(data as Patient[]);
      } catch (e: any) {
        setError(e.message || "Error al buscar pacientes");
      }
    };
    run();
  }, [term, supabaseReady]);

  const assign = async () => {
    if (!selected) return alert("Seleccione un paciente");
    if (!supabaseReady)
      return alert("Configura Supabase para guardar en la base de datos");
    try {
      const supabase = getSupabase();
      const start = new Date();
      const end = new Date(start);
      end.setDate(start.getDate() + Number(days || 0));
      const timesArr = times
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const { error: err } = await supabase.from("medication_plans").insert({
        patient_id: selected.id,
        drug,
        dose,
        times: timesArr,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      });
      if (err) throw err;
      alert("Plan asignado correctamente");
      setDrug("");
      setDose("");
      setTimes("08:00, 20:00");
      setDays(7);
    } catch (e: any) {
      alert(e.message || "Error al asignar plan");
    }
  };

  return (
    <div className="grid gap-6">
      <header>
        <h2 className="text-xl font-semibold">Asignar horarios y medicación</h2>
        <p className="text-muted-foreground">
          Busque un paciente y defina medicamento, horarios y duración.
        </p>
      </header>

      {!supabaseReady && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Conecta Supabase para habilitar esta función</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Configura las variables VITE_SUPABASE_URL y
              VITE_SUPABASE_ANON_KEY.
            </p>
            <p>Tablas esperadas:</p>
            <pre className="overflow-auto rounded-md bg-muted p-3">
              {`create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique
);

create table if not exists medication_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  drug text not null,
  dose text,
  times text[] not null,
  start_date timestamptz not null,
  end_date timestamptz not null
);`}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Buscar paciente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <input
            placeholder="Nombre o correo"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="h-10 w-full max-w-md rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {patients.length > 0 && (
            <ul className="rounded-md border divide-y max-w-md">
              {patients.map((p) => (
                <li
                  key={p.id}
                  className={`p-3 cursor-pointer ${selected?.id === p.id ? "bg-primary/10" : "hover:bg-accent"}`}
                  onClick={() => setSelected(p)}
                >
                  <p className="font-medium">{p.name || p.email}</p>
                  {p.email && (
                    <p className="text-xs text-muted-foreground">{p.email}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Definir plan de medicación</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 max-w-2xl">
          <div className="text-sm">
            Paciente seleccionado:{" "}
            {selected ? (
              <span className="font-medium">
                {selected.name || selected.email}
              </span>
            ) : (
              <span className="text-muted-foreground">ninguno</span>
            )}
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Medicamento</label>
            <input
              value={drug}
              onChange={(e) => setDrug(e.target.value)}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Dosis</label>
            <input
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">
              Horas (HH:mm separadas por coma)
            </label>
            <input
              value={times}
              onChange={(e) => setTimes(e.target.value)}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            />
          </div>
          <div className="grid gap-1 max-w-xs">
            <label className="text-sm font-medium">Duración (días)</label>
            <input
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value || "0"))}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            />
          </div>
          <div>
            <Button onClick={assign} disabled={!selected || !drug || !times}>
              Asignar plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
