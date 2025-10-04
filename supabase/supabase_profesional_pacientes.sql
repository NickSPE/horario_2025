-- =====================================================
-- EXTENSIÓN: PROFESIONAL ASIGNA RECORDATORIOS A PACIENTES
-- =====================================================

-- NOTA: Este script requiere que primero ejecutes:
-- 1. supabase_medicamentos.sql
-- 2. supabase_recordatorios.sql
-- 3. supabase_tabla_pacientes.sql  <-- NUEVO

-- Tabla para vincular pacientes con profesionales de salud
CREATE TABLE IF NOT EXISTS paciente_profesional (
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

-- Modificar tabla de recordatorios para saber quién lo creó
ALTER TABLE recordatorios_medicamentos 
  ADD COLUMN IF NOT EXISTS creado_por_profesional_id UUID REFERENCES auth.users(id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_paciente_profesional_paciente 
  ON paciente_profesional(paciente_id);

CREATE INDEX IF NOT EXISTS idx_paciente_profesional_profesional 
  ON paciente_profesional(profesional_id);

CREATE INDEX IF NOT EXISTS idx_recordatorios_creado_por 
  ON recordatorios_medicamentos(creado_por_profesional_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE paciente_profesional ENABLE ROW LEVEL SECURITY;

-- Profesionales ven sus pacientes asignados
CREATE POLICY "Profesionales ven sus pacientes"
  ON paciente_profesional FOR SELECT
  USING (auth.uid() = profesional_id);

-- Pacientes ven sus profesionales asignados
CREATE POLICY "Pacientes ven sus profesionales"
  ON paciente_profesional FOR SELECT
  USING (auth.uid() = paciente_id);

-- Solo profesionales pueden asignar pacientes
CREATE POLICY "Profesionales asignan pacientes"
  ON paciente_profesional FOR INSERT
  WITH CHECK (auth.uid() = profesional_id);

-- Profesionales actualizan sus asignaciones
CREATE POLICY "Profesionales actualizan asignaciones"
  ON paciente_profesional FOR UPDATE
  USING (auth.uid() = profesional_id);

-- Actualizar políticas de recordatorios para permitir que profesionales creen recordatorios para sus pacientes
DROP POLICY IF EXISTS "Usuarios crean sus recordatorios" ON recordatorios_medicamentos;

CREATE POLICY "Usuarios y profesionales crean recordatorios"
  ON recordatorios_medicamentos FOR INSERT
  WITH CHECK (
    -- El usuario crea su propio recordatorio
    auth.uid() = user_id
    OR
    -- Un profesional asignado crea recordatorio para su paciente
    EXISTS (
      SELECT 1 FROM paciente_profesional
      WHERE paciente_profesional.paciente_id = recordatorios_medicamentos.user_id
      AND paciente_profesional.profesional_id = auth.uid()
      AND paciente_profesional.activo = true
    )
  );

-- Profesionales pueden ver recordatorios de sus pacientes
DROP POLICY IF EXISTS "Usuarios ven sus recordatorios" ON recordatorios_medicamentos;

CREATE POLICY "Usuarios y profesionales ven recordatorios"
  ON recordatorios_medicamentos FOR SELECT
  USING (
    -- El usuario ve sus propios recordatorios
    auth.uid() = user_id
    OR
    -- Un profesional ve recordatorios de sus pacientes
    EXISTS (
      SELECT 1 FROM paciente_profesional
      WHERE paciente_profesional.paciente_id = recordatorios_medicamentos.user_id
      AND paciente_profesional.profesional_id = auth.uid()
      AND paciente_profesional.activo = true
    )
  );

-- Profesionales pueden actualizar recordatorios de sus pacientes
DROP POLICY IF EXISTS "Usuarios actualizan sus recordatorios" ON recordatorios_medicamentos;

CREATE POLICY "Usuarios y profesionales actualizan recordatorios"
  ON recordatorios_medicamentos FOR UPDATE
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM paciente_profesional
      WHERE paciente_profesional.paciente_id = recordatorios_medicamentos.user_id
      AND paciente_profesional.profesional_id = auth.uid()
      AND paciente_profesional.activo = true
    )
  );

-- =====================================================
-- VISTA: Lista de pacientes con información básica
-- =====================================================

DROP VIEW IF EXISTS vista_pacientes_profesional;

CREATE OR REPLACE VIEW vista_pacientes_profesional AS
SELECT 
  pp.id AS relacion_id,
  pp.profesional_id,
  pp.paciente_id,
  pp.fecha_asignacion,
  pp.activo AS relacion_activa,
  pp.notas AS notas_profesional,
  
  -- Información del paciente (de la tabla pacientes)
  p.id AS paciente_tabla_id,
  p.nombre AS paciente_nombre,
  p.apellido AS paciente_apellido,
  p.email AS paciente_email,
  p.telefono AS paciente_telefono,
  p.dni AS paciente_dni,
  
  -- Contar recordatorios activos
  (
    SELECT COUNT(*)
    FROM recordatorios_medicamentos
    WHERE user_id = pp.paciente_id
    AND activo = true
  ) AS recordatorios_activos

FROM paciente_profesional pp
JOIN pacientes p ON pp.paciente_id = p.user_id
WHERE pp.activo = true AND p.activo = true;

-- RLS para la vista
ALTER VIEW vista_pacientes_profesional SET (security_invoker = on);

-- =====================================================
-- FUNCIÓN: Buscar pacientes (VERSIÓN SIMPLIFICADA)
-- =====================================================

-- ⚠️ COMENTADO: Esta función está definida en supabase_tabla_pacientes.sql
-- La versión de supabase_tabla_pacientes.sql incluye búsqueda por DNI y es más completa
-- No descomentar esto para evitar conflictos de tipo de retorno

/*
CREATE OR REPLACE FUNCTION buscar_pacientes(
  termino TEXT,
  profesional_id_param UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  nombre TEXT,
  apellido TEXT,
  telefono TEXT,
  esta_asignado BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(
      u.raw_user_meta_data->>'nombre',
      u.raw_user_meta_data->>'name', 
      u.raw_user_meta_data->>'firstName',
      u.raw_user_meta_data->>'first_name',
      SPLIT_PART(u.email, '@', 1)  -- Si no hay nombre, usa la parte del email antes del @
    ) AS nombre,
    COALESCE(
      u.raw_user_meta_data->>'apellido',
      u.raw_user_meta_data->>'lastName',
      u.raw_user_meta_data->>'last_name',
      u.raw_user_meta_data->>'surname',
      ''
    ) AS apellido,
    COALESCE(
      u.raw_user_meta_data->>'telefono',
      u.raw_user_meta_data->>'phone',
      u.raw_user_meta_data->>'telephone',
      ''
    ) AS telefono,
    EXISTS (
      SELECT 1 FROM paciente_profesional
      WHERE paciente_id = u.id
      AND profesional_id = COALESCE(profesional_id_param, auth.uid())
      AND activo = true
    ) AS esta_asignado
  FROM auth.users u
  WHERE 
    -- Buscar principalmente por EMAIL
    LOWER(u.email) LIKE LOWER('%' || termino || '%')
    -- Excluir al profesional actual
    AND u.id != COALESCE(profesional_id_param, auth.uid())
  ORDER BY 
    u.email
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- =====================================================
-- TRIGGER para updated_at
-- =====================================================

CREATE TRIGGER update_paciente_profesional_updated_at
  BEFORE UPDATE ON paciente_profesional
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

SELECT 'Sistema de asignación profesional-paciente creado exitosamente' AS status;
