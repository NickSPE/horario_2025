-- =====================================================
-- SISTEMA DE RECORDATORIOS DE MEDICAMENTOS
-- =====================================================

-- Tabla de recordatorios de medicamentos
CREATE TABLE IF NOT EXISTS recordatorios_medicamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medicamento_id UUID REFERENCES medicamentos(id) ON DELETE CASCADE NOT NULL,
  
  -- Configuración de frecuencia
  intervalo_horas DECIMAL(10, 8) NOT NULL, -- Permite decimales para pruebas (ej: 0.00277778 = 10 segundos)
  dosis_personalizada TEXT, -- Opcional: sobreescribe dosis del medicamento
  
  -- Contador de tomas
  tomas_totales INTEGER, -- Total de tomas que debe tomar (ej: 20 pastillas)
  tomas_completadas INTEGER DEFAULT 0, -- Cuántas ha tomado ya
  
  -- Tiempo
  inicio_tratamiento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  proxima_toma TIMESTAMP WITH TIME ZONE, -- NULL permitido cuando termina el tratamiento
  ultima_toma TIMESTAMP WITH TIME ZONE,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  notas TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de historial de tomas
CREATE TABLE IF NOT EXISTS historial_tomas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recordatorio_id UUID REFERENCES recordatorios_medicamentos(id) ON DELETE CASCADE NOT NULL,
  
  hora_programada TIMESTAMP WITH TIME ZONE NOT NULL,
  hora_real TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tomado BOOLEAN DEFAULT true,
  notas TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_recordatorios_user 
  ON recordatorios_medicamentos(user_id);

CREATE INDEX IF NOT EXISTS idx_recordatorios_medicamento 
  ON recordatorios_medicamentos(medicamento_id);

CREATE INDEX IF NOT EXISTS idx_recordatorios_proxima_toma 
  ON recordatorios_medicamentos(proxima_toma);

CREATE INDEX IF NOT EXISTS idx_historial_recordatorio 
  ON historial_tomas(recordatorio_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE recordatorios_medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_tomas ENABLE ROW LEVEL SECURITY;

-- Usuarios solo pueden ver sus propios recordatorios
CREATE POLICY "Usuarios ven sus recordatorios"
  ON recordatorios_medicamentos FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios solo pueden crear sus propios recordatorios
CREATE POLICY "Usuarios crean sus recordatorios"
  ON recordatorios_medicamentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuarios solo pueden actualizar sus propios recordatorios
CREATE POLICY "Usuarios actualizan sus recordatorios"
  ON recordatorios_medicamentos FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuarios solo pueden eliminar sus propios recordatorios
CREATE POLICY "Usuarios eliminan sus recordatorios"
  ON recordatorios_medicamentos FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para historial de tomas
CREATE POLICY "Usuarios ven su historial"
  ON historial_tomas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recordatorios_medicamentos
      WHERE recordatorios_medicamentos.id = historial_tomas.recordatorio_id
      AND recordatorios_medicamentos.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios crean su historial"
  ON historial_tomas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recordatorios_medicamentos
      WHERE recordatorios_medicamentos.id = historial_tomas.recordatorio_id
      AND recordatorios_medicamentos.user_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGER PARA updated_at
-- =====================================================

CREATE TRIGGER update_recordatorios_updated_at
  BEFORE UPDATE ON recordatorios_medicamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIÓN PARA CALCULAR PRÓXIMA TOMA
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_proxima_toma(
  ultima TIMESTAMP WITH TIME ZONE,
  intervalo INTEGER
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
  RETURN ultima + (intervalo || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VISTA: Recordatorios con información del medicamento
-- =====================================================

CREATE OR REPLACE VIEW vista_recordatorios_completa AS
SELECT 
  r.id,
  r.user_id,
  r.medicamento_id,
  m.nombre AS medicamento_nombre,
  m.dosis_recomendada,
  m.via_administracion,
  m.indicaciones,
  c.nombre AS categoria_nombre,
  r.intervalo_horas,
  r.dosis_personalizada,
  r.tomas_totales,
  r.tomas_completadas,
  CASE 
    WHEN r.tomas_totales IS NOT NULL THEN r.tomas_totales - r.tomas_completadas
    ELSE NULL
  END AS tomas_restantes,
  COALESCE(r.dosis_personalizada, m.dosis_recomendada) AS dosis_a_tomar,
  r.inicio_tratamiento,
  r.proxima_toma,
  r.ultima_toma,
  r.activo,
  r.notas,
  r.created_at,
  r.updated_at,
  -- Calcular tiempo restante en segundos (NULL si tratamiento terminó)
  CASE 
    WHEN r.proxima_toma IS NULL THEN NULL
    ELSE EXTRACT(EPOCH FROM (r.proxima_toma - NOW()))
  END AS segundos_restantes,
  -- Verificar si ya pasó la hora (FALSE si tratamiento terminó)
  CASE
    WHEN r.proxima_toma IS NULL THEN false
    ELSE (r.proxima_toma <= NOW())
  END AS debe_tomar_ahora
FROM recordatorios_medicamentos r
JOIN medicamentos m ON r.medicamento_id = m.id
LEFT JOIN categorias_medicamentos c ON m.categoria_id = c.id
ORDER BY r.proxima_toma ASC;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

SELECT 'Sistema de recordatorios creado exitosamente' AS status;
