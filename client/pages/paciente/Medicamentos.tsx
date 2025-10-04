import { useEffect, useState, useMemo } from "react";
import { getSupabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { CategoriaMedicamento, Medicamento } from "@shared/medicamentos";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MedicamentosPaciente() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoriaMedicamento[]>([]);
  const [meds, setMeds] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [expandedMedId, setExpandedMedId] = useState<string | null>(null);

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
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMeds.map((med) => {
          const isExpanded = expandedMedId === med.id;
          return (
            <Card key={med.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
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
          <p className="text-foreground/70 col-span-full text-center py-8">No se encontraron medicamentos con esa búsqueda.</p>
        )}
      </div>
    </section>
  );
}
