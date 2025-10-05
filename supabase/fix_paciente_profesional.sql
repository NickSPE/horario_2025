-- =====================================================
-- SCRIPT DE MIGRACIÓN: Corregir nombre de tabla
-- =====================================================

-- Si existe profesional_pacientes (nombre incorrecto), crear la correcta
DO $$ 
BEGIN
  -- Verificar si existe la tabla con el nombre antiguo
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profesional_pacientes') THEN
    -- Renombrar la tabla
    ALTER TABLE profesional_pacientes RENAME TO paciente_profesional;
    
    -- Renombrar índices si existen
    ALTER INDEX IF EXISTS idx_profesional_pacientes_paciente RENAME TO idx_paciente_profesional_paciente;
    ALTER INDEX IF EXISTS idx_profesional_pacientes_profesional RENAME TO idx_paciente_profesional_profesional;
    
    RAISE NOTICE 'Tabla profesional_pacientes renombrada a paciente_profesional';
  ELSIF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'paciente_profesional') THEN
    -- Si no existe ninguna de las dos, crear la tabla correcta
    CREATE TABLE paciente_profesional (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      paciente_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      profesional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      activo BOOLEAN DEFAULT true,
      notas TEXT,
      
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      
      -- Evitar duplicados
      UNIQUE(paciente_id, profesional_id)
    );

    -- Crear índices
    CREATE INDEX idx_paciente_profesional_paciente ON paciente_profesional(paciente_id);
    CREATE INDEX idx_paciente_profesional_profesional ON paciente_profesional(profesional_id);
    
    RAISE NOTICE 'Tabla paciente_profesional creada exitosamente';
  ELSE
    RAISE NOTICE 'La tabla paciente_profesional ya existe';
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE paciente_profesional ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Profesionales ven sus pacientes" ON paciente_profesional;
DROP POLICY IF EXISTS "Pacientes ven sus profesionales" ON paciente_profesional;
DROP POLICY IF EXISTS "Profesionales asignan pacientes" ON paciente_profesional;
DROP POLICY IF EXISTS "Profesionales actualizan asignaciones" ON paciente_profesional;

-- Crear políticas actualizadas
-- IMPORTANTE: Cada profesional SOLO ve SUS pacientes asignados
CREATE POLICY "Profesionales ven sus pacientes"
  ON paciente_profesional FOR SELECT
  USING (auth.uid() = profesional_id AND activo = true);

-- Pacientes ven sus profesionales asignados
CREATE POLICY "Pacientes ven sus profesionales"
  ON paciente_profesional FOR SELECT
  USING (auth.uid() = paciente_id AND activo = true);

-- Solo profesionales pueden asignar pacientes
CREATE POLICY "Profesionales asignan pacientes"
  ON paciente_profesional FOR INSERT
  WITH CHECK (auth.uid() = profesional_id);

-- Profesionales actualizan solo sus asignaciones
CREATE POLICY "Profesionales actualizan asignaciones"
  ON paciente_profesional FOR UPDATE
  USING (auth.uid() = profesional_id);

-- Agregar columna creado_por_profesional_id si no existe
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
    
    RAISE NOTICE 'Columna creado_por_profesional_id agregada a recordatorios_medicamentos';
  ELSE
    RAISE NOTICE 'La columna creado_por_profesional_id ya existe';
  END IF;
END $$;

-- =====================================================
-- ACTUALIZAR POLÍTICAS DE RECORDATORIOS
-- =====================================================

-- Eliminar políticas antiguas
DROP POLICY IF EXISTS "Usuarios crean sus recordatorios" ON recordatorios_medicamentos;
DROP POLICY IF EXISTS "Usuarios y profesionales crean recordatorios" ON recordatorios_medicamentos;
DROP POLICY IF EXISTS "Usuarios ven sus recordatorios" ON recordatorios_medicamentos;
DROP POLICY IF EXISTS "Usuarios y profesionales ven recordatorios" ON recordatorios_medicamentos;

-- Política de INSERT: Usuario crea sus recordatorios O profesional asignado
CREATE POLICY "Usuarios y profesionales crean recordatorios"
  ON recordatorios_medicamentos FOR INSERT
  WITH CHECK (
    -- El usuario crea su propio recordatorio
    auth.uid() = user_id
    OR
    -- Un profesional ASIGNADO A ESE PACIENTE crea recordatorio
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
    -- Un profesional ve SOLO los recordatorios de SUS pacientes asignados
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

-- Política de DELETE: Solo el usuario o el profesional que lo creó pueden eliminar
CREATE POLICY "Usuarios y profesionales eliminan recordatorios"
  ON recordatorios_medicamentos FOR DELETE
  USING (
    auth.uid() = user_id
    OR
    (auth.uid() = creado_por_profesional_id AND creado_por_profesional_id IS NOT NULL)
  );

RAISE NOTICE '✅ Migración completada. Cada profesional ahora ve SOLO sus pacientes asignados.';
