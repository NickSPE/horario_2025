# Solución: Error Foreign Key Constraint en paciente_profesional

## El Error

```
insert or update on table "paciente_profesional"
violates foreign key constraint "paciente_profesional_paciente_id_fkey"
```

## Causa Raíz

### Estructura de las Tablas

**Tabla `pacientes`**:
```sql
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- UUID único de la tabla pacientes
  user_id UUID REFERENCES auth.users(id),         -- UUID que apunta a auth.users
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  ...
);
```

**Tabla `paciente_profesional`**:
```sql
CREATE TABLE paciente_profesional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES auth.users(id),     -- ⚠️ Apunta a auth.users, NO a pacientes.id
  profesional_id UUID REFERENCES auth.users(id),
  ...
);
```

### El Problema

El código estaba usando **`paciente.id`** (UUID de la tabla `pacientes`) cuando debería usar **`paciente.user_id`** (UUID de `auth.users`):

```typescript
❌ INCORRECTO:
paciente_id: paciente.id  // Este es el UUID de la tabla pacientes
```

```typescript
✅ CORRECTO:
paciente_id: paciente.user_id  // Este es el UUID de auth.users
```

## Solución Aplicada

### Cambio 1: Selección del Paciente

**Archivo**: `client/pages/profesional/Medicamentos.tsx`

```typescript
const handlePacienteSeleccionado = async (paciente: Paciente) => {
  // Agregar el paciente a la lista si no está
  if (!misPacientes.find(p => p.id === paciente.id)) {
    setMisPacientes([...misPacientes, paciente]);
  }
  
  // ✅ CORREGIDO: Usar user_id (auth.users) en lugar de id (pacientes)
  setRecordatorioForm({
    ...recordatorioForm,
    paciente_id: paciente.user_id, // user_id apunta a auth.users(id)
  });
  
  toast({
    title: "Paciente seleccionado",
    description: `${paciente.nombre} ${paciente.apellido} fue agregado al recordatorio`,
  });
};
```

### Cambio 2: Inserción en paciente_profesional

```typescript
// PASO 1: Crear o verificar la relación profesional-paciente
// ✅ paciente_id debe ser el user_id (auth.users.id) no el id de la tabla pacientes
const { error: relacionError } = await supabase
  .from("paciente_profesional")
  .upsert([
    {
      paciente_id: recordatorioForm.paciente_id, // ✅ Este es user_id de auth.users
      profesional_id: user.id,
    }
  ], { onConflict: 'paciente_id,profesional_id' });

if (relacionError) throw relacionError;

// PASO 2: Crear el recordatorio
const recordatorioData = {
  user_id: recordatorioForm.paciente_id, // ✅ También user_id de auth.users
  medicamento_id: selectedMedicamento.id,
  // ... resto de campos
  creado_por_profesional_id: user.id,
};
```

### Cambio 3: Mostrar Paciente Seleccionado (Toast)

```typescript
❌ ANTES:
const paciente = misPacientes.find(p => p.id === recordatorioForm.paciente_id);

✅ AHORA:
const paciente = misPacientes.find(p => p.user_id === recordatorioForm.paciente_id);
```

### Cambio 4: Mostrar Paciente en el Formulario

```typescript
❌ ANTES:
✓ Paciente seleccionado: {misPacientes.find(p => p.id === recordatorioForm.paciente_id)?.nombre}

✅ AHORA:
✓ Paciente seleccionado: {misPacientes.find(p => p.user_id === recordatorioForm.paciente_id)?.nombre}
```

## Diagrama del Flujo de Datos

```
┌─────────────────┐
│  auth.users     │ (Supabase Auth)
│  - id (UUID)    │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌──────────────────────┐
│  pacientes      │  │ paciente_profesional │
│  - id (UUID)    │  │  - paciente_id  ────┼──> auth.users.id ✅
│  - user_id ─────┼──> auth.users.id  
│  - nombre       │  │  - profesional_id ──┼──> auth.users.id ✅
│  - apellido     │  └──────────────────────┘
└─────────────────┘

recordatorios_medicamentos
  - user_id ────────────────────> auth.users.id ✅
  - creado_por_profesional_id ──> auth.users.id ✅
```

## Verificación

### Interface de TypeScript

```typescript
interface Paciente {
  id: string;        // UUID de la tabla pacientes
  user_id: string;   // ✅ UUID de auth.users (este debemos usar)
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  dni?: string;
  esta_asignado: boolean;
}
```

### Qué usa cada campo

| Campo | Descripción | Usado para |
|-------|-------------|------------|
| `paciente.id` | UUID único en tabla `pacientes` | Mostrar en listas, identificar registro |
| `paciente.user_id` | UUID de `auth.users` | ✅ **Foreign keys en otras tablas** |

## Resumen de Cambios

| Archivo | Línea aprox. | Cambio |
|---------|--------------|--------|
| `Medicamentos.tsx` | ~400 | `paciente.id` → `paciente.user_id` en selección |
| `Medicamentos.tsx` | ~458 | Comentario explicativo en upsert |
| `Medicamentos.tsx` | ~488 | `p.id` → `p.user_id` en find (toast) |
| `Medicamentos.tsx` | ~855 | `p.id` → `p.user_id` en find (UI) |

## Prueba

1. Login como profesional
2. Ir a "Medicamentos"
3. Seleccionar medicamento → "Asignar medicamento"
4. Click en "Seleccionar Paciente"
5. Buscar y seleccionar paciente
6. Llenar formulario
7. Click en "Guardar"
8. ✅ Debería guardar correctamente sin error de foreign key

## SQL para Verificar

```sql
-- Ver estructura de paciente_profesional
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'paciente_profesional';

-- Ver registros creados
SELECT 
  pp.*,
  p.nombre || ' ' || p.apellido as paciente_nombre,
  prof.nombre || ' ' || prof.apellido as profesional_nombre
FROM paciente_profesional pp
JOIN pacientes p ON p.user_id = pp.paciente_id  -- ✅ JOIN correcto
LEFT JOIN profesionales prof ON prof.id = pp.profesional_id;
```

---

**Estado**: ✅ Implementado y corregido
**Fecha**: 2024
