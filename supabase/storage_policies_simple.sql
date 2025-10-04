-- =====================================================
-- POLÍTICAS SIMPLIFICADAS PARA SUPABASE STORAGE
-- Permite que usuarios autenticados suban imágenes
-- =====================================================

-- 1. Asegurarse de que el bucket existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagenes', 'imagenes', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Permitir lectura pública de imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Solo profesionales pueden subir imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Solo profesionales pueden actualizar imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Solo profesionales pueden eliminar imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar imágenes" ON storage.objects;

-- 3. Crear políticas simplificadas

-- Permitir que TODOS (incluso no autenticados) vean las imágenes
CREATE POLICY "Permitir lectura pública de imágenes"
ON storage.objects FOR SELECT
USING (bucket_id = 'imagenes');

-- Permitir que usuarios autenticados suban imágenes
CREATE POLICY "Usuarios autenticados pueden subir imágenes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'imagenes' 
  AND auth.role() = 'authenticated'
);

-- Permitir que usuarios autenticados actualicen imágenes
CREATE POLICY "Usuarios autenticados pueden actualizar imágenes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'imagenes'
  AND auth.role() = 'authenticated'
);

-- Permitir que usuarios autenticados eliminen imágenes
CREATE POLICY "Usuarios autenticados pueden eliminar imágenes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'imagenes'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT 
  'Políticas de Storage actualizadas' AS status,
  'Usuarios autenticados pueden ahora subir imágenes' AS mensaje;
