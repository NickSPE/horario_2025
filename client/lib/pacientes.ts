import { getSupabase } from "./supabase";

export interface PacienteInfo {
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

// Obtener pacientes asignados a un profesional
export async function obtenerPacientesProfesional(profesionalId: string): Promise<PacienteInfo[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from('vista_pacientes_recordatorios_profesional')
        .select(`
      paciente_id,
      paciente_nombre,
      paciente_apellido,
      paciente_email,
      paciente_dni,
      paciente_telefono,
      paciente_activo,
      fecha_asignacion
    `)
        .eq('profesional_id', profesionalId);

    if (error) throw error;

    return data?.map(p => ({
        id: p.paciente_id,
        user_id: p.paciente_id,
        nombre: p.paciente_nombre,
        apellido: p.paciente_apellido,
        email: p.paciente_email,
        dni: p.paciente_dni,
        telefono: p.paciente_telefono,
        activo: p.paciente_activo,
        created_at: p.fecha_asignacion,
    })) || [];
}

// Buscar pacientes existentes en el sistema (para asignar)
export async function buscarPacientesExistentes(
    termino: string,
    profesionalId: string
): Promise<PacienteInfo[]> {
    const supabase = getSupabase();

    // Primero obtener los IDs de pacientes ya asignados a este profesional
    const { data: pacientesAsignados } = await supabase
        .from('paciente_profesional')
        .select('paciente_id')
        .eq('profesional_id', profesionalId)
        .eq('activo', true);

    const idsAsignados = pacientesAsignados?.map(p => p.paciente_id) || [];

    let query = supabase
        .from('pacientes')
        .select('*')
        .or(`nombre.ilike.%${termino}%,apellido.ilike.%${termino}%,email.ilike.%${termino}%,dni.ilike.%${termino}%`)
        .eq('activo', true)
        .limit(10);

    // Excluir pacientes ya asignados
    if (idsAsignados.length > 0) {
        query = query.not('user_id', 'in', `(${idsAsignados.map(id => `'${id}'`).join(',')})`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
}

// Asignar paciente existente al profesional
export async function asignarPacienteExistente(
    pacienteId: string,
    profesionalId: string,
    notas?: string
): Promise<{ success: boolean; message: string }> {
    const supabase = getSupabase();

    try {
        // Verificar si ya está asignado
        const { data: existingAssignment } = await supabase
            .from('paciente_profesional')
            .select('id')
            .eq('paciente_id', pacienteId)
            .eq('profesional_id', profesionalId)
            .eq('activo', true)
            .single();

        if (existingAssignment) {
            return { success: false, message: 'Este paciente ya está asignado a usted' };
        }

        // Crear nueva asignación
        const { error } = await supabase
            .from('paciente_profesional')
            .insert({
                paciente_id: pacienteId,
                profesional_id: profesionalId,
                notas: notas || `Paciente asignado el ${new Date().toLocaleDateString()}`
            });

        if (error) throw error;

        return { success: true, message: 'Paciente asignado exitosamente' };

    } catch (error) {
        console.error('Error al asignar paciente:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al asignar paciente'
        };
    }
}

// Desasignar paciente del profesional
export async function desasignarPaciente(
    pacienteId: string,
    profesionalId: string
): Promise<{ success: boolean; message: string }> {
    const supabase = getSupabase();

    try {
        const { error } = await supabase
            .from('paciente_profesional')
            .update({ activo: false })
            .eq('paciente_id', pacienteId)
            .eq('profesional_id', profesionalId);

        if (error) throw error;

        return { success: true, message: 'Paciente desasignado exitosamente' };

    } catch (error) {
        console.error('Error al desasignar paciente:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al desasignar paciente'
        };
    }
}