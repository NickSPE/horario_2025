// Tipos compartidos para el sistema de medicamentos

export interface CategoriaMedicamento {
  id: string;
  nombre: string;
  descripcion?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Medicamento {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria_id: string;
  imagen_url?: string;
  dosis_recomendada?: string;
  via_administracion?: string;
  indicaciones?: string;
  contraindicaciones?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MedicamentoConCategoria extends Medicamento {
  categoria_nombre?: string;
}

export interface CategoriaConConteo extends CategoriaMedicamento {
  total_medicamentos?: number;
}
