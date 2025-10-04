interface Paciente {
    id: string;
    user_id: string;
    email: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    dni?: string;
    esta_asignado: boolean;
}

interface PacienteAsignado {
    relacion_id: string;
    paciente_id: string;
    paciente_email: string;
    paciente_nombre: string;
    paciente_apellido: string;
    paciente_telefono?: string;
    paciente_dni?: string;
    fecha_asignacion: string;
    recordatorios_activos: number;
}

interface RecordatorioPaciente {
    recordatorio_id: string;
    medicamento_nombre: string;
    categoria_nombre: string;
    intervalo_horas: number;
    dosis_a_tomar: string;
    tomas_totales?: number;
    tomas_completadas: number;
    tomas_restantes?: number;
    ultima_toma?: string;
    proxima_toma?: string;
    estado_recordatorio: 'al_dia' | 'atrasado' | 'completado' | 'sin_iniciar';
    porcentaje_adherencia?: number;
    horas_hasta_proxima_toma?: number;
    notas?: string;
}

interface PacienteConRecordatorios {
    paciente_id: string;
    paciente_nombre: string;
    paciente_apellido: string;
    paciente_email: string;
    paciente_dni?: string;
    paciente_telefono?: string;
    total_recordatorios: number;
    recordatorios_al_dia: number;
    recordatorios_atrasados: number;
    recordatorios_completados: number;
    adherencia_promedio?: number;
    recordatorios: RecordatorioPaciente[];
}

export type {
    Paciente,
    PacienteAsignado, PacienteConRecordatorios, RecordatorioPaciente
};
