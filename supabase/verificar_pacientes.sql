-- =====================================================
-- VERIFICAR SI EXISTEN PACIENTES EN EL SISTEMA
-- =====================================================

-- Ver cuántos pacientes hay
SELECT COUNT(*) as total_pacientes FROM pacientes WHERE activo = true;

-- Ver lista de pacientes
SELECT 
  id,
  nombre,
  apellido,
  email,
  dni,
  activo,
  created_at
FROM pacientes
ORDER BY created_at DESC
LIMIT 10;

-- Ver usuarios que NO tienen registro en tabla pacientes
SELECT 
  u.id as user_id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN pacientes p ON p.user_id = u.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- =====================================================
-- NOTA IMPORTANTE:
-- =====================================================
-- Si no hay pacientes, los usuarios deben registrarse 
-- y crear su perfil en la tabla pacientes.
-- 
-- Puedes verificar las políticas RLS con:
-- SELECT * FROM pg_policies WHERE tablename = 'pacientes';
