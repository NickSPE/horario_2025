-- =====================================================
-- DIAGNÓSTICO: Por qué el paciente no ve recordatorios
-- =====================================================

-- PASO 1: Ver todos los recordatorios (sin RLS)
-- Ejecutar como postgres/admin
SELECT 
  rm.id,
  rm.user_id,
  p.nombre || ' ' || p.apellido AS paciente,
  m.nombre AS medicamento,
  rm.activo,
  rm.tomas_completadas,
  rm.creado_por_profesional_id,
  prof.nombre || ' ' || prof.apellido AS profesional_creador,
  rm.created_at
FROM recordatorios_medicamentos rm
LEFT JOIN pacientes p ON p.user_id = rm.user_id
LEFT JOIN medicamentos m ON m.id = rm.medicamento_id
LEFT JOIN profesionales prof ON prof.user_id = rm.creado_por_profesional_id
ORDER BY rm.created_at DESC
LIMIT 10;

-- PASO 2: Ver políticas RLS activas en recordatorios_medicamentos
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'recordatorios_medicamentos'
ORDER BY cmd, policyname;

-- PASO 3: Verificar la vista (como paciente)
-- Reemplazar 'PACIENTE_USER_ID' con el user_id del paciente
-- SELECT * FROM vista_recordatorios_completa 
-- WHERE user_id = 'PACIENTE_USER_ID'
-- ORDER BY created_at DESC;

-- PASO 4: Ver estructura de la vista
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vista_recordatorios_completa'
ORDER BY ordinal_position;

-- PASO 5: Verificar permisos en la vista
SELECT 
  table_schema,
  table_name,
  privilege_type,
  grantee
FROM information_schema.table_privileges
WHERE table_name = 'vista_recordatorios_completa';

-- PASO 6: Ver relaciones paciente-profesional
SELECT 
  pp.*,
  pac.nombre || ' ' || pac.apellido AS paciente_nombre,
  prof.nombre || ' ' || prof.apellido AS profesional_nombre
FROM paciente_profesional pp
LEFT JOIN pacientes pac ON pac.user_id = pp.paciente_id
LEFT JOIN profesionales prof ON prof.user_id = pp.profesional_id
ORDER BY pp.created_at DESC
LIMIT 10;

-- =====================================================
-- RESULTADOS ESPERADOS
-- =====================================================
/*
PASO 1: Debería mostrar los recordatorios recién creados
  - user_id = UUID del paciente (auth.users.id)
  - activo = false
  - tomas_completadas = 0
  - creado_por_profesional_id = UUID del profesional (auth.users.id)

PASO 2: Debería mostrar estas políticas:
  - "Usuarios ven sus recordatorios" (SELECT)
  - "Usuarios crean sus recordatorios" (INSERT)
  - "Usuarios actualizan sus recordatorios" (UPDATE)
  - "Usuarios eliminan sus recordatorios" (DELETE)
  - "Profesionales pueden crear recordatorios" (INSERT) ← Nueva

PASO 3: Debería mostrar los recordatorios del paciente
  - Si no muestra nada, hay problema con RLS o la vista

PASO 4: Debería incluir columnas:
  - creado_por_profesional_id
  - profesional_nombre
  - profesional_apellido
  - etc.

PASO 5: Debería mostrar:
  - authenticated: SELECT

PASO 6: Debería mostrar la relación recién creada
  - paciente_id = user_id del paciente
  - profesional_id = user_id del profesional
*/
