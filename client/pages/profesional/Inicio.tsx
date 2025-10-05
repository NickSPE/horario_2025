import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Row {
  id: number;
  fecha: string;
  paciente: string;
  medicamento: string;
  dosis: string;
  estado: "Activa" | "Completada";
}

interface PacienteReceta {
  paciente_id: string;
  paciente_nombre: string;
  paciente_apellido: string;
  paciente_email: string;
  recordatorio_id: string;
  medicamento_nombre: string;
  dosis_a_tomar: string;
  inicio_tratamiento: string;
  estado_recordatorio: string;
  porcentaje_adherencia: number;
}

interface ResumenPaciente {
  paciente_id: string;
  paciente_nombre: string;
  paciente_apellido: string;
  paciente_email: string;
  total_medicamentos: number;
  medicamentos_activos: number;
  adherencia_promedio: number;
  ultimo_medicamento: string;
  fecha_asignacion: string;
}

export default function ProfesionalInicio() {
  const supabase = getSupabase();
  const navigate = useNavigate();
  const [pacientesConRecetas, setPacientesConRecetas] = useState<PacienteReceta[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  // Función para obtener pacientes con recetas del profesional actual
  const obtenerPacientesConRecetas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vista_pacientes_recordatorios_profesional')
        .select(`
          paciente_id,
          paciente_nombre,
          paciente_apellido,
          paciente_email,
          recordatorio_id,
          medicamento_nombre,
          dosis_a_tomar,
          inicio_tratamiento,
          estado_recordatorio,
          porcentaje_adherencia
        `)
        .eq('profesional_id', user?.id)
        .not('recordatorio_id', 'is', null); // Solo pacientes que tienen recordatorios

      if (error) {
        console.error('Error al obtener pacientes con recetas:', error);
        return;
      }

      setPacientesConRecetas(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    obtenerPacientesConRecetas();
  }, []);


  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold">
          Panel de Control del Doctor
        </h1>
        <p className="text-muted-foreground">
          Bienvenida, {user?.user_metadata.nombre} {user?.user_metadata.apellido}. Aquí puede gestionar sus recetaas y ver el progreso de sus pacientes.
        </p>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => navigate('/dashboard/profesional/asignar')}>Nueva Receta</Button>
          <Button
            onClick={obtenerPacientesConRecetas}
            variant="outline"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Actualizar Datos"}
          </Button>
        </div>
      </header>

      {/* Sección de Pacientes con Recetas Reales */}
      <div className="rounded-lg border">
        <div className="p-4 font-semibold">
          Mis Pacientes con Recetas ({pacientesConRecetas.length})
        </div>

        {
          loading ? (
            <div className="p-4 text-center text-muted-foreground" >
              Cargando pacientes...
            </div>
          ) : pacientesConRecetas.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No tienes pacientes con recetas asignadas aún.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-accent/50 text-muted-foreground">
                  <tr>
                    <th className="text-left p-3">Paciente</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Medicamento</th>
                    <th className="text-left p-3">Dosis</th>
                    <th className="text-left p-3">Inicio</th>
                    <th className="text-left p-3">Estado</th>
                    <th className="text-left p-3">Adherencia</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesConRecetas.map((paciente) => (
                    <tr key={`${paciente.paciente_id}-${paciente.recordatorio_id}`} className="border-t">
                      <td className="p-3 font-medium">
                        {paciente.paciente_nombre} {paciente.paciente_apellido}
                      </td>
                      <td className="p-3 text-muted-foreground">{paciente.paciente_email}</td>
                      <td className="p-3">{paciente.medicamento_nombre}</td>
                      <td className="p-3">{paciente.dosis_a_tomar}</td>
                      <td className="p-3">
                        {new Date(paciente.inicio_tratamiento).toLocaleDateString('es-ES')}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            paciente.estado_recordatorio === "al_dia"
                              ? "default"
                              : paciente.estado_recordatorio === "atrasado"
                                ? "destructive"
                                : paciente.estado_recordatorio === "completado"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {paciente.estado_recordatorio === "al_dia" && "Al día"}
                          {paciente.estado_recordatorio === "atrasado" && "Atrasado"}
                          {paciente.estado_recordatorio === "completado" && "Completado"}
                          {paciente.estado_recordatorio === "sin_iniciar" && "Sin iniciar"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {paciente.porcentaje_adherencia !== null
                          ? `${paciente.porcentaje_adherencia}%`
                          : "N/A"
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div >

  )

};
