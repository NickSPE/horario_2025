-- =====================================================
-- ARREGLAR POLÍTICAS RLS DE MEDICAMENTOS
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Todos pueden ver medicamentos" ON medicamentos;
DROP POLICY IF EXISTS "Solo profesionales pueden crear medicamentos" ON medicamentos;
DROP POLICY IF EXISTS "Profesionales pueden actualizar medicamentos" ON medicamentos;
DROP POLICY IF EXISTS "Profesionales pueden eliminar medicamentos" ON medicamentos;

-- =====================================================
-- POLÍTICAS SIMPLIFICADAS (Para que funcione)
-- =====================================================

-- Todos pueden VER medicamentos
CREATE POLICY "Todos pueden ver medicamentos"
  ON medicamentos FOR SELECT
  USING (true);

-- Usuarios autenticados pueden CREAR medicamentos (simplificado)
CREATE POLICY "Usuarios autenticados pueden crear medicamentos"
  ON medicamentos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Usuarios autenticados pueden ACTUALIZAR medicamentos
CREATE POLICY "Usuarios autenticados pueden actualizar medicamentos"
  ON medicamentos FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Usuarios autenticados pueden ELIMINAR medicamentos
CREATE POLICY "Usuarios autenticados pueden eliminar medicamentos"
  ON medicamentos FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT 'Políticas de medicamentos actualizadas' AS status;
SELECT 'NOTA: Estas políticas permiten a cualquier usuario autenticado modificar medicamentos' AS warning;
SELECT 'Para producción, cambiar a políticas más restrictivas basadas en roles' AS recommendation;
