-- =====================================================
-- DIAGNÓSTICO COMPLETO: Recordatorios no aparecen al paciente
-- =====================================================

-- PARTE 1: Ver todos los recordatorios (como admin)
-- Esto muestra TODOS los recordatorios sin RLS
SELECT 
  'TODOS LOS RECORDATORIOS' as seccion,
  rm.id,
  rm.user_id,
  p.nombre || ' ' || p.apellido AS paciente_nombre,
  p.user_id AS paciente_auth_user_id,
  m.nombre AS medicamento,
  rm.activo,
  rm.tomas_completadas,
  rm.creado_por_profesional_id,
  CASE 
    WHEN rm.creado_por_profesional_id IS NOT NULL THEN 'Por Profesional'
    ELSE 'Por Paciente'
  END AS creado_por,
  prof.nombre || ' ' || prof.apellido AS profesional_nombre,
  rm.created_at
FROM recordatorios_medicamentos rm
LEFT JOIN pacientes p ON p.user_id = rm.user_id
LEFT JOIN medicamentos m ON m.id = rm.medicamento_id
LEFT JOIN profesionales prof ON prof.user_id = rm.creado_por_profesional_id
ORDER BY rm.created_at DESC
LIMIT 20;

-- PARTE 2: Ver relaciones paciente-profesional
SELECT 
  'RELACIONES PACIENTE-PROFESIONAL' as seccion,
  pp.id,
  pp.paciente_id,
  pac.nombre || ' ' || pac.apellido AS paciente_nombre,
  pp.profesional_id,
  prof.nombre || ' ' || prof.apellido AS profesional_nombre,
  pp.created_at
FROM paciente_profesional pp
LEFT JOIN pacientes pac ON pac.user_id = pp.paciente_id
LEFT JOIN profesionales prof ON prof.user_id = pp.profesional_id
ORDER BY pp.created_at DESC
LIMIT 10;

-- PARTE 3: Ver políticas RLS activas
SELECT 
  'POLÍTICAS RLS' as seccion,
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Lectura'
    WHEN cmd = 'INSERT' THEN 'Crear'
    WHEN cmd = 'UPDATE' THEN 'Actualizar'
    WHEN cmd = 'DELETE' THEN 'Eliminar'
  END as operacion
FROM pg_policies 
WHERE tablename = 'recordatorios_medicamentos'
ORDER BY cmd, policyname;

-- PARTE 4: Verificar IDs que no coinciden (problema común)
SELECT 
  'VERIFICAR IDS' as seccion,
  rm.id as recordatorio_id,
  rm.user_id as recordatorio_user_id,
  p.user_id as paciente_user_id,
  p.id as paciente_tabla_id,
  CASE 
    WHEN rm.user_id = p.user_id THEN '✅ CORRECTO'
    WHEN rm.user_id = p.id THEN '❌ ERROR: Usando ID de tabla en vez de user_id'
    ELSE '❌ ERROR: IDs no coinciden'
  END as estado
FROM recordatorios_medicamentos rm
LEFT JOIN pacientes p ON p.user_id = rm.user_id
WHERE rm.created_at > NOW() - INTERVAL '1 day'
ORDER BY rm.created_at DESC;

-- PARTE 5: Simular consulta del paciente (RLS)
-- IMPORTANTE: Reemplaza 'PACIENTE_USER_ID' con el user_id del paciente
-- Puedes obtenerlo de la PARTE 1 (columna paciente_auth_user_id)

-- Para obtener el user_id del paciente, primero ejecuta esto:
SELECT 
  'IDS DE PACIENTES' as seccion,
  p.id as tabla_id,
  p.user_id as auth_user_id,
  p.nombre || ' ' || p.apellido as nombre,
  p.email
FROM pacientes p
ORDER BY p.created_at DESC
LIMIT 5;

-- Luego copia el auth_user_id del paciente y úsalo abajo:
-- SELECT set_config('request.jwt.claim.sub', 'PACIENTE_USER_ID_AQUI', TRUE);
-- SELECT * FROM vista_recordatorios_completa WHERE user_id = 'PACIENTE_USER_ID_AQUI';

-- =====================================================
-- RESULTADOS ESPERADOS
-- =====================================================

/*
PARTE 1: Debería mostrar TODOS los recordatorios
  - Los 2 creados por el paciente (creado_por_profesional_id = NULL)
  - Los creados por el profesional (creado_por_profesional_id = UUID del prof)
  - IMPORTANTE: Verifica que user_id = paciente_auth_user_id

PARTE 2: Debería mostrar la relación paciente-profesional
  - paciente_id debe ser el user_id del paciente (auth.users)
  - profesional_id debe ser el user_id del profesional (auth.users)

PARTE 3: Debería mostrar estas políticas:
  SELECT:
    - "Usuarios ven sus recordatorios" (pacientes)
    - "Profesionales leen recordatorios de sus pacientes" (profesionales)
  INSERT:
    - "Usuarios crean sus recordatorios" (pacientes)
    - "Profesionales pueden crear recordatorios" (profesionales)

PARTE 4: CRÍTICO - Verifica el estado
  ✅ Si todos muestran "✅ CORRECTO" → El problema es otro
  ❌ Si alguno muestra "❌ ERROR..." → Ahí está el problema

PARTE 5: IDs de pacientes
  - Copia el auth_user_id del paciente que no ve los recordatorios
  - Úsalo para verificar qué ve ese paciente específicamente
*/

-- =====================================================
-- SOLUCIONES SEGÚN EL PROBLEMA ENCONTRADO
-- =====================================================

/*
PROBLEMA 1: user_id en recordatorios_medicamentos usa ID de tabla en vez de auth.users
  ❌ recordatorio_user_id = paciente_tabla_id
  ✅ recordatorio_user_id debería = paciente_auth_user_id

SOLUCIÓN:
  - El código ya fue corregido para usar paciente.user_id
  - Los recordatorios NUEVOS se crearán correctamente
  - Los recordatorios VIEJOS necesitan corrección manual

PROBLEMA 2: Falta política RLS para profesionales
SOLUCIÓN:
  - Ejecutar: supabase/fix_rls_recordatorios_profesional.sql

PROBLEMA 3: Relación paciente_profesional no existe
SOLUCIÓN:
  - El código ya crea la relación automáticamente (upsert)
  - Verificar en PARTE 2 que existe la relación
*/
