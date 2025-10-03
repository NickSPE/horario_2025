# 🔐 Flujo de Autenticación - Diagrama

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRO DE USUARIO                           │
└─────────────────────────────────────────────────────────────────┘

  1. Usuario visita /registro
          ↓
  2. Elige rol: Paciente o Profesional
          ↓
  3. Completa formulario:
     - Nombre completo
     - Email
     - Contraseña (min 6 chars)
     - Licencia (solo profesionales)
          ↓
  4. Click "Crear cuenta"
          ↓
  5. Register.tsx → getSupabase().auth.signUp()
          ↓
  6. Supabase crea usuario con metadata:
     {
       nombre: "Juan Pérez",
       role: "paciente",
       licencia: "12345" (opcional)
     }
          ↓
  7. Toast de confirmación
          ↓
  8. Redirige a /login


┌─────────────────────────────────────────────────────────────────┐
│                    INICIO DE SESIÓN                              │
└─────────────────────────────────────────────────────────────────┘

  1. Usuario visita /login
          ↓
  2. Ingresa email y contraseña
          ↓
  3. Click "Ingresar"
          ↓
  4. Login.tsx → getSupabase().auth.signInWithPassword()
          ↓
  5. Supabase valida credenciales
          ↓
  6. Lee user.user_metadata.role
          ↓
  7. Redirige según rol:
     - role === "paciente" → /dashboard/paciente
     - role === "profesional" → /dashboard/profesional


┌─────────────────────────────────────────────────────────────────┐
│                    PROTECCIÓN DE RUTAS                           │
└─────────────────────────────────────────────────────────────────┘

  Usuario intenta acceder a /dashboard/*
          ↓
  ProtectedRoute verifica:
  1. ¿Hay usuario autenticado?
     NO → Redirige a /login
     SÍ ↓
          
  2. ¿Rol coincide con la ruta?
     NO → Redirige a su dashboard correcto
     SÍ ↓
          
  3. Muestra contenido protegido


┌─────────────────────────────────────────────────────────────────┐
│                    PERSISTENCIA DE SESIÓN                        │
└─────────────────────────────────────────────────────────────────┘

  App.tsx carga
          ↓
  AuthProvider ejecuta useEffect
          ↓
  getSupabase().auth.getSession()
          ↓
  Recupera sesión de localStorage
          ↓
  Actualiza estado de usuario
          ↓
  onAuthStateChange escucha cambios
          ↓
  Mantiene sincronizado el estado


┌─────────────────────────────────────────────────────────────────┐
│                    CERRAR SESIÓN                                 │
└─────────────────────────────────────────────────────────────────┘

  Usuario click "Cerrar sesión"
          ↓
  Layout.tsx → handleSignOut()
          ↓
  useAuth().signOut()
          ↓
  getSupabase().auth.signOut()
          ↓
  Limpia localStorage
          ↓
  Actualiza estado: user = null
          ↓
  Redirige a /login


┌─────────────────────────────────────────────────────────────────┐
│                    ESTRUCTURA DE COMPONENTES                     │
└─────────────────────────────────────────────────────────────────┘

App.tsx
  └─ AuthProvider (gestión de estado auth)
      └─ BrowserRouter
          └─ Routes
              ├─ / → Index (pública)
              ├─ /login → Login (pública)
              ├─ /registro → Register (pública)
              │
              ├─ /dashboard/paciente
              │   └─ ProtectedRoute (role="paciente")
              │       └─ PacienteLayout
              │           └─ useAuth() → muestra nombre, logout
              │
              └─ /dashboard/profesional
                  └─ ProtectedRoute (role="profesional")
                      └─ ProfesionalLayout
                          └─ useAuth() → muestra nombre, licencia, logout


┌─────────────────────────────────────────────────────────────────┐
│                    METADATA DEL USUARIO                          │
└─────────────────────────────────────────────────────────────────┘

Supabase Auth User Object:
{
  id: "uuid-del-usuario",
  email: "usuario@example.com",
  user_metadata: {
    nombre: "Juan Pérez",
    role: "paciente",        // o "profesional"
    licencia: "12345ABC"     // solo profesionales
  },
  created_at: "2025-01-15T...",
  ...
}

Acceso en componentes:
const { user } = useAuth();
const nombre = user?.user_metadata?.nombre;
const role = user?.user_metadata?.role;
```

## 🗂️ Archivos Clave

| Archivo | Responsabilidad |
|---------|----------------|
| `client/hooks/use-auth.tsx` | Hook global para estado de auth |
| `client/components/ProtectedRoute.tsx` | HOC para proteger rutas |
| `client/lib/supabase.ts` | Cliente singleton de Supabase |
| `client/pages/Register.tsx` | Formulario de registro + signUp |
| `client/pages/Login.tsx` | Formulario de login + signIn |
| `client/pages/*/Layout.tsx` | Muestra info usuario + logout |
| `client/App.tsx` | Envuelve app con AuthProvider |

## 🔑 Funciones Clave de Supabase Auth

```typescript
// Registro
supabase.auth.signUp({
  email,
  password,
  options: { data: { nombre, role, licencia } }
})

// Login
supabase.auth.signInWithPassword({ email, password })

// Obtener sesión actual
supabase.auth.getSession()

// Escuchar cambios de auth
supabase.auth.onAuthStateChange((event, session) => {
  // Actualizar estado
})

// Cerrar sesión
supabase.auth.signOut()
```

## 📊 Estados de Autenticación

| Estado | user | loading | Comportamiento |
|--------|------|---------|----------------|
| Cargando | null | true | Muestra spinner |
| No autenticado | null | false | Redirige a /login |
| Autenticado | User | false | Acceso a dashboard |

## 🎯 Verificaciones de Seguridad

✅ Contraseña mínimo 6 caracteres  
✅ Email válido (validación HTML5)  
✅ Rutas protegidas por autenticación  
✅ Rutas protegidas por rol  
✅ Sesión persiste en localStorage  
✅ Token JWT en cada request  
✅ Metadata encriptada en Supabase  

---

**Implementado con Supabase Auth + React Context + Protected Routes** 🔒
