import { useEffect, useState, useMemo } from "react";
import { getSupabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { CategoriaMedicamento, Medicamento } from "@shared/medicamentos";
import { Search, ChevronDown, ChevronUp, Plus, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { INTERVALOS_DISPONIBLES } from "@shared/recordatorios";

export default function MedicamentosPaciente() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoriaMedicamento[]>([]);
  const [meds, setMeds] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [expandedMedId, setExpandedMedId] = useState<string | null>(null);
  
  // Estados para el diálogo de crear recordatorio
  const [isRecordatorioDialogOpen, setIsRecordatorioDialogOpen] = useState(false);
  const [selectedMedicamento, setSelectedMedicamento] = useState<Medicamento | null>(null);
  const [recordatorioForm, setRecordatorioForm] = useState({
    dosis: "",
    intervalo_horas: "8",
    indicaciones: "",
    tomas_totales: "",
  });
  const [creatingRecordatorio, setCreatingRecordatorio] = useState(false);
  const [intervaloPersonalizado, setIntervaloPersonalizado] = useState(false);
  const [intervaloCustom, setIntervaloCustom] = useState({ valor: "", unidad: "horas" });

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

  const handleOpenRecordatorioDialog = (med: Medicamento) => {
    setSelectedMedicamento(med);
    setRecordatorioForm({
      dosis: med.dosis_recomendada || "",
      intervalo_horas: "8",
      indicaciones: med.indicaciones || "",
      tomas_totales: "",
    });
    setIntervaloPersonalizado(false);
    setIntervaloCustom({ valor: "", unidad: "horas" });
    setIsRecordatorioDialogOpen(true);
  };

  const handleCreateRecordatorio = async () => {
    if (!selectedMedicamento || !user?.id) return;

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
      
      const recordatorioData = {
        user_id: user.id,
        medicamento_id: selectedMedicamento.id,
        dosis_personalizada: recordatorioForm.dosis.trim(),
        intervalo_horas: intervaloEnHoras,
        notas: recordatorioForm.indicaciones.trim() || null,
        tomas_totales: recordatorioForm.tomas_totales ? parseInt(recordatorioForm.tomas_totales) : null,
        tomas_completadas: 0,
        activo: false,
        creado_por_profesional_id: null,
      };

      const { error } = await supabase
        .from("recordatorios_medicamentos")
        .insert([recordatorioData]);

      if (error) throw error;

      toast({
        title: "¡Recordatorio creado!",
        description: `${selectedMedicamento.nombre} agregado. Ve a Recordatorios y toma tu primera dosis para activar las alarmas.`,
        duration: 6000,
      });

      setIsRecordatorioDialogOpen(false);
      setSelectedMedicamento(null);
    } catch (error: any) {
      toast({
        title: "Error al crear recordatorio",
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
      </div>
      <div className="mt-6">
        <div className="relative mx-auto max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/50" />
          <Input
            aria-label="Buscar medicamentos"
            placeholder="Buscar medicamentos por nombre o síntoma..."
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
              <CardHeader className="p-0">
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
                          parent.innerHTML = '<div class="text-6xl">💊</div>';
                        }
                      }}
                    />
                  ) : (
                    <div className="text-6xl">💊</div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{med.nombre}</h3>
                <p className="text-sm text-muted-foreground mb-2">{med.descripcion || "Medicamento disponible"}</p>
                
                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t pt-4 animate-in slide-in-from-top-2">
                    {med.dosis_recomendada && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">💊 Dosis recomendada:</h4>
                        <p className="text-sm text-muted-foreground">{med.dosis_recomendada}</p>
                      </div>
                    )}
                    {med.via_administracion && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">💉 Vía de administración:</h4>
                        <p className="text-sm text-muted-foreground">{med.via_administracion}</p>
                      </div>
                    )}
                    {med.indicaciones && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">✅ Indicaciones:</h4>
                        <p className="text-sm text-muted-foreground">{med.indicaciones}</p>
                      </div>
                    )}
                    {med.contraindicaciones && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">⚠️ Contraindicaciones:</h4>
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
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="text-sm">Añadir Recordatorio</span>
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
          <p className="text-foreground/70 col-span-full text-center py-8">No se encontraron medicamentos con esa búsqueda.</p>
        )}
      </div>

      {/* Diálogo para crear recordatorio */}
      <Dialog open={isRecordatorioDialogOpen} onOpenChange={setIsRecordatorioDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Crear Recordatorio
            </DialogTitle>
            <DialogDescription>
              Configura un recordatorio para {selectedMedicamento?.nombre}
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
                  if (value === "-1") {
                    setIntervaloPersonalizado(true);
                  } else {
                    setIntervaloPersonalizado(false);
                    setRecordatorioForm({ ...recordatorioForm, intervalo_horas: value });
                  }
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
              <div className="space-y-2 border-l-4 border-primary pl-4 bg-blue-50 p-3 rounded">
                <Label className="text-primary font-semibold">⚙️ Intervalo Personalizado</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Cantidad"
                      value={intervaloCustom.valor}
                      onChange={(e) => setIntervaloCustom({ ...intervaloCustom, valor: e.target.value })}
                    />
                  </div>
                  <Select
                    value={intervaloCustom.unidad}
                    onValueChange={(value) => setIntervaloCustom({ ...intervaloCustom, unidad: value })}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutos">Minutos</SelectItem>
                      <SelectItem value="horas">Horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ejemplo: 30 minutos, 2 horas, etc.
                </p>
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
              disabled={creatingRecordatorio}
              className="bg-green-600 hover:bg-green-700"
            >
              {creatingRecordatorio ? "Creando..." : "Crear Recordatorio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
