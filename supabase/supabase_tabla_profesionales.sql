-- =====================================================
-- TABLA PROFESIONALES: Información básica de profesionales
-- =====================================================

-- Tabla de profesionales (campos esenciales)
CREATE TABLE IF NOT EXISTS profesionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Información básica
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  licencia VARCHAR(50), -- Número de licencia profesional
  especialidad VARCHAR(100),
  telefono VARCHAR(20),
  
  -- Metadata
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_profesionales_user_id ON profesionales(user_id);
CREATE INDEX IF NOT EXISTS idx_profesionales_nombre ON profesionales(nombre);
CREATE INDEX IF NOT EXISTS idx_profesionales_apellido ON profesionales(apellido);
CREATE INDEX IF NOT EXISTS idx_profesionales_email ON profesionales(email);
CREATE INDEX IF NOT EXISTS idx_profesionales_licencia ON profesionales(licencia);
CREATE INDEX IF NOT EXISTS idx_profesionales_activo ON profesionales(activo);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profesionales ENABLE ROW LEVEL SECURITY;

-- Profesionales ven su propio perfil
CREATE POLICY "Profesionales ven su perfil"
  ON profesionales FOR SELECT
  USING (auth.uid() = user_id);

-- Profesionales actualizan su propio perfil
CREATE POLICY "Profesionales actualizan su perfil"
  ON profesionales FOR UPDATE
  USING (auth.uid() = user_id);

-- Profesionales crean su perfil al registrarse
CREATE POLICY "Profesionales crean su perfil"
  ON profesionales FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Pacientes pueden ver profesionales asignados
CREATE POLICY "Pacientes ven sus profesionales"
  ON profesionales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM paciente_profesional
      WHERE paciente_profesional.profesional_id = profesionales.user_id
      AND paciente_profesional.paciente_id = auth.uid()
      AND paciente_profesional.activo = true
    )
  );

-- =====================================================
-- FUNCIÓN: Trigger para updated_at
-- =====================================================

CREATE TRIGGER update_profesionales_updated_at
  BEFORE UPDATE ON profesionales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIÓN: Crear perfil automático al registrarse
-- =====================================================

CREATE OR REPLACE FUNCTION crear_perfil_profesional()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo crear perfil si el usuario es profesional
  IF NEW.raw_user_meta_data->>'role' = 'profesional' THEN
    BEGIN
      INSERT INTO profesionales (
        user_id,
        email,
        nombre,
        apellido,
        licencia,
        telefono
      ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Sin nombre'),
        COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
        COALESCE(NEW.raw_user_meta_data->>'licencia', NULL),
        COALESCE(NEW.raw_user_meta_data->>'telefono', '')
      )
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log el error pero permitir que el registro continúe
        RAISE WARNING 'Error al crear perfil de profesional: %', SQLERRM;
    END;
  END IF;
  
  -- Siempre retornar NEW para que el registro del usuario se complete
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created_create_profesional ON auth.users;

CREATE TRIGGER on_auth_user_created_create_profesional
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION crear_perfil_profesional();

-- =====================================================
-- MIGRAR USUARIOS EXISTENTES
-- =====================================================

-- Insertar profesionales desde auth.users existentes
INSERT INTO profesionales (user_id, email, nombre, apellido, licencia, telefono)
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
    u.raw_user_meta_data->>'licencia',
    NULL
  ),
  COALESCE(
    u.raw_user_meta_data->>'telefono',
    ''
  )
FROM auth.users u
WHERE 
  u.raw_user_meta_data->>'role' = 'profesional'
  AND NOT EXISTS (
    SELECT 1 FROM profesionales p WHERE p.user_id = u.id
  )
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver profesionales creados
SELECT 
  id,
  nombre,
  apellido,
  email,
  licencia,
  telefono,
  created_at
FROM profesionales
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

SELECT 'Tabla profesionales creada exitosamente. ' || 
       'Total profesionales: ' || COUNT(*)::TEXT AS status
FROM profesionales;
