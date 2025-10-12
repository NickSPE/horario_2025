-- =====================================================
-- TABLA DE CITAS - ESTRUCTURA COMPLETA
-- =====================================================

-- 1. CREAR TABLA CITAS
CREATE TABLE IF NOT EXISTS citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paciente_nombre TEXT NOT NULL,
  paciente_apellido TEXT NOT NULL,
  paciente_email TEXT,
  paciente_telefono TEXT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completada', 'cancelada', 'no_asistio')),
  notas TEXT,
  tipo_cita TEXT DEFAULT 'consulta',
  duracion_minutos INTEGER DEFAULT 30,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fecha_futura CHECK (fecha >= CURRENT_DATE)
);

-- 2. CREAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_citas_profesional ON citas(profesional_id);
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_profesional_fecha ON citas(profesional_id, fecha);

-- 3. HABILITAR RLS
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

-- 4. ELIMINAR POLÍTICAS ANTIGUAS (si existen)
DROP POLICY IF EXISTS "Profesionales ven sus citas" ON citas;
DROP POLICY IF EXISTS "Profesionales crean citas" ON citas;
DROP POLICY IF EXISTS "Profesionales actualizan citas" ON citas;
DROP POLICY IF EXISTS "Profesionales eliminan citas" ON citas;
DROP POLICY IF EXISTS "Pacientes ven sus citas" ON citas;

-- 5. CREAR POLÍTICAS RLS

-- Profesionales ven solo sus citas
CREATE POLICY "Profesionales ven sus citas"
  ON citas FOR SELECT
  USING (auth.uid() = profesional_id);

-- Profesionales crean citas
CREATE POLICY "Profesionales crean citas"
  ON citas FOR INSERT
  WITH CHECK (auth.uid() = profesional_id);

-- Profesionales actualizan sus citas
CREATE POLICY "Profesionales actualizan citas"
  ON citas FOR UPDATE
  USING (auth.uid() = profesional_id)
  WITH CHECK (auth.uid() = profesional_id);

-- Profesionales eliminan sus citas
CREATE POLICY "Profesionales eliminan citas"
  ON citas FOR DELETE
  USING (auth.uid() = profesional_id);

-- Pacientes pueden ver sus citas
CREATE POLICY "Pacientes ven sus citas"
  ON citas FOR SELECT
  USING (auth.uid() = paciente_id);

-- 6. CREAR TRIGGER PARA ACTUALIZAR updated_at
CREATE OR REPLACE FUNCTION actualizar_updated_at_citas()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_citas ON citas;
CREATE TRIGGER trigger_actualizar_citas
  BEFORE UPDATE ON citas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at_citas();

-- 7. CREAR VISTA PARA MOSTRAR CITAS CON RELACIONES
CREATE OR REPLACE VIEW vista_citas_profesional AS
SELECT 
  c.id,
  c.profesional_id,
  c.paciente_id,
  c.paciente_nombre,
  c.paciente_apellido,
  c.paciente_email,
  c.paciente_telefono,
  c.fecha,
  c.hora,
  c.estado,
  c.notas,
  c.tipo_cita,
  c.duracion_minutos,
  c.created_at,
  c.updated_at,
  (c.paciente_nombre || ' ' || c.paciente_apellido) AS paciente_nombre_completo,
  (c.fecha || ' ' || c.hora) AS fecha_hora
FROM citas c
WHERE c.profesional_id = auth.uid()
ORDER BY c.fecha DESC, c.hora DESC;

-- 8. GRANT PERMISOS
GRANT SELECT, INSERT, UPDATE, DELETE ON citas TO authenticated;
GRANT SELECT ON vista_citas_profesional TO authenticated;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver estructura de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'citas'
ORDER BY ordinal_position;

-- Ver políticas RLS
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'citas'
ORDER BY policyname;

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE '✅ Tabla citas creada exitosamente';
  RAISE NOTICE 'Características:';
  RAISE NOTICE '  - Relación profesional-paciente';
  RAISE NOTICE '  - Estados: pendiente, completada, cancelada, no_asistio';
  RAISE NOTICE '  - RLS habilitado (solo ve sus propias citas)';
  RAISE NOTICE '  - Vista: vista_citas_profesional';
END $$;