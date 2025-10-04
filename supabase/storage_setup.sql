-- =====================================================
-- CONFIGURACIÓN DE SUPABASE STORAGE PARA IMÁGENES
-- =====================================================

-- 1. Crear bucket para almacenar imágenes de medicamentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagenes', 'imagenes', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Permitir lectura pública de imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Solo profesionales pueden subir imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Solo profesionales pueden actualizar imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Solo profesionales pueden eliminar imágenes" ON storage.objects;

-- 3. Crear políticas de seguridad para el bucket 'imagenes'

-- Permitir que todos vean las imágenes (lectura pública)
CREATE POLICY "Permitir lectura pública de imágenes"
ON storage.objects FOR SELECT
USING (bucket_id = 'imagenes');

-- Solo profesionales pueden subir imágenes
CREATE POLICY "Solo profesionales pueden subir imágenes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'imagenes' 
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'profesional'
  )
);

-- Solo profesionales pueden actualizar imágenes
CREATE POLICY "Solo profesionales pueden actualizar imágenes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'imagenes'
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'profesional'
  )
);

-- Solo profesionales pueden eliminar imágenes
CREATE POLICY "Solo profesionales pueden eliminar imágenes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'imagenes'
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'profesional'
  )
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT 'Bucket de imágenes configurado exitosamente' AS status;
