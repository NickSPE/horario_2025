-- =====================================================
-- AGREGAR COLUMNA imagen_url A LA TABLA medicamentos
-- =====================================================

-- Agregar la columna imagen_url si no existe
ALTER TABLE medicamentos 
ADD COLUMN IF NOT EXISTS imagen_url TEXT;

-- Actualizar la vista para incluir imagen_url
DROP VIEW IF EXISTS vista_medicamentos_completa;

CREATE VIEW vista_medicamentos_completa AS
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

-- Verificación
SELECT 'Columna imagen_url agregada exitosamente' AS status;
