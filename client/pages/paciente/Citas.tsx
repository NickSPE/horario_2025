import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Cita {
  paciente_id: string;
  fecha: string;
  hora: string;
}


export default function PacienteCitas() {

  const { user } = useAuth();
  const supabase = getSupabase();
  const [citas, setCitas] = useState<Cita[]>([]);

  useEffect(() => {
    fetchCitas();
  }, []);

  const fetchCitas = async () => {
    const { data, error } = await supabase
      .from("citas")
      .select(`paciente_id , fecha, hora`)
      .eq("paciente_id", user.id);
    if (error) {
      console.error("Error fetching citas:", error);
      return [];
    }
    console.log("Citas fetched:", data);
    setCitas(data);
  }


  const add = () => {
    // Lógica para agregar una nueva cita
    alert("Agregar nueva cita");
  };
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mis Citas Médicas</h2>
        <Button
          onClick={add}
          className="bg-blue-500 hover:bg-blue-600 transition-colors"
        >
          + Nueva cita
        </Button>
      </div>

      {citas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tienes citas programadas
        </div>
      ) : (
        <div className="grid gap-4">
          {citas.map((cita, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600">
                    <span className="font-semibold">Fecha:</span> {new Date(cita.fecha).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Hora:</span> {cita.hora}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-500"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
