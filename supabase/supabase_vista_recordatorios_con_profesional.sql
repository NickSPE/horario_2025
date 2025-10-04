-- =====================================================
-- ACTUALIZACIÓN: Vista recordatorios con información del profesional
-- =====================================================
-- Este script actualiza la vista para incluir datos del profesional que creó el recordatorio
-- Ejecutar en Supabase SQL Editor

-- Eliminar vista anterior
DROP VIEW IF EXISTS vista_recordatorios_completa CASCADE;

-- Crear vista mejorada con información del profesional
CREATE OR REPLACE VIEW vista_recordatorios_completa AS
SELECT 
  r.id,
  r.user_id,
  r.medicamento_id,
  m.nombre AS medicamento_nombre,
  m.dosis_recomendada,
  m.via_administracion,
  m.indicaciones,
  c.nombre AS categoria_nombre,
  r.intervalo_horas,
  r.dosis_personalizada,
  r.tomas_totales,
  r.tomas_completadas,
  CASE 
    WHEN r.tomas_totales IS NOT NULL THEN r.tomas_totales - r.tomas_completadas
    ELSE NULL
  END AS tomas_restantes,
  COALESCE(r.dosis_personalizada, m.dosis_recomendada) AS dosis_a_tomar,
  r.inicio_tratamiento,
  r.proxima_toma,
  r.ultima_toma,
  r.activo,
  r.notas,
  r.created_at,
  r.updated_at,
  -- Información del profesional que creó el recordatorio
  r.creado_por_profesional_id,
  prof.nombre AS profesional_nombre,
  prof.apellido AS profesional_apellido,
  prof.licencia AS profesional_licencia,
  prof.especialidad AS profesional_especialidad,
  -- Calcular tiempo restante en segundos (NULL si tratamiento terminó)
  CASE 
    WHEN r.proxima_toma IS NULL THEN NULL
    ELSE EXTRACT(EPOCH FROM (r.proxima_toma - NOW()))
  END AS segundos_restantes,
  -- Verificar si ya pasó la hora (FALSE si tratamiento terminó)
  CASE
    WHEN r.proxima_toma IS NULL THEN false
    ELSE (r.proxima_toma <= NOW())
  END AS debe_tomar_ahora
FROM recordatorios_medicamentos r
JOIN medicamentos m ON r.medicamento_id = m.id
LEFT JOIN categorias_medicamentos c ON m.categoria_id = c.id
LEFT JOIN profesionales prof ON r.creado_por_profesional_id = prof.user_id
ORDER BY r.proxima_toma ASC;

-- Habilitar RLS en la vista
ALTER VIEW vista_recordatorios_completa OWNER TO postgres;
GRANT SELECT ON vista_recordatorios_completa TO authenticated;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver estructura de la vista actualizada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vista_recordatorios_completa'
ORDER BY ordinal_position;

-- Probar consulta (reemplazar USER_ID con el user_id de un paciente de prueba)
-- SELECT * FROM vista_recordatorios_completa WHERE user_id = 'USER_ID' AND activo = true;

SELECT '✅ Vista actualizada exitosamente con información del profesional' AS status;
