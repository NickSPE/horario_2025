-- Crear bucket para audios de alarmas personalizados
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-alarmas', 'audio-alarmas', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Los usuarios pueden subir sus propios audios
CREATE POLICY "Los usuarios pueden subir sus propios audios"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-alarmas' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Los usuarios pueden ver sus propios audios
CREATE POLICY "Los usuarios pueden ver sus propios audios"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-alarmas'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Los usuarios pueden eliminar sus propios audios
CREATE POLICY "Los usuarios pueden eliminar sus propios audios"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio-alarmas'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Todos pueden leer audios (para que funcionen las URLs públicas)
CREATE POLICY "Audios públicos de lectura"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'audio-alarmas');
