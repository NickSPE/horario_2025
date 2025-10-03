# 💊 Sistema de Medicamentos - Configuración

## 🎯 Descripción

Sistema completo de gestión de medicamentos con categorías para profesionales de salud y pacientes. Los profesionales pueden agregar y organizar medicamentos, y los pacientes pueden consultarlos.

---

## 📋 Características

### Para Profesionales de Salud
✅ **Gestión de Categorías:**
- Crear categorías de medicamentos
- Agregar descripciones
- Ver contador de medicamentos por categoría
- Eliminar categorías (elimina también medicamentos asociados)

✅ **Gestión de Medicamentos:**
- Agregar medicamentos con información completa
- Organizar por categorías
- Campos detallados: nombre, descripción, dosis, vía de administración, indicaciones
- Eliminar medicamentos individuales
- Vista organizada por categoría

### Para Pacientes
✅ **Consulta de Medicamentos:**
- Ver todo el catálogo de medicamentos
- Búsqueda rápida por nombre
- Vista organizada por categorías (acordeón)
- Información detallada de cada medicamento
- Estadísticas del catálogo

---

## 🗄️ Estructura de Base de Datos

### Tablas Creadas

#### 1. `categorias_medicamentos`
```sql
- id (UUID, PRIMARY KEY)
- nombre (TEXT, NOT NULL)
- descripcion (TEXT, opcional)
- created_by (UUID, referencia a auth.users)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 2. `medicamentos`
```sql
- id (UUID, PRIMARY KEY)
- nombre (TEXT, NOT NULL)
- descripcion (TEXT, opcional)
- categoria_id (UUID, FK a categorias_medicamentos)
- dosis_recomendada (TEXT, opcional)
- via_administracion (TEXT, opcional)
- indicaciones (TEXT, opcional)
- contraindicaciones (TEXT, opcional)
- created_by (UUID, referencia a auth.users)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## 🔐 Seguridad (RLS)

### Categorías
- ✅ **SELECT**: Todos pueden ver (pacientes y profesionales)
- 🔒 **INSERT**: Solo profesionales
- 🔒 **UPDATE**: Solo profesionales
- 🔒 **DELETE**: Solo profesionales

### Medicamentos
- ✅ **SELECT**: Todos pueden ver (pacientes y profesionales)
- 🔒 **INSERT**: Solo profesionales
- 🔒 **UPDATE**: Solo profesionales
- 🔒 **DELETE**: Solo profesionales

---

## ⚙️ Instalación en Supabase

### Paso 1: Ejecutar el Script SQL

1. Ve a tu proyecto en Supabase
2. Abre **SQL Editor**
3. Click en **New Query**
4. Copia y pega el contenido de `supabase_medicamentos.sql`
5. Click en **Run** (ejecutar)
6. Verifica el mensaje: "Tablas de medicamentos creadas exitosamente"

### Paso 2: Verificar Tablas Creadas

1. Ve a **Table Editor**
2. Deberías ver las nuevas tablas:
   - `categorias_medicamentos`
   - `medicamentos`
3. Verifica que tengan datos de ejemplo (10 categorías, 4 medicamentos)

### Paso 3: Verificar RLS (Row Level Security)

1. Ve a **Authentication → Policies**
2. Verifica que las políticas estén creadas:
   - 4 políticas para `categorias_medicamentos`
   - 4 políticas para `medicamentos`

### Paso 4: Probar en la Aplicación

1. Arranca el servidor: `npm run dev`
2. Inicia sesión como **profesional**
3. Ve a **Medicamentos** en el menú
4. Deberías ver categorías y medicamentos de ejemplo
5. Prueba agregar una categoría nueva
6. Prueba agregar un medicamento

---

## 🧪 Datos de Ejemplo Incluidos

### Categorías (10)
- Analgésicos
- Antibióticos
- Antiinflamatorios
- Antihistamínicos
- Antihipertensivos
- Antidiabéticos
- Cardiovasculares
- Gastrointestinales
- Vitaminas y Suplementos
- Respiratorios

### Medicamentos (4 ejemplos)
- Paracetamol 500mg (Analgésicos)
- Ibuprofeno 400mg (Antiinflamatorios)
- Amoxicilina 500mg (Antibióticos)
- Losartán 50mg (Antihipertensivos)

---

## 📱 Uso de la Aplicación

### Como Profesional

#### Agregar Categoría
1. Ve a **Dashboard Profesional → Medicamentos**
2. En "Nueva Categoría":
   - Nombre: `Ej: Antipiréticos`
   - Descripción: `Ej: Reducen la fiebre`
3. Click **Agregar Categoría**

#### Agregar Medicamento
1. Selecciona una categoría del dropdown
2. Completa los campos:
   - Nombre: `Ej: Aspirina 500mg`
   - Descripción: `Opcional`
   - Dosis Recomendada: `Ej: 1 tableta cada 8 horas`
   - Vía de Administración: `Selecciona del dropdown`
   - Indicaciones: `Ej: Dolor de cabeza, fiebre`
3. Click **Agregar Medicamento**

#### Ver/Eliminar
- Las categorías y medicamentos aparecen en listas
- Click en el ícono de papelera para eliminar
- Al eliminar una categoría, se eliminan todos sus medicamentos

### Como Paciente

#### Consultar Medicamentos
1. Ve a **Dashboard Paciente → Medicamentos**
2. Verás:
   - Estadísticas (total de categorías y medicamentos)
   - Buscador (buscar por nombre)
   - Acordeón con categorías

#### Buscar Medicamento
1. Escribe en el buscador
2. Los resultados se filtran automáticamente
3. Las categorías sin resultados se ocultan

#### Ver Detalles
1. Click en una categoría para expandir
2. Verás todos los medicamentos con:
   - Nombre y descripción
   - Dosis recomendada
   - Vía de administración
   - Indicaciones
   - Contraindicaciones (si las hay)

---

## 🎨 Componentes Creados

### Frontend
```
client/pages/
├── profesional/
│   └── Medicamentos.tsx       ← Gestión completa (CRUD)
└── paciente/
    └── Medicamentos.tsx       ← Solo lectura (consulta)
```

### Tipos Compartidos
```
shared/
└── medicamentos.ts            ← Tipos TypeScript
```

### SQL
```
supabase_medicamentos.sql      ← Script de instalación
```

---

## 🔧 Funcionalidades Técnicas

### Profesionales
- ✅ Cargar datos desde Supabase
- ✅ Crear categorías con descripción
- ✅ Crear medicamentos con campos completos
- ✅ Eliminar categorías (cascade a medicamentos)
- ✅ Eliminar medicamentos individuales
- ✅ Botón de recarga manual
- ✅ Vista organizada por categoría
- ✅ Contador de medicamentos por categoría
- ✅ Validación de campos requeridos
- ✅ Toasts de confirmación/error

### Pacientes
- ✅ Vista de solo lectura
- ✅ Búsqueda en tiempo real
- ✅ Acordeón por categorías
- ✅ Estadísticas visuales
- ✅ Información detallada de medicamentos
- ✅ Aviso de consultar al médico
- ✅ Diseño responsive

---

## 🚀 Testing

### Test 1: Crear Categoría (Profesional)
```
1. Login como profesional
2. Ir a Medicamentos
3. Agregar categoría "Prueba"
4. Verificar que aparece en la lista
5. Verificar contador en 0 medicamentos
```

### Test 2: Crear Medicamento (Profesional)
```
1. Seleccionar categoría "Prueba"
2. Agregar medicamento "Test 100mg"
3. Completar todos los campos
4. Verificar que aparece en la lista
5. Verificar que el contador de categoría aumentó
```

### Test 3: Eliminar (Profesional)
```
1. Eliminar medicamento creado
2. Verificar que desaparece
3. Eliminar categoría
4. Confirmar diálogo
5. Verificar que desaparece
```

### Test 4: Ver Medicamentos (Paciente)
```
1. Login como paciente
2. Ir a Medicamentos
3. Verificar estadísticas correctas
4. Expandir una categoría
5. Verificar detalles completos
```

### Test 5: Búsqueda (Paciente)
```
1. Escribir "paracetamol" en búsqueda
2. Verificar filtrado en tiempo real
3. Limpiar búsqueda
4. Verificar que vuelven todos los resultados
```

---

## 🐛 Solución de Problemas

### ❌ "Permission denied for table medicamentos"
**Causa:** RLS no está configurado correctamente

**Solución:**
1. Ejecuta el script SQL completo de nuevo
2. Verifica que las políticas existen en Supabase
3. Asegúrate de que el usuario tenga rol "profesional" en metadata

### ❌ No se cargan los medicamentos
**Causa:** Error de conexión con Supabase

**Solución:**
1. Verifica variables de entorno `.env`
2. Verifica que las tablas existen
3. Revisa la consola del navegador para errores

### ❌ "Cannot read property 'nombre'"
**Causa:** Categoría eliminada pero aún referenciada

**Solución:**
- Recarga la página
- El CASCADE debería eliminar referencias automáticamente

### ❌ Paciente puede crear medicamentos
**Causa:** RLS no está funcionando

**Solución:**
1. Ve a Table Editor → medicamentos
2. Verifica que RLS está habilitado (candado verde)
3. Revisa las políticas en Authentication → Policies

---

## 📊 Vistas SQL Creadas

### `vista_medicamentos_completa`
```sql
SELECT medicamentos + nombre de categoría
ORDER BY categoría, medicamento
```

### `vista_categorias_con_conteo`
```sql
SELECT categorías + count de medicamentos
GROUP BY categoría
```

**Uso en futuras consultas:**
```sql
SELECT * FROM vista_medicamentos_completa
WHERE categoria_nombre = 'Analgésicos';
```

---

## 🎯 Próximas Mejoras (Opcional)

### Funcionalidades Adicionales
- [ ] Editar medicamentos existentes
- [ ] Editar categorías
- [ ] Importar/exportar catálogo (CSV)
- [ ] Imágenes de medicamentos
- [ ] Búsqueda avanzada con filtros
- [ ] Favoritos para pacientes
- [ ] Alertas de interacciones medicamentosas
- [ ] Historial de cambios

### Optimizaciones
- [ ] Paginación para catálogos grandes
- [ ] Cache de búsquedas frecuentes
- [ ] Índices adicionales
- [ ] Vistas materializadas

---

## ✅ Checklist de Instalación

- [ ] Script SQL ejecutado en Supabase
- [ ] Tablas creadas verificadas
- [ ] RLS habilitado verificado
- [ ] Políticas creadas verificadas
- [ ] Datos de ejemplo cargados
- [ ] Test como profesional exitoso
- [ ] Test como paciente exitoso
- [ ] Búsqueda funcionando
- [ ] CRUD completo funcionando

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que ejecutaste el script SQL completo
2. Verifica que tienes usuario profesional creado
3. Revisa la consola del navegador
4. Revisa logs de Supabase
5. Verifica políticas RLS

---

**🎉 ¡Sistema de Medicamentos instalado y funcionando!**
