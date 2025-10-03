import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { CategoriaMedicamento, Medicamento } from "@shared/medicamentos";
import { Search, Pill } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function MedicamentosPaciente() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoriaMedicamento[]>([]);
  const [meds, setMeds] = useState<Medicamento[]>([]);
  const [filteredMeds, setFilteredMeds] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMeds(meds);
    } else {
      const filtered = meds.filter((m) =>
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMeds(filtered);
    }
  }, [searchTerm, meds]);

  const loadData = async () => {
    try {
      const supabase = getSupabase();

      // Cargar categorías
      const { data: cats, error: catsError } = await supabase
        .from("categorias_medicamentos")
        .select("*")
        .order("nombre");

      if (catsError) throw catsError;
      setCategories(cats || []);

      // Cargar medicamentos
      const { data: medications, error: medsError } = await supabase
        .from("medicamentos")
        .select("*")
        .order("nombre");

      if (medsError) throw medsError;
      setMeds(medications || []);
      setFilteredMeds(medications || []);
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

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Catálogo de Medicamentos
        </h1>
        <p className="text-muted-foreground mt-1">
          Consulta información sobre medicamentos disponibles
        </p>
      </div>

      {/* Buscador */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar medicamento..."
              className="h-11 w-full rounded-md border bg-background pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              {filteredMeds.length} resultado(s) para "{searchTerm}"
            </p>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{categories.length}</p>
              <p className="text-sm text-muted-foreground">Categorías</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{meds.length}</p>
              <p className="text-sm text-muted-foreground">Medicamentos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medicamentos por Categoría (Acordeón) */}
      <Card>
        <CardHeader>
          <CardTitle>Medicamentos por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay categorías disponibles aún
            </p>
          ) : (
            <Accordion type="multiple" className="w-full">
              {categories.map((cat) => {
                const catMeds = filteredMeds.filter(
                  (m) => m.categoria_id === cat.id
                );

                return (
                  <AccordionItem key={cat.id} value={cat.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Pill className="h-5 w-5 text-primary" />
                        <div className="text-left">
                          <p className="font-semibold">{cat.nombre}</p>
                          {cat.descripcion && (
                            <p className="text-sm text-muted-foreground">
                              {cat.descripcion}
                            </p>
                          )}
                        </div>
                        <span className="ml-auto mr-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {catMeds.length}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {catMeds.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          {searchTerm
                            ? "No hay medicamentos que coincidan con tu búsqueda"
                            : "No hay medicamentos en esta categoría"}
                        </p>
                      ) : (
                        <div className="grid gap-3 pt-2">
                          {catMeds.map((med) => (
                            <div
                              key={med.id}
                              className="rounded-lg border p-4 bg-accent/20 hover:bg-accent/40 transition-colors"
                            >
                              <h4 className="font-semibold text-lg mb-2">
                                {med.nombre}
                              </h4>

                              {med.descripcion && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {med.descripcion}
                                </p>
                              )}

                              <div className="grid gap-2 text-sm">
                                {med.dosis_recomendada && (
                                  <div className="flex gap-2">
                                    <span className="font-medium text-primary">
                                      💊 Dosis:
                                    </span>
                                    <span>{med.dosis_recomendada}</span>
                                  </div>
                                )}

                                {med.via_administracion && (
                                  <div className="flex gap-2">
                                    <span className="font-medium text-primary">
                                      📍 Vía:
                                    </span>
                                    <span>{med.via_administracion}</span>
                                  </div>
                                )}

                                {med.indicaciones && (
                                  <div className="flex gap-2">
                                    <span className="font-medium text-primary">
                                      ℹ️ Indicaciones:
                                    </span>
                                    <span>{med.indicaciones}</span>
                                  </div>
                                )}

                                {med.contraindicaciones && (
                                  <div className="flex gap-2">
                                    <span className="font-medium text-destructive">
                                      ⚠️ Contraindicaciones:
                                    </span>
                                    <span>{med.contraindicaciones}</span>
                                  </div>
                                )}
                              </div>

                              <p className="text-xs text-muted-foreground mt-3 italic">
                                Consulta siempre a tu médico antes de tomar cualquier
                                medicamento
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-blue-600 dark:text-blue-400 text-2xl">ℹ️</div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Información Importante
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>
                  • La información aquí presentada es de carácter informativo
                </li>
                <li>
                  • No sustituye la consulta con un profesional de la salud
                </li>
                <li>
                  • Sigue siempre las indicaciones de tu médico
                </li>
                <li>
                  • Reporta cualquier reacción adversa a tu profesional de salud
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
