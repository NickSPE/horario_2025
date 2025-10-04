-- =====================================================
-- CONFIGURACIÓN SIMPLE DE SUPABASE STORAGE (Para testing)
-- =====================================================

-- 1. Crear bucket público
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagenes', 'imagenes', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Eliminar políticas existentes
DROP POLICY IF EXISTS "Permitir lectura pública de imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Solo profesionales pueden subir imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Solo profesionales pueden actualizar imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Solo profesionales pueden eliminar imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subir imagenes publicamente" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualizar imagenes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminar imagenes" ON storage.objects;

-- 3. Crear políticas simples (TEMPORALES - Solo para testing)

-- Todos pueden leer
CREATE POLICY "Permitir lectura pública de imágenes"
ON storage.objects FOR SELECT
USING (bucket_id = 'imagenes');

-- Usuarios autenticados pueden subir (temporal - relajado para testing)
CREATE POLICY "Permitir subir imagenes publicamente"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'imagenes' 
  AND auth.role() = 'authenticated'
);

-- Usuarios autenticados pueden actualizar
CREATE POLICY "Permitir actualizar imagenes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'imagenes'
  AND auth.role() = 'authenticated'
);

-- Usuarios autenticados pueden eliminar
CREATE POLICY "Permitir eliminar imagenes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'imagenes'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT 'Storage configurado con políticas relajadas para testing' AS status;
SELECT 'ADVERTENCIA: Cambiar a políticas restrictivas en producción' AS warning;
