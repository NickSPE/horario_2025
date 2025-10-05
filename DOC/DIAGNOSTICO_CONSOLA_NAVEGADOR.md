# Diagnóstico desde Consola del Navegador (Como Paciente)

## Instrucciones

1. **Login como PACIENTE** en la aplicación
2. Presiona **F12** para abrir la consola del navegador
3. Copia y pega el siguiente código:

```javascript
// ========================================
// DIAGNÓSTICO RECORDATORIOS DEL PACIENTE
// ========================================

async function diagnosticarRecordatorios() {
  console.clear();
  console.log('🔍 Iniciando diagnóstico...\n');
  
  // 1. Verificar usuario actual
  const { data: { user }, error: authError } = await window.supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('❌ Error de autenticación:', authError);
    return;
  }
  
  console.log('👤 Usuario actual:');
  console.log('  - user_id:', user.id);
  console.log('  - email:', user.email);
  console.log('  - nombre:', user.user_metadata?.nombre, user.user_metadata?.apellido);
  console.log('\n');
  
  // 2. Ver TODOS los recordatorios (sin filtros)
  const { data: todos, error: error1 } = await window.supabase
    .from('recordatorios_medicamentos')
    .select('*')
    .eq('user_id', user.id);
  
  console.log('📋 TODOS LOS RECORDATORIOS (tabla directa):');
  console.log('  - Total:', todos?.length || 0);
  
  if (error1) {
    console.error('  ❌ Error:', error1.message);
  } else {
    console.table(todos?.map(r => ({
      id: r.id.substring(0, 8) + '...',
      medicamento_id: r.medicamento_id.substring(0, 8) + '...',
      activo: r.activo ? '✅ Sí' : '❌ No',
      tomas: r.tomas_completadas + '/' + (r.tomas_totales || '∞'),
      creado_por_prof: r.creado_por_profesional_id ? '👨‍⚕️ Sí' : '👤 Paciente',
      fecha: new Date(r.created_at).toLocaleString()
    })));
  }
  console.log('\n');
  
  // 3. Ver recordatorios desde la vista
  const { data: vista, error: error2 } = await window.supabase
    .from('vista_recordatorios_completa')
    .select('*')
    .eq('user_id', user.id);
  
  console.log('📊 RECORDATORIOS (vista completa):');
  console.log('  - Total:', vista?.length || 0);
  
  if (error2) {
    console.error('  ❌ Error:', error2.message);
  } else {
    console.table(vista?.map(r => ({
      medicamento: r.medicamento_nombre,
      dosis: r.dosis_a_tomar,
      activo: r.activo ? '✅ Sí' : '❌ No',
      tomas: r.tomas_completadas + '/' + (r.tomas_totales || '∞'),
      creado_por: r.profesional_nombre 
        ? '👨‍⚕️ Dr. ' + r.profesional_nombre 
        : '👤 Tú mismo',
      proxima_toma: r.proxima_toma 
        ? new Date(r.proxima_toma).toLocaleString() 
        : 'Sin programar'
    })));
  }
  console.log('\n');
  
  // 4. Separar por tipo
  const activos = todos?.filter(r => r.activo) || [];
  const inactivos = todos?.filter(r => !r.activo) || [];
  const porProfesional = todos?.filter(r => r.creado_por_profesional_id) || [];
  const porPaciente = todos?.filter(r => !r.creado_por_profesional_id) || [];
  
  console.log('📈 RESUMEN:');
  console.log('  ✅ Activos:', activos.length);
  console.log('  💤 Inactivos:', inactivos.length);
  console.log('  👨‍⚕️ Creados por profesional:', porProfesional.length);
  console.log('  👤 Creados por ti:', porPaciente.length);
  console.log('\n');
  
  // 5. Ver relaciones profesional-paciente
  const { data: relaciones, error: error3 } = await window.supabase
    .from('paciente_profesional')
    .select('*')
    .eq('paciente_id', user.id);
  
  console.log('🔗 RELACIONES CON PROFESIONALES:');
  console.log('  - Total:', relaciones?.length || 0);
  
  if (error3) {
    console.error('  ❌ Error:', error3.message);
  } else if (relaciones && relaciones.length > 0) {
    console.table(relaciones.map(r => ({
      profesional_id: r.profesional_id.substring(0, 8) + '...',
      fecha_asignacion: new Date(r.fecha_asignacion).toLocaleDateString(),
      activo: r.activo ? '✅' : '❌'
    })));
  } else {
    console.log('  ℹ️ No tienes profesionales asignados');
  }
  console.log('\n');
  
  // 6. Diagnóstico
  console.log('🩺 DIAGNÓSTICO:');
  
  if (todos && todos.length === 0) {
    console.log('  ⚠️ NO tienes ningún recordatorio creado');
    console.log('  💡 Crea uno desde la sección "Recordatorios"');
  } else {
    console.log('  ✅ Tienes', todos.length, 'recordatorio(s) en total');
    
    if (activos.length === 0) {
      console.log('  ⚠️ NINGUNO está activo');
      console.log('  💡 Los recordatorios deben estar activos para aparecer en el dashboard');
    } else {
      console.log('  ✅ Tienes', activos.length, 'recordatorio(s) activo(s)');
    }
    
    if (porProfesional.length === 0) {
      console.log('  ℹ️ Ningún recordatorio fue creado por un profesional');
    } else {
      console.log('  ✅ Tienes', porProfesional.length, 'recordatorio(s) asignado(s) por profesional');
      
      const profesionalesActivos = porProfesional.filter(r => r.activo);
      if (profesionalesActivos.length === 0) {
        console.log('  ⚠️ PERO están INACTIVOS - no aparecerán en el dashboard');
      }
    }
  }
  
  console.log('\n');
  console.log('✅ Diagnóstico completado');
  console.log('📝 Si necesitas más ayuda, comparte esta salida');
}

// Ejecutar diagnóstico
diagnosticarRecordatorios();
```

## Interpretación de Resultados

### ✅ Si ves "Total: 2" en tabla directa y vista:
- Los 2 recordatorios que creaste están bien
- El problema es que el profesional **NO** ha creado recordatorios para ti
- O los creó pero están INACTIVOS

### ✅ Si ves "Total: X" en tabla directa pero "Total: 0" en vista:
- Hay un problema con la vista `vista_recordatorios_completa`
- Posible error en el JOIN de la vista

### ✅ Si ves más en "tabla directa" que en "vista":
- RLS está bloqueando algunos recordatorios en la vista
- O hay un error en el JOIN de la vista

### ✅ Si ves "Creados por profesional: 0":
- El profesional NO ha creado recordatorios para ti todavía
- O los creó pero con `user_id` incorrecto

## Siguiente Paso Según el Resultado

Ejecuta el diagnóstico y dime qué números ves para:
1. **Total recordatorios (tabla directa)**: ___
2. **Total recordatorios (vista)**: ___
3. **Activos**: ___
4. **Inactivos**: ___
5. **Creados por profesional**: ___
6. **Creados por ti**: ___

Con esa información te diré exactamente qué hacer.
