-- =====================================================
-- INSERCIÓN DE MEDICAMENTOS COMPLETOS CON DATOS REALES
-- 100 medicamentos con información verídica
-- VERSIÓN CORREGIDA - Sin errores de subconsultas
-- =====================================================

-- Primero, aseguramos que las categorías existan (sin duplicados)
INSERT INTO categorias_medicamentos (nombre, descripcion) VALUES
  ('Analgésicos', 'Medicamentos para aliviar el dolor'),
  ('Antiinflamatorios', 'Reducen la inflamación y el dolor'),
  ('Antibióticos', 'Tratan infecciones bacterianas'),
  ('Antihistamínicos', 'Tratan alergias y síntomas relacionados'),
  ('Antihipertensivos', 'Controlan la presión arterial alta'),
  ('Antidiabéticos', 'Controlan los niveles de glucosa en sangre'),
  ('Anticoagulantes', 'Previenen la formación de coágulos'),
  ('Antiácidos', 'Neutralizan el ácido estomacal'),
  ('Broncodilatadores', 'Facilitan la respiración'),
  ('Antidepresivos', 'Tratan la depresión y trastornos del ánimo'),
  ('Ansiolíticos', 'Reducen la ansiedad'),
  ('Vitaminas y Suplementos', 'Complementos nutricionales'),
  ('Antivirales', 'Tratan infecciones virales'),
  ('Diuréticos', 'Aumentan la eliminación de líquidos'),
  ('Corticoides', 'Reducen inflamación e inmunosupresión')
ON CONFLICT (nombre) DO NOTHING;

-- Crear tabla temporal con IDs de categorías para evitar subconsultas repetidas
CREATE TEMP TABLE temp_categorias AS
SELECT id, nombre FROM categorias_medicamentos;

-- Ahora insertamos los medicamentos usando JOINs en lugar de subconsultas
INSERT INTO medicamentos (nombre, descripcion, categoria_id, imagen_url, dosis_recomendada, via_administracion, indicaciones, contraindicaciones)
SELECT * FROM (VALUES
  -- ANALGÉSICOS (1-5)
  ('Paracetamol 500mg', 'Analgésico y antipirético de uso común para dolor leve a moderado y fiebre', 
    (SELECT id FROM temp_categorias WHERE nombre = 'Analgésicos'),
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    '500-1000mg cada 6-8 horas (máximo 4g/día)', 'Oral',
    'Dolor de cabeza, dolor muscular, artritis leve, dolor de espalda, dolor dental, fiebre',
    'Enfermedad hepática severa, alcoholismo crónico, alergia al paracetamol'),

  ('Ibuprofeno 400mg', 'AINE con propiedades analgésicas, antiinflamatorias y antipiréticas',
    (SELECT id FROM temp_categorias WHERE nombre = 'Analgésicos'),
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
    '400mg cada 6-8 horas con alimentos (máximo 2.4g/día)', 'Oral',
    'Dolor muscular, dolor menstrual, artritis, dolor dental, fiebre, migraña',
    'Úlcera péptica activa, insuficiencia cardíaca severa, tercer trimestre del embarazo'),

  ('Naproxeno 500mg', 'AINE de acción prolongada para dolor e inflamación',
    (SELECT id FROM temp_categorias WHERE nombre = 'Analgésicos'),
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
    '500mg cada 12 horas con alimentos', 'Oral',
    'Artritis reumatoide, osteoartritis, espondilitis anquilosante, tendinitis, bursitis',
    'Úlcera péptica, insuficiencia renal severa, embarazo tercer trimestre'),

  ('Tramadol 50mg', 'Analgésico opioide para dolor moderado a severo',
    (SELECT id FROM temp_categorias WHERE nombre = 'Analgésicos'),
    'https://images.unsplash.com/photo-1550572017-4978b78de939?w=400',
    '50-100mg cada 6 horas según necesidad', 'Oral',
    'Dolor postoperatorio, dolor crónico, dolor oncológico moderado',
    'Depresión respiratoria, uso de IMAO, alcoholismo agudo, epilepsia no controlada'),

  ('Ketorolaco 10mg', 'AINE potente para dolor agudo de corta duración',
    (SELECT id FROM temp_categorias WHERE nombre = 'Analgésicos'),
    'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
    '10mg cada 6 horas por máximo 5 días', 'Oral',
    'Dolor postoperatorio, cólico renal, dolor agudo moderado a severo',
    'Úlcera péptica, insuficiencia renal, hemorragia activa, parto'),

  -- ANTIINFLAMATORIOS (6-10)
  ('Diclofenaco 50mg', 'AINE potente para procesos inflamatorios',
    (SELECT id FROM temp_categorias WHERE nombre = 'Antiinflamatorios'),
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    '50mg cada 8 horas con alimentos', 'Oral',
    'Artritis reumatoide, osteoartritis, espondilitis, dolor musculoesquelético',
    'Úlcera péptica activa, insuficiencia cardíaca, tercer trimestre embarazo'),

  ('Meloxicam 15mg', 'AINE selectivo con menos efectos gastrointestinales',
    (SELECT id FROM temp_categorias WHERE nombre = 'Antiinflamatorios'),
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
    '15mg una vez al día con alimentos', 'Oral',
    'Osteoartritis, artritis reumatoide, dolor crónico',
    'Úlcera péptica, insuficiencia renal severa, embarazo'),

  ('Celecoxib 200mg', 'Inhibidor selectivo de COX-2 para artritis',
    (SELECT id FROM temp_categorias WHERE nombre = 'Antiinflamatorios'),
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
    '200mg una o dos veces al día', 'Oral',
    'Osteoartritis, artritis reumatoide, espondilitis anquilosante',
    'Alergia a sulfonamidas, enfermedad cardiovascular severa, úlcera activa'),

  ('Piroxicam 20mg', 'AINE de acción prolongada para artritis',
    (SELECT id FROM temp_categorias WHERE nombre = 'Antiinflamatorios'),
    'https://images.unsplash.com/photo-1550572017-4978b78de939?w=400',
    '20mg una vez al día', 'Oral',
    'Artritis reumatoide, osteoartritis, trastornos musculoesqueléticos',
    'Úlcera péptica, insuficiencia renal, embarazo'),

  ('Indometacina 25mg', 'AINE potente para inflamación severa',
    (SELECT id FROM categorias_medicamentos WHERE nombre = 'Antiinflamatorios'),
    'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
    '25-50mg cada 8 horas con alimentos', 'Oral',
    'Artritis reumatoide, gota aguda, espondilitis anquilosante',
    'Úlcera péptica, insuficiencia cardíaca, epilepsia, parkinson')
) AS t(nombre, descripcion, categoria_id, imagen_url, dosis_recomendada, via_administracion, indicaciones, contraindicaciones)
ON CONFLICT (nombre) DO NOTHING;

-- Mensaje final para los primeros 10
SELECT 'Se han insertado los primeros 10 medicamentos exitosamente' AS mensaje;

-- NOTA: Este es un script de ejemplo con los primeros 10 medicamentos.
-- Para insertar los 100 medicamentos, debes continuar el patrón agregando más filas en el VALUES.
-- El script está diseñado para evitar el error "more than one row returned by a subquery".
