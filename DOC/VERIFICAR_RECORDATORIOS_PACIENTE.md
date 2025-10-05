# Verificar Recordatorios del Paciente

## Problema
El paciente no ve los recordatorios creados por el profesional desde la sección de medicamentos.

## Causas Posibles

### 1. **Script RLS no ejecutado**
   - Si no ejecutaste `supabase/fix_rls_recordatorios_profesional.sql`
   - Las políticas antiguas bloquean la inserción
   - El recordatorio nunca se creó

### 2. **Vista desactualizada**
   - Si la vista no tiene los campos del profesional
   - Puede causar errores en el JOIN

### 3. **user_id incorrecto**
   - Si se usó `paciente.id` en lugar de `paciente.user_id`
   - El recordatorio se creó con ID incorrecto

## Verificación Rápida (Navegador)

### Opción A: Consola del Navegador (Como Paciente)

Abre la consola del navegador (F12) cuando estés logueado como paciente y ejecuta:

```javascript
// 1. Verificar user_id del paciente
const { data: { user } } = await window.supabase.auth.getUser();
console.log('👤 Paciente user_id:', user.id);

// 2. Ver todos los recordatorios (sin filtro)
const { data: recordatorios, error } = await window.supabase
  .from('vista_recordatorios_completa')
  .select('*')
  .eq('user_id', user.id);

console.log('📋 Total recordatorios:', recordatorios?.length || 0);
console.log('📋 Recordatorios:', recordatorios);

if (error) {
  console.error('❌ Error:', error);
}

// 3. Ver recordatorios inactivos
const inactivos = recordatorios?.filter(r => !r.activo);
console.log('💤 Recordatorios inactivos:', inactivos);

// 4. Ver recordatorios que esperan primera toma
const esperandoPrimera = inactivos?.filter(r => r.tomas_completadas === 0);
console.log('⏳ Esperando primera toma:', esperandoPrimera);
```

### Opción B: Verificar en Supabase SQL Editor

Ejecuta el script `supabase/diagnosticar_recordatorios_paciente.sql` en el SQL Editor de Supabase.

## Posibles Resultados

### ✅ Resultado Esperado
```javascript
👤 Paciente user_id: abc123-def456-...
📋 Total recordatorios: 1 (o más)
📋 Recordatorios: [
  {
    id: "...",
    user_id: "abc123-def456-...",
    medicamento_nombre: "Aspirina",
    activo: false,
    tomas_completadas: 0,
    creado_por_profesional_id: "xyz789-...",
    profesional_nombre: "Dr. Juan",
    ...
  }
]
💤 Recordatorios inactivos: [...]
⏳ Esperando primera toma: [...]
```

### ❌ Problema: No aparece ningún recordatorio
**Causa probable**: El recordatorio no se creó correctamente

**Solución**:
1. Ejecuta `supabase/fix_rls_recordatorios_profesional.sql`
2. Como profesional, crea el recordatorio nuevamente
3. Verifica otra vez como paciente

### ❌ Problema: Aparece pero con creado_por_profesional_id = null
**Causa probable**: La vista no tiene el campo o el JOIN falló

**Solución**:
1. Ejecuta `supabase/supabase_vista_recordatorios_con_profesional.sql`
2. Recarga la página del paciente

### ❌ Problema: Error de RLS
**Causa probable**: Las políticas están bloqueando

**Solución**:
1. Ejecuta `supabase/fix_rls_recordatorios_profesional.sql`
2. Verifica las políticas con el script de diagnóstico

## Solución Paso a Paso

### Paso 1: Ejecutar Scripts SQL en Supabase

En el **SQL Editor de Supabase**, ejecuta en orden:

```sql
-- 1. Actualizar políticas RLS
-- Copiar y pegar: supabase/fix_rls_recordatorios_profesional.sql

-- 2. Verificar vista actualizada
-- Copiar y pegar: supabase/supabase_vista_recordatorios_con_profesional.sql

-- 3. Diagnóstico
-- Copiar y pegar: supabase/diagnosticar_recordatorios_paciente.sql
```

### Paso 2: Como Profesional

1. Login como profesional
2. Ir a "Medicamentos"
3. Seleccionar medicamento
4. "Asignar medicamento"
5. "Seleccionar Paciente" → Buscar → Seleccionar
6. Llenar formulario
7. **Guardar**
8. ✅ Debería mostrar: "¡Recordatorio asignado! ... El paciente debe tomar la primera dosis para activar las alarmas."

### Paso 3: Como Paciente

1. Logout
2. Login como paciente
3. Ir a "Recordatorios"
4. Buscar en la sección **"Recordatorios Inactivos (Esperan primera toma)"**
   - El recordatorio debería aparecer ahí con un badge "Pendiente"
   - Mensaje: "👨‍⚕️ Asignado por: Dr. [Nombre]"
5. Click en **"Activar y tomar primera dosis"**
6. ✅ El recordatorio se activa y aparece en la sección de activos

## Código de Verificación Adicional

Si el recordatorio aparece pero no puedes activarlo, ejecuta en consola:

```javascript
const { data: { user } } = await window.supabase.auth.getUser();

// Ver recordatorios inactivos directamente de la tabla
const { data, error } = await window.supabase
  .from('recordatorios_medicamentos')
  .select(`
    *,
    medicamentos(nombre),
    profesionales:creado_por_profesional_id(nombre, apellido)
  `)
  .eq('user_id', user.id)
  .eq('activo', false);

console.log('Recordatorios inactivos (tabla directa):', data);
```

## Checklist Final

- [ ] ✅ Ejecuté `fix_rls_recordatorios_profesional.sql`
- [ ] ✅ Ejecuté `supabase_vista_recordatorios_con_profesional.sql`
- [ ] ✅ Como profesional, creé el recordatorio
- [ ] ✅ Vi mensaje de confirmación "¡Recordatorio asignado!"
- [ ] ✅ Como paciente, refresqué la página
- [ ] ✅ Veo el recordatorio en "Inactivos (Esperan primera toma)"
- [ ] ✅ Puedo activarlo tomando la primera dosis

---

**Si sigues sin ver el recordatorio después de estos pasos, ejecuta el diagnóstico en consola y comparte los resultados.**
