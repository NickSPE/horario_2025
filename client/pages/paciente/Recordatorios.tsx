import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import type { MedicamentoConCategoria } from '@shared/medicamentos';
import type { RecordatorioCompleto } from '@shared/recordatorios';
import { INTERVALOS_DISPONIBLES } from '@shared/recordatorios';
import { Clock, Pill, Plus, Trash2, CheckCircle2, Timer, Bell, Play } from 'lucide-react';
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
  const [segundosRestantes, setSegundosRestantes] = useState(recordatorio.segundos_restantes);
  const debeTomar = segundosRestantes <= 0;

  // Actualizar cuando cambie el recordatorio
  useEffect(() => {
    setSegundosRestantes(recordatorio.segundos_restantes);
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

  // Calcular porcentaje de progreso
  const porcentajeTranscurrido = Math.max(0, Math.min(100, 
    ((recordatorio.intervalo_horas * 3600 - segundosRestantes) / (recordatorio.intervalo_horas * 3600)) * 100
  ));

  return (
    <Card className={debeTomar ? 'border-2 border-destructive animate-pulse' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Pill className="h-6 w-6 text-primary" />
              {recordatorio.medicamento_nombre}
            </CardTitle>
            <CardDescription className="text-base mt-1">
              {recordatorio.categoria_nombre}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEliminar(recordatorio.id)}
            className="flex-shrink-0"
          >
            <Trash2 className="h-5 w-5 text-destructive" />
          </Button>
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
            className="w-full gap-2 text-base min-h-[52px]"
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

  const [recordatorios, setRecordatorios] = useState<RecordatorioCompleto[]>([]);
  const [medicamentos, setMedicamentos] = useState<MedicamentoConCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Formulario
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState('');
  const [intervalo, setIntervalo] = useState('8');
  const [dosisPersonalizada, setDosisPersonalizada] = useState('');
  const [notas, setNotas] = useState('');

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

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

    const { data, error } = await supabase
      .from('recordatorios_medicamentos')
      .insert({
        user_id: user.id,
        medicamento_id: medicamentoSeleccionado,
        intervalo_horas: intervaloNum,
        dosis_personalizada: dosisPersonalizada || null,
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

    const intervaloTexto = intervaloNum < 1 
      ? '10 segundos' 
      : `${intervaloNum} horas`;

    toast({
      title: '¡Recordatorio creado!',
      description: `Empezará ahora. Tomarás ${vecesAlDia} veces al día (cada ${intervaloTexto})`
    });

    setMedicamentoSeleccionado('');
    setIntervalo('8');
    setDosisPersonalizada('');
    setNotas('');
    setMostrarFormulario(false);
    cargarRecordatorios();
  }

  async function marcarComoTomado(recordatorioId: string) {
    const recordatorio = recordatorios.find(r => r.id === recordatorioId);
    if (!recordatorio) return;

    const ahora = new Date();
    const proximaToma = new Date(ahora.getTime() + recordatorio.intervalo_horas * 60 * 60 * 1000);

    const { error: errorUpdate } = await supabase
      .from('recordatorios_medicamentos')
      .update({
        ultima_toma: ahora.toISOString(),
        proxima_toma: proximaToma.toISOString()
      })
      .eq('id', recordatorioId);

    const { error: errorHistorial } = await supabase
      .from('historial_tomas')
      .insert({
        recordatorio_id: recordatorioId,
        hora_programada: recordatorio.proxima_toma,
        hora_real: ahora.toISOString(),
        tomado: true
      });

    if (errorUpdate || errorHistorial) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo registrar la toma'
      });
      return;
    }

    toast({
      title: '¡Toma registrada!',
      description: `Próxima toma en ${recordatorio.intervalo_horas} horas`
    });

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
        <Button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          size="lg"
          className="gap-2 min-h-[52px]"
        >
          <Plus className="h-6 w-6" />
          Nuevo Recordatorio
        </Button>
      </div>

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
