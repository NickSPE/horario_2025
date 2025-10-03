# Autenticación con Supabase - Guía de Configuración

## 📋 Resumen

Este proyecto ahora está integrado con **Supabase** para autenticación real de usuarios. Los usuarios pueden registrarse como **paciente** o **profesional de salud**, y el sistema gestiona automáticamente el acceso basado en roles.

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Asegúrate de tener las siguientes variables en tu archivo `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

Estas credenciales las encuentras en:
- Supabase Dashboard → Settings → API

### 2. Configuración de Supabase (Opcional)

Si quieres almacenar datos adicionales de usuarios en una tabla personalizada, ejecuta este SQL en Supabase:

```sql
-- Tabla de perfiles de usuario (opcional, para extender datos)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  nombre TEXT,
  role TEXT CHECK (role IN ('paciente', 'profesional')),
  licencia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver y editar su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, role, licencia)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'licencia'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función al crear un usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Configuración de Email (Supabase)

Por defecto, Supabase requiere confirmación por email. Para desarrollo, puedes desactivarla:

1. Ve a: **Authentication → Email Templates**
2. Cambia el template de "Confirm signup" a uno simple
3. O desactiva la confirmación en: **Authentication → Settings → Email Auth → Disable email confirmations** (solo para desarrollo)

## 🔐 Flujo de Autenticación

### Registro
1. El usuario elige entre "Paciente" o "Profesional"
2. Completa el formulario con nombre, email, contraseña
3. Si es profesional, debe ingresar número de licencia
4. Los datos se guardan en `user_metadata` de Supabase Auth
5. Se envía email de confirmación (si está habilitado)
6. Redirige a `/login`

### Login
1. Usuario ingresa email y contraseña
2. Supabase valida las credenciales
3. El sistema lee el `role` desde `user_metadata`
4. Redirige automáticamente al dashboard correcto:
   - Pacientes → `/dashboard/paciente`
   - Profesionales → `/dashboard/profesional`

### Protección de Rutas
- Las rutas de dashboard están protegidas con `ProtectedRoute`
- Los usuarios no autenticados son redirigidos a `/login`
- Los usuarios con rol incorrecto son redirigidos a su dashboard

### Cerrar Sesión
- Botón "Cerrar sesión" disponible en ambos dashboards
- Limpia la sesión de Supabase
- Redirige a `/login`

## 📁 Archivos Modificados/Creados

### Nuevos Archivos
- `client/hooks/use-auth.tsx` - Hook para gestionar estado de autenticación
- `client/components/ProtectedRoute.tsx` - Componente para proteger rutas
- `SUPABASE_AUTH.md` - Esta guía

### Archivos Actualizados
- `client/pages/Register.tsx` - Conectado con Supabase signUp
- `client/pages/Login.tsx` - Conectado con Supabase signIn
- `client/App.tsx` - Envuelto con AuthProvider y rutas protegidas
- `client/pages/profesional/Layout.tsx` - Muestra datos del usuario, botón logout
- `client/pages/paciente/Layout.tsx` - Muestra datos del usuario, botón logout

## 🧪 Pruebas

### Crear cuenta de prueba
```bash
# 1. Arranca el servidor
npm run dev

# 2. Abre http://localhost:8080/registro

# 3. Regístrate como paciente:
Nombre: Juan Pérez
Email: paciente@test.com
Contraseña: Test1234

# 4. Regístrate como profesional:
Nombre: Dra. María López
Email: profesional@test.com
Contraseña: Test1234
Licencia: 12345ABC
```

### Verificar en Supabase
1. Dashboard → Authentication → Users
2. Deberías ver los usuarios creados
3. Haz clic en un usuario para ver `user_metadata` con role, nombre, etc.

## 🎯 Metadata del Usuario

Cuando un usuario se registra, guardamos en `user_metadata`:

```typescript
{
  nombre: "Juan Pérez",
  role: "paciente", // o "profesional"
  licencia: "12345ABC" // solo para profesionales
}
```

Acceso desde el código:
```typescript
const { user } = useAuth();
const nombre = user?.user_metadata?.nombre;
const role = user?.user_metadata?.role;
const licencia = user?.user_metadata?.licencia;
```

## 🔧 Solución de Problemas

### Error: "Missing VITE_SUPABASE_URL"
- Verifica que `.env` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo después de editar `.env`

### Email de confirmación no llega
- Revisa spam/correo no deseado
- Verifica configuración en Supabase → Authentication → Email Templates
- Para desarrollo, desactiva confirmación de email

### Usuario no puede acceder al dashboard
- Verifica que el `role` se guardó correctamente en `user_metadata`
- Revisa la consola del navegador para errores
- Confirma que el email fue verificado (si la confirmación está activa)

### Sesión no persiste al recargar
- Supabase usa localStorage por defecto
- Verifica que `persistSession: true` en `client/lib/supabase.ts`

## 📚 Recursos

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [React Auth Tutorial](https://supabase.com/docs/guides/auth/auth-helpers/react)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ Checklist de Despliegue

- [ ] Variables de entorno configuradas en producción
- [ ] Confirmación de email habilitada en Supabase
- [ ] Políticas de RLS configuradas (si usas tabla profiles)
- [ ] Email templates personalizados
- [ ] Rate limiting configurado en Supabase
- [ ] Redirect URLs configuradas en Supabase para tu dominio

---

**¡Listo!** Tu aplicación ahora tiene autenticación real con Supabase 🎉
