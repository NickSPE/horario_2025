export const categorias = ["Todos", "Ojos", "Piel", "Corazón", "Respiratorio"] as const;

export interface Medicamento {
  id: string;
  nombre: string;
  categoria: typeof categorias[number];
  descripcion: string;
  imagen: string;
}

export const medicamentos: Medicamento[] = [
  {
    id: "1",
    nombre: "Gotas para ojos",
    categoria: "Ojos",
    descripcion: "Alivio para ojos secos e irritados.",
    imagen: "/placeholder.svg"
  },
  {
    id: "2",
    nombre: "Crema para la piel",
    categoria: "Piel",
    descripcion: "Tratamiento para irritaciones y eczema.",
    imagen: "/placeholder.svg"
  },
  {
    id: "3",
    nombre: "Pastillas para el corazón",
    categoria: "Corazón",
    descripcion: "Control de la presión arterial.",
    imagen: "/placeholder.svg"
  },
  {
    id: "4",
    nombre: "Inhalador respiratorio",
    categoria: "Respiratorio",
    descripcion: "Alivio rápido para crisis de asma.",
    imagen: "/placeholder.svg"
  },
  {
    id: "5",
    nombre: "Lágrimas artificiales",
    categoria: "Ojos",
    descripcion: "Hidratación inmediata para ojos secos.",
    imagen: "/placeholder.svg"
  },
  {
    id: "6",
    nombre: "Loción hidratante",
    categoria: "Piel",
    descripcion: "Hidratación profunda para piel seca.",
    imagen: "/placeholder.svg"
  },
  {
    id: "7",
    nombre: "Aspirina cardio",
    categoria: "Corazón",
    descripcion: "Prevención de problemas cardiovasculares.",
    imagen: "/placeholder.svg"
  },
  {
    id: "8",
    nombre: "Spray nasal",
    categoria: "Respiratorio",
    descripcion: "Descongestión nasal rápida.",
    imagen: "/placeholder.svg"
  }
];
