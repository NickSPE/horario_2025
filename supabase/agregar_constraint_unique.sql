-- =====================================================
-- AGREGAR CONSTRAINT UNIQUE A LAS TABLAS
-- Necesario para poder usar ON CONFLICT en los INSERT
-- =====================================================

-- Primero verificamos si ya existen duplicados y los eliminamos
-- (esto es importante antes de agregar el constraint)

-- Ver si hay categorías duplicadas
SELECT nombre, COUNT(*) 
FROM categorias_medicamentos 
GROUP BY nombre 
HAVING COUNT(*) > 1;

-- Ver si hay medicamentos duplicados
SELECT nombre, COUNT(*) 
FROM medicamentos 
GROUP BY nombre 
HAVING COUNT(*) > 1;

-- Si hay duplicados, eliminar los extras manteniendo solo uno
-- (descomenta estas líneas si es necesario)
/*
DELETE FROM categorias_medicamentos a
USING categorias_medicamentos b
WHERE a.id > b.id AND a.nombre = b.nombre;

DELETE FROM medicamentos a
USING medicamentos b
WHERE a.id > b.id AND a.nombre = b.nombre;
*/

-- Ahora agregamos los constraints UNIQUE
ALTER TABLE categorias_medicamentos 
ADD CONSTRAINT unique_categoria_nombre UNIQUE (nombre);

ALTER TABLE medicamentos 
ADD CONSTRAINT unique_medicamento_nombre UNIQUE (nombre);

-- Verificar que se crearon correctamente
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE' 
    AND tc.table_name IN ('categorias_medicamentos', 'medicamentos');

SELECT 'Constraints UNIQUE agregados correctamente' AS mensaje;
