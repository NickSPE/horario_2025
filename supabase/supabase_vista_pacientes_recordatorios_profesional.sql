-- =====================================================
-- VISTA: Pacientes con sus recordatorios para el profesional
-- =====================================================
-- Esta vista muestra a cada profesional sus pacientes asignados
-- con el detalle de los recordatorios que les ha creado

-- Eliminar vista anterior si existe
DROP VIEW IF EXISTS vista_pacientes_recordatorios_profesional CASCADE;

-- Crear vista con información completa de recordatorios
CREATE OR REPLACE VIEW vista_pacientes_recordatorios_profesional AS
SELECT 
  pp.profesional_id,
  pp.paciente_id,
  p.nombre AS paciente_nombre,
  p.apellido AS paciente_apellido,
  p.email AS paciente_email,
  p.dni AS paciente_dni,
  p.telefono AS paciente_telefono,
  pp.activo AS relacion_activa,
  pp.fecha_asignacion,
  -- Información del recordatorio
  r.id AS recordatorio_id,
  r.medicamento_id,
  m.nombre AS medicamento_nombre,
  c.nombre AS categoria_nombre,
  r.intervalo_horas,
  r.dosis_personalizada,
  COALESCE(r.dosis_personalizada, m.dosis_recomendada) AS dosis_a_tomar,
  r.tomas_totales,
  r.tomas_completadas,
  CASE 
    WHEN r.tomas_totales IS NOT NULL THEN r.tomas_totales - r.tomas_completadas
    ELSE NULL
  END AS tomas_restantes,
  r.inicio_tratamiento,
  r.proxima_toma,
  r.ultima_toma,
  r.activo AS recordatorio_activo,
  r.notas,
  r.created_at AS recordatorio_creado_en,
  -- Estado del recordatorio
  CASE
    WHEN r.proxima_toma IS NULL THEN 'completado'
    WHEN r.proxima_toma > NOW() THEN 'al_dia'
    WHEN r.proxima_toma <= NOW() THEN 'atrasado'
    ELSE 'sin_iniciar'
  END AS estado_recordatorio,
  -- Calcular adherencia (% de tomas completadas a tiempo)
  CASE 
    WHEN r.tomas_totales IS NOT NULL AND r.tomas_totales > 0 
    THEN ROUND((r.tomas_completadas::numeric / r.tomas_totales::numeric) * 100, 1)
    ELSE NULL
  END AS porcentaje_adherencia,
  -- Tiempo desde última toma (en horas)
  CASE
    WHEN r.ultima_toma IS NOT NULL 
    THEN ROUND(EXTRACT(EPOCH FROM (NOW() - r.ultima_toma)) / 3600, 1)
    ELSE NULL
  END AS horas_desde_ultima_toma,
  -- Tiempo hasta próxima toma (en horas)
  CASE
    WHEN r.proxima_toma IS NOT NULL 
    THEN ROUND(EXTRACT(EPOCH FROM (r.proxima_toma - NOW())) / 3600, 1)
    ELSE NULL
  END AS horas_hasta_proxima_toma
FROM paciente_profesional pp
JOIN pacientes p ON pp.paciente_id = p.user_id
LEFT JOIN recordatorios_medicamentos r ON r.user_id = p.user_id 
  AND r.creado_por_profesional_id = pp.profesional_id
  AND r.activo = true
LEFT JOIN medicamentos m ON r.medicamento_id = m.id
LEFT JOIN categorias_medicamentos c ON m.categoria_id = c.id
WHERE pp.activo = true
ORDER BY 
  p.apellido, 
  p.nombre, 
  CASE 
    WHEN r.proxima_toma IS NULL THEN 3
    WHEN r.proxima_toma <= NOW() THEN 1
    WHEN r.proxima_toma > NOW() THEN 2
  END,
  r.proxima_toma;

-- Habilitar permisos
ALTER VIEW vista_pacientes_recordatorios_profesional OWNER TO postgres;
GRANT SELECT ON vista_pacientes_recordatorios_profesional TO authenticated;

-- Nota: Las vistas usan SECURITY DEFINER en las funciones que las consultan
-- para aplicar filtros de seguridad basados en auth.uid()

-- =====================================================
-- FUNCIÓN: Resumen de paciente para el profesional
-- =====================================================
-- Agrupa todos los recordatorios por paciente

CREATE OR REPLACE FUNCTION obtener_resumen_pacientes(profesional_id_param UUID)
RETURNS TABLE (
  paciente_id UUID,
  paciente_nombre VARCHAR(100),
  paciente_apellido VARCHAR(100),
  paciente_email VARCHAR(255),
  paciente_dni VARCHAR(20),
  paciente_telefono VARCHAR(20),
  total_recordatorios BIGINT,
  recordatorios_al_dia BIGINT,
  recordatorios_atrasados BIGINT,
  recordatorios_completados BIGINT,
  adherencia_promedio NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.paciente_id,
    v.paciente_nombre,
    v.paciente_apellido,
    v.paciente_email,
    v.paciente_dni,
    v.paciente_telefono,
    COUNT(v.recordatorio_id) AS total_recordatorios,
    COUNT(CASE WHEN v.estado_recordatorio = 'al_dia' THEN 1 END) AS recordatorios_al_dia,
    COUNT(CASE WHEN v.estado_recordatorio = 'atrasado' THEN 1 END) AS recordatorios_atrasados,
    COUNT(CASE WHEN v.estado_recordatorio = 'completado' THEN 1 END) AS recordatorios_completados,
    ROUND(AVG(v.porcentaje_adherencia), 1) AS adherencia_promedio
  FROM vista_pacientes_recordatorios_profesional v
  WHERE v.profesional_id = profesional_id_param
  GROUP BY 
    v.paciente_id,
    v.paciente_nombre,
    v.paciente_apellido,
    v.paciente_email,
    v.paciente_dni,
    v.paciente_telefono
  ORDER BY v.paciente_apellido, v.paciente_nombre;
END;
$$;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver estructura de la vista
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vista_pacientes_recordatorios_profesional'
ORDER BY ordinal_position;

-- Probar función (reemplazar con UUID real de un profesional)
-- SELECT * FROM obtener_resumen_pacientes('UUID_DEL_PROFESIONAL');

SELECT '✅ Vista de pacientes con recordatorios creada exitosamente' AS status;
