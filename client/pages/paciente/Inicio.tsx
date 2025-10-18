import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Clock, Pill, Plus } from "lucide-react";
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
    <div className="grid gap-6 max-w-7xl mx-auto">
      {/* Encabezado común */}
      <header className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Panel de Control</h1>
        <p className="text-muted-foreground text-base md:text-lg mt-2">
          Accede a tus servicios de salud de forma rápida y sencilla.
        </p>
      </header>

      {/* Vista móvil: tiles grandes y fáciles de tocar (como la imagen) */}
      <section className="grid grid-cols-2 gap-4 md:hidden">
        <Tile to="/dashboard/paciente/citas" title="Mis Citas" icon="📅" />
        <Tile to="/dashboard/paciente/medicamentos" title="Medicamentos" icon="💊" />
        <Tile to="/dashboard/paciente/recordatorios" title="Recordatorios" icon="⏰" />
        <Tile to="/dashboard/paciente/mensajes" title="Mensajes" icon="✉️" />
        <Tile to="/dashboard/paciente/perfil" title="Mi Perfil" icon="👤" />
      </section>

      {/* Vista escritorio/tablet: tarjetas detalladas (formato original) */}
      <section className="hidden md:grid gap-8">
        {/* Recordatorios próximos - Sección de horarios */}
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                Tu horario de hoy
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Próximas tomas programadas</p>
            </div>
            <Link 
              to="/dashboard/paciente/recordatorios" 
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              Ver todos →
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-lg border p-5 animate-pulse bg-muted/20">
                  <div className="h-5 bg-muted rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : recordatorios.length === 0 ? (
            <div className="text-center py-12 px-6 bg-muted/30 rounded-lg border-2 border-dashed">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <Pill className="h-12 w-12 text-primary/50" />
              </div>
              <p className="font-semibold text-lg mb-2">No tienes recordatorios activos</p>
              <p className="text-sm text-muted-foreground mb-4">
                Crea recordatorios para no olvidar tus medicamentos
              </p>
              <Link 
                to="/dashboard/paciente/recordatorios" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Crear recordatorio
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {recordatorios.map((recordatorio) => {
                const debeTomar = recordatorio.segundos_restantes !== null && recordatorio.segundos_restantes <= 0;
                const esProximo = recordatorio.segundos_restantes !== null && recordatorio.segundos_restantes <= 7200; // 2 horas
                
                return (
                  <div
                    key={recordatorio.id}
                    className={`rounded-xl border-2 p-5 flex items-center justify-between transition-all hover:shadow-md ${
                      debeTomar 
                        ? 'bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-800 shadow-lg' 
                        : esProximo
                        ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-800'
                        : 'bg-card hover:border-primary/50'
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
                      className={`ml-4 text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-sm ${
                        debeTomar
                          ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md'
                      }`}
                    >
                      {debeTomar ? '⏰ Tomar ahora' : 'Ver detalle →'}
                    </Link>
                  </div>
                );
              })}

              {recordatoriosProximos.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl border-2 border-blue-300 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <strong className="text-base">{recordatoriosProximos.length}</strong> recordatorio(s) próximo(s) en las siguientes 2 horas
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
