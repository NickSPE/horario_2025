// Tipos para el sistema de recordatorios

export interface RecordatorioMedicamento {
  id: string;
  user_id: string;
  medicamento_id: string;
  intervalo_horas: number; // 6, 8, 12, 24
  dosis_personalizada?: string;
  tomas_totales?: number; // Total de pastillas/ampollas que tiene
  tomas_completadas: number; // Cuántas ha tomado
  inicio_tratamiento: string;
  proxima_toma: string | null; // Nullable cuando termina el tratamiento
  ultima_toma?: string;
  activo: boolean;
  notas?: string;
  creado_por_profesional_id?: string; // UUID del profesional que creó el recordatorio
  audio_personalizado_url?: string; // URL del audio personalizado en Supabase Storage
  tipo_sonido?: string; // Tipo de sonido predefinido o 'personalizado'
  created_at: string;
  updated_at: string;
}

export interface RecordatorioCompleto extends RecordatorioMedicamento {
  medicamento_nombre: string;
  dosis_recomendada?: string;
  via_administracion?: string;
  indicaciones?: string;
  categoria_nombre?: string;
  dosis_a_tomar: string;
  segundos_restantes: number;
  debe_tomar_ahora: boolean;
  tomas_restantes?: number; // Cuántas le quedan
  // Información del profesional que creó el recordatorio
  profesional_nombre?: string;
  profesional_apellido?: string;
  profesional_licencia?: string;
  profesional_especialidad?: string;
}

export interface HistorialToma {
  id: string;
  recordatorio_id: string;
  hora_programada: string;
  hora_real: string;
  tomado: boolean;
  notas?: string;
  created_at: string;
}

export const INTERVALOS_DISPONIBLES = [
  { value: 0.00277778, label: '⚡ Cada 10 segundos', ejemplo: 'SOLO PARA PRUEBAS', esPrueba: true },
  { value: 4, label: 'Cada 4 horas', ejemplo: '6 veces al día', esPrueba: false },
  { value: 6, label: 'Cada 6 horas', ejemplo: '4 veces al día', esPrueba: false },
  { value: 8, label: 'Cada 8 horas', ejemplo: '3 veces al día', esPrueba: false },
  { value: 12, label: 'Cada 12 horas', ejemplo: '2 veces al día', esPrueba: false },
  { value: 24, label: 'Cada 24 horas', ejemplo: '1 vez al día', esPrueba: false },
  { value: -1, label: 'Personalizado', ejemplo: 'Define tu propio intervalo', esPrueba: false },
] as const;

export const SONIDOS_ALARMA = [
  { value: 'beep', label: '🔔 Beep clásico', descripcion: 'Tres tonos cortos' },
  { value: 'suave', label: '🎵 Suave', descripcion: 'Tono melodioso y gentil' },
  { value: 'urgente', label: '⚠️ Urgente', descripcion: 'Alarma insistente' },
  { value: 'campana', label: '🔔 Campana', descripcion: 'Sonido de campana' },
  { value: 'digital', label: '📱 Digital', descripcion: 'Bips electrónicos' },
  // DESACTIVADO TEMPORALMENTE: Sonido personalizado
  // { value: 'personalizado', label: '🎼 Personalizado', descripcion: 'Sube tu propio audio' },
] as const;

export type TipoSonido = typeof SONIDOS_ALARMA[number]['value'];

// Configuración de alarmas
export const CONFIGURACION_ALARMA = {
  DURACION_ALARMA_SEGUNDOS: 30, // Alarma suena durante 30 segundos
  TIEMPO_ESPERA_AUTO_AVANCE_MINUTOS: 5, // Después de 5 minutos sin marcar, avanza automáticamente
  TIEMPO_ESPERA_AUTO_AVANCE_SEGUNDOS: 5 * 60, // 5 minutos en segundos
} as const;
