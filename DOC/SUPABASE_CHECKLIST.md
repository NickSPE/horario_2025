# ✅ Checklist de Configuración de Supabase

## 🎯 Objetivo
Configurar Supabase para autenticación completa en la aplicación Horario Médico.

---

## 📋 Pasos de Configuración

### 1. Crear Proyecto en Supabase

- [ ] Ir a [supabase.com](https://supabase.com)
- [ ] Crear cuenta o iniciar sesión
- [ ] Click en "New Project"
- [ ] Llenar datos:
  - Nombre: `horario-medico` (o el que prefieras)
  - Database Password: (guardar en lugar seguro)
  - Region: Elegir la más cercana
  - Plan: Free tier (suficiente para desarrollo)
- [ ] Click "Create new project"
- [ ] Esperar ~2 minutos mientras se provisiona

### 2. Obtener Credenciales

- [ ] Ir a Settings → API
- [ ] Copiar `Project URL` → pegar en `.env` como `VITE_SUPABASE_URL`
- [ ] Copiar `anon public` key → pegar en `.env` como `VITE_SUPABASE_ANON_KEY`

**Tu `.env` debe verse así:**
```env
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3. Configurar Authentication

#### 3.1 Habilitar Email Auth
- [ ] Ir a Authentication → Providers
- [ ] Verificar que "Email" esté habilitado ✅
- [ ] (Opcional) Habilitar otros providers (Google, GitHub, etc.)

#### 3.2 Configurar Confirmación de Email

**Para Desarrollo (más rápido):**
- [ ] Ir a Authentication → Settings
- [ ] Scroll a "Email Confirmation"
- [ ] Toggle OFF "Enable email confirmations"
- [ ] Click "Save"

**Para Producción (recomendado):**
- [ ] Mantener "Enable email confirmations" ON
- [ ] Ir a Authentication → Email Templates
- [ ] Personalizar template de "Confirm signup"
- [ ] Agregar tu dominio en "Site URL"

#### 3.3 Configurar URLs de Redirect

- [ ] Ir a Authentication → URL Configuration
- [ ] Agregar URLs permitidas:
  ```
  http://localhost:8080
  http://localhost:8080/**
  https://tu-dominio.netlify.app
  https://tu-dominio.netlify.app/**
  ```

### 4. Crear Tabla de Perfiles (Opcional pero Recomendado)

- [ ] Ir a SQL Editor
- [ ] Click "New Query"
- [ ] Copiar y pegar el siguiente SQL:

```sql
-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nombre TEXT,
  role TEXT CHECK (role IN ('paciente', 'profesional')),
  licencia TEXT,
  telefono TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Política: Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Función para crear perfil automáticamente
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

-- Trigger para ejecutar la función
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

- [ ] Click "Run"
- [ ] Verificar mensaje de éxito

### 5. Verificar Configuración

#### Test Manual
- [ ] Arrancar app: `npm run dev`
- [ ] Ir a http://localhost:8080/registro
- [ ] Registrar usuario de prueba:
  - Nombre: Test User
  - Email: test@example.com
  - Contraseña: Test1234
  - Rol: Paciente
- [ ] Click "Crear cuenta"
- [ ] Verificar toast de éxito

#### Verificar en Supabase
- [ ] Ir a Authentication → Users
- [ ] Verificar que aparece el nuevo usuario
- [ ] Click en el usuario
- [ ] Verificar que `user_metadata` contiene:
  ```json
  {
    "nombre": "Test User",
    "role": "paciente"
  }
  ```

#### Verificar Tabla Profiles (si la creaste)
- [ ] Ir a Table Editor → profiles
- [ ] Verificar que hay una fila con los datos del usuario

### 6. Configurar Email Templates (Producción)

- [ ] Ir a Authentication → Email Templates
- [ ] Personalizar templates:
  - **Confirm signup**: Email de confirmación
  - **Invite user**: Invitación de usuario
  - **Magic Link**: Login sin contraseña
  - **Change Email Address**: Cambio de email
  - **Reset Password**: Reseteo de contraseña

**Template de ejemplo para Confirm Signup:**
```html
<h2>Bienvenido a Horario Médico</h2>
<p>Hola {{ .Name }},</p>
<p>Por favor confirma tu cuenta haciendo click en el siguiente enlace:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar cuenta</a></p>
<p>Este enlace expira en 24 horas.</p>
<p>Si no creaste esta cuenta, ignora este email.</p>
```

### 7. Configurar Rate Limiting (Seguridad)

- [ ] Ir a Authentication → Settings
- [ ] Scroll a "Rate Limits"
- [ ] Configurar límites apropiados:
  - Sign ups per hour: 100 (default)
  - Password resets per hour: 20 (default)
  - Sign ins per hour: 500 (default)

### 8. (Opcional) Habilitar Providers Adicionales

#### Google OAuth
- [ ] Ir a Authentication → Providers → Google
- [ ] Habilitar
- [ ] Agregar Client ID y Client Secret desde Google Cloud Console
- [ ] Configurar redirect URL en Google

#### GitHub OAuth
- [ ] Ir a Authentication → Providers → GitHub
- [ ] Habilitar
- [ ] Agregar Client ID y Client Secret desde GitHub Developer Settings
- [ ] Configurar callback URL en GitHub

### 9. Configurar Storage (Para avatares de usuario)

- [ ] Ir a Storage
- [ ] Click "Create bucket"
- [ ] Nombre: `avatars`
- [ ] Public bucket: ✅
- [ ] Click "Create bucket"
- [ ] Configurar políticas de Storage (opcional)

### 10. Verificación Final

- [ ] Todas las credenciales en `.env` son correctas
- [ ] Email auth está habilitado
- [ ] Usuario de prueba creado exitosamente
- [ ] Login funciona correctamente
- [ ] Redirect a dashboard según rol funciona
- [ ] Cerrar sesión funciona
- [ ] (Opcional) Tabla profiles creada y poblada

---

## 🚨 Troubleshooting

### ❌ "Invalid API key"
**Solución:** Verifica que copiaste la `anon public` key correcta desde Settings → API

### ❌ "Email rate limit exceeded"
**Solución:** Espera 1 hora o desactiva rate limiting temporalmente en Settings

### ❌ "Invalid redirect URL"
**Solución:** Agrega tu URL en Authentication → URL Configuration

### ❌ Email no llega
**Solución:** 
1. Revisa spam
2. Para desarrollo, desactiva confirmación de email
3. Verifica que el template de email esté configurado

### ❌ "User not found after signup"
**Solución:** Confirma el email del usuario o desactiva confirmación

---

## 📊 Resumen de Variables de Entorno

Copia esto en tu `.env`:

```env
# Supabase
VITE_SUPABASE_URL=https://XXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Servidor (opcional)
PORT=3000
PING_MESSAGE=ping
```

---

## 🎉 ¡Listo!

Una vez completado este checklist:
- ✅ Autenticación funcionando
- ✅ Usuarios pueden registrarse
- ✅ Login y logout funcionales
- ✅ Rutas protegidas por rol
- ✅ Datos persistentes en Supabase

**Siguiente paso:** Ejecuta `npm run dev` y prueba el flujo completo de registro → login → dashboard

---

## 📚 Referencias Rápidas

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Guía completa del proyecto](./SUPABASE_AUTH.md)

---

**Creado para facilitar la configuración inicial de Supabase** 🚀
