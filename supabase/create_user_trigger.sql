-- =====================================================
-- TRIGGER AUTOMÁTICO PARA CREAR PACIENTES Y PROFESIONALES
-- Cuando un usuario se registra en auth.users, automáticamente
-- crea su registro en la tabla correspondiente
-- =====================================================

-- 1. Función que se ejecuta cuando se crea un nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Obtener el rol del usuario desde los metadatos
  user_role := NEW.raw_user_meta_data->>'role';
  
  -- Si es paciente, crear registro en tabla pacientes
  IF user_role = 'paciente' THEN
    INSERT INTO public.pacientes (
      user_id,
      nombre,
      apellido,
      email,
      dni,
      activo
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
      COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
      NEW.email,
      NEW.raw_user_meta_data->>'dni',
      true
    );
    
  -- Si es profesional, crear registro en tabla profesionales
  ELSIF user_role = 'profesional' THEN
    INSERT INTO public.profesionales (
      user_id,
      nombre,
      apellido,
      email,
      licencia,
      activo
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
      COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
      NEW.email,
      NEW.raw_user_meta_data->>'licencia',
      true
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Si hay error, loguearlo pero no fallar el registro
    RAISE WARNING 'Error al crear perfil: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Crear el trigger que ejecuta la función cuando se crea un usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT 
  'Trigger creado exitosamente' AS status,
  'Los nuevos usuarios ahora se registrarán automáticamente en pacientes o profesionales' AS mensaje;

-- =====================================================
-- MIGRAR USUARIOS EXISTENTES (Opcional)
-- Si ya tienes usuarios registrados que no están en las tablas
-- =====================================================

-- Insertar pacientes que existen en auth pero no en la tabla pacientes
INSERT INTO public.pacientes (user_id, nombre, apellido, email, dni, activo)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'nombre', '') as nombre,
  COALESCE(u.raw_user_meta_data->>'apellido', '') as apellido,
  u.email,
  u.raw_user_meta_data->>'dni' as dni,
  true
FROM auth.users u
WHERE u.raw_user_meta_data->>'role' = 'paciente'
  AND NOT EXISTS (
    SELECT 1 FROM public.pacientes p WHERE p.user_id = u.id
  )
ON CONFLICT (user_id) DO NOTHING;

-- Insertar profesionales que existen en auth pero no en la tabla profesionales
INSERT INTO public.profesionales (user_id, nombre, apellido, email, licencia, activo)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'nombre', '') as nombre,
  COALESCE(u.raw_user_meta_data->>'apellido', '') as apellido,
  u.email,
  u.raw_user_meta_data->>'licencia' as licencia,
  true
FROM auth.users u
WHERE u.raw_user_meta_data->>'role' = 'profesional'
  AND NOT EXISTS (
    SELECT 1 FROM public.profesionales p WHERE p.user_id = u.id
  )
ON CONFLICT (user_id) DO NOTHING;

-- Mostrar resumen
SELECT 
  'Migración completada' AS status,
  (SELECT COUNT(*) FROM pacientes) AS total_pacientes,
  (SELECT COUNT(*) FROM profesionales) AS total_profesionales;
