# 🔍 Diagnóstico: No Se Encuentran Pacientes

## ❓ Problema
El modal de búsqueda de pacientes no encuentra ningún usuario.

## 🔎 Posibles Causas

### 1️⃣ **No Hay Pacientes Registrados**
La tabla `pacientes` está vacía.

**Verificar:**
```sql
-- Ejecutar en Supabase SQL Editor
SELECT COUNT(*) FROM pacientes WHERE activo = true;
```

**Solución:** Los usuarios deben:
1. Registrarse en el sistema
2. Crear su perfil de paciente
3. Asegurarse de que `activo = true`

---

### 2️⃣ **Políticas RLS Bloqueando la Consulta**
Las políticas de seguridad están impidiendo que el profesional vea pacientes.

**Verificar políticas:**
```sql
SELECT 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'pacientes';
```

**Política correcta para profesionales:**
```sql
-- Profesionales pueden buscar TODOS los pacientes
-- (para asignarlos, no para ver sus datos médicos)
CREATE POLICY "Profesionales buscan pacientes"
  ON pacientes FOR SELECT
  TO authenticated
  USING (activo = true);
```

---

### 3️⃣ **Error en la Consulta de Búsqueda**

**Ver errores en consola:**
1. Abre DevTools (F12)
2. Ve a la pestaña Console
3. Busca errores en rojo
4. Haz una búsqueda y observa los logs

**Logs que debes ver:**
```
Pacientes encontrados: Array(X)
```

---

## 🚀 Solución Rápida

### Paso 1: Ejecutar Verificación
```sql
-- Copiar y ejecutar: supabase/verificar_pacientes.sql
```

### Paso 2: Revisar Políticas RLS

Si no hay pacientes o las políticas bloquean:

```sql
-- EJECUTAR ESTO SOLO SI ES NECESARIO
-- Eliminar política restrictiva
DROP POLICY IF EXISTS "Profesionales ven pacientes asignados" ON pacientes;

-- Crear política que permita buscar
CREATE POLICY "Todos pueden ver pacientes activos"
  ON pacientes FOR SELECT
  TO authenticated
  USING (activo = true);
```

### Paso 3: Crear Pacientes de Prueba

Si necesitas datos de prueba:

```sql
-- SOLO PARA DESARROLLO/PRUEBAS
-- NO USAR EN PRODUCCIÓN

-- Insertar paciente de prueba (requiere un user_id válido)
INSERT INTO pacientes (user_id, nombre, apellido, email, dni, activo)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Reemplazar con user_id real
  'Juan',
  'Pérez',
  'juan.perez@example.com',
  '12345678',
  true
);
```

---

## 📋 Checklist de Diagnóstico

- [ ] Verificar que existen pacientes: `SELECT COUNT(*) FROM pacientes`
- [ ] Verificar RLS habilitado: `SELECT rowsecurity FROM pg_tables WHERE tablename = 'pacientes'`
- [ ] Ver políticas activas: `SELECT * FROM pg_policies WHERE tablename = 'pacientes'`
- [ ] Abrir consola del navegador (F12) y buscar errores
- [ ] Ver logs en consola al hacer búsqueda
- [ ] Verificar que el profesional está autenticado
- [ ] Verificar que profesionalId no es null

---

## 🧪 Prueba Manual

1. **Abre la consola del navegador** (F12)
2. **Ejecuta esto en Console:**

```javascript
const { createClient } = window.supabase;
const supabase = createClient(/* tus credenciales */);

// Ver sesión actual
const session = await supabase.auth.getSession();
console.log('Usuario actual:', session);

// Buscar pacientes
const { data, error } = await supabase
  .from('pacientes')
  .select('*')
  .eq('activo', true);
  
console.log('Pacientes:', data);
console.log('Error:', error);
```

---

## 🔧 Solución Definitiva

### Modificar Política RLS de Pacientes

El problema más común es que las políticas RLS impiden que profesionales busquen pacientes.

**Script SQL a ejecutar:**

```sql
-- =====================================================
-- PERMITIR BÚSQUEDA DE PACIENTES
-- =====================================================

-- Eliminar políticas restrictivas
DROP POLICY IF EXISTS "Profesionales ven pacientes asignados" ON pacientes;
DROP POLICY IF EXISTS "Pacientes ven su perfil" ON pacientes;

-- Política 1: Pacientes ven y editan su propio perfil
CREATE POLICY "Pacientes gestionan su perfil"
  ON pacientes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política 2: Profesionales pueden buscar pacientes (solo lectura)
CREATE POLICY "Profesionales buscan pacientes"
  ON pacientes FOR SELECT
  TO authenticated
  USING (
    activo = true 
    AND 
    EXISTS (
      SELECT 1 FROM profesionales 
      WHERE profesionales.user_id = auth.uid()
    )
  );

-- Política 3: Profesionales ven detalles de pacientes asignados
CREATE POLICY "Profesionales ven pacientes asignados completo"
  ON pacientes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM paciente_profesional
      WHERE paciente_profesional.paciente_id = pacientes.user_id
      AND paciente_profesional.profesional_id = auth.uid()
      AND paciente_profesional.activo = true
    )
  );
```

---

## ✅ Verificación Final

Después de aplicar cambios:

```sql
-- 1. Ver políticas
SELECT policyname FROM pg_policies WHERE tablename = 'pacientes';

-- 2. Contar pacientes
SELECT COUNT(*) FROM pacientes WHERE activo = true;

-- 3. Probar búsqueda (desde la interfaz)
-- Buscar: "juan" o "perez" o cualquier email
```

**Deberías ver:**
- ✅ Lista de pacientes en el modal
- ✅ Sin errores en consola
- ✅ Logs: "Pacientes encontrados: Array(X)"

---

## 📞 Si Aún No Funciona

1. Comparte el **error exacto** de la consola
2. Comparte el resultado de:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'pacientes';
   SELECT COUNT(*) FROM pacientes;
   ```
3. Verifica que el usuario logueado sea realmente un profesional
