-- =====================================================
-- SISTEMA DE MEDICAMENTOS - SUPABASE SQL
-- =====================================================

-- 1. Tabla de Categorías de Medicamentos
CREATE TABLE IF NOT EXISTS categorias_medicamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Medicamentos
CREATE TABLE IF NOT EXISTS medicamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria_id UUID REFERENCES categorias_medicamentos(id) ON DELETE CASCADE,
  imagen_url TEXT,
  dosis_recomendada TEXT,
  via_administracion TEXT,
  indicaciones TEXT,
  contraindicaciones TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_medicamentos_categoria 
  ON medicamentos(categoria_id);

CREATE INDEX IF NOT EXISTS idx_medicamentos_nombre 
  ON medicamentos(nombre);

CREATE INDEX IF NOT EXISTS idx_categorias_nombre 
  ON categorias_medicamentos(nombre);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE categorias_medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE SEGURIDAD - CATEGORÍAS
-- =====================================================

-- Todos pueden VER las categorías (pacientes y profesionales)
CREATE POLICY "Todos pueden ver categorías"
  ON categorias_medicamentos FOR SELECT
  USING (true);

-- Solo PROFESIONALES pueden CREAR categorías
CREATE POLICY "Solo profesionales pueden crear categorías"
  ON categorias_medicamentos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'profesional'
    )
  );

-- Solo el CREADOR o PROFESIONALES pueden ACTUALIZAR categorías
CREATE POLICY "Profesionales pueden actualizar categorías"
  ON categorias_medicamentos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'profesional'
    )
  );

-- Solo el CREADOR o PROFESIONALES pueden ELIMINAR categorías
CREATE POLICY "Profesionales pueden eliminar categorías"
  ON categorias_medicamentos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'profesional'
    )
  );

-- =====================================================
-- POLÍTICAS DE SEGURIDAD - MEDICAMENTOS
-- =====================================================

-- Todos pueden VER medicamentos (pacientes y profesionales)
CREATE POLICY "Todos pueden ver medicamentos"
  ON medicamentos FOR SELECT
  USING (true);

-- Solo PROFESIONALES pueden CREAR medicamentos
CREATE POLICY "Solo profesionales pueden crear medicamentos"
  ON medicamentos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'profesional'
    )
  );

-- Solo PROFESIONALES pueden ACTUALIZAR medicamentos
CREATE POLICY "Profesionales pueden actualizar medicamentos"
  ON medicamentos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'profesional'
    )
  );

-- Solo PROFESIONALES pueden ELIMINAR medicamentos
CREATE POLICY "Profesionales pueden eliminar medicamentos"
  ON medicamentos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'profesional'
    )
  );

-- =====================================================
-- TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categorias_updated_at
  BEFORE UPDATE ON categorias_medicamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medicamentos_updated_at
  BEFORE UPDATE ON medicamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS DE EJEMPLO (CATEGORÍAS)
-- =====================================================

INSERT INTO categorias_medicamentos (nombre, descripcion) VALUES
  ('Analgésicos', 'Medicamentos para aliviar el dolor'),
  ('Antibióticos', 'Medicamentos para combatir infecciones bacterianas'),
  ('Antiinflamatorios', 'Reducen la inflamación y el dolor'),
  ('Antihistamínicos', 'Para alergias y reacciones alérgicas'),
  ('Antihipertensivos', 'Control de presión arterial'),
  ('Antidiabéticos', 'Control de glucosa en sangre'),
  ('Cardiovasculares', 'Salud del corazón y circulación'),
  ('Gastrointestinales', 'Problemas digestivos y estomacales'),
  ('Vitaminas y Suplementos', 'Complementos nutricionales'),
  ('Respiratorios', 'Problemas respiratorios y asma')
ON CONFLICT DO NOTHING;

-- =====================================================
-- DATOS DE EJEMPLO (MEDICAMENTOS)
-- =====================================================

-- Obtener IDs de categorías para insertar medicamentos
DO $$
DECLARE
  cat_analgesicos UUID;
  cat_antibioticos UUID;
  cat_antiinflamatorios UUID;
  cat_antihipertensivos UUID;
BEGIN
  -- Obtener IDs de categorías
  SELECT id INTO cat_analgesicos FROM categorias_medicamentos WHERE nombre = 'Analgésicos' LIMIT 1;
  SELECT id INTO cat_antibioticos FROM categorias_medicamentos WHERE nombre = 'Antibióticos' LIMIT 1;
  SELECT id INTO cat_antiinflamatorios FROM categorias_medicamentos WHERE nombre = 'Antiinflamatorios' LIMIT 1;
  SELECT id INTO cat_antihipertensivos FROM categorias_medicamentos WHERE nombre = 'Antihipertensivos' LIMIT 1;

  -- Insertar medicamentos de ejemplo
  INSERT INTO medicamentos (nombre, categoria_id, dosis_recomendada, via_administracion, indicaciones) VALUES
    ('Paracetamol 500mg', cat_analgesicos, '1 tableta cada 6-8 horas', 'Oral', 'Dolor leve a moderado, fiebre'),
    ('Ibuprofeno 400mg', cat_antiinflamatorios, '1 tableta cada 8 horas', 'Oral', 'Dolor, inflamación, fiebre'),
    ('Amoxicilina 500mg', cat_antibioticos, '1 cápsula cada 8 horas', 'Oral', 'Infecciones bacterianas'),
    ('Losartán 50mg', cat_antihipertensivos, '1 tableta al día', 'Oral', 'Hipertensión arterial')
  ON CONFLICT DO NOTHING;
END $$;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista: Medicamentos con nombre de categoría
CREATE OR REPLACE VIEW vista_medicamentos_completa AS
SELECT 
  m.id,
  m.nombre,
  m.descripcion,
  m.imagen_url,
  m.dosis_recomendada,
  m.via_administracion,
  m.indicaciones,
  m.contraindicaciones,
  m.categoria_id,
  c.nombre AS categoria_nombre,
  m.created_at,
  m.updated_at
FROM medicamentos m
LEFT JOIN categorias_medicamentos c ON m.categoria_id = c.id
ORDER BY c.nombre, m.nombre;

-- Vista: Contar medicamentos por categoría
CREATE OR REPLACE VIEW vista_categorias_con_conteo AS
SELECT 
  c.id,
  c.nombre,
  c.descripcion,
  COUNT(m.id) AS total_medicamentos,
  c.created_at,
  c.updated_at
FROM categorias_medicamentos c
LEFT JOIN medicamentos m ON m.categoria_id = c.id
GROUP BY c.id, c.nombre, c.descripcion, c.created_at, c.updated_at
ORDER BY c.nombre;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Verificar instalación
SELECT 'Tablas de medicamentos creadas exitosamente' AS status;
