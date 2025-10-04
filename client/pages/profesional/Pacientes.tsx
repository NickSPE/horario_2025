import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface Paciente {
  id: string;
  user_id: string;
  nombre: string;
  apellido: string;
  email: string;
  dni?: string;
  telefono?: string;
  activo: boolean;
  created_at: string;
}

export default function ProfesionalPacientes() {
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacientesEncontrados, setPacientesEncontrados] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscando, setBuscando] = useState(false);
  const [asignando, setAsignando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");

  // Verificar que el usuario esté autenticado antes de cargar
  useEffect(() => {
    if (user?.id) {
      console.log('👤 Usuario autenticado:', user.id);
      cargarPacientes();
    } else {
      console.log('⚠️ Usuario no autenticado');
      setLoading(false);
    }
  }, [user]);

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabase();

      console.log('🔍 Cargando pacientes para profesional:', user?.id);

      // Verificar primero que las tablas existan
      const { data: testConnection, error: testError } = await supabase
        .from('paciente_profesional')
        .select('count', { count: 'exact', head: true })
        .limit(1);

      if (testError) {
        console.error('❌ Error de conexión o tabla no existe:', testError);
        if (testError.message.includes('relation') && testError.message.includes('does not exist')) {
          setError('La tabla paciente_profesional no existe. Por favor, ejecuta las migraciones de la base de datos.');
          return;
        }
        throw testError;
      }

      // Primero obtener las relaciones paciente-profesional
      const { data: relaciones, error: errorRelaciones } = await supabase
        .from('paciente_profesional')
        .select('paciente_id, fecha_asignacion')
        .eq('profesional_id', user?.id)
        .eq('activo', true);

      if (errorRelaciones) {
        console.error('❌ Error al obtener relaciones:', errorRelaciones);
        throw errorRelaciones;
      }

      console.log('📋 Relaciones encontradas:', relaciones);

      if (!relaciones || relaciones.length === 0) {
        console.log('ℹ️ No hay pacientes asignados a este profesional');
        setPacientes([]);
        return;
      }

      // Obtener IDs de pacientes
      const pacienteIds = relaciones.map(r => r.paciente_id);
      console.log('🆔 IDs de pacientes:', pacienteIds);

      // Verificar que la tabla pacientes existe
      const { data: testPacientes, error: testPacientesError } = await supabase
        .from('pacientes')
        .select('count', { count: 'exact', head: true })
        .limit(1);

      if (testPacientesError) {
        console.error('❌ Error con tabla pacientes:', testPacientesError);
        if (testPacientesError.message.includes('relation') && testPacientesError.message.includes('does not exist')) {
          setError('La tabla pacientes no existe. Por favor, ejecuta las migraciones de la base de datos.');
          return;
        }
        throw testPacientesError;
      }

      // Obtener información de los pacientes
      const { data: pacientesData, error: errorPacientes } = await supabase
        .from('pacientes')
        .select('*')
        .in('user_id', pacienteIds)
        .eq('activo', true);

      if (errorPacientes) {
        console.error('❌ Error al obtener pacientes:', errorPacientes);
        throw errorPacientes;
      }

      console.log('👥 Datos de pacientes:', pacientesData);

      // Combinar datos
      const pacientesTransformados = pacientesData?.map(paciente => {
        const relacion = relaciones.find(r => r.paciente_id === paciente.user_id);
        return {
          id: paciente.user_id,
          user_id: paciente.user_id,
          nombre: paciente.nombre,
          apellido: paciente.apellido,
          email: paciente.email,
          dni: paciente.dni,
          telefono: paciente.telefono,
          activo: paciente.activo,
          created_at: relacion?.fecha_asignacion || paciente.created_at,
        };
      }) || [];

      console.log('✅ Pacientes transformados:', pacientesTransformados);
      setPacientes(pacientesTransformados);
    } catch (err) {
      console.error('💥 Error al cargar pacientes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar la lista de pacientes: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const buscarPacientes = async (termino: string) => {
    if (!termino.trim()) {
      setPacientesEncontrados([]);
      return;
    }

    try {
      setBuscando(true);
      setError(null);
      const supabase = getSupabase();

      // Obtener IDs de pacientes ya asignados a este profesional
      const pacientesAsignadosIds = pacientes.map(p => p.user_id);

      // Buscar pacientes que NO estén ya asignados a este profesional
      let query = supabase
        .from('pacientes')
        .select('*')
        .or(`nombre.ilike.%${termino}%,apellido.ilike.%${termino}%,email.ilike.%${termino}%,dni.ilike.%${termino}%`)
        .eq('activo', true)
        .limit(10);

      // Excluir pacientes ya asignados si hay alguno
      if (pacientesAsignadosIds.length > 0) {
        query = query.not('user_id', 'in', `(${pacientesAsignadosIds.map(id => `'${id}'`).join(',')})`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPacientesEncontrados(data || []);
    } catch (err) {
      console.error('Error al buscar pacientes:', err);
      setError('Error al buscar pacientes');
    } finally {
      setBuscando(false);
    }
  };

  const asignarPaciente = async (paciente: Paciente) => {
    if (!user) {
      setError('No hay usuario autenticado');
      return;
    }

    try {
      setAsignando(paciente.id);
      setError(null);
      setSuccess(null);
      const supabase = getSupabase();

      // Verificar si ya está asignado
      const { data: existingAssignment } = await supabase
        .from('paciente_profesional')
        .select('id')
        .eq('paciente_id', paciente.user_id)
        .eq('profesional_id', user.id)
        .eq('activo', true)
        .single();

      if (existingAssignment) {
        setError('Este paciente ya está asignado a usted');
        return;
      }

      // Crear nueva asignación
      const { error } = await supabase
        .from('paciente_profesional')
        .insert({
          paciente_id: paciente.user_id,
          profesional_id: user.id,
          notas: `Paciente asignado el ${new Date().toLocaleDateString()}`
        });

      if (error) throw error;

      setSuccess(`${paciente.nombre} ${paciente.apellido} ha sido asignado a su lista`);

      // Recargar la lista de pacientes y limpiar búsqueda
      await cargarPacientes();
      setTerminoBusqueda("");
      setPacientesEncontrados([]);

    } catch (err) {
      console.error('Error al asignar paciente:', err);
      setError(err instanceof Error ? err.message : 'Error al asignar paciente');
    } finally {
      setAsignando(null);
    }
  };

  // Buscar automáticamente mientras escribe
  useEffect(() => {
    const timer = setTimeout(() => {
      buscarPacientes(terminoBusqueda);
    }, 500);

    return () => clearTimeout(timer);
  }, [terminoBusqueda, pacientes]);

  if (loading) {
    return (
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Pacientes</h2>
        <p>Cargando pacientes...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Mis Pacientes</h2>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Búsqueda de pacientes */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar y Asignar Pacientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="Buscar por nombre, apellido, email o DNI..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="w-full"
            />
          </div>

          {buscando && (
            <p className="text-sm text-muted-foreground">Buscando pacientes...</p>
          )}

          {pacientesEncontrados.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Pacientes encontrados:</h4>
              {pacientesEncontrados.map((paciente) => (
                <div
                  key={paciente.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="grid gap-1">
                    <div className="font-medium">
                      {paciente.nombre} {paciente.apellido}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {paciente.email}
                    </div>
                    {paciente.dni && (
                      <div className="text-sm text-muted-foreground">
                        🆔 {paciente.dni}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => asignarPaciente(paciente)}
                    disabled={asignando === paciente.id}
                    size="sm"
                  >
                    {asignando === paciente.id ? "Asignando..." : "Asignar"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {terminoBusqueda.length > 0 && !buscando && pacientesEncontrados.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No se encontraron pacientes con ese término de búsqueda.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Lista de pacientes asignados */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Pacientes Asignados ({pacientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pacientes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No tienes pacientes asignados aún. Busca y asigna pacientes usando el buscador de arriba.
            </p>
          ) : (
            <div className="space-y-2">
              {pacientes.map((paciente) => (
                <div
                  key={paciente.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="grid gap-1">
                    <div className="font-medium">
                      {paciente.nombre} {paciente.apellido}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {paciente.email}
                    </div>
                    {paciente.telefono && (
                      <div className="text-sm text-muted-foreground">
                        📞 {paciente.telefono}
                      </div>
                    )}
                    {paciente.dni && (
                      <div className="text-sm text-muted-foreground">
                        🆔 {paciente.dni}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        alert(`Ver ficha completa de ${paciente.nombre} ${paciente.apellido}`);
                      }}
                    >
                      Ver Ficha
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        alert(`Gestionar recordatorios de ${paciente.nombre}`);
                      }}
                    >
                      Recordatorios
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
