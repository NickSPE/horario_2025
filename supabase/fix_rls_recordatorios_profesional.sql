-- =====================================================
-- ACTUALIZAR RLS PARA RECORDATORIOS - PROFESIONAL
-- =====================================================
-- Este script permite que los profesionales creen recordatorios
-- para cualquier paciente. La relación profesional-paciente
-- se crea automáticamente cuando se guarda el recordatorio.

-- 1. Eliminar políticas anteriores (si existen)
DROP POLICY IF EXISTS "Profesionales crean recordatorios para sus pacientes" 
  ON recordatorios_medicamentos;

DROP POLICY IF EXISTS "Profesionales pueden crear recordatorios" 
  ON recordatorios_medicamentos;

-- 2. Crear política permisiva para profesionales (INSERT)
CREATE POLICY "Profesionales pueden crear recordatorios" 
  ON recordatorios_medicamentos 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    -- Permitir si el usuario es un profesional autenticado
    EXISTS (
      SELECT 1 
      FROM profesionales 
      WHERE user_id = auth.uid()
    )
  );

-- 3. Verificar que existe política de SELECT
-- (Los profesionales deben poder ver los recordatorios que crearon)
DROP POLICY IF EXISTS "Profesionales leen recordatorios de sus pacientes" 
  ON recordatorios_medicamentos;

CREATE POLICY "Profesionales leen recordatorios de sus pacientes" 
  ON recordatorios_medicamentos 
  FOR SELECT 
  TO authenticated 
  USING (
    -- El profesional ve recordatorios que creó
    creado_por_profesional_id = auth.uid()
    OR
    -- O recordatorios de sus pacientes asignados
    EXISTS (
      SELECT 1 
      FROM paciente_profesional pp
      WHERE pp.profesional_id = auth.uid()
        AND pp.paciente_id = recordatorios_medicamentos.user_id
    )
  );

-- 4. Política UPDATE (opcional, por si el profesional necesita editar)
DROP POLICY IF EXISTS "Profesionales editan recordatorios que crearon" 
  ON recordatorios_medicamentos;

CREATE POLICY "Profesionales editan recordatorios que crearon" 
  ON recordatorios_medicamentos 
  FOR UPDATE 
  TO authenticated 
  USING (
    creado_por_profesional_id = auth.uid()
  )
  WITH CHECK (
    creado_por_profesional_id = auth.uid()
  );

-- 5. Política DELETE (opcional)
DROP POLICY IF EXISTS "Profesionales eliminan recordatorios que crearon" 
  ON recordatorios_medicamentos;

CREATE POLICY "Profesionales eliminan recordatorios que crearon" 
  ON recordatorios_medicamentos 
  FOR DELETE 
  TO authenticated 
  USING (
    creado_por_profesional_id = auth.uid()
  );

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver todas las políticas activas
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
ORDER BY policyname;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS actualizadas correctamente para recordatorios_medicamentos';
  RAISE NOTICE 'Los profesionales ahora pueden:';
  RAISE NOTICE '  - Crear recordatorios para cualquier paciente (INSERT)';
  RAISE NOTICE '  - Ver recordatorios que crearon o de sus pacientes (SELECT)';
  RAISE NOTICE '  - Editar recordatorios que crearon (UPDATE)';
  RAISE NOTICE '  - Eliminar recordatorios que crearon (DELETE)';
END $$;
