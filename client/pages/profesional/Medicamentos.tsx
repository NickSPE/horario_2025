import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { CategoriaMedicamento, Medicamento } from "@shared/medicamentos";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function Medicamentos() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoriaMedicamento[]>([]);
  const [meds, setMeds] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);

  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [medName, setMedName] = useState("");
  const [medDesc, setMedDesc] = useState("");
  const [medCatId, setMedCatId] = useState<string>("");
  const [medDosis, setMedDosis] = useState("");
  const [medVia, setMedVia] = useState("");
  const [medIndicaciones, setMedIndicaciones] = useState("");

  // Cargar datos desde Supabase
  useEffect(() => {
    loadData();
  }, []);

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
    } catch (error: any) {
      toast({
        title: "Error al cargar datos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!catName.trim()) return;

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("categorias_medicamentos")
        .insert([{ nombre: catName.trim(), descripcion: catDesc.trim() || null }])
        .select()
        .single();

      if (error) throw error;

      setCategories([data, ...categories]);
      setCatName("");
      setCatDesc("");

      toast({
        title: "Categoría agregada",
        description: `${data.nombre} fue agregada exitosamente`,
      });
    } catch (error: any) {
      toast({
        title: "Error al agregar categoría",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría? Los medicamentos asociados también se eliminarán.")) return;

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("categorias_medicamentos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCategories(categories.filter((c) => c.id !== id));
      setMeds(meds.filter((m) => m.categoria_id !== id));

      toast({
        title: "Categoría eliminada",
        description: "La categoría fue eliminada exitosamente",
      });
    } catch (error: any) {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addMed = async () => {
    if (!medName.trim() || !medCatId) {
      toast({
        title: "Campos requeridos",
        description: "Debes completar nombre y categoría",
        variant: "destructive",
      });
      return;
    }

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("medicamentos")
        .insert([
          {
            nombre: medName.trim(),
            descripcion: medDesc.trim() || null,
            categoria_id: medCatId,
            dosis_recomendada: medDosis.trim() || null,
            via_administracion: medVia.trim() || null,
            indicaciones: medIndicaciones.trim() || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setMeds([data, ...meds]);
      setMedName("");
      setMedDesc("");
      setMedDosis("");
      setMedVia("");
      setMedIndicaciones("");

      toast({
        title: "Medicamento agregado",
        description: `${data.nombre} fue agregado exitosamente`,
      });
    } catch (error: any) {
      toast({
        title: "Error al agregar medicamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteMed = async (id: string) => {
    if (!confirm("¿Eliminar este medicamento?")) return;

    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("medicamentos").delete().eq("id", id);

      if (error) throw error;

      setMeds(meds.filter((m) => m.id !== id));

      toast({
        title: "Medicamento eliminado",
        description: "El medicamento fue eliminado exitosamente",
      });
    } catch (error: any) {
      toast({
        title: "Error al eliminar",
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

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">
          Catálogo de Medicamentos
        </h1>
        <Button onClick={loadData} variant="outline" size="sm">
          🔄 Recargar
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* CATEGORÍAS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nueva Categoría
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nombre *</label>
              <input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Ej: Analgésicos"
                className="h-10 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Descripción</label>
              <textarea
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Descripción opcional"
                rows={2}
                className="rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <Button onClick={addCategory} disabled={!catName.trim()}>
              Agregar Categoría
            </Button>

            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">
                Categorías ({categories.length})
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-md border bg-accent/50"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{c.nombre}</p>
                      {c.descripcion && (
                        <p className="text-xs text-muted-foreground">
                          {c.descripcion}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {meds.filter((m) => m.categoria_id === c.id).length}{" "}
                        medicamento(s)
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCategory(c.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay categorías aún
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MEDICAMENTOS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nuevo Medicamento
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Categoría *</label>
              <select
                value={medCatId}
                onChange={(e) => setMedCatId(e.target.value)}
                className="h-10 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">Selecciona categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Nombre *</label>
              <input
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                placeholder="Ej: Paracetamol 500mg"
                className="h-10 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Descripción</label>
              <input
                value={medDesc}
                onChange={(e) => setMedDesc(e.target.value)}
                placeholder="Breve descripción"
                className="h-10 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Dosis Recomendada</label>
              <input
                value={medDosis}
                onChange={(e) => setMedDosis(e.target.value)}
                placeholder="Ej: 1 tableta cada 8 horas"
                className="h-10 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Vía de Administración</label>
              <select
                value={medVia}
                onChange={(e) => setMedVia(e.target.value)}
                className="h-10 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">Selecciona</option>
                <option value="Oral">Oral</option>
                <option value="Sublingual">Sublingual</option>
                <option value="Intravenosa">Intravenosa</option>
                <option value="Intramuscular">Intramuscular</option>
                <option value="Subcutánea">Subcutánea</option>
                <option value="Tópica">Tópica</option>
                <option value="Inhalatoria">Inhalatoria</option>
                <option value="Oftálmica">Oftálmica</option>
                <option value="Ótica">Ótica</option>
                <option value="Rectal">Rectal</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Indicaciones</label>
              <textarea
                value={medIndicaciones}
                onChange={(e) => setMedIndicaciones(e.target.value)}
                placeholder="Para qué se usa este medicamento"
                rows={2}
                className="rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <Button onClick={addMed} disabled={!medCatId || !medName.trim()}>
              Agregar Medicamento
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE MEDICAMENTOS POR CATEGORÍA */}
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">
          Medicamentos por Categoría ({meds.length} total)
        </h2>
        {categories.map((cat) => {
          const catMeds = meds.filter((m) => m.categoria_id === cat.id);
          if (catMeds.length === 0) return null;

          return (
            <Card key={cat.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {cat.nombre} ({catMeds.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {catMeds.map((med) => (
                    <div
                      key={med.id}
                      className="flex items-start justify-between p-3 rounded-md border bg-accent/30"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{med.nombre}</p>
                        {med.descripcion && (
                          <p className="text-sm text-muted-foreground">
                            {med.descripcion}
                          </p>
                        )}
                        {med.dosis_recomendada && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Dosis:</strong> {med.dosis_recomendada}
                          </p>
                        )}
                        {med.via_administracion && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Vía:</strong> {med.via_administracion}
                          </p>
                        )}
                        {med.indicaciones && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Indicaciones:</strong> {med.indicaciones}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMed(med.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {meds.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay medicamentos registrados aún
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
