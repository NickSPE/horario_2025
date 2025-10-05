-- =====================================================
-- CORRECCIÓN: Recordatorios con user_id incorrecto
-- =====================================================
-- Este script corrige recordatorios que fueron creados con el ID 
-- de la tabla pacientes en lugar del user_id de auth.users

-- PASO 1: Identificar recordatorios con problema
-- (Aquellos donde user_id no está en auth.users pero sí en pacientes.id)
SELECT 
  'RECORDATORIOS CON PROBLEMA' as seccion,
  rm.id as recordatorio_id,
  rm.user_id as user_id_incorrecto,
  p.id as paciente_tabla_id,
  p.user_id as user_id_correcto,
  p.nombre || ' ' || p.apellido as paciente,
  m.nombre as medicamento,
  rm.created_at
FROM recordatorios_medicamentos rm
JOIN pacientes p ON p.id = rm.user_id  -- JOIN por ID de tabla (el error)
JOIN medicamentos m ON m.id = rm.medicamento_id
WHERE NOT EXISTS (
  -- Verificar que user_id NO existe en auth.users
  SELECT 1 FROM auth.users WHERE id = rm.user_id
)
ORDER BY rm.created_at DESC;

-- PASO 2: CORRECCIÓN AUTOMÁTICA
-- ⚠️ CUIDADO: Esto actualiza los recordatorios
-- Solo ejecuta esto si la consulta anterior mostró recordatorios con problema

UPDATE recordatorios_medicamentos rm
SET user_id = p.user_id  -- Cambiar a user_id correcto (auth.users)
FROM pacientes p
WHERE p.id = rm.user_id  -- Donde user_id está usando ID de tabla pacientes
  AND NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = rm.user_id
  );

-- PASO 3: Verificar corrección
SELECT 
  'VERIFICACIÓN POST-CORRECCIÓN' as seccion,
  rm.id as recordatorio_id,
  rm.user_id,
  p.nombre || ' ' || p.apellido as paciente,
  m.nombre as medicamento,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = rm.user_id) 
    THEN '✅ CORRECTO (auth.users)'
    ELSE '❌ AÚN CON PROBLEMA'
  END as estado,
  rm.created_at
FROM recordatorios_medicamentos rm
LEFT JOIN pacientes p ON p.user_id = rm.user_id
LEFT JOIN medicamentos m ON m.id = rm.medicamento_id
ORDER BY rm.created_at DESC
LIMIT 20;

-- PASO 4: Ver cuántos registros se actualizaron
SELECT 
  'RESUMEN' as seccion,
  COUNT(*) as total_recordatorios,
  COUNT(CASE WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = rm.user_id) THEN 1 END) as correctos,
  COUNT(CASE WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE id = rm.user_id) THEN 1 END) as con_problema
FROM recordatorios_medicamentos rm;

-- =====================================================
-- MENSAJE
-- =====================================================
DO $$
DECLARE
  actualizados INTEGER;
BEGIN
  SELECT COUNT(*) INTO actualizados
  FROM recordatorios_medicamentos rm
  JOIN pacientes p ON p.user_id = rm.user_id
  WHERE rm.created_at > NOW() - INTERVAL '1 hour';
  
  RAISE NOTICE '✅ Corrección completada';
  RAISE NOTICE 'Recordatorios actualizados recientemente: %', actualizados;
  RAISE NOTICE '';
  RAISE NOTICE 'Ahora los pacientes deberían ver TODOS sus recordatorios,';
  RAISE NOTICE 'incluyendo los asignados por profesionales.';
  RAISE NOTICE '';
  RAISE NOTICE 'Recarga la página del paciente para verificar.';
END $$;
