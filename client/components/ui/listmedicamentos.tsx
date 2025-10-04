import { Button } from "@/components/ui/button";
import type { CategoriaMedicamento, Medicamento } from "@shared/medicamentos";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export function ListMedicamentos({
    categories,
    meds,
    deleteMed,
}: {
    categories: CategoriaMedicamento[];
    meds: Medicamento[];
    deleteMed: (id: string) => void;
}) {
    const [selectedCategory, setSelectedCategory] = useState<string>(
        categories.length > 0 ? categories[0].id : ""
    );
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 3; // medicamentos por página

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1); // reiniciar paginación al cambiar categoría
    };

    const filteredMeds = meds.filter((m) => m.categoria_id === selectedCategory);
    const totalPages = Math.ceil(filteredMeds.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedMeds = filteredMeds.slice(startIndex, startIndex + pageSize);
    const currentCategory = categories.find((cat) => cat.id === selectedCategory);

    return (
        <div className="grid gap-4">
            <h2 className="text-xl font-semibold">
                Medicamentos por Categoría ({meds.length} total)
            </h2>

            {/* SELECTOR DE CATEGORÍA */}
            <div className="flex items-center gap-2">
                <label htmlFor="categorySelect" className="text-sm font-medium">
                    Categoría:
                </label>
                <select
                    id="categorySelect"
                    className="border rounded-md px-2 py-1 bg-background"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                >
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {currentCategory ? (
                <Card key={currentCategory.id}>
                    <CardHeader>
                        <CardTitle className="text-lg flex justify-between items-center">
                            <span>
                                {currentCategory.nombre} ({filteredMeds.length})
                            </span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="grid gap-2">
                            {paginatedMeds.map((med) => (
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

                        {/* PAGINACIÓN */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-5 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    ←
                                </Button>

                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNumber = i + 1;
                                    const isActive = pageNumber === currentPage;
                                    return (
                                        <Button
                                            key={pageNumber}
                                            variant={isActive ? "default" : "outline"}
                                            size="sm"
                                            className={isActive ? "font-bold" : ""}
                                            onClick={() => setCurrentPage(pageNumber)}
                                        >
                                            {pageNumber}
                                        </Button>
                                    );
                                })}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    →
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        No hay categorías disponibles.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
