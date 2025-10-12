import { BuscarPacienteDialog } from "@/components/profesional/BuscarPacienteDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getSupabase } from "@/lib/supabase";
import type { CategoriaMedicamento, Medicamento } from "@shared/medicamentos";
import { INTERVALOS_DISPONIBLES } from "@shared/recordatorios";
import { ChevronDown, ChevronUp, Clock, Edit, MoreVertical, Plus, Search, Trash2, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Paciente {
  id: string;
  user_id: string; // UUID de auth.users
  nombre: string;
  apellido: string;
  email: string;
}

export default function MedicamentosProfesional() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoriaMedicamento[]>([]);
  const [meds, setMeds] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [expandedMedId, setExpandedMedId] = useState<string | null>(null);

  // Estados para el diálogo de agregar/editar
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicamento | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria_id: "",
    imagen_url: "",
    dosis_recomendada: "",
    via_administracion: "",
    indicaciones: "",
    contraindicaciones: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Estados para asignar recordatorio
  const [isRecordatorioDialogOpen, setIsRecordatorioDialogOpen] = useState(false);
  const [selectedMedicamento, setSelectedMedicamento] = useState<Medicamento | null>(null);
  const [misPacientes, setMisPacientes] = useState<Paciente[]>([]);
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [recordatorioForm, setRecordatorioForm] = useState({
    paciente_id: "",
    dosis: "",
    intervalo_horas: "8",
    indicaciones: "",
    tomas_totales: "",
  });
  const [creatingRecordatorio, setCreatingRecordatorio] = useState(false);
  const [intervaloPersonalizado, setIntervaloPersonalizado] = useState(false);
  const [intervaloCustom, setIntervaloCustom] = useState({ valor: "", unidad: "horas" });

  // Estado para el diálogo de buscar paciente
  const [isBuscarPacienteDialogOpen, setIsBuscarPacienteDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const filteredMeds = useMemo(() => {
    let filtered = meds;
    if (selectedCategory !== "Todos") {
      const cat = categories.find(c => c.nombre === selectedCategory);
      if (cat) {
        filtered = filtered.filter(m => m.categoria_id === cat.id);
      }
    }
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((m) =>
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [searchTerm, meds, selectedCategory, categories]);

  const loadData = async () => {
    try {
      const supabase = getSupabase();
      const { data: cats, error: catsError } = await supabase
        .from("categorias_medicamentos")
        .select("*")
        .order("nombre");
      if (catsError) throw catsError;
      setCategories(cats || []);

      const { data: medications, error: medsError } = await supabase
        .from("medicamentos")
        .select("*")
        .order("nombre");
      if (medsError) throw medsError;
      setMeds(medications || []);
    } catch (error: any) {
      toast({
        title: "Error al cargar medicamentos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingMed(null);
    setFormData({
      nombre: "",
      descripcion: "",
      categoria_id: categories[0]?.id || "",
      imagen_url: "",
      dosis_recomendada: "",
      via_administracion: "",
      indicaciones: "",
      contraindicaciones: "",
    });
    setImagePreview(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (med: Medicamento) => {
    setEditingMed(med);
    setFormData({
      nombre: med.nombre,
      descripcion: med.descripcion || "",
      categoria_id: med.categoria_id,
      imagen_url: med.imagen_url || "",
      dosis_recomendada: med.dosis_recomendada || "",
      via_administracion: med.via_administracion || "",
      indicaciones: med.indicaciones || "",
      contraindicaciones: med.contraindicaciones || "",
    });
    setImagePreview(med.imagen_url || null);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no puede superar los 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    try {
      const supabase = getSupabase();

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `medicamentos/${fileName}`;

      // Subir imagen a Supabase Storage
      const { data, error } = await supabase.storage
        .from('imagenes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Obtener URL pública de la imagen
      const { data: { publicUrl } } = supabase.storage
        .from('imagenes')
        .getPublicUrl(filePath);

      setFormData({ ...formData, imagen_url: publicUrl });
      setImagePreview(publicUrl);

      toast({
        title: "Imagen subida",
        description: "La imagen se ha cargado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error al subir imagen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imagen_url: "" });
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre del medicamento es obligatorio",
        variant: "destructive",
      });
      return;
    }

    try {
      const supabase = getSupabase();

      if (editingMed) {
        // Actualizar medicamento existente
        const { data, error } = await supabase
          .from("medicamentos")
          .update({
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim() || null,
            categoria_id: formData.categoria_id,
            imagen_url: formData.imagen_url.trim() || null,
            dosis_recomendada: formData.dosis_recomendada.trim() || null,
            via_administracion: formData.via_administracion.trim() || null,
            indicaciones: formData.indicaciones.trim() || null,
            contraindicaciones: formData.contraindicaciones.trim() || null,
          })
          .eq("id", editingMed.id)
          .select()
          .single();

        if (error) throw error;

        setMeds(meds.map(m => m.id === editingMed.id ? data : m));
        toast({
          title: "Medicamento actualizado",
          description: `${data.nombre} fue actualizado exitosamente`,
        });
      } else {
        // Crear nuevo medicamento
        const { data, error } = await supabase
          .from("medicamentos")
          .insert([{
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim() || null,
            categoria_id: formData.categoria_id,
            imagen_url: formData.imagen_url.trim() || null,
            dosis_recomendada: formData.dosis_recomendada.trim() || null,
            via_administracion: formData.via_administracion.trim() || null,
            indicaciones: formData.indicaciones.trim() || null,
            contraindicaciones: formData.contraindicaciones.trim() || null,
          }])
          .select()
          .single();

        if (error) throw error;

        setMeds([data, ...meds]);
        toast({
          title: "Medicamento agregado",
          description: `${data.nombre} fue agregado exitosamente`,
        });
      }

      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error al guardar medicamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (med: Medicamento) => {
    if (!confirm(`¿Eliminar ${med.nombre}? Esta acción no se puede deshacer.`)) return;

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("medicamentos")
        .delete()
        .eq("id", med.id);

      if (error) throw error;

      setMeds(meds.filter(m => m.id !== med.id));
      toast({
        title: "Medicamento eliminado",
        description: `${med.nombre} fue eliminado exitosamente`,
      });
    } catch (error: any) {
      toast({
        title: "Error al eliminar medicamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleOpenRecordatorioDialog = async (med: Medicamento) => {
    setSelectedMedicamento(med);
    setRecordatorioForm({
      paciente_id: "",
      dosis: med.dosis_recomendada || "",
      intervalo_horas: "8",
      indicaciones: med.indicaciones || "",
      tomas_totales: "",
    });
    setIntervaloPersonalizado(false);
    setIntervaloCustom({ valor: "", unidad: "horas" });
    setIsRecordatorioDialogOpen(true);

    // Cargar lista de pacientes
    if (user?.id) {
      setLoadingPacientes(true);
      try {
        const supabase = getSupabase();

        // Primero obtener las relaciones paciente-profesional
        const { data: relaciones, error: errorRelaciones } = await supabase
          .from("paciente_profesional")
          .select("paciente_id")
          .eq("profesional_id", user.id)
          .eq("activo", true);

        if (errorRelaciones) throw errorRelaciones;

        if (!relaciones || relaciones.length === 0) {
          setMisPacientes([]);
          return;
        }

        // Luego obtener los datos de los pacientes
        const pacienteIds = relaciones.map(r => r.paciente_id);
        const { data: pacientesData, error: errorPacientes } = await supabase
          .from("pacientes")
          .select("id, user_id, nombre, apellido, email")
          .in("user_id", pacienteIds);

        if (errorPacientes) throw errorPacientes;

        setMisPacientes(pacientesData || []);
      } catch (error: any) {
        toast({
          title: "Error al cargar pacientes",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoadingPacientes(false);
      }
    }
  };

  const handlePacienteSeleccionado = async (paciente: Paciente) => {
    // Agregar el paciente a la lista si no está
    if (!misPacientes.find(p => p.id === paciente.id)) {
      setMisPacientes([...misPacientes, paciente]);
    }

    // Seleccionarlo automáticamente en el formulario (usar user_id para auth.users)
    setRecordatorioForm({
      ...recordatorioForm,
      paciente_id: paciente.user_id, // user_id apunta a auth.users(id)
    });

    toast({
      title: "Paciente seleccionado",
      description: `${paciente.nombre} ${paciente.apellido} fue agregado al recordatorio`,
    });
  };

  const handleCreateRecordatorio = async () => {
    if (!selectedMedicamento || !user?.id) return;

    if (!recordatorioForm.paciente_id) {
      toast({
        title: "Error",
        description: "Debes seleccionar un paciente",
        variant: "destructive",
      });
      return;
    }

    if (!recordatorioForm.dosis.trim()) {
      toast({
        title: "Error",
        description: "La dosis es obligatoria",
        variant: "destructive",
      });
      return;
    }

    // Calcular intervalo en horas
    let intervaloEnHoras: number;
    if (intervaloPersonalizado) {
      const valor = parseFloat(intervaloCustom.valor);
      if (!valor || valor <= 0) {
        toast({
          title: "Error",
          description: "Ingresa un intervalo válido",
          variant: "destructive",
        });
        return;
      }
      intervaloEnHoras = intervaloCustom.unidad === "minutos" ? valor / 60 : valor;
    } else {
      intervaloEnHoras = parseFloat(recordatorioForm.intervalo_horas);
    }

    setCreatingRecordatorio(true);

    try {
      const supabase = getSupabase();

      // PASO 1: Crear o verificar la relación profesional-paciente
      // paciente_id debe ser el user_id (auth.users.id) no el id de la tabla pacientes
      const { error: relacionError } = await supabase
        .from("paciente_profesional")
        .upsert([
          {
            paciente_id: recordatorioForm.paciente_id, // Este es user_id de auth.users
            profesional_id: user.id,
          }
        ], { onConflict: 'paciente_id,profesional_id' });

      if (relacionError) throw relacionError;

      // PASO 2: Crear el recordatorio (INACTIVO - espera primera toma del paciente)
      const recordatorioData = {
        user_id: recordatorioForm.paciente_id,
        medicamento_id: selectedMedicamento.id,
        dosis_personalizada: recordatorioForm.dosis.trim(),
        intervalo_horas: intervaloEnHoras,
        notas: recordatorioForm.indicaciones.trim() || null,
        tomas_totales: recordatorioForm.tomas_totales ? parseInt(recordatorioForm.tomas_totales) : null,
        tomas_completadas: 0,
        activo: false, // ⏸️ INACTIVO - El paciente lo activa al tomar la primera dosis
        creado_por_profesional_id: user.id,
      };

      const { error } = await supabase
        .from("recordatorios_medicamentos")
        .insert([recordatorioData]);

      if (error) throw error;

      const paciente = misPacientes.find(p => p.user_id === recordatorioForm.paciente_id);

      toast({
        title: "✅ Recordatorio asignado",
        description: `${selectedMedicamento.nombre} asignado a ${paciente?.nombre} ${paciente?.apellido}. El paciente debe tomar la primera dosis para activar las alarmas.`,
        duration: 7000,
      });

      setIsRecordatorioDialogOpen(false);
      setSelectedMedicamento(null);
    } catch (error: any) {
      toast({
        title: "Error al asignar recordatorio",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreatingRecordatorio(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const allCategories = ["Todos", ...categories.map(c => c.nombre)];

  return (
    <section className="pb-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Medicamentos</h1>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar medicamento
        </Button>
      </div>

      <div className="mt-6">
        <div className="relative mx-auto max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/50" />
          <Input
            aria-label="Buscar medicamentos"
            placeholder="Buscar medicamentos por nombre..."
            className="pl-10 h-12 rounded-xl bg-white border border-border/70 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "secondary"}
              className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all ${selectedCategory === cat ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted hover:bg-muted/80 text-muted-foreground"}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {filteredMeds.map((med) => {
          const isExpanded = expandedMedId === med.id;
          return (
            <Card key={med.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 h-fit">
              <CardHeader className="p-0 relative">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
                  {med.imagen_url ? (
                    <img
                      src={med.imagen_url}
                      alt={med.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="text-6xl"></div>';
                        }
                      }}
                    />
                  ) : (
                    <div className="text-6xl"></div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 bg-white/90 hover:bg-white"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(med)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(med)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{med.nombre}</h3>
                <p className="text-sm text-muted-foreground mb-2">{med.descripcion || "Sin descripción"}</p>

                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t pt-4 animate-in slide-in-from-top-2">
                    {med.dosis_recomendada && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1"> Dosis recomendada:</h4>
                        <p className="text-sm text-muted-foreground">{med.dosis_recomendada}</p>
                      </div>
                    )}
                    {med.via_administracion && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1"> Vía de administración:</h4>
                        <p className="text-sm text-muted-foreground">{med.via_administracion}</p>
                      </div>
                    )}
                    {med.indicaciones && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1"> Indicaciones:</h4>
                        <p className="text-sm text-muted-foreground">{med.indicaciones}</p>
                      </div>
                    )}
                    {med.contraindicaciones && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1"> Contraindicaciones:</h4>
                        <p className="text-sm text-muted-foreground">{med.contraindicaciones}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-3 pt-0 flex flex-col gap-2">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="sm"
                  onClick={() => handleOpenRecordatorioDialog(med)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span className="text-sm">Asignar a Paciente</span>
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedMedId(isExpanded ? null : med.id)}
                >
                  <span className="text-xs">{isExpanded ? "Ocultar" : "Ver detalles"}</span>
                  {isExpanded ? <ChevronUp className="ml-2 h-3 w-3" /> : <ChevronDown className="ml-2 h-3 w-3" />}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
        {filteredMeds.length === 0 && (
          <p className="text-foreground/70 col-span-full text-center py-8">No se encontraron medicamentos.</p>
        )}
      </div>

      {/* Diálogo para agregar/editar medicamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMed ? "Editar medicamento" : "Agregar nuevo medicamento"}</DialogTitle>
            <DialogDescription>
              {editingMed ? "Modifica los datos del medicamento" : "Completa la información del nuevo medicamento"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre del medicamento *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Paracetamol 500mg"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <Select
                value={formData.categoria_id}
                onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
              >
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="imagen">Imagen del medicamento</Label>
              <div className="space-y-2">
                <Input
                  id="imagen"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="cursor-pointer"
                />
                {uploadingImage && (
                  <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
                )}
                {imagePreview && (
                  <div className="relative w-full max-w-xs">
                    <div className="relative w-full h-48 border-2 border-dashed rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={handleRemoveImage}
                    >
                      Eliminar imagen
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción breve del medicamento"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dosis">Dosis recomendada</Label>
              <Input
                id="dosis"
                value={formData.dosis_recomendada}
                onChange={(e) => setFormData({ ...formData, dosis_recomendada: e.target.value })}
                placeholder="Ej: 1 tableta cada 8 horas"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="via">Vía de administración</Label>
              <Input
                id="via"
                value={formData.via_administracion}
                onChange={(e) => setFormData({ ...formData, via_administracion: e.target.value })}
                placeholder="Ej: Oral, Intravenosa, Tópica"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="indicaciones">Indicaciones</Label>
              <Textarea
                id="indicaciones"
                value={formData.indicaciones}
                onChange={(e) => setFormData({ ...formData, indicaciones: e.target.value })}
                placeholder="¿Para qué sirve este medicamento?"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contraindicaciones">Contraindicaciones</Label>
              <Textarea
                id="contraindicaciones"
                value={formData.contraindicaciones}
                onChange={(e) => setFormData({ ...formData, contraindicaciones: e.target.value })}
                placeholder="¿Cuándo NO se debe usar este medicamento?"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingMed ? "Guardar cambios" : "Agregar medicamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para asignar recordatorio a paciente */}
      <Dialog open={isRecordatorioDialogOpen} onOpenChange={setIsRecordatorioDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Asignar Recordatorio a Paciente
            </DialogTitle>
            <DialogDescription>
              Asigna {selectedMedicamento?.nombre} a uno de tus pacientes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Medicamento seleccionado (solo lectura) */}
            <div className="space-y-2">
              <Label>Medicamento</Label>
              <div className="p-3 bg-muted rounded-md border">
                <p className="font-medium">{selectedMedicamento?.nombre}</p>
                <p className="text-sm text-muted-foreground">
                  {categories.find(c => c.id === selectedMedicamento?.categoria_id)?.nombre}
                </p>
              </div>
            </div>

            {/* Selección de paciente */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="paciente">Paciente *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBuscarPacienteDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Seleccionar Paciente
                </Button>
              </div>
              {loadingPacientes ? (
                <div className="p-3 text-center text-muted-foreground">
                  Cargando pacientes...
                </div>
              ) : recordatorioForm.paciente_id ? (
                <div className="p-3 bg-green-50 rounded-md border border-green-200">
                  <p className="text-sm text-green-800">
                    ✓ Paciente seleccionado: {misPacientes.find(p => p.user_id === recordatorioForm.paciente_id)?.nombre} {misPacientes.find(p => p.user_id === recordatorioForm.paciente_id)?.apellido}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-sm text-blue-800">
                    Haz clic en "Seleccionar Paciente" para buscar y elegir un paciente
                  </p>
                </div>
              )}
            </div>

            {/* Dosis */}
            <div className="space-y-2">
              <Label htmlFor="dosis">Dosis *</Label>
              <Input
                id="dosis"
                placeholder="Ej: 1 tableta, 5ml, 2 cápsulas..."
                value={recordatorioForm.dosis}
                onChange={(e) => setRecordatorioForm({ ...recordatorioForm, dosis: e.target.value })}
              />
            </div>

            {/* Intervalo */}
            <div className="space-y-2">
              <Label htmlFor="intervalo">Frecuencia *</Label>
              <Select
                value={recordatorioForm.intervalo_horas}
                onValueChange={(value) => {
                  setRecordatorioForm({ ...recordatorioForm, intervalo_horas: value });
                  setIntervaloPersonalizado(value === "-1");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVALOS_DISPONIBLES.map((int) => (
                    <SelectItem key={int.value} value={int.value.toString()}>
                      {int.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Intervalo personalizado */}
            {intervaloPersonalizado && (
              <div className="space-y-2 border rounded-lg p-4 bg-muted/50">
                <Label>Configurar intervalo personalizado</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="intervalo-valor">Cantidad *</Label>
                    <Input
                      id="intervalo-valor"
                      type="number"
                      min="0.1"
                      step="0.5"
                      placeholder="Ej: 30"
                      value={intervaloCustom.valor}
                      onChange={(e) =>
                        setIntervaloCustom({ ...intervaloCustom, valor: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="intervalo-unidad">Unidad *</Label>
                    <Select
                      value={intervaloCustom.unidad}
                      onValueChange={(value) =>
                        setIntervaloCustom({ ...intervaloCustom, unidad: value as "minutos" | "horas" })
                      }
                    >
                      <SelectTrigger id="intervalo-unidad">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutos">Minutos</SelectItem>
                        <SelectItem value="horas">Horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Tomas totales (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="tomas_totales">Tomas totales (opcional)</Label>
              <Input
                id="tomas_totales"
                type="number"
                min="1"
                placeholder="Dejar vacío para recordatorio continuo"
                value={recordatorioForm.tomas_totales}
                onChange={(e) => setRecordatorioForm({ ...recordatorioForm, tomas_totales: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Si se define, el recordatorio se desactivará al completar todas las tomas
              </p>
            </div>

            {/* Indicaciones */}
            <div className="space-y-2">
              <Label htmlFor="indicaciones">Indicaciones adicionales (opcional)</Label>
              <Textarea
                id="indicaciones"
                placeholder="Ej: Tomar con alimentos, antes de dormir..."
                value={recordatorioForm.indicaciones}
                onChange={(e) => setRecordatorioForm({ ...recordatorioForm, indicaciones: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRecordatorioDialogOpen(false)}
              disabled={creatingRecordatorio}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateRecordatorio}
              disabled={creatingRecordatorio || misPacientes.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {creatingRecordatorio ? "Asignando..." : "Asignar Recordatorio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para buscar y asignar paciente */}
      <BuscarPacienteDialog
        open={isBuscarPacienteDialogOpen}
        onOpenChange={setIsBuscarPacienteDialogOpen}
        onPacienteSeleccionado={handlePacienteSeleccionado}
        profesionalId={user?.id || ""}
      />
    </section>
  );
}
