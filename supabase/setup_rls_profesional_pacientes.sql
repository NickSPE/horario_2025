-- =====================================================
-- SCRIPT DE CONFIGURACIÓN: paciente_profesional
-- Asegurar RLS y políticas para aislamiento de datos
-- =====================================================

-- Este script trabaja con la tabla existente paciente_profesional
-- Solo configura RLS para que cada profesional vea SOLO sus pacientes

-- =====================================================
-- VERIFICAR QUE LA TABLA EXISTE
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'paciente_profesional') THEN
    RAISE EXCEPTION 'La tabla paciente_profesional no existe. Ejecuta primero supabase_profesional_pacientes.sql';
  END IF;
  
  RAISE NOTICE '✓ Tabla paciente_profesional encontrada';
END $$;

-- =====================================================
-- AGREGAR COLUMNAS SI NO EXISTEN
-- =====================================================

-- Columna activo (para desactivar sin eliminar)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'paciente_profesional' 
    AND column_name = 'activo'
  ) THEN
    ALTER TABLE paciente_profesional ADD COLUMN activo BOOLEAN DEFAULT true;
    RAISE NOTICE '✓ Columna activo agregada';
  ELSE
    RAISE NOTICE '✓ Columna activo ya existe';
  END IF;
END $$;

-- Columna fecha_asignacion
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'paciente_profesional' 
    AND column_name = 'fecha_asignacion'
  ) THEN
    ALTER TABLE paciente_profesional ADD COLUMN fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE '✓ Columna fecha_asignacion agregada';
  ELSE
    RAISE NOTICE '✓ Columna fecha_asignacion ya existe';
  END IF;
END $$;

-- Columna notas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'paciente_profesional' 
    AND column_name = 'notas'
  ) THEN
    ALTER TABLE paciente_profesional ADD COLUMN notas TEXT;
    RAISE NOTICE '✓ Columna notas agregada';
  ELSE
    RAISE NOTICE '✓ Columna notas ya existe';
  END IF;
END $$;

-- =====================================================
-- AGREGAR COLUMNA EN RECORDATORIOS
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'recordatorios_medicamentos' 
    AND column_name = 'creado_por_profesional_id'
  ) THEN
    ALTER TABLE recordatorios_medicamentos 
      ADD COLUMN creado_por_profesional_id UUID REFERENCES auth.users(id);
    
    CREATE INDEX IF NOT EXISTS idx_recordatorios_creado_por 
      ON recordatorios_medicamentos(creado_por_profesional_id);
    
    RAISE NOTICE '✓ Columna creado_por_profesional_id agregada a recordatorios';
  ELSE
    RAISE NOTICE '✓ Columna creado_por_profesional_id ya existe';
  END IF;
END $$;

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE paciente_profesional ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ELIMINAR POLÍTICAS ANTIGUAS
-- =====================================================

DROP POLICY IF EXISTS "Profesionales ven sus pacientes" ON paciente_profesional;
DROP POLICY IF EXISTS "Pacientes ven sus profesionales" ON paciente_profesional;
DROP POLICY IF EXISTS "Profesionales asignan pacientes" ON paciente_profesional;
DROP POLICY IF EXISTS "Profesionales actualizan asignaciones" ON paciente_profesional;
DROP POLICY IF EXISTS "Profesionales eliminan asignaciones" ON paciente_profesional;

-- =====================================================
-- CREAR POLÍTICAS NUEVAS (AISLAMIENTO DE DATOS)
-- =====================================================

-- 🔒 IMPORTANTE: Cada profesional SOLO ve SUS pacientes asignados
CREATE POLICY "Profesionales ven sus pacientes"
  ON paciente_profesional FOR SELECT
  USING (auth.uid() = profesional_id AND activo = true);

-- Pacientes ven sus profesionales asignados
CREATE POLICY "Pacientes ven sus profesionales"
  ON paciente_profesional FOR SELECT
  USING (auth.uid() = paciente_id AND activo = true);

-- Solo profesionales pueden asignar pacientes a sí mismos
CREATE POLICY "Profesionales asignan pacientes"
  ON paciente_profesional FOR INSERT
  WITH CHECK (auth.uid() = profesional_id);

-- Profesionales actualizan solo sus asignaciones
CREATE POLICY "Profesionales actualizan asignaciones"
  ON paciente_profesional FOR UPDATE
  USING (auth.uid() = profesional_id);

-- Profesionales pueden eliminar sus asignaciones
CREATE POLICY "Profesionales eliminan asignaciones"
  ON paciente_profesional FOR DELETE
  USING (auth.uid() = profesional_id);

-- =====================================================
-- ACTUALIZAR POLÍTICAS DE RECORDATORIOS
-- =====================================================

-- Eliminar políticas antiguas
DROP POLICY IF EXISTS "Usuarios crean sus recordatorios" ON recordatorios_medicamentos;
DROP POLICY IF EXISTS "Usuarios y profesionales crean recordatorios" ON recordatorios_medicamentos;
DROP POLICY IF EXISTS "Usuarios ven sus recordatorios" ON recordatorios_medicamentos;
DROP POLICY IF EXISTS "Usuarios y profesionales ven recordatorios" ON recordatorios_medicamentos;
DROP POLICY IF EXISTS "Usuarios actualizan sus recordatorios" ON recordatorios_medicamentos;
DROP POLICY IF EXISTS "Usuarios y profesionales eliminan recordatorios" ON recordatorios_medicamentos;

-- Política de INSERT: Usuario crea sus recordatorios O profesional asignado
CREATE POLICY "Usuarios y profesionales crean recordatorios"
  ON recordatorios_medicamentos FOR INSERT
  WITH CHECK (
    -- El usuario crea su propio recordatorio
    auth.uid() = user_id
    OR
    -- Un profesional ASIGNADO crea recordatorio para su paciente
    EXISTS (
      SELECT 1 FROM paciente_profesional
      WHERE paciente_profesional.paciente_id = recordatorios_medicamentos.user_id
      AND paciente_profesional.profesional_id = auth.uid()
      AND paciente_profesional.activo = true
    )
  );

-- Política de SELECT: Usuario ve sus recordatorios O profesional asignado
CREATE POLICY "Usuarios y profesionales ven recordatorios"
  ON recordatorios_medicamentos FOR SELECT
  USING (
    -- El usuario ve sus propios recordatorios
    auth.uid() = user_id
    OR
    -- Un profesional ve SOLO recordatorios de SUS pacientes asignados
    EXISTS (
      SELECT 1 FROM paciente_profesional
      WHERE paciente_profesional.paciente_id = recordatorios_medicamentos.user_id
      AND paciente_profesional.profesional_id = auth.uid()
      AND paciente_profesional.activo = true
    )
  );

-- Política de UPDATE: Solo el usuario puede actualizar sus recordatorios
CREATE POLICY "Usuarios actualizan sus recordatorios"
  ON recordatorios_medicamentos FOR UPDATE
  USING (auth.uid() = user_id);

-- Política de DELETE: Usuario o profesional creador
CREATE POLICY "Usuarios y profesionales eliminan recordatorios"
  ON recordatorios_medicamentos FOR DELETE
  USING (
    auth.uid() = user_id
    OR
    (auth.uid() = creado_por_profesional_id AND creado_por_profesional_id IS NOT NULL)
  );

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

DO $$
DECLARE
  policy_count INTEGER;
  profesional_pacientes_exists BOOLEAN;
  rls_enabled BOOLEAN;
BEGIN
  -- Verificar que la tabla existe
  SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'paciente_profesional'
  ) INTO profesional_pacientes_exists;
  
  IF NOT profesional_pacientes_exists THEN
    RAISE EXCEPTION 'ERROR: La tabla paciente_profesional no existe!';
  END IF;
  
  RAISE NOTICE '✓ Tabla paciente_profesional existe';
  
  -- Verificar RLS habilitado
  SELECT rowsecurity INTO rls_enabled
  FROM pg_tables
  WHERE tablename = 'paciente_profesional';
  
  IF rls_enabled THEN
    RAISE NOTICE '✓ RLS habilitado en paciente_profesional';
  ELSE
    RAISE WARNING 'RLS NO está habilitado en paciente_profesional';
  END IF;
  
  -- Contar políticas en paciente_profesional
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'paciente_profesional';
  
  RAISE NOTICE '✓ Políticas en paciente_profesional: %', policy_count;
  
  IF policy_count < 5 THEN
    RAISE WARNING 'Se esperaban 5 políticas, pero hay %', policy_count;
  END IF;
  
  -- Contar políticas en recordatorios_medicamentos
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'recordatorios_medicamentos';
  
  RAISE NOTICE '✓ Políticas en recordatorios_medicamentos: %', policy_count;
  
  -- Verificar columna creado_por_profesional_id
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'recordatorios_medicamentos' 
    AND column_name = 'creado_por_profesional_id'
  ) THEN
    RAISE NOTICE '✓ Columna creado_por_profesional_id existe en recordatorios';
  ELSE
    RAISE WARNING 'Columna creado_por_profesional_id NO existe';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CONFIGURACIÓN COMPLETADA';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 RLS habilitado en paciente_profesional';
  RAISE NOTICE '🔒 Cada profesional ve SOLO sus pacientes';
  RAISE NOTICE '🔒 Recordatorios aislados por profesional';
  RAISE NOTICE '';
  RAISE NOTICE 'Puedes probar el sistema desde la interfaz!';
  RAISE NOTICE '';
END $$;
