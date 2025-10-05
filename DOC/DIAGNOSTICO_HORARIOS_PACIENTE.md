# Diagnóstico Rápido: Recordatorios no aparecen

## Problema
Los recordatorios no aparecen en el dashboard del paciente (sección "Tu horario de hoy").

## Diagnóstico en Consola del Navegador

Abre la consola (F12) cuando estés logueado como **PACIENTE** y ejecuta:

```javascript
// 1. Verificar user_id del paciente
const { data: { user } } = await window.supabase.auth.getUser();
console.log('👤 Paciente user_id:', user.id);
console.log('👤 Email:', user.email);

// 2. Ver TODOS los recordatorios del paciente (sin filtros)
const { data: todos, error: error1 } = await window.supabase
  .from('vista_recordatorios_completa')
  .select('*')
  .eq('user_id', user.id);

console.log('📋 Total recordatorios:', todos?.length || 0);
console.log('📋 Recordatorios:', todos);

if (error1) {
  console.error('❌ Error al cargar:', error1);
}

// 3. Ver solo ACTIVOS
const activos = todos?.filter(r => r.activo);
console.log('✅ Recordatorios ACTIVOS:', activos?.length || 0, activos);

// 4. Ver solo INACTIVOS
const inactivos = todos?.filter(r => !r.activo);
console.log('💤 Recordatorios INACTIVOS:', inactivos?.length || 0, inactivos);

// 5. Ver recordatorios creados por profesional
const porProfesional = todos?.filter(r => r.creado_por_profesional_id);
console.log('👨‍⚕️ Creados por profesional:', porProfesional?.length || 0, porProfesional);

// 6. Ver directamente la tabla (sin vista)
const { data: directos, error: error2 } = await window.supabase
  .from('recordatorios_medicamentos')
  .select('*')
  .eq('user_id', user.id);

console.log('🔍 Tabla directa:', directos?.length || 0, directos);

if (error2) {
  console.error('❌ Error tabla directa:', error2);
}
```

## Interpretación de Resultados

### ✅ Caso 1: Total recordatorios = 0
**Problema**: No se crearon recordatorios o se crearon con user_id incorrecto

**Solución**:
1. Como profesional, crea un nuevo recordatorio
2. Verifica que aparezca en la consola del profesional
3. Ejecuta diagnóstico otra vez como paciente

### ✅ Caso 2: Total recordatorios > 0, pero activos = 0
**Problema**: Los recordatorios se crearon INACTIVOS

**Solución**:
- Ya corregido en el código
- Los nuevos recordatorios se crean ACTIVOS
- Prueba crear uno nuevo

### ✅ Caso 3: Activos > 0, pero no aparecen en el dashboard
**Problema**: Error en el componente Inicio.tsx

**Solución**:
- Ya actualizado
- Recarga la página del dashboard
- Debería aparecer ahora

### ✅ Caso 4: Error "permission denied" o RLS
**Problema**: Las políticas RLS están bloqueando

**Solución**:
1. Ejecuta `supabase/fix_rls_recordatorios_profesional.sql`
2. Asegúrate que tiene la política de SELECT para pacientes:

```sql
CREATE POLICY "Usuarios ven sus recordatorios"
  ON recordatorios_medicamentos FOR SELECT
  USING (auth.uid() = user_id);
```

### ✅ Caso 5: "Tabla directa" tiene datos, pero "vista" está vacía
**Problema**: La vista tiene un problema en el JOIN

**Solución**:
Ejecuta en Supabase SQL Editor:

```sql
-- Ver si hay problemas en la vista
SELECT * FROM vista_recordatorios_completa LIMIT 5;

-- Si da error, recrear la vista:
-- Copiar y ejecutar: supabase/supabase_vista_recordatorios_con_profesional.sql
```

## Verificación Post-Fix

Después de aplicar las correcciones, ejecuta en consola:

```javascript
// Recargar datos
window.location.reload();

// O solo refrescar recordatorios:
const { data: { user } } = await window.supabase.auth.getUser();
const { data } = await window.supabase
  .from('vista_recordatorios_completa')
  .select('*')
  .eq('user_id', user.id)
  .eq('activo', true)
  .order('proxima_toma');

console.log('Recordatorios activos después del fix:', data);
```

## Checklist

- [ ] Ejecuté el diagnóstico en consola como paciente
- [ ] Verifiqué que `Total recordatorios > 0`
- [ ] Verifiqué que `Recordatorios ACTIVOS > 0`
- [ ] Ejecuté `fix_rls_recordatorios_profesional.sql` en Supabase
- [ ] Recargué la página del dashboard del paciente
- [ ] Veo los recordatorios en "Tu horario de hoy"

---

**Si después de estos pasos sigues sin ver recordatorios, copia y pega los resultados de la consola para más ayuda.**
