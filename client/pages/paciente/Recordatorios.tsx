import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useNotificacionRecordatorio } from '@/hooks/use-notificacion-recordatorio';
import { useServiceWorker } from '@/hooks/use-service-worker';
import { useToast } from '@/hooks/use-toast';
import { getSupabase } from '@/lib/supabase';
import type { MedicamentoConCategoria } from '@shared/medicamentos';
import type { RecordatorioCompleto, TipoSonido } from '@shared/recordatorios';
import { CONFIGURACION_ALARMA, INTERVALOS_DISPONIBLES, SONIDOS_ALARMA } from '@shared/recordatorios';
import { Bell, CheckCircle2, ChevronDown, ChevronUp, Clock, Pill, Play, Plus, Settings, Timer, Trash2, Volume2, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

// Función para formatear el tiempo restante
const formatearTiempo = (segundos: number) => {
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

const agregarCalendar = ({
  title,
  description,
  startDate,
  endDate,
}: {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}) => {
  // Formato ISO sin guiones, dos puntos ni milisegundos
  const start = startDate.toISOString().replace(/-|:|\.\d+/g, '');
  const end = endDate.toISOString().replace(/-|:|\.\d+/g, '');

  // Parámetros esperados por Google Calendar
  const details = {
    text: title,
    details: description || '',
    dates: `${start}/${end}`,
  };

  const queryString = new URLSearchParams(details).toString();
  const url = `https://www.google.com/calendar/render?action=TEMPLATE&${queryString}`;
  window.open(url, '_blank');
};

// Componente de tarjeta con temporizador
const TemporizadorCard = ({
  recordatorio,
  onMarcarTomado,
  onEliminar,
  onMarcarNoTomado,
  tipoSonido = 'beep',
  audioUrl
}: {
  recordatorio: RecordatorioCompleto;
  onMarcarTomado: (id: string) => void;
  onEliminar: (id: string) => void;
  onMarcarNoTomado: (id: string) => void;
  tipoSonido?: TipoSonido;
  audioUrl?: string;
}) => {
  const esAsignadoPorProfesional = !!recordatorio.creado_por_profesional_id;
  const estaInactivo = !recordatorio.activo;
  const [segundosRestantes, setSegundosRestantes] = useState(recordatorio.segundos_restantes);
  const debeTomar = segundosRestantes <= 0;
  const [yaAlarmo, setYaAlarmo] = useState(false);
  const [segundosDesdeAlarma, setSegundosDesdeAlarma] = useState(0);
  const [recienActivado, setRecienActivado] = useState(false); // Evitar alarma inmediata tras activar
  const { alarmaCompleta, detenerAlarma } = useNotificacionRecordatorio();

  // Actualizar cuando cambie el recordatorio
  useEffect(() => {
    setSegundosRestantes(recordatorio.segundos_restantes);
    setYaAlarmo(false); // Reset cuando cambia el recordatorio
    setSegundosDesdeAlarma(0); // Reset contador de auto-avance

    // Si el recordatorio está activo pero segundosRestantes > 0, significa que recién se activó
    // Marcamos como recienActivado para evitar alarma inmediata
    // NOTA: Con el nuevo sistema, la primera activación queda en tomas_completadas = 0
    if (recordatorio.activo && recordatorio.segundos_restantes > 0 && recordatorio.tomas_completadas === 0) {
      setRecienActivado(true);
      // Después de 2 segundos, permitir alarmas normales
      setTimeout(() => setRecienActivado(false), 2000);
    }
  }, [recordatorio.segundos_restantes, recordatorio.activo, recordatorio.tomas_completadas]);

  // Temporizador que cuenta cada segundo (solo si está activo)
  useEffect(() => {
    if (estaInactivo) return; // No contar si está inactivo

    const interval = setInterval(() => {
      setSegundosRestantes(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [estaInactivo]);

  // Contador de tiempo desde que sonó la alarma (para auto-avance)
  useEffect(() => {
    if (!debeTomar || !yaAlarmo || estaInactivo) return;

    const interval = setInterval(() => {
      setSegundosDesdeAlarma(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [debeTomar, yaAlarmo, estaInactivo]);

  // Auto-avance: Si pasan 5 minutos sin marcar como tomado, marcar como NO tomado
  useEffect(() => {
    if (segundosDesdeAlarma >= 300) { // 5 minutos = 300 segundos
      console.log('Auto-avance: 5 minutos sin respuesta, marcando como NO tomado');
      detenerAlarma(); // Detener la alarma
      onMarcarNoTomado(recordatorio.id);
    }
  }, [segundosDesdeAlarma, recordatorio.id, onMarcarNoTomado, detenerAlarma]);

  // Activar alarma cuando llegue a 0 (solo si está activo Y tiene al menos 1 toma completada)
  useEffect(() => {
    if (estaInactivo) return; // No alarmar si está inactivo
    if (recienActivado) return; // No alarmar si recién se activó (primera toma)

    // La alarma debe sonar desde la SEGUNDA toma en adelante
    // Si tomas_completadas = 0, está esperando primera toma (no suena)
    // Si tomas_completadas >= 1, ya tomó la primera, ahora debe sonar
    // PERO solo si debeTomar es true (segundosRestantes <= 0)
    if (recordatorio.tomas_completadas < 1) return;

    // IMPORTANTE: debeTomar significa que segundosRestantes <= 0
    // Esto evita que suene inmediatamente después de tomar la primera dosis
    // porque segundosRestantes será > 0 (el intervalo completo)
    if (debeTomar && !yaAlarmo) {
      // Reproducir alarma sonora + vibración + notificación
      alarmaCompleta(recordatorio.medicamento_nombre, recordatorio.dosis_a_tomar, tipoSonido, audioUrl);
      setYaAlarmo(true);
    }
  }, [debeTomar, yaAlarmo, recordatorio.tomas_completadas, recordatorio.medicamento_nombre, recordatorio.dosis_a_tomar, alarmaCompleta, estaInactivo, recienActivado, tipoSonido, audioUrl]);

  // Calcular porcentaje de progreso
  const porcentajeTranscurrido = Math.max(0, Math.min(100,
    ((recordatorio.intervalo_horas * 3600 - segundosRestantes) / (recordatorio.intervalo_horas * 3600)) * 100
  ));

  // Si está inactivo y NO ha tomado ninguna dosis, mostrar tarjeta especial (esperando primera toma)
  if (estaInactivo && recordatorio.tomas_completadas === 0) {
    return (
      <Card className="border-2 border-yellow-500 bg-yellow-50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Pill className="h-6 w-6 text-yellow-600" />
                  {recordatorio.medicamento_nombre}
                </CardTitle>
                <Badge variant="outline" className="border-yellow-600 text-yellow-700 bg-yellow-100">
                  🕑 Esperando toma inicial
                </Badge>
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
            <Badge variant="secondary" className="text-base px-3 py-1 bg-yellow-100">
              {recordatorio.dosis_a_tomar}
            </Badge>
            <span className="text-muted-foreground">
              {recordatorio.intervalo_horas < 1
                ? 'cada 10 segundos (PRUEBA)'
                : `cada ${recordatorio.intervalo_horas}h (${Math.round(24 / recordatorio.intervalo_horas)} veces/día)`
              }
            </span>
          </div>

          {recordatorio.tomas_totales && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-900">Tomas programadas:</span>
                <span className="text-lg font-bold text-yellow-700">
                  {recordatorio.tomas_totales} tomas
                </span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Toma inicial (sin alarma) + {recordatorio.tomas_totales} tomas con alarma
              </p>
            </div>
          )}

          <div className="bg-yellow-200 border-2 border-yellow-400 rounded-lg p-4">
            <p className="text-sm font-semibold text-yellow-900 mb-2">
              👉 Para activar este recordatorio:
            </p>
            <p className="text-sm text-yellow-800 mb-2">
              Toma tu dosis AHORA y haz clic en el botón de abajo. Esta es tu <strong>toma inicial</strong> (no cuenta para el progreso).
            </p>
            <p className="text-xs text-yellow-700 font-medium">
              ⚠️ Importante: NO sonará alarma ahora porque ya tomaste la dosis. Las alarmas comenzarán para las siguientes tomas.
            </p>
          </div>

          {recordatorio.notas && (
            <p className="text-sm text-muted-foreground border-l-2 border-yellow-500 pl-3">
              {recordatorio.notas}
            </p>
          )}

          <Button
            onClick={() => onMarcarTomado(recordatorio.id)}
            className="w-full gap-2 text-base min-h-[52px] bg-yellow-600 hover:bg-yellow-700"
            size="lg"
          >
            <CheckCircle2 className="h-6 w-6" />
            Ya tomé mi dosis inicial - Activar alarmas
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Recordatorio activo normal
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
          <>
            {yaAlarmo && segundosDesdeAlarma > 0 && (
              <Alert className="border-orange-500 bg-orange-50">
                <Timer className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>⚠️ Advertencia:</strong> Si no marcas como tomado en{' '}
                  <strong>{formatearTiempo(300 - segundosDesdeAlarma)}</strong>,
                  se marcará automáticamente como NO TOMADO y avanzará a la siguiente toma.
                </AlertDescription>
              </Alert>
            )}
            <Button
              onClick={() => {
                detenerAlarma();
                onMarcarTomado(recordatorio.id);
              }}
              className="w-full gap-2 text-base min-h-[52px] animate-bounce"
              size="lg"
            >
              <CheckCircle2 className="h-6 w-6" />
              Marcar como tomado
            </Button>
          </>
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
  const [tipoSonidoSeleccionado, setTipoSonidoSeleccionado] = useState<TipoSonido>(() => {
    // Cargar preferencia de sonido desde localStorage
    const sonidoGuardado = localStorage.getItem('preferenciaSonidoAlarma');
    return (sonidoGuardado as TipoSonido) || 'beep';
  });
  // DESACTIVADO TEMPORALMENTE: Audio personalizado
  // const [audioPersonalizadoUrl, setAudioPersonalizadoUrl] = useState<string>('');
  // const [subiendoAudio, setSubiendoAudio] = useState(false);

  // Estados para secciones colapsables
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);

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
    // DESACTIVADO TEMPORALMENTE: Cargar audio personalizado
    // const audioGuardado = localStorage.getItem('audioPersonalizadoUrl');
    // if (audioGuardado) {
    //   setAudioPersonalizadoUrl(audioGuardado);
    // }
  }, []);

  // Guardar preferencia de sonido cuando cambie
  useEffect(() => {
    localStorage.setItem('preferenciaSonidoAlarma', tipoSonidoSeleccionado);
  }, [tipoSonidoSeleccionado]);

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
        title: ' Notificaciones activadas',
        description: 'Recibirás alertas INCLUSO con el navegador cerrado'
      });
    }
  }

  function probarAlarma() {
    // DESACTIVADO TEMPORALMENTE: Audio personalizado
    // const audioUrl = tipoSonidoSeleccionado === 'personalizado' ? audioPersonalizadoUrl : undefined;
    // reproducirAlarma(tipoSonidoSeleccionado, audioUrl);
    reproducirAlarma(tipoSonidoSeleccionado);
    const sonidoInfo = SONIDOS_ALARMA.find(s => s.value === tipoSonidoSeleccionado);
    toast({
      title: 'Probando alarma',
      description: `Sonido: ${sonidoInfo?.label} - ${sonidoInfo?.descripcion}`
    });
  }

  // DESACTIVADO TEMPORALMENTE: Función de subir audio personalizado
  /*
  async function subirAudioPersonalizado(archivo: File) {
    if (!user) return;

    setSubiendoAudio(true);

    try {
      // Validar tipo de archivo
      if (!archivo.type.startsWith('audio/')) {
        toast({
          title: 'Error',
          description: 'Solo se permiten archivos de audio (MP3, WAV, OGG, etc.)',
          variant: 'destructive'
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'El archivo no debe superar 5MB',
          variant: 'destructive'
        });
        return;
      }

      // Subir a Supabase Storage
      const nombreArchivo = `${user.id}/alarma-${Date.now()}.${archivo.name.split('.').pop()}`;
      const { data, error } = await supabase.storage
        .from('audio-alarmas')
        .upload(nombreArchivo, archivo, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error al subir audio:', error);
        toast({
          title: 'Error al subir audio',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('audio-alarmas')
        .getPublicUrl(nombreArchivo);

      setAudioPersonalizadoUrl(urlData.publicUrl);
      localStorage.setItem('audioPersonalizadoUrl', urlData.publicUrl);
      setTipoSonidoSeleccionado('personalizado');

      toast({
        title: '✅ Audio cargado',
        description: 'Tu sonido personalizado está listo'
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el audio',
        variant: 'destructive'
      });
    } finally {
      setSubiendoAudio(false);
    }
  }
  */

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
      .filter("categoria_nombre.nombre", "in", '("Analgésicos","Antibióticos","Tuberculosis")')

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
      .order('activo', { ascending: false })
      .order('proxima_toma');

    if (error) {
      console.error('Error al cargar recordatorios:', error);
      return;
    }

    // Filtrar: mostrar solo activos o inactivos que esperan primera toma
    const recordatoriosFiltrados = (data || []).filter(r =>
      r.activo || (!r.activo && r.tomas_completadas === 0)
    );

    setRecordatorios(recordatoriosFiltrados);
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
      title: 'Recordatorio creado',
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
    const esPrimeraToma = !recordatorio.activo && recordatorio.tomas_completadas === 0;

    // IMPORTANTE: Para la primera toma, ya tomó la pastilla AHORA
    // La próxima toma debe ser después del intervalo completo
    // Ejemplo: Si toma cada 8h, próxima toma es en 8h (no debe sonar ahora)
    const proximaToma = new Date(ahora.getTime() + recordatorio.intervalo_horas * 60 * 60 * 1000);

    // CLAVE: En la primera activación NO incrementar contador (queda en 0)
    // Esto evita que suene la alarma (solo suena cuando tomas_completadas >= 1)
    // En las siguientes tomas SÍ incrementa normalmente
    const nuevasTomasCompletadas = esPrimeraToma ? 0 : recordatorio.tomas_completadas + 1;

    // Verificar si ya completó todas las tomas
    const terminoTratamiento = recordatorio.tomas_totales
      ? nuevasTomasCompletadas >= recordatorio.tomas_totales
      : false;

    // Guardar en historial (usar ahora como hora_programada si es primera toma)
    const horaProgramada = esPrimeraToma ? ahora.toISOString() : (recordatorio.proxima_toma || ahora.toISOString());

    const { error: errorHistorial } = await supabase
      .from('historial_tomas')
      .insert({
        recordatorio_id: recordatorioId,
        hora_programada: horaProgramada,
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

    // Actualizar el recordatorio
    const updateData: any = {
      ultima_toma: ahora.toISOString(),
      proxima_toma: terminoTratamiento ? null : proximaToma.toISOString(),
      tomas_completadas: nuevasTomasCompletadas,
      activo: esPrimeraToma ? true : !terminoTratamiento // Activar en primera toma, desactivar si terminó
    };

    // Solo establecer inicio_tratamiento en la primera toma
    if (esPrimeraToma) {
      updateData.inicio_tratamiento = ahora.toISOString();
    }

    const { error: errorUpdate } = await supabase
      .from('recordatorios_medicamentos')
      .update(updateData)
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

    // Actualización optimista del estado local para UI inmediata
    setRecordatorios(prev => {
      const updated = prev.map(r => {
        if (r.id === recordatorioId) {
          return {
            ...r,
            activo: esPrimeraToma ? true : !terminoTratamiento,
            tomas_completadas: nuevasTomasCompletadas,
            ultima_toma: ahora.toISOString(),
            proxima_toma: terminoTratamiento ? null : proximaToma.toISOString(),
            segundos_restantes: terminoTratamiento ? 0 : recordatorio.intervalo_horas * 3600,
            inicio_tratamiento: esPrimeraToma ? ahora.toISOString() : r.inicio_tratamiento
          };
        }
        return r;
      });

      // Filtrar: mantener solo activos o inactivos que NO han sido activados
      return updated.filter(r =>
        r.activo || (!r.activo && r.tomas_completadas === 0)
      );
    });

    if (terminoTratamiento) {
      toast({
        title: '🎉 ¡Tratamiento completado!',
        description: `Has terminado todas las ${recordatorio.tomas_totales} tomas de ${recordatorio.medicamento_nombre}`,
        duration: 5000
      });
    } else if (esPrimeraToma) {
      toast({
        title: '✅ Tratamiento iniciado',
        description: `Primera dosis tomada. La alarma sonará en ${recordatorio.intervalo_horas} horas para recordarte la siguiente toma`,
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

    // Forzar una segunda recarga después de 500ms para asegurar que la UI se actualice
    // Esto soluciona problemas de cache en la vista de Supabase
    setTimeout(() => {
      cargarRecordatorios();
    }, 500);
  }

  // Marcar como NO tomado (auto-avance después de 5 minutos)
  async function marcarComoNoTomado(recordatorioId: string) {
    const recordatorio = recordatorios.find(r => r.id === recordatorioId);
    if (!recordatorio) return;

    const ahora = new Date();
    const proximaToma = new Date(ahora.getTime() + recordatorio.intervalo_horas * 60 * 60 * 1000);

    // Guardar en historial como NO tomado
    const { error: errorHistorial } = await supabase
      .from('historial_tomas')
      .insert({
        recordatorio_id: recordatorioId,
        hora_programada: recordatorio.proxima_toma || ahora.toISOString(),
        hora_real: ahora.toISOString(),
        tomado: false,
        notas: 'Auto-avance: No se marcó como tomado en 5 minutos'
      });

    if (errorHistorial) {
      console.error('Error al guardar historial de NO tomado:', errorHistorial);
    }

    // Actualizar próxima toma sin incrementar contador
    const { error: errorUpdate } = await supabase
      .from('recordatorios_medicamentos')
      .update({
        proxima_toma: proximaToma.toISOString(),
      })
      .eq('id', recordatorioId);

    if (errorUpdate) {
      console.error('Error al actualizar recordatorio:', errorUpdate);
    }

    toast({
      title: '⏭️ Toma omitida',
      description: `No se marcó como tomado en 5 minutos. Próxima alarma en ${recordatorio.intervalo_horas} horas`,
      variant: 'destructive',
      duration: 7000
    });

    cargarRecordatorios();
  }

  async function eliminarRecordatorio(id: string) {
    const recordatorio = recordatorios.find(r => r.id === id);

    // Si el recordatorio está activo, pedir confirmación
    if (recordatorio?.activo) {
      const confirmar = window.confirm(
        `¿Estás seguro de eliminar el recordatorio de "${recordatorio.medicamento_nombre}"?\n\nEste recordatorio está activo y ya tiene ${recordatorio.tomas_completadas} tomas registradas.`
      );
      if (!confirmar) return;
    }

    // Si está INACTIVO (esperando primera toma), ELIMINAR físicamente
    // Si está ACTIVO, solo desactivar
    const esInactivo = !recordatorio?.activo;

    const { error } = esInactivo
      ? await supabase.from('recordatorios_medicamentos').delete().eq('id', id)
      : await supabase.from('recordatorios_medicamentos').update({ activo: false }).eq('id', id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el recordatorio'
      });
      return;
    }

    // Actualización optimista: eliminar del estado local inmediatamente
    setRecordatorios(prev => prev.filter(r => r.id !== id));

    toast({
      title: 'Recordatorio eliminado',
      description: esInactivo
        ? 'El recordatorio ha sido eliminado completamente'
        : 'Ya no recibirás notificaciones'
    });

    // Recargar después para confirmar
    setTimeout(() => cargarRecordatorios(), 500);
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

      {/* Sección colapsable de configuración */}
      <Collapsible open={mostrarConfiguracion} onOpenChange={setMostrarConfiguracion}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <CardTitle className="text-lg">Configuración</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={permisoNotificaciones ? "default" : "secondary"}>
                    {permisoNotificaciones ? "✓ Activo" : "Configurar"}
                  </Badge>
                  {mostrarConfiguracion ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </div>
              <CardDescription>
                Notificaciones y sonidos de alarma
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              {/* Alerta de notificaciones */}
              {!permisoNotificaciones && (
                <Alert>
                  <Bell className="h-5 w-5" />
                  <AlertDescription className="text-base">
                    <div className="flex flex-col gap-3">
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

              {/* Selector de sonido de alarma */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Sonido de Alarma
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Elige el sonido que escucharás cuando sea hora de tomar tu medicamento
                  </p>
                </div>

                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Select
                      value={tipoSonidoSeleccionado}
                      onValueChange={(value) => setTipoSonidoSeleccionado(value as TipoSonido)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SONIDOS_ALARMA.map((sonido) => (
                          <SelectItem key={sonido.value} value={sonido.value}>
                            <div className="flex flex-col">
                              <span>{sonido.label}</span>
                              <span className="text-xs text-muted-foreground">{sonido.descripcion}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={probarAlarma} variant="default" className="gap-2" size="sm">
                    <Play className="h-4 w-4" />
                    Probar
                  </Button>
                </div>

                {/* DESACTIVADO TEMPORALMENTE: Subir audio personalizado
                {tipoSonidoSeleccionado === 'personalizado' && (
                  <div className="mt-4 p-4 border rounded-lg bg-muted/50 space-y-3">
                    // ... código comentado
                  </div>
                )}
                */}

                <Alert>
                  <Timer className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>📢 Duración:</strong> La alarma sonará durante <strong>{CONFIGURACION_ALARMA.DURACION_ALARMA_SEGUNDOS} segundos</strong>
                    {' '}y se repetirá cada 3 segundos hasta que marques como tomado.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Estado del Service Worker */}
      {
        serviceWorkerRegistered && (
          <Alert className="border-green-200 bg-green-50">
            <Wifi className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-base text-green-800">
              <strong>✓ Modo offline activado:</strong> Recibirás notificaciones aunque cierres el navegador
            </AlertDescription>
          </Alert>
        )
      }

      {
        mostrarFormulario && (
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
        )
      }

      {
        recordatorios.length === 0 ? (
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
                onMarcarNoTomado={marcarComoNoTomado}
                tipoSonido={tipoSonidoSeleccionado}
              />
            ))}
          </div>
        )
      }
    </div >
  );
}
