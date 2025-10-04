-- =====================================================
-- TABLA PACIENTES: Información básica de pacientes
-- =====================================================

-- Tabla de pacientes (solo campos esenciales)
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Información básica
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  dni VARCHAR(20) UNIQUE, -- DNI/Cédula/Pasaporte
  telefono VARCHAR(20),
  
  -- Metadata
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_pacientes_user_id ON pacientes(user_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre ON pacientes(nombre);
CREATE INDEX IF NOT EXISTS idx_pacientes_apellido ON pacientes(apellido);
CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);
CREATE INDEX IF NOT EXISTS idx_pacientes_dni ON pacientes(dni);
CREATE INDEX IF NOT EXISTS idx_pacientes_activo ON pacientes(activo);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;

-- Pacientes ven su propio perfil
CREATE POLICY "Pacientes ven su perfil"
  ON pacientes FOR SELECT
  USING (auth.uid() = user_id);

-- Pacientes actualizan su propio perfil
CREATE POLICY "Pacientes actualizan su perfil"
  ON pacientes FOR UPDATE
  USING (auth.uid() = user_id);

-- Pacientes crean su perfil al registrarse
CREATE POLICY "Pacientes crean su perfil"
  ON pacientes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Profesionales ven pacientes asignados
CREATE POLICY "Profesionales ven pacientes asignados"
  ON pacientes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM paciente_profesional
      WHERE paciente_profesional.paciente_id = pacientes.user_id
      AND paciente_profesional.profesional_id = auth.uid()
      AND paciente_profesional.activo = true
    )
  );

-- Profesionales actualizan info de pacientes asignados
CREATE POLICY "Profesionales actualizan pacientes asignados"
  ON pacientes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM paciente_profesional
      WHERE paciente_profesional.paciente_id = pacientes.user_id
      AND paciente_profesional.profesional_id = auth.uid()
      AND paciente_profesional.activo = true
    )
  );

-- =====================================================
-- FUNCIÓN: Trigger para updated_at
-- =====================================================

CREATE TRIGGER update_pacientes_updated_at
  BEFORE UPDATE ON pacientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIÓN: Buscar pacientes (SIMPLE Y RÁPIDA)
-- =====================================================

DROP FUNCTION IF EXISTS buscar_pacientes(TEXT, UUID);

CREATE OR REPLACE FUNCTION buscar_pacientes(
  termino TEXT,
  profesional_id_param UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email VARCHAR(255),
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  telefono VARCHAR(20),
  dni VARCHAR(20),
  esta_asignado BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.email,
    p.nombre,
    p.apellido,
    p.telefono,
    p.dni,
    EXISTS (
      SELECT 1 FROM paciente_profesional pp
      WHERE pp.paciente_id = p.user_id
      AND pp.profesional_id = COALESCE(profesional_id_param, auth.uid())
      AND pp.activo = true
    ) AS esta_asignado
  FROM pacientes p
  WHERE 
    p.activo = true
    AND (
      -- Si el término está vacío, mostrar todos
      termino IS NULL OR termino = '' OR
      -- Buscar por DNI (principal)
      p.dni LIKE '%' || termino || '%' OR
      -- Buscar por email
      LOWER(p.email) LIKE LOWER('%' || termino || '%') OR
      -- Buscar por nombre
      LOWER(p.nombre) LIKE LOWER('%' || termino || '%') OR
      -- Buscar por apellido
      LOWER(p.apellido) LIKE LOWER('%' || termino || '%') OR
      -- Buscar por teléfono
      p.telefono LIKE '%' || termino || '%'
    )
    -- Excluir al profesional actual
    AND p.user_id != COALESCE(profesional_id_param, auth.uid())
  ORDER BY 
    p.apellido, p.nombre
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VISTA: Pacientes del profesional (SIMPLE)
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
  
  -- Información del paciente
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
-- FUNCIÓN: Crear perfil automático al registrarse
-- =====================================================

CREATE OR REPLACE FUNCTION crear_perfil_paciente()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo crear perfil si el usuario es paciente
  IF NEW.raw_user_meta_data->>'role' = 'paciente' THEN
    BEGIN
      INSERT INTO pacientes (
        user_id,
        email,
        nombre,
        apellido,
        telefono,
        dni
      ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Sin nombre'),
        COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
        COALESCE(NEW.raw_user_meta_data->>'telefono', ''),
        COALESCE(NEW.raw_user_meta_data->>'dni', NULL)
      )
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log el error pero permitir que el registro continúe
        RAISE WARNING 'Error al crear perfil de paciente: %', SQLERRM;
    END;
  END IF;
  
  -- Siempre retornar NEW para que el registro del usuario se complete
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;

CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION crear_perfil_paciente();

-- =====================================================
-- MIGRAR USUARIOS EXISTENTES
-- =====================================================

-- Insertar pacientes desde auth.users existentes
INSERT INTO pacientes (user_id, email, nombre, apellido, telefono, dni)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'nombre',
    u.raw_user_meta_data->>'name',
    SPLIT_PART(u.email, '@', 1)
  ),
  COALESCE(
    u.raw_user_meta_data->>'apellido',
    ''
  ),
  COALESCE(
    u.raw_user_meta_data->>'telefono',
    ''
  ),
  COALESCE(
    u.raw_user_meta_data->>'dni',
    NULL
  )
FROM auth.users u
WHERE 
  u.raw_user_meta_data->>'role' = 'paciente'
  AND NOT EXISTS (
    SELECT 1 FROM pacientes p WHERE p.user_id = u.id
  )
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- ACTUALIZAR TABLA paciente_profesional
-- =====================================================

-- Ya no necesita cambios, sigue usando user_id como FK

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver pacientes creados
SELECT 
  id,
  nombre,
  apellido,
  email,
  dni,
  telefono,
  created_at
FROM pacientes
ORDER BY created_at DESC
LIMIT 10;

-- Probar búsqueda por DNI
SELECT * FROM buscar_pacientes('12345');

-- Probar búsqueda por nombre
SELECT * FROM buscar_pacientes('maria');

-- Ver vista de profesional-paciente
SELECT * FROM vista_pacientes_profesional LIMIT 5;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

SELECT 'Tabla pacientes creada exitosamente. ' || 
       'Total pacientes: ' || COUNT(*)::TEXT AS status
FROM pacientes;
