# 🏥 Horario Médico - Plataforma de Gestión de Medicamentos

Plataforma web para la gestión de tratamientos médicos, recordatorios de medicación y comunicación entre pacientes y profesionales de la salud.

## ✨ Características

### Para Pacientes
- 📋 Gestión de recetas y medicamentos
- ⏰ Recordatorios personalizados de tomas
- 📅 Calendario de citas médicas
- 💬 Mensajería con profesionales
- 📊 Historial de adherencia al tratamiento

### Para Profesionales de Salud
- 👥 Gestión de pacientes
- 📝 Emisión de recetas digitales
- 💊 Catálogo de medicamentos
- 📹 Videollamadas con pacientes
- 📊 Seguimiento de adherencia
- ⏱️ Gestión de horarios y citas

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ (recomendado 18.x o 20.x)
- npm o pnpm
- Cuenta de Supabase (gratuita)

### Instalación

1. **Clonar el repositorio**
```powershell
git clone <tu-repo>
cd 123
```

2. **Instalar dependencias**
```powershell
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase (obligatorio)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Servidor (opcional)
PORT=3000
PING_MESSAGE=ping
```

Puedes copiar `.env.example` como plantilla.

4. **Arrancar en modo desarrollo**
```powershell
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:8080
```

## 🔐 Autenticación

Este proyecto usa **Supabase Auth** para autenticación real. Ver [SUPABASE_AUTH.md](./SUPABASE_AUTH.md) para:
- Configuración completa de Supabase
- Creación de tablas opcionales
- Configuración de políticas de seguridad
- Solución de problemas comunes

### Registro Rápido

1. Ve a http://localhost:8080/registro
2. Elige tipo de usuario (Paciente o Profesional)
3. Completa el formulario
4. Confirma tu email (si está habilitado)
5. Inicia sesión en http://localhost:8080/login

## 📂 Estructura del Proyecto

```
123/
├── client/               # Aplicación React (Frontend)
│   ├── components/      # Componentes UI reutilizables
│   │   ├── layout/     # Layouts principales
│   │   └── ui/         # Componentes shadcn/ui
│   ├── hooks/          # Hooks personalizados
│   │   └── use-auth.tsx  # Hook de autenticación
│   ├── lib/            # Utilidades y configuración
│   │   └── supabase.ts   # Cliente de Supabase
│   ├── pages/          # Páginas de la aplicación
│   │   ├── paciente/   # Dashboard paciente
│   │   └── profesional/ # Dashboard profesional
│   ├── App.tsx         # Componente raíz
│   └── global.css      # Estilos globales
│
├── server/              # Servidor Express (Backend)
│   ├── routes/         # Rutas API
│   ├── index.ts        # Configuración Express
│   └── node-build.ts   # Entry point producción
│
├── shared/              # Código compartido (tipos, utils)
├── netlify/             # Funciones Netlify (deployment)
└── public/              # Archivos estáticos

```

## 🛠️ Scripts Disponibles

```powershell
# Desarrollo (Vite + Express)
npm run dev

# Build para producción
npm run build

# Arrancar build de producción
npm start

# Verificar tipos TypeScript
npm run typecheck

# Formatear código
npm run format.fix

# Tests
npm test
```

## 🧪 Testing

### Usuarios de Prueba

Puedes crear usuarios de prueba usando el formulario de registro:

**Paciente:**
- Email: `paciente@test.com`
- Password: `Test1234`

**Profesional:**
- Email: `profesional@test.com`
- Password: `Test1234`
- Licencia: `12345ABC`

## 🏗️ Stack Tecnológico

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router** - Enrutamiento
- **TanStack Query** - Gestión de estado servidor
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **Radix UI** - Primitivas accesibles

### Backend
- **Express 5** - Framework servidor
- **Supabase** - Base de datos y autenticación
- **Zod** - Validación de schemas

### Desarrollo
- **SWC** - Compilador rápido
- **Vitest** - Testing
- **Prettier** - Formateo de código

## 🌐 Deployment

### Netlify (Recomendado)

El proyecto está preconfigurado para Netlify:

1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno en Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático en cada push

### Build Manual

```powershell
# Compilar cliente y servidor
npm run build

# Archivos generados:
# - dist/spa/      → Frontend estático
# - dist/server/   → Bundle del servidor

# Arrancar en producción
npm start
```

## 🔒 Seguridad

- ✅ Autenticación JWT con Supabase
- ✅ Row Level Security (RLS) en base de datos
- ✅ Variables de entorno para secretos
- ✅ Validación de inputs con Zod
- ✅ Rutas protegidas por rol
- ✅ CORS configurado

## 📝 Configuración de Supabase

### 1. Crear Proyecto
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia URL y anon key

### 2. Configurar Email Auth
- Authentication → Providers → Email ✅
- (Opcional) Desactivar confirmación para desarrollo

### 3. Tabla Opcional de Perfiles

Ver SQL completo en [SUPABASE_AUTH.md](./SUPABASE_AUTH.md#2-configuración-de-supabase-opcional)

## 🐛 Solución de Problemas

### Error: "Missing VITE_SUPABASE_URL"
- Crea archivo `.env` con las variables de Supabase
- Reinicia el servidor de desarrollo

### Error: "outside of Vite serving allow list"
- Ya está solucionado en `vite.config.ts`
- Si persiste, verifica que `allow: ["./", ...]` incluye raíz

### pnpm no encontrado
- Usa `npm` en su lugar (totalmente compatible)
- O instala pnpm: `npm install -g pnpm`

### El servidor no arranca en producción
- Verifica que ejecutaste `npm run build`
- Revisa que existe `dist/server/*.mjs`
- Comprueba variables de entorno en producción

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

## 📧 Contacto

Para soporte o preguntas, abre un issue en el repositorio.

---

**Desarrollado con ❤️ para mejorar la adherencia al tratamiento médico**
