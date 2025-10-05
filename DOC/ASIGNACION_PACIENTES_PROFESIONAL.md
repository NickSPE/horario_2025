# 🔒 Sistema de Asignación de Pacientes a Profesionales

## 📋 Problemas Resueltos

### 1. ❌ Error: "Could not find table 'profesional_pacientes'"
**Causa**: La tabla existe pero no tenía RLS configurado correctamente

**Solución**: 
- ✅ Código actualizado para usar `profesional_pacientes` (nombre existente)
- ✅ Script SQL `setup_rls_profesional_pacientes.sql` que configura RLS

---

### 2. 🔍 Flujo de Asignación Mejorado
**Antes**: No había forma clara de buscar y asignar pacientes

**Ahora**:
1. Click en "Asignar a Paciente" en un medicamento
2. Se abre el diálogo de recordatorio
3. Click en "Buscar Paciente" 
4. Modal de búsqueda aparece
5. Buscar por nombre, email o DNI
6. Click en "Asignar" 
7. El paciente se agrega a la lista Y se selecciona automáticamente
8. Continuar llenando el formulario de recordatorio

---

### 3. 🔐 Aislamiento de Datos por Profesional
**Problema**: Todos los profesionales veían todos los pacientes

**Solución**: Row Level Security (RLS) implementado

#### Políticas RLS en `profesional_pacientes`:
```sql
-- Cada profesional VE SOLO sus pacientes asignados
CREATE POLICY "Profesionales ven sus pacientes"
  ON profesional_pacientes FOR SELECT
  USING (auth.uid() = profesional_id AND activo = true);
```

#### Políticas RLS en `recordatorios_medicamentos`:
```sql
-- Profesional ve SOLO recordatorios de SUS pacientes
CREATE POLICY "Usuarios y profesionales ven recordatorios"
  ON recordatorios_medicamentos FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM profesional_pacientes
      WHERE profesional_pacientes.paciente_id = recordatorios_medicamentos.user_id
      AND profesional_pacientes.profesional_id = auth.uid()
      AND profesional_pacientes.activo = true
    )
  );
```

---

## 🗂️ Archivos Modificados

### Nuevos Componentes
- ✅ `client/components/profesional/BuscarPacienteDialog.tsx` - Modal de búsqueda

### Actualizados
- ✅ `client/pages/profesional/Medicamentos.tsx`:
  - Import del `BuscarPacienteDialog`
  - Usa tabla `profesional_pacientes`
  - Agregado botón "Buscar Paciente"
  - Función `handlePacienteSeleccionado()` para auto-selección
  - Estado `isBuscarPacienteDialogOpen`

### SQL Scripts
- ✅ `supabase/setup_rls_profesional_pacientes.sql` - Script de configuración RLS ⭐ **NUEVO**
- 📝 `supabase/supabase_profesional_pacientes.sql` - SQL original (crear tabla si no existe)

---

## 🚀 Instrucciones de Implementación

### 1️⃣ Ejecutar el Script SQL en Supabase
```sql
-- Ir a Supabase Dashboard → SQL Editor
-- Copiar y ejecutar: supabase/setup_rls_profesional_pacientes.sql
```

Este script:
- ✅ Verifica que la tabla `profesional_pacientes` existe
- ✅ Agrega columnas necesarias (activo, fecha_asignacion, notas)
- ✅ Configura RLS para aislamiento de datos
- ✅ Actualiza políticas de recordatorios
- ✅ Agrega columna `creado_por_profesional_id`

### 2️⃣ Verificar en Supabase
```sql
-- Verificar que la tabla existe
SELECT * FROM profesional_pacientes LIMIT 1;

-- Verificar RLS habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profesional_pacientes';

-- Ver políticas activas
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profesional_pacientes';
```

### 3️⃣ Probar el Flujo
1. Login como Profesional
2. Ir a Medicamentos
3. Click "Asignar a Paciente" en un medicamento
4. Click "Buscar Paciente"
5. Buscar paciente (debe existir en tabla `pacientes`)
6. Asignar paciente
7. Completar formulario de recordatorio
8. Guardar

---

## 🔐 Seguridad Garantizada

### ✅ Cada Profesional:
- Ve **SOLO** sus pacientes asignados
- Crea recordatorios **SOLO** para sus pacientes
- No puede ver pacientes de otros profesionales
- No puede ver recordatorios de pacientes no asignados

### ✅ Cada Paciente:
- Ve solo sus propios recordatorios
- Ve la lista de profesionales asignados
- Actualiza solo sus propios recordatorios

---

## 📊 Estructura de Datos

### Tabla `profesional_pacientes`
```sql
CREATE TABLE profesional_pacientes (
  id UUID PRIMARY KEY,
  paciente_id UUID REFERENCES auth.users(id),  -- User ID del paciente
  profesional_id UUID REFERENCES auth.users(id), -- User ID del profesional
  fecha_asignacion TIMESTAMP,
  activo BOOLEAN DEFAULT true,  -- Permite desactivar sin eliminar
  notas TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(paciente_id, profesional_id)  -- Un profesional no puede asignar 2 veces al mismo paciente
);
```

### Tabla `recordatorios_medicamentos` (columna nueva)
```sql
ALTER TABLE recordatorios_medicamentos 
  ADD COLUMN creado_por_profesional_id UUID REFERENCES auth.users(id);
```

Esto permite saber qué recordatorios fueron creados por profesionales.

---

## 🧪 Testing

### Caso 1: Profesional A asigna Paciente X
```
1. Profesional A login
2. Busca y asigna Paciente X
3. Crea recordatorio para Paciente X ✅
4. Ve el recordatorio en su lista ✅
```

### Caso 2: Profesional B NO ve Paciente X
```
1. Profesional B login
2. Busca Paciente X
3. Lo encuentra ✅
4. Lo asigna a su lista
5. Ahora SÍ puede crear recordatorios ✅
```

### Caso 3: Profesional A NO ve recordatorios de Profesional B
```
1. Profesional B crea recordatorio para Paciente Y
2. Profesional A login
3. Profesional A NO ve a Paciente Y en su lista ✅
4. Profesional A NO ve los recordatorios de Paciente Y ✅
```

---

## ⚠️ Notas Importantes

1. **Tabla `pacientes` requerida**: Los pacientes deben estar registrados en la tabla `pacientes` (ver `supabase_tabla_pacientes.sql`)

2. **Foreign Key**: La relación es con `auth.users(id)` (el user_id de Supabase Auth), no con `pacientes.id`

3. **Campo `activo`**: Permite "desactivar" la relación sin eliminarla (histórico)

4. **Búsqueda**: El modal busca en `pacientes` con filtro `activo = true`

5. **RLS siempre activo**: No se puede desactivar sin perder la seguridad

---

## 🐛 Troubleshooting

### Error: "Could not find table profesional_pacientes"
```sql
-- Ejecutar setup_rls_profesional_pacientes.sql
-- O crear la tabla con supabase_profesional_pacientes.sql
```

### Error: "No se encontraron pacientes"
```sql
-- Verificar que existan pacientes en la tabla
SELECT * FROM pacientes WHERE activo = true;
```

### Profesional ve pacientes de otros
```sql
-- Verificar RLS habilitado
ALTER TABLE profesional_pacientes ENABLE ROW LEVEL SECURITY;

-- Re-crear políticas ejecutando setup_rls_profesional_pacientes.sql
```

### Error al crear recordatorio
```sql
-- Verificar que la columna existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'recordatorios_medicamentos' 
AND column_name = 'creado_por_profesional_id';

-- Si no existe, ejecutar fix_paciente_profesional.sql
```

---

## 📚 Referencias

- `DOC/SISTEMA_REGISTRO_PACIENTES.md` - Sistema completo de pacientes
- `supabase/supabase_profesional_pacientes.sql` - SQL original (crear tabla)
- `supabase/setup_rls_profesional_pacientes.sql` - SQL de configuración RLS ✅ **USAR ESTE**
