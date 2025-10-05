import { useState, useEffect } from "react";
import { Search, UserPlus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getSupabase } from "@/lib/supabase";

interface Paciente {
  id: string;
  user_id: string;
  nombre: string;
  apellido: string;
  email: string;
  dni?: string;
  telefono?: string;
}

interface BuscarPacienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPacienteSeleccionado: (paciente: Paciente) => void;
  profesionalId: string;
}

export function BuscarPacienteDialog({
  open,
  onOpenChange,
  onPacienteSeleccionado,
  profesionalId,
}: BuscarPacienteDialogProps) {
  const [busqueda, setBusqueda] = useState("");
  const [pacientesEncontrados, setPacientesEncontrados] = useState<Paciente[]>([]);
  const [buscando, setBuscando] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setBusqueda("");
      setPacientesEncontrados([]);
    }
  }, [open]);

  const buscarPacientes = async () => {
    if (!busqueda.trim()) {
      toast({
        title: "Campo vacío",
        description: "Escribe nombre, email o DNI para buscar",
        variant: "destructive",
      });
      return;
    }

    if (busqueda.trim().length < 2) {
      toast({
        title: "Búsqueda muy corta",
        description: "Escribe al menos 2 caracteres",
        variant: "destructive",
      });
      return;
    }

    setBuscando(true);
    try {
      const supabase = getSupabase();
      
      const terminoBusqueda = busqueda.trim();
      
      console.log('🔍 Buscando pacientes con término:', terminoBusqueda);
      
      // Usar la misma función RPC que usa Horarios (Asignar.tsx)
      const { data: pacientes, error } = await supabase.rpc('buscar_pacientes', {
        termino: terminoBusqueda
      });

      console.log('📊 Resultados de búsqueda:', { pacientes, error });

      if (error) {
        console.error("❌ Error al buscar pacientes:", error);
        throw error;
      }

      console.log(`✅ Encontrados ${(pacientes || []).length} paciente(s)`);
      setPacientesEncontrados(pacientes || []);

      if ((pacientes || []).length === 0) {
        toast({
          title: "Sin resultados",
          description: `No se encontraron pacientes con "${terminoBusqueda}"`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error al buscar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBuscando(false);
    }
  };

  const seleccionarPaciente = (paciente: Paciente) => {
    // Simplemente seleccionar el paciente, sin crear asignación
    toast({
      title: "Paciente seleccionado",
      description: `${paciente.nombre} ${paciente.apellido}`,
    });

    onPacienteSeleccionado(paciente);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Seleccionar Paciente</DialogTitle>
          <DialogDescription>
            Busca por nombre, apellido, email o DNI para seleccionar el paciente al que asignarás el recordatorio
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="Nombre, email o DNI..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                buscarPacientes();
              }
            }}
          />
          <Button onClick={buscarPacientes} disabled={buscando}>
            {buscando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {pacientesEncontrados.length === 0 && !buscando && (
            <p className="text-center text-muted-foreground py-8">
              Usa el buscador para encontrar pacientes
            </p>
          )}

          {pacientesEncontrados.map((paciente) => (
            <Card key={paciente.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {paciente.nombre} {paciente.apellido}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{paciente.email}</p>
                    {paciente.dni && (
                      <p className="text-xs text-muted-foreground">DNI: {paciente.dni}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => seleccionarPaciente(paciente)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Seleccionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
