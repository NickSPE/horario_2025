import { useEffect, useState, useMemo } from "react";
import { getSupabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { CategoriaMedicamento, Medicamento } from "@shared/medicamentos";
import { Search, ChevronDown, ChevronUp, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MedicamentosProfesional() {
  const { toast } = useToast();
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
      
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMeds.map((med) => {
          const isExpanded = expandedMedId === med.id;
          return (
            <Card key={med.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
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
              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  size="default"
                  onClick={() => setExpandedMedId(isExpanded ? null : med.id)}
                >
                  <span>{isExpanded ? "Ocultar" : "Ver detalles"}</span>
                  {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
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
    </section>
  );
}
