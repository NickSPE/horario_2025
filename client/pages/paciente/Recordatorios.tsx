import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { useNotificacionRecordatorio } from '@/hooks/use-notificacion-recordatorio';
import { useServiceWorker } from '@/hooks/use-service-worker';
import type { MedicamentoConCategoria } from '@shared/medicamentos';
import type { RecordatorioCompleto } from '@shared/recordatorios';
import { INTERVALOS_DISPONIBLES } from '@shared/recordatorios';
import { Clock, Pill, Plus, Trash2, CheckCircle2, Timer, Bell, Play, Volume2, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Función para formatear el tiempo restante
function formatearTiempo(segundos: number) {
  if (segundos <= 0) return '¡Es hora de tomar!';
  
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = Math.floor(segundos % 60);
  
  if (horas > 0) {
    return `${horas}h ${minutos}m ${segs}s`;
  } else if (minutos > 0) {
    return `${minutos}m ${segs}s`;
  } else {
    return `${segs}s`;
  }
}

// Componente de tarjeta con temporizador
function TemporizadorCard({ 
  recordatorio, 
  onMarcarTomado, 
  onEliminar 
}: {
  recordatorio: RecordatorioCompleto;
  onMarcarTomado: (id: string) => void;
  onEliminar: (id: string) => void;
}) {
  const esAsignadoPorProfesional = !!recordatorio.creado_por_profesional_id;
  const [segundosRestantes, setSegundosRestantes] = useState(recordatorio.segundos_restantes);
  const debeTomar = segundosRestantes <= 0;
  const [yaAlarmo, setYaAlarmo] = useState(false);
  const { alarmaCompleta, reproducirAlarma } = useNotificacionRecordatorio();

  // Actualizar cuando cambie el recordatorio
  useEffect(() => {
    setSegundosRestantes(recordatorio.segundos_restantes);
    setYaAlarmo(false); // Reset cuando cambia el recordatorio
  }, [recordatorio.segundos_restantes]);

  // Temporizador que cuenta cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setSegundosRestantes(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Activar alarma cuando llegue a 0
  useEffect(() => {
    if (debeTomar && !yaAlarmo) {
      // Reproducir alarma sonora + vibración + notificación
      alarmaCompleta(recordatorio.medicamento_nombre, recordatorio.dosis_a_tomar);
      setYaAlarmo(true);
    }
  }, [debeTomar, yaAlarmo, recordatorio, alarmaCompleta]);

  // Calcular porcentaje de progreso
  const porcentajeTranscurrido = Math.max(0, Math.min(100, 
    ((recordatorio.intervalo_horas * 3600 - segundosRestantes) / (recordatorio.intervalo_horas * 3600)) * 100
  ));

  return (
    <Card className={debeTomar ? 'border-2 border-destructive animate-pulse' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl flex items-center gap-2">
                <Pill className="h-6 w-6 text-primary" />
                {recordatorio.medicamento_nombre}
              </CardTitle>
              {esAsignadoPorProfesional && (
                <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                  👨‍⚕️ Asignado por profesional
                </Badge>
              )}
            </div>
            <CardDescription className="text-base mt-1">
              {recordatorio.categoria_nombre}
              {recordatorio.profesional_nombre && (
                <span className="block text-sm text-blue-600 font-medium mt-1">
                  Dr(a). {recordatorio.profesional_nombre} {recordatorio.profesional_apellido}
                </span>
              )}
            </CardDescription>
          </div>
          {!esAsignadoPorProfesional && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEliminar(recordatorio.id)}
              className="flex-shrink-0"
              title="Eliminar recordatorio"
            >
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-base flex-wrap">
          <Badge variant="secondary" className="text-base px-3 py-1">
            {recordatorio.dosis_a_tomar}
          </Badge>
          <span className="text-muted-foreground">
            {recordatorio.intervalo_horas < 1 
              ? 'cada 10 segundos (PRUEBA)' 
              : `cada ${recordatorio.intervalo_horas}h (${Math.round(24 / recordatorio.intervalo_horas)} veces/día)`
            }
          </span>
        </div>

        {/* Contador de tomas restantes */}
        {recordatorio.tomas_totales && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Progreso del tratamiento:</span>
              <span className="text-lg font-bold text-blue-600">
                {recordatorio.tomas_completadas} / {recordatorio.tomas_totales}
              </span>
            </div>
            <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${(recordatorio.tomas_completadas / recordatorio.tomas_totales) * 100}%` }}
              />
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {recordatorio.tomas_totales - recordatorio.tomas_completadas} {recordatorio.tomas_totales - recordatorio.tomas_completadas === 1 ? 'toma restante' : 'tomas restantes'}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className={`h-5 w-5 ${debeTomar ? 'text-destructive' : 'text-primary'}`} />
              <span className="font-medium text-base">
                {debeTomar ? '¡Tomar ahora!' : 'Próxima toma en:'}
              </span>
            </div>
            <span className={`text-2xl font-bold tabular-nums ${debeTomar ? 'text-destructive' : 'text-primary'}`}>
              {formatearTiempo(segundosRestantes)}
            </span>
          </div>

          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${debeTomar ? 'bg-destructive' : 'bg-primary'}`}
              style={{ width: `${porcentajeTranscurrido}%` }}
            />
          </div>
        </div>

        {recordatorio.indicaciones && (
          <p className="text-sm text-muted-foreground border-l-2 border-primary pl-3">
            {recordatorio.indicaciones}
          </p>
        )}

        {debeTomar && (
          <Button 
            onClick={() => onMarcarTomado(recordatorio.id)}
            className="w-full gap-2 text-base min-h-[52px] animate-bounce"
            size="lg"
          >
            <CheckCircle2 className="h-6 w-6" />
            Marcar como tomado
          </Button>
        )}

        {recordatorio.ultima_toma && (
          <p className="text-xs text-muted-foreground text-center">
            Última toma: {new Date(recordatorio.ultima_toma).toLocaleString('es-ES')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Recordatorios() {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = getSupabase();
  const { solicitarPermisoNotificaciones, reproducirAlarma } = useNotificacionRecordatorio();
  const { serviceWorkerRegistered, scheduleNotification, saveRecordatorioLocal } = useServiceWorker();

  const [recordatorios, setRecordatorios] = useState<RecordatorioCompleto[]>([]);
  const [medicamentos, setMedicamentos] = useState<MedicamentoConCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [permisoNotificaciones, setPermisoNotificaciones] = useState(false);

  // Formulario
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState('');
  const [intervalo, setIntervalo] = useState('8');
  const [dosisPersonalizada, setDosisPersonalizada] = useState('');
  const [tomasTotales, setTomasTotales] = useState(''); // Nuevo: cuántas pastillas tiene
  const [notas, setNotas] = useState('');

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatos();
    verificarPermisoNotificaciones();
  }, []);

  async function verificarPermisoNotificaciones() {
    if ('Notification' in window) {
      setPermisoNotificaciones(Notification.permission === 'granted');
    }
  }

  async function activarNotificaciones() {
    const permiso = await solicitarPermisoNotificaciones();
    setPermisoNotificaciones(permiso);
    if (permiso) {
      toast({
        title: '🔔 Notificaciones activadas',
        description: 'Recibirás alertas INCLUSO con el navegador cerrado'
      });
    }
  }

  function probarAlarma() {
    reproducirAlarma();
    toast({
      title: '🔊 Probando alarma',
      description: 'Este es el sonido que escucharás cuando sea hora de tomar'
    });
  }

  // Actualizar recordatorios cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      cargarRecordatorios();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  async function cargarDatos() {
    await Promise.all([cargarMedicamentos(), cargarRecordatorios()]);
    setLoading(false);
  }

  async function cargarMedicamentos() {
    const { data, error } = await supabase
      .from('medicamentos')
      .select(`
        *,
        categoria_nombre:categorias_medicamentos(nombre)
      `)
      .order('nombre');

    if (error) {
      console.error('Error al cargar medicamentos:', error);
      return;
    }

    const medicamentosFormateados = (data || []).map((m: any) => ({
      ...m,
      categoria_nombre: m.categoria_nombre?.nombre
    }));

    setMedicamentos(medicamentosFormateados);
  }

  async function cargarRecordatorios() {
    if (!user) return;

    const { data, error } = await supabase
      .from('vista_recordatorios_completa')
      .select('*')
      .eq('user_id', user.id)
      .eq('activo', true)
      .order('proxima_toma');

    if (error) {
      console.error('Error al cargar recordatorios:', error);
      return;
    }

    setRecordatorios(data || []);
  }

  async function agregarRecordatorio(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !medicamentoSeleccionado) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debes seleccionar un medicamento'
      });
      return;
    }

    const intervaloNum = parseFloat(intervalo);
    const ahora = new Date();
    
    // Calcular próxima toma en milisegundos
    const milisegundos = intervaloNum * 60 * 60 * 1000;
    const proximaToma = new Date(ahora.getTime() + milisegundos);

    // Calcular veces al día
    const vecesAlDia = Math.round(24 / intervaloNum);

    console.log('Creando recordatorio:', {
      intervalo_horas: intervaloNum,
      proxima_toma: proximaToma.toISOString(),
      veces_al_dia: vecesAlDia
    });

    const tomasTotalesNum = tomasTotales ? parseInt(tomasTotales) : null;

    const { data, error } = await supabase
      .from('recordatorios_medicamentos')
      .insert({
        user_id: user.id,
        medicamento_id: medicamentoSeleccionado,
        intervalo_horas: intervaloNum,
        dosis_personalizada: dosisPersonalizada || null,
        tomas_totales: tomasTotalesNum,
        tomas_completadas: 0,
        notas: notas || null,
        inicio_tratamiento: ahora.toISOString(),
        proxima_toma: proximaToma.toISOString(),
        activo: true
      })
      .select();

    if (error) {
      console.error('Error al crear recordatorio:', error);
      toast({
        variant: 'destructive',
        title: 'Error al crear recordatorio',
        description: error.message || 'Verifica que hayas ejecutado el SQL en Supabase'
      });
      return;
    }

    // Programar notificación en Service Worker (funciona con navegador cerrado)
    if (data && data[0]) {
      const medicamentoInfo = medicamentos.find(m => m.id === medicamentoSeleccionado);
      await scheduleNotification(
        data[0].id,
        medicamentoInfo?.nombre || 'Medicamento',
        dosisPersonalizada || medicamentoInfo?.dosis_recomendada || 'Dosis',
        proximaToma.getTime()
      );
    }

    const intervaloTexto = intervaloNum < 1 
      ? '10 segundos' 
      : `${intervaloNum} horas`;

    toast({
      title: '✅ Recordatorio creado',
      description: serviceWorkerRegistered 
        ? `Recibirás alertas cada ${intervaloTexto} INCLUSO con navegador cerrado` 
        : `Te avisaremos cada ${intervaloTexto}. Tomarás ${vecesAlDia} veces al día`
    });

    setMedicamentoSeleccionado('');
    setIntervalo('8');
    setDosisPersonalizada('');
    setTomasTotales('');
    setNotas('');
    setMostrarFormulario(false);
    cargarRecordatorios();
  }

  async function marcarComoTomado(recordatorioId: string) {
    const recordatorio = recordatorios.find(r => r.id === recordatorioId);
    if (!recordatorio) return;

    const ahora = new Date();
    
    // IMPORTANTE: Guardar la hora programada ANTES de actualizar
    const horaProgramadaActual = recordatorio.proxima_toma;
    
    const proximaToma = new Date(ahora.getTime() + recordatorio.intervalo_horas * 60 * 60 * 1000);
    
    // Incrementar contador de tomas completadas
    const nuevasTomasCompletadas = recordatorio.tomas_completadas + 1;
    
    // Verificar si ya completó todas las tomas
    const terminoTratamiento = recordatorio.tomas_totales 
      ? nuevasTomasCompletadas >= recordatorio.tomas_totales
      : false;

    // Primero guardar en historial (antes de actualizar el recordatorio)
    const { error: errorHistorial } = await supabase
      .from('historial_tomas')
      .insert({
        recordatorio_id: recordatorioId,
        hora_programada: horaProgramadaActual, // Usar la hora guardada
        hora_real: ahora.toISOString(),
        tomado: true
      });

    if (errorHistorial) {
      console.error('Error al guardar historial:', errorHistorial);
      toast({
        variant: 'destructive',
        title: 'Error al guardar historial',
        description: errorHistorial.message
      });
      return;
    }

    // Luego actualizar el recordatorio
    const { error: errorUpdate } = await supabase
      .from('recordatorios_medicamentos')
      .update({
        ultima_toma: ahora.toISOString(),
        proxima_toma: terminoTratamiento ? null : proximaToma.toISOString(),
        tomas_completadas: nuevasTomasCompletadas,
        activo: !terminoTratamiento // Desactivar si terminó
      })
      .eq('id', recordatorioId);

    if (errorUpdate) {
      console.error('Error al actualizar recordatorio:', errorUpdate);
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: errorUpdate.message
      });
      return;
    }

    if (terminoTratamiento) {
      toast({
        title: '🎉 ¡Tratamiento completado!',
        description: `Has terminado todas las ${recordatorio.tomas_totales} tomas de ${recordatorio.medicamento_nombre}`,
        duration: 5000
      });
    } else {
      const tomasRestantes = recordatorio.tomas_totales 
        ? recordatorio.tomas_totales - nuevasTomasCompletadas
        : null;
      
      toast({
        title: '✅ Toma registrada',
        description: tomasRestantes !== null
          ? `Próxima toma en ${recordatorio.intervalo_horas} horas. Quedan ${tomasRestantes} tomas`
          : `Próxima toma en ${recordatorio.intervalo_horas} horas`
      });
    }

    cargarRecordatorios();
  }

  async function eliminarRecordatorio(id: string) {
    const { error } = await supabase
      .from('recordatorios_medicamentos')
      .update({ activo: false })
      .eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el recordatorio'
      });
      return;
    }

    toast({
      title: 'Recordatorio eliminado',
      description: 'Ya no recibirás notificaciones'
    });

    cargarRecordatorios();
  }

  const medicamentoInfo = medicamentoSeleccionado 
    ? medicamentos.find(m => m.id === medicamentoSeleccionado)
    : null;

  if (loading) {
    return <div className="text-center py-8 text-lg">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Recordatorios de Medicamentos</h2>
          <p className="text-muted-foreground text-base mt-1">
            Nunca olvides tomar tus medicamentos a tiempo
          </p>
        </div>
        <div className="flex gap-2">
          {!permisoNotificaciones && (
            <Button 
              onClick={activarNotificaciones}
              variant="outline"
              size="lg"
              className="gap-2 min-h-[52px]"
            >
              <Bell className="h-6 w-6" />
              Activar Alertas
            </Button>
          )}
          <Button 
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            size="lg"
            className="gap-2 min-h-[52px]"
          >
            <Plus className="h-6 w-6" />
            Nuevo
          </Button>
        </div>
      </div>

      {/* Alerta de notificaciones */}
      {!permisoNotificaciones && (
        <Alert>
          <Bell className="h-5 w-5" />
          <AlertDescription className="text-base">
            <div className="flex items-center justify-between gap-4">
              <div>
                <strong>Activa las notificaciones</strong> para recibir alertas <strong>incluso con el navegador cerrado</strong>
              </div>
              <div className="flex gap-2">
                <Button onClick={probarAlarma} variant="outline" size="sm" className="gap-2">
                  <Volume2 className="h-4 w-4" />
                  Probar Sonido
                </Button>
                <Button onClick={activarNotificaciones} size="sm">
                  Activar
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Estado del Service Worker */}
      {serviceWorkerRegistered && (
        <Alert className="border-green-200 bg-green-50">
          <Wifi className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-base text-green-800">
            <strong>✓ Modo offline activado:</strong> Recibirás notificaciones aunque cierres el navegador
          </AlertDescription>
        </Alert>
      )}

      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Crear Recordatorio
            </CardTitle>
            <CardDescription className="text-base">
              Selecciona un medicamento y presiona "Empezar ahora"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={agregarRecordatorio} className="space-y-4">
              <div className="space-y-2">
                <label className="text-base font-medium">Medicamento</label>
                <Select value={medicamentoSeleccionado} onValueChange={setMedicamentoSeleccionado}>
                  <SelectTrigger className="text-base min-h-[52px]">
                    <SelectValue placeholder="Selecciona un medicamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicamentos.map(med => (
                      <SelectItem key={med.id} value={med.id} className="text-base py-3">
                        {med.nombre} - {med.categoria_nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {medicamentoInfo && (
                <Alert>
                  <Pill className="h-5 w-5" />
                  <AlertDescription className="text-base space-y-1">
                    <div><strong>Dosis:</strong> {medicamentoInfo.dosis_recomendada || 'No especificada'}</div>
                    <div><strong>Vía:</strong> {medicamentoInfo.via_administracion || 'No especificada'}</div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-base font-medium">¿Cada cuánto tiempo?</label>
                <Select value={intervalo} onValueChange={setIntervalo}>
                  <SelectTrigger className="text-base min-h-[52px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVALOS_DISPONIBLES.map(int => {
                      const vecesAlDia = Math.round(24 / int.value);
                      return (
                        <SelectItem 
                          key={int.value} 
                          value={int.value.toString()} 
                          className={`text-base py-3 ${int.esPrueba ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''}`}
                        >
                          <div>
                            <div className="font-medium">{int.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {int.esPrueba ? int.ejemplo : `${vecesAlDia} ${vecesAlDia === 1 ? 'vez' : 'veces'} al día`}
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-base font-medium">Dosis personalizada (opcional)</label>
                <input
                  type="text"
                  value={dosisPersonalizada}
                  onChange={(e) => setDosisPersonalizada(e.target.value)}
                  placeholder="Ej: 2 tabletas, 5ml, etc."
                  className="w-full px-4 py-3 text-base border rounded-md min-h-[52px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-base font-medium">¿Cuántas pastillas/ampollas tienes? (opcional)</label>
                <input
                  type="number"
                  min="1"
                  value={tomasTotales}
                  onChange={(e) => setTomasTotales(e.target.value)}
                  placeholder="Ej: 20 pastillas, 10 ampollas"
                  className="w-full px-4 py-3 text-base border rounded-md min-h-[52px]"
                />
                <p className="text-sm text-muted-foreground">
                  El recordatorio se desactivará automáticamente cuando termines todas las tomas
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-base font-medium">Notas (opcional)</label>
                <Textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej: Tomar con alimentos"
                  className="text-base min-h-[80px]"
                />
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                {parseFloat(intervalo) < 1 ? (
                  <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mb-3">
                    <p className="text-sm font-bold text-yellow-800 text-center">
                      ⚠️ MODO DE PRUEBA: El temporizador será de 10 segundos
                    </p>
                  </div>
                ) : (
                  <p className="text-base text-center mb-3">
                    Tomarás <strong>{Math.round(24 / parseFloat(intervalo))} {Math.round(24 / parseFloat(intervalo)) === 1 ? 'vez' : 'veces'} al día</strong>
                    <br />
                    El temporizador <strong>empezará ahora</strong> y te avisará cada <strong>{intervalo} horas</strong>
                  </p>
                )}
                <div className="flex gap-3">
                  <Button type="submit" size="lg" className="flex-1 min-h-[52px] text-base gap-2">
                    <Play className="h-6 w-6" />
                    Empezar Ahora
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg"
                    onClick={() => setMostrarFormulario(false)}
                    className="min-h-[52px]"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {recordatorios.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              No tienes recordatorios activos
            </p>
            <p className="text-base text-muted-foreground mt-2">
              Crea uno para no olvidar tomar tus medicamentos
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recordatorios.map(recordatorio => (
            <TemporizadorCard
              key={recordatorio.id}
              recordatorio={recordatorio}
              onMarcarTomado={marcarComoTomado}
              onEliminar={eliminarRecordatorio}
            />
          ))}
        </div>
      )}
    </div>
  );
}
