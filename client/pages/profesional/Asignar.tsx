import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { Paciente, PacienteAsignado, PacienteConRecordatorios } from '@/lib/pacients';
import { getSupabase } from '@/lib/supabase';
import type { MedicamentoConCategoria } from '@shared/medicamentos';
import { INTERVALOS_DISPONIBLES } from '@shared/recordatorios';
import { CheckCircle2, Clock, Pill, Plus, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';


export default function AsignarRecordatorios() {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = getSupabase();

  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<Paciente[]>([]);
  const [pacientesAsignados, setPacientesAsignados] = useState<PacienteAsignado[]>([]);
  const [pacientesConRecordatorios, setPacientesConRecordatorios] = useState<PacienteConRecordatorios[]>([]);
  const [medicamentos, setMedicamentos] = useState<MedicamentoConCategoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'al_dia' | 'atrasados' | 'completados'>('todos');

  // Dialog para asignar recordatorio
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteAsignado | null>(null);

  // Formulario de recordatorio
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState('');
  const [intervalo, setIntervalo] = useState('8');
  const [dosisPersonalizada, setDosisPersonalizada] = useState('');
  const [tomasTotales, setTomasTotales] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  // Búsqueda automática con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (busqueda.trim().length >= 2) {
        buscarPacientes();
      } else {
        setResultadosBusqueda([]);
      }
    }, 500); // Espera 500ms después de dejar de escribir

    return () => clearTimeout(timer);
  }, [busqueda]);

  async function cargarDatos() {
    await Promise.all([
      cargarPacientesAsignados(),
      cargarPacientesConRecordatorios(),
      cargarMedicamentos()
    ]);
  }

  async function cargarPacientesConRecordatorios() {
    if (!user) return;

    const { data, error } = await supabase
      .from('vista_pacientes_recordatorios_profesional')
      .select('*')
      .eq('profesional_id', user.id);

    if (error) {
      console.error('Error al cargar pacientes con recordatorios:', error);
      return;
    }

    // Agrupar recordatorios por paciente
    const pacientesMap = new Map<string, PacienteConRecordatorios>();

    (data || []).forEach((row: any) => {
      const pacienteId = row.paciente_id;

      if (!pacientesMap.has(pacienteId)) {
        pacientesMap.set(pacienteId, {
          paciente_id: row.paciente_id,
          paciente_nombre: row.paciente_nombre,
          paciente_apellido: row.paciente_apellido,
          paciente_email: row.paciente_email,
          paciente_dni: row.paciente_dni,
          paciente_telefono: row.paciente_telefono,
          total_recordatorios: 0,
          recordatorios_al_dia: 0,
          recordatorios_atrasados: 0,
          recordatorios_completados: 0,
          recordatorios: []
        });
      }

      const paciente = pacientesMap.get(pacienteId)!;

      if (row.recordatorio_id) {
        paciente.recordatorios.push({
          recordatorio_id: row.recordatorio_id,
          medicamento_nombre: row.medicamento_nombre,
          categoria_nombre: row.categoria_nombre,
          intervalo_horas: row.intervalo_horas,
          dosis_a_tomar: row.dosis_a_tomar,
          tomas_totales: row.tomas_totales,
          tomas_completadas: row.tomas_completadas,
          tomas_restantes: row.tomas_restantes,
          ultima_toma: row.ultima_toma,
          proxima_toma: row.proxima_toma,
          estado_recordatorio: row.estado_recordatorio,
          porcentaje_adherencia: row.porcentaje_adherencia,
          horas_hasta_proxima_toma: row.horas_hasta_proxima_toma,
          notas: row.notas
        });

        paciente.total_recordatorios++;
        if (row.estado_recordatorio === 'al_dia') paciente.recordatorios_al_dia++;
        if (row.estado_recordatorio === 'atrasado') paciente.recordatorios_atrasados++;
        if (row.estado_recordatorio === 'completado') paciente.recordatorios_completados++;
      }
    });

    // Calcular adherencia promedio
    pacientesMap.forEach(paciente => {
      const adherencias = paciente.recordatorios
        .map(r => r.porcentaje_adherencia)
        .filter((a): a is number => a !== undefined && a !== null);

      if (adherencias.length > 0) {
        paciente.adherencia_promedio = Math.round(
          adherencias.reduce((sum, a) => sum + a, 0) / adherencias.length
        );
      }
    });

    setPacientesConRecordatorios(Array.from(pacientesMap.values()));
  }

  async function cargarMedicamentos() {
    const { data, error } = await supabase
      .from('medicamentos')
      .select(`
        *,
        categoria_nombre:categorias_medicamentos(nombre)
      `)
      .filter('categoria_nombre.nombre', 'in', '("Hipertensión","Diabetes","Tuberculosis")')

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

  async function cargarPacientesAsignados() {
    if (!user) return;

    const { data, error } = await supabase
      .from('vista_pacientes_profesional')
      .select('*')
      .eq('profesional_id', user.id)
      .eq('activo', true)
      .order('fecha_asignacion', { ascending: false });

    if (error) {
      console.error('Error al cargar pacientes asignados:', error);
      return;
    }

    setPacientesAsignados(data || []);
  }

  async function buscarPacientes() {
    if (!busqueda.trim() || busqueda.length < 2) {
      setResultadosBusqueda([]);
      return;
    }

    setLoading(true);
    console.log('🔍 Buscando pacientes con término:', busqueda);

    try {
      const { data, error } = await supabase.rpc('buscar_pacientes', {
        termino: busqueda
      });

      console.log('📊 Resultados de búsqueda:', { data, error });

      if (error) {
        console.error('❌ Error al buscar pacientes:', error);
        toast({
          variant: 'destructive',
          title: 'Error en la búsqueda',
          description: error.message
        });
        setResultadosBusqueda([]);
      } else {
        console.log(`✅ Encontrados ${data?.length || 0} pacientes`);
        setResultadosBusqueda(data || []);

        if ((data || []).length === 0) {
          toast({
            title: 'Sin resultados',
            description: `No se encontraron pacientes con "${busqueda}"`
          });
        }
      }
    } catch (err) {
      console.error('💥 Error inesperado:', err);
      toast({
        variant: 'destructive',
        title: 'Error inesperado',
        description: String(err)
      });
      setResultadosBusqueda([]);
    } finally {
      setLoading(false);
    }
  }

  async function asignarPaciente(pacienteId: string) {
    if (!user) return;

    const { error } = await supabase
      .from('paciente_profesional')
      .insert({
        paciente_id: pacienteId,
        profesional_id: user.id,
        activo: true
      });

    if (error) {
      console.error('Error al asignar paciente:', error);
      toast({
        variant: 'destructive',
        title: 'Error al asignar',
        description: error.message
      });
      return;
    }

    toast({
      title: '✅ Paciente asignado',
      description: 'Ahora puedes crear recordatorios para este paciente'
    });

    await cargarPacientesAsignados();
    await buscarPacientes(); // Actualizar lista
  }

  async function asignarYCrearRecordatorio(paciente: Paciente) {
    if (!user) return;

    // Primero asignar el paciente si no está asignado
    if (!paciente.esta_asignado) {
      const { error } = await supabase
        .from('paciente_profesional')
        .insert({
          paciente_id: paciente.user_id,
          profesional_id: user.id,
          activo: true
        });

      if (error) {
        console.error('Error al asignar paciente:', error);
        toast({
          variant: 'destructive',
          title: 'Error al asignar',
          description: error.message
        });
        return;
      }

      await cargarPacientesAsignados();
      await buscarPacientes();
    }

    // Convertir Paciente a PacienteAsignado para abrir el dialog
    const pacienteParaDialog: PacienteAsignado = {
      relacion_id: '', // No lo necesitamos para crear
      paciente_id: paciente.user_id,
      paciente_email: paciente.email,
      paciente_nombre: paciente.nombre,
      paciente_apellido: paciente.apellido,
      paciente_telefono: paciente.telefono,
      paciente_dni: paciente.dni,
      fecha_asignacion: new Date().toISOString(),
      recordatorios_activos: 0
    };

    setPacienteSeleccionado(pacienteParaDialog);
    setDialogAbierto(true);
  }

  async function crearRecordatorio() {
    if (!user || !pacienteSeleccionado || !medicamentoSeleccionado) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debes seleccionar un medicamento'
      });
      return;
    }

    const intervaloNum = parseFloat(intervalo);
    const ahora = new Date();
    const milisegundos = intervaloNum * 60 * 60 * 1000;
    const proximaToma = new Date(ahora.getTime() + milisegundos);
    const tomasTotalesNum = tomasTotales ? parseInt(tomasTotales) : null;

    const { data, error } = await supabase
      .from('recordatorios_medicamentos')
      .insert({
        user_id: pacienteSeleccionado.paciente_id,
        medicamento_id: medicamentoSeleccionado,
        intervalo_horas: intervaloNum,
        dosis_personalizada: dosisPersonalizada || null,
        tomas_totales: tomasTotalesNum,
        tomas_completadas: 0,
        notas: notas || null,
        inicio_tratamiento: ahora.toISOString(),
        proxima_toma: proximaToma.toISOString(),
        activo: true,
        creado_por_profesional_id: user.id
      })
      .select();

    if (error) {
      console.error('Error al crear recordatorio:', error);
      toast({
        variant: 'destructive',
        title: 'Error al crear recordatorio',
        description: error.message
      });
      return;
    }

    const medicamentoInfo = medicamentos.find(m => m.id === medicamentoSeleccionado);
    const vecesAlDia = Math.round(24 / intervaloNum);

    toast({
      title: '✅ Recordatorio creado',
      description: `${medicamentoInfo?.nombre} - ${vecesAlDia} veces al día para ${pacienteSeleccionado.paciente_nombre}`
    });

    // Limpiar formulario
    setMedicamentoSeleccionado('');
    setIntervalo('8');
    setDosisPersonalizada('');
    setTomasTotales('');
    setNotas('');
    setDialogAbierto(false);

    // Recargar datos actualizados
    cargarPacientesAsignados();
    cargarPacientesConRecordatorios();
  }

  const medicamentoInfo = medicamentoSeleccionado
    ? medicamentos.find(m => m.id === medicamentoSeleccionado)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Asignar Recordatorios</h2>
        <p className="text-muted-foreground text-base mt-1">
          Busca pacientes y asígnales recordatorios de medicamentos
        </p>
      </div>

      {/* Dialog GLOBAL para crear recordatorio */}
      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Asignar Recordatorio a {pacienteSeleccionado?.paciente_nombre} {pacienteSeleccionado?.paciente_apellido}
            </DialogTitle>
            <DialogDescription className="text-base">
              Configura el medicamento y el horario del tratamiento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Seleccionar medicamento */}
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

            {/* Info del medicamento */}
            {medicamentoInfo && (
              <Alert>
                <Pill className="h-5 w-5" />
                <AlertDescription className="text-base space-y-1">
                  <div><strong>Dosis recomendada:</strong> {medicamentoInfo.dosis_recomendada || 'No especificada'}</div>
                  <div><strong>Vía:</strong> {medicamentoInfo.via_administracion || 'No especificada'}</div>
                </AlertDescription>
              </Alert>
            )}

            {/* Intervalo */}
            <div className="space-y-2">
              <label className="text-base font-medium">¿Cada cuánto tiempo debe tomar?</label>
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

            {/* Dosis personalizada */}
            <div className="space-y-2">
              <label className="text-base font-medium">Dosis personalizada (opcional)</label>
              <Input
                type="text"
                value={dosisPersonalizada}
                onChange={(e) => setDosisPersonalizada(e.target.value)}
                placeholder="Ej: 2 tabletas, 5ml, 1 cápsula, etc."
                className="text-base min-h-[52px]"
              />
            </div>

            {/* Tomas totales */}
            <div className="space-y-2">
              <label className="text-base font-medium">¿Cuántas pastillas/ampollas tiene el paciente? (opcional)</label>
              <Input
                type="number"
                min="1"
                value={tomasTotales}
                onChange={(e) => setTomasTotales(e.target.value)}
                placeholder="Ej: 20 pastillas, 30 cápsulas"
                className="text-base min-h-[52px]"
              />
              <p className="text-sm text-muted-foreground">
                El recordatorio se desactivará automáticamente cuando termine todas las tomas
              </p>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <label className="text-base font-medium">Indicaciones para el paciente</label>
              <Textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: Tomar con alimentos, no mezclar con alcohol, tomar en ayunas..."
                className="text-base min-h-[100px]"
              />
            </div>

            {/* Vista previa */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-base text-center text-blue-900">
                📋 El paciente recibirá notificaciones <strong>{Math.round(24 / parseFloat(intervalo))} veces al día</strong>
                <br />
                ⏰ Cada <strong>{intervalo} horas</strong>
                {tomasTotales && (
                  <>
                    <br />
                    💊 Durante <strong>{tomasTotales} tomas</strong>
                  </>
                )}
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={crearRecordatorio}
                className="flex-1 min-h-[52px] text-base gap-2"
                size="lg"
                disabled={!medicamentoSeleccionado}
              >
                <CheckCircle2 className="h-5 w-5" />
                Asignar Recordatorio al Paciente
              </Button>
              <Button
                onClick={() => {
                  setDialogAbierto(false);
                  setPacienteSeleccionado(null);
                  setMedicamentoSeleccionado('');
                  setIntervalo('8');
                  setDosisPersonalizada('');
                  setTomasTotales('');
                  setNotas('');
                }}
                variant="outline"
                className="min-h-[52px]"
                size="lg"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Buscador de pacientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6" />
            Buscar Paciente
          </CardTitle>
          <CardDescription className="text-base">
            Busca por DNI, nombre, apellido, email o teléfono
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="DNI, nombre, apellido, email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="text-base min-h-[52px] pr-10"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {busqueda.length > 0 && busqueda.length < 2 && (
            <p className="text-sm text-muted-foreground">
              Escribe al menos 2 caracteres para buscar...
            </p>
          )}

          {/* Resultados de búsqueda */}
          {resultadosBusqueda.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {resultadosBusqueda.length} resultado(s) encontrado(s):
              </p>
              <div className="space-y-2">
                {resultadosBusqueda.map(paciente => (
                  <div
                    key={paciente.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                  >
                    <div>
                      <p className="font-medium text-base">
                        {paciente.nombre || paciente.apellido
                          ? `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim()
                          : 'Sin nombre'}
                        {paciente.dni && <span className="ml-2 text-primary">• DNI: {paciente.dni}</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {paciente.email}
                        {paciente.telefono && ` • ${paciente.telefono}`}
                      </p>
                    </div>
                    {paciente.esta_asignado ? (
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-base px-3 py-1">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Asignado
                        </Badge>
                        <Button
                          onClick={() => asignarYCrearRecordatorio(paciente)}
                          variant="default"
                          size="sm"
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Crear Recordatorio
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => asignarYCrearRecordatorio(paciente)}
                        variant="default"
                        size="sm"
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Asignar y Crear Recordatorio
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {busqueda.length >= 2 && resultadosBusqueda.length === 0 && !loading && (
            <Alert>
              <AlertDescription className="text-base">
                <p className="font-medium mb-2">No se encontraron pacientes con "{busqueda}"</p>
                <p className="text-sm text-muted-foreground">
                  💡 Verifica que el usuario esté registrado en el sistema.
                  La búsqueda es por email, nombre o apellido.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Lista de pacientes asignados con recordatorios */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Mis Pacientes ({pacientesConRecordatorios.length})
          </h3>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filtroEstado === 'todos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroEstado('todos')}
            >
              Todos
            </Button>
            <Button
              variant={filtroEstado === 'al_dia' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroEstado('al_dia')}
              className="gap-1"
            >
              ✅ Al día
            </Button>
            <Button
              variant={filtroEstado === 'atrasados' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroEstado('atrasados')}
              className="gap-1"
            >
              ⚠️ Atrasados
            </Button>
            <Button
              variant={filtroEstado === 'completados' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroEstado('completados')}
              className="gap-1"
            >
              🎉 Completados
            </Button>
          </div>
        </div>

        {pacientesConRecordatorios.length === 0 ? (
          <Alert>
            <AlertDescription className="text-base">
              No tienes pacientes asignados. Usa el buscador para encontrar y asignar pacientes.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {pacientesConRecordatorios.map(paciente => {
              // Filtrar recordatorios según estado seleccionado
              const recordatoriosFiltrados = filtroEstado === 'todos'
                ? paciente.recordatorios
                : paciente.recordatorios.filter(r => r.estado_recordatorio === filtroEstado);

              if (filtroEstado !== 'todos' && recordatoriosFiltrados.length === 0) {
                return null; // No mostrar paciente si no tiene recordatorios del filtro
              }

              return (
                <Card key={paciente.paciente_id} className="overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {paciente.paciente_nombre} {paciente.paciente_apellido}
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                          📧 {paciente.paciente_email}
                          {paciente.paciente_dni && <span className="ml-3">🆔 {paciente.paciente_dni}</span>}
                          {paciente.paciente_telefono && <span className="ml-3">📞 {paciente.paciente_telefono}</span>}
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          const pacienteAsignado: PacienteAsignado = {
                            relacion_id: paciente.paciente_id,
                            paciente_id: paciente.paciente_id,
                            paciente_email: paciente.paciente_email,
                            paciente_nombre: paciente.paciente_nombre,
                            paciente_apellido: paciente.paciente_apellido,
                            paciente_telefono: paciente.paciente_telefono,
                            paciente_dni: paciente.paciente_dni,
                            fecha_asignacion: new Date().toISOString(),
                            recordatorios_activos: paciente.total_recordatorios
                          };
                          setPacienteSeleccionado(pacienteAsignado);
                          setDialogAbierto(true);
                        }}
                        className="gap-2 min-h-[48px]"
                        size="sm"
                      >
                        <Plus className="h-5 w-5" />
                        Nuevo Recordatorio
                      </Button>
                    </div>

                    {/* Resumen de adherencia */}
                    {paciente.adherencia_promedio !== undefined && (
                      <div className="mt-3 flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Adherencia:</span>
                          <Badge
                            variant={paciente.adherencia_promedio >= 80 ? 'default' : paciente.adherencia_promedio >= 60 ? 'secondary' : 'destructive'}
                            className="text-base px-2"
                          >
                            {paciente.adherencia_promedio}%
                          </Badge>
                        </div>
                        <div className="flex gap-2 text-sm">
                          <Badge variant="outline" className="gap-1">✅ {paciente.recordatorios_al_dia} Al día</Badge>
                          <Badge variant="outline" className="gap-1">⚠️ {paciente.recordatorios_atrasados} Atrasados</Badge>
                          <Badge variant="outline" className="gap-1">🎉 {paciente.recordatorios_completados} Completados</Badge>
                        </div>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="pt-4">
                    {paciente.recordatorios.length === 0 ? (
                      <Alert>
                        <AlertDescription className="text-base">
                          No hay recordatorios asignados. Haz click en "Nuevo Recordatorio" para crear uno.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-3">
                        {recordatoriosFiltrados.map(rec => {
                          const estadoColor = {
                            al_dia: 'bg-green-50 border-green-200',
                            atrasado: 'bg-red-50 border-red-200',
                            completado: 'bg-blue-50 border-blue-200',
                            sin_iniciar: 'bg-gray-50 border-gray-200'
                          }[rec.estado_recordatorio];

                          const estadoTexto = {
                            al_dia: '✅ Al día',
                            atrasado: '⚠️ Atrasado',
                            completado: '🎉 Completado',
                            sin_iniciar: '⏸️ Sin iniciar'
                          }[rec.estado_recordatorio];

                          return (
                            <div key={rec.recordatorio_id} className={`border rounded-lg p-4 ${estadoColor}`}>
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-lg flex items-center gap-2">
                                      <Pill className="h-5 w-5" />
                                      {rec.medicamento_nombre}
                                    </h4>
                                    <Badge variant="secondary" className="text-sm">
                                      {rec.categoria_nombre}
                                    </Badge>
                                    <Badge variant="outline" className="text-sm">
                                      {estadoTexto}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {rec.dosis_a_tomar} • Cada {rec.intervalo_horas}h ({Math.round(24 / rec.intervalo_horas)} veces/día)
                                  </p>
                                </div>
                              </div>

                              {/* Progreso de tomas */}
                              {rec.tomas_totales && (
                                <div className="space-y-2 mb-3">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Progreso:</span>
                                    <span className="font-bold">
                                      {rec.tomas_completadas} / {rec.tomas_totales} tomas
                                      {rec.porcentaje_adherencia !== undefined && ` (${rec.porcentaje_adherencia}%)`}
                                    </span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all ${rec.porcentaje_adherencia && rec.porcentaje_adherencia >= 80
                                        ? 'bg-green-600'
                                        : rec.porcentaje_adherencia && rec.porcentaje_adherencia >= 60
                                          ? 'bg-yellow-600'
                                          : 'bg-red-600'
                                        }`}
                                      style={{ width: `${rec.porcentaje_adherencia || 0}%` }}
                                    />
                                  </div>
                                  {rec.tomas_restantes !== undefined && rec.tomas_restantes > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      Quedan {rec.tomas_restantes} {rec.tomas_restantes === 1 ? 'toma' : 'tomas'}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Última y próxima toma */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                {rec.ultima_toma && (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span>
                                      <strong>Última toma:</strong>{' '}
                                      {new Date(rec.ultima_toma).toLocaleString('es-ES', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                )}
                                {rec.proxima_toma && rec.estado_recordatorio !== 'completado' && (
                                  <div className="flex items-center gap-2">
                                    <Clock className={`h-4 w-4 ${rec.estado_recordatorio === 'atrasado' ? 'text-red-600' : 'text-blue-600'}`} />
                                    <span>
                                      <strong>Próxima toma:</strong>{' '}
                                      {rec.horas_hasta_proxima_toma !== undefined && rec.horas_hasta_proxima_toma < 0
                                        ? `Atrasada ${Math.abs(rec.horas_hasta_proxima_toma).toFixed(1)}h`
                                        : rec.horas_hasta_proxima_toma !== undefined && rec.horas_hasta_proxima_toma < 24
                                          ? `En ${rec.horas_hasta_proxima_toma.toFixed(1)}h`
                                          : new Date(rec.proxima_toma).toLocaleString('es-ES', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })
                                      }
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Notas */}
                              {rec.notas && (
                                <p className="text-sm text-muted-foreground mt-2 border-l-2 border-primary pl-3">
                                  📝 {rec.notas}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
