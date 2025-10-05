import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Clock, Pill } from "lucide-react";
import type { RecordatorioCompleto } from "@shared/recordatorios";

// Función para formatear tiempo restante
function formatearTiempoRestante(segundos: number): string {
  if (segundos <= 0) return "¡Ahora!";
  
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  
  if (horas > 0) {
    return `En ${horas}h ${minutos}m`;
  } else if (minutos > 0) {
    return `En ${minutos}m`;
  } else {
    return "¡Ahora!";
  }
}

const Tile = ({ to, title, icon }: { to: string; title: string; icon: string }) => (
  <Link
    to={to}
    className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] grid place-items-center text-center"
  >
    <div className="h-16 w-16 rounded-full bg-primary/10 text-primary grid place-items-center text-3xl mb-3">
      {icon}
    </div>
    <span className="text-base font-medium">{title}</span>
  </Link>
);

export default function PacienteInicio() {
  const { user } = useAuth();
  const [recordatorios, setRecordatorios] = useState<RecordatorioCompleto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarRecordatorios();
  }, [user]);

  async function cargarRecordatorios() {
    if (!user) return;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('vista_recordatorios_completa')
      .select('*')
      .eq('user_id', user.id)
      .eq('activo', true)
      .order('proxima_toma')
      .limit(5); // Solo los próximos 5

    if (error) {
      console.error('Error al cargar recordatorios:', error);
    } else {
      setRecordatorios(data || []);
    }
    
    setLoading(false);
  }

  // Recordatorios que deben tomarse pronto (en las próximas 2 horas)
  const recordatoriosProximos = recordatorios.filter(r => 
    r.segundos_restantes !== null && r.segundos_restantes <= 7200
  );

  return (
    <div className="grid gap-6">
      {/* Encabezado común */}
      <header className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold">Panel de Control</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Accede a tus servicios de salud de forma rápida y sencilla.
        </p>
      </header>

      {/* Vista móvil: tiles grandes y fáciles de tocar (como la imagen) */}
      <section className="grid grid-cols-2 gap-4 md:hidden">
        <Tile to="/dashboard/paciente/citas" title="Mis Citas" icon="📅" />
        <Tile to="/dashboard/paciente/recetas" title="Recetas" icon="📋" />
        <Tile to="/dashboard/paciente/medicamentos" title="Medicamentos" icon="💊" />
        <Tile to="/dashboard/paciente/recordatorios" title="Recordatorios" icon="⏰" />
        <Tile to="/dashboard/paciente/mensajes" title="Mensajes" icon="✉️" />
        <Tile to="/dashboard/paciente/perfil" title="Mi Perfil" icon="�" />
      </section>

      {/* Vista escritorio/tablet: tarjetas detalladas (formato original) */}
      <section className="hidden md:grid gap-8">
        {/* Recordatorios próximos - Sección de horarios */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Tu horario de hoy
              </h2>
              <p className="text-sm text-muted-foreground">Próximas tomas programadas</p>
            </div>
            <Link 
              to="/dashboard/paciente/recordatorios" 
              className="text-sm text-primary hover:underline"
            >
              Ver todos →
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-3">
              <div className="rounded-md border p-4 animate-pulse bg-muted/20">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ) : recordatorios.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No tienes recordatorios activos</p>
                <p className="text-sm mt-1">
                  Puedes crear uno en la sección de{" "}
                  <Link to="/dashboard/paciente/recordatorios" className="text-primary hover:underline">
                    Recordatorios
                  </Link>
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {recordatorios.map((recordatorio) => {
                const debeTomar = recordatorio.segundos_restantes !== null && recordatorio.segundos_restantes <= 0;
                const esProximo = recordatorio.segundos_restantes !== null && recordatorio.segundos_restantes <= 7200; // 2 horas
                
                return (
                  <div
                    key={recordatorio.id}
                    className={`rounded-lg border p-4 flex items-center justify-between transition-colors ${
                      debeTomar 
                        ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900' 
                        : esProximo
                        ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-base">
                          {recordatorio.medicamento_nombre}
                        </p>
                        {recordatorio.creado_por_profesional_id && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            👨‍⚕️ Asignado
                          </span>
                        )}
                        {debeTomar && (
                          <Bell className="h-4 w-4 text-red-500 animate-pulse" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          <strong className="text-foreground">{recordatorio.dosis_a_tomar}</strong>
                        </span>
                        
                        {recordatorio.segundos_restantes !== null && (
                          <span className={debeTomar ? 'text-red-600 font-semibold' : 'text-foreground'}>
                            {formatearTiempoRestante(recordatorio.segundos_restantes)}
                          </span>
                        )}
                        
                        {recordatorio.tomas_restantes !== null && (
                          <span>
                            Quedan {recordatorio.tomas_restantes} tomas
                          </span>
                        )}
                      </div>

                      {recordatorio.notas && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {recordatorio.notas}
                        </p>
                      )}

                      {recordatorio.profesional_nombre && (
                        <p className="text-xs text-muted-foreground mt-1">
                          👨‍⚕️ Dr. {recordatorio.profesional_nombre} {recordatorio.profesional_apellido}
                        </p>
                      )}
                    </div>

                    <Link
                      to="/dashboard/paciente/recordatorios"
                      className={`ml-4 text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                        debeTomar
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'text-primary hover:bg-primary/10'
                      }`}
                    >
                      {debeTomar ? 'Tomar ahora' : 'Ver detalle'}
                    </Link>
                  </div>
                );
              })}

              {recordatoriosProximos.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                  <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <strong>{recordatoriosProximos.length}</strong> recordatorio(s) próximo(s) en las siguientes 2 horas
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
