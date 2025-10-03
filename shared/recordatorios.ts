// Tipos para el sistema de recordatorios

export interface RecordatorioMedicamento {
  id: string;
  user_id: string;
  medicamento_id: string;
  intervalo_horas: number; // 6, 8, 12, 24
  dosis_personalizada?: string;
  inicio_tratamiento: string;
  proxima_toma: string;
  ultima_toma?: string;
  activo: boolean;
  notas?: string;
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
] as const;
