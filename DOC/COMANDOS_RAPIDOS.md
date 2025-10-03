# 🚀 Comandos Rápidos - Guía de Desarrollo

## 📦 Instalación y Setup

```powershell
# Instalar dependencias (primera vez)
npm install

# Copiar ejemplo de .env y configurar
copy .env.example .env
# Luego edita .env con tus credenciales de Supabase
```

## 🏃 Desarrollo

```powershell
# Arrancar servidor de desarrollo (Vite + Express)
npm run dev
# Abre: http://localhost:8080

# Verificar tipos TypeScript sin compilar
npm run typecheck

# Formatear código automáticamente
npm run format.fix
```

## 🏗️ Build y Producción

```powershell
# Build completo (cliente + servidor)
npm run build

# Solo build del cliente
npm run build:client

# Solo build del servidor
npm run build:server

# Arrancar en modo producción
npm start
# Usa el build generado en dist/
```

## 🧪 Testing

```powershell
# Ejecutar tests
npm test

# Tests en modo watch
npm run test -- --watch

# Tests con coverage
npm run test -- --coverage
```

## 🔍 Debugging

```powershell
# Ver logs de Vite en detalle
npm run dev -- --debug

# Limpiar cache de Vite
Remove-Item -Recurse -Force node_modules/.vite

# Reinstalar dependencias desde cero
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

## 🌐 URLs Importantes

| Página | URL | Descripción |
|--------|-----|-------------|
| Home | http://localhost:8080/ | Página principal |
| Login | http://localhost:8080/login | Iniciar sesión |
| Registro | http://localhost:8080/registro | Crear cuenta |
| Dashboard Paciente | http://localhost:8080/dashboard/paciente | Panel paciente |
| Dashboard Profesional | http://localhost:8080/dashboard/profesional | Panel profesional |

## 🔐 Supabase - Links Rápidos

```powershell
# Abrir dashboard de Supabase
start https://supabase.com/dashboard

# Documentación de Auth
start https://supabase.com/docs/guides/auth
```

## 🛠️ Utilidades de PowerShell

```powershell
# Ver procesos en puerto 8080
Get-NetTCPConnection -LocalPort 8080 | Select-Object -Property LocalAddress, LocalPort, State, OwningProcess

# Matar proceso en puerto 8080 (si está ocupado)
$processId = (Get-NetTCPConnection -LocalPort 8080).OwningProcess
Stop-Process -Id $processId -Force

# Ver tamaño de node_modules
Get-ChildItem node_modules -Recurse | Measure-Object -Property Length -Sum | Select-Object @{Name="Size (MB)"; Expression={[math]::Round($_.Sum / 1MB, 2)}}

# Buscar archivo en el proyecto
Get-ChildItem -Recurse -Filter "*.tsx" | Where-Object { $_.Name -like "*Auth*" }

# Contar líneas de código TypeScript
(Get-Content -Path (Get-ChildItem -Recurse -Filter "*.tsx" -Exclude "node_modules").FullName | Measure-Object -Line).Lines
```

## 📝 Git - Comandos Útiles

```powershell
# Crear commit con mensaje descriptivo
git add .
git commit -m "feat: add Supabase authentication"

# Ver cambios no commiteados
git status

# Ver diferencias
git diff

# Crear rama para feature
git checkout -b feature/nueva-funcionalidad

# Volver a main
git checkout main
```

## 🔄 Actualizar Dependencias

```powershell
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas las dependencias (cuidado)
npm update

# Actualizar una dependencia específica
npm install react@latest

# Actualizar Supabase
npm install @supabase/supabase-js@latest
```

## 🐛 Solución Rápida de Problemas

### Error: Puerto 8080 ocupado
```powershell
# Opción 1: Matar proceso
$processId = (Get-NetTCPConnection -LocalPort 8080).OwningProcess
Stop-Process -Id $processId -Force

# Opción 2: Cambiar puerto en vite.config.ts
# Edita: server.port = 3000
```

### Error: Cannot find module
```powershell
# Reinstalar dependencias
Remove-Item -Recurse -Force node_modules
npm install
```

### Error: VITE_SUPABASE_URL missing
```powershell
# Verificar que .env existe
Test-Path .env

# Si no existe, crear desde ejemplo
copy .env.example .env

# Editar .env con tus credenciales
notepad .env
```

### Caché corrupta de Vite
```powershell
# Limpiar caché
Remove-Item -Recurse -Force node_modules/.vite
npm run dev
```

## 📊 Scripts de Información

```powershell
# Ver versión de Node y npm
node -v
npm -v

# Ver información del proyecto
Get-Content package.json | ConvertFrom-Json | Select-Object name, version, description

# Listar todos los scripts disponibles
Get-Content package.json | ConvertFrom-Json | Select-Object -ExpandProperty scripts
```

## 🎨 Generar Componente Nuevo

```powershell
# Crear componente React
@"
import { FC } from 'react';

interface MiComponenteProps {
  // Props aquí
}

export const MiComponente: FC<MiComponenteProps> = () => {
  return (
    <div>
      {/* Contenido */}
    </div>
  );
};
"@ | Out-File -FilePath "client/components/MiComponente.tsx" -Encoding utf8
```

## 📦 Deployment

### Netlify
```powershell
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Vercel
```powershell
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🔗 Links de Documentación

| Tecnología | Documentación |
|------------|---------------|
| React | https://react.dev |
| TypeScript | https://www.typescriptlang.org/docs |
| Vite | https://vitejs.dev |
| TailwindCSS | https://tailwindcss.com/docs |
| Supabase | https://supabase.com/docs |
| React Router | https://reactrouter.com |
| shadcn/ui | https://ui.shadcn.com |

---

**💡 Tip:** Guarda este archivo en tus favoritos para acceso rápido a comandos comunes
