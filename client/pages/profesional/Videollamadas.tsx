import { Button } from "@/components/ui/button";

export default function ProfesionalVideollamadas() {
  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Videollamadas</h2>
      <p className="text-muted-foreground">
        Inicie una videollamada segura con su paciente.
      </p>
      <Button onClick={() => alert("Videollamada iniciada")}>
        Iniciar videollamada
      </Button>
    </div>
  );
}
