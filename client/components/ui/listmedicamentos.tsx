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
    // Estado de página por categoría
    const [pageByCategory, setPageByCategory] = useState<Record<string, number>>({});
    const pageSize = 3; // medicamentos por página

    const handlePageChange = (catId: string, newPage: number) => {
        setPageByCategory((prev) => ({ ...prev, [catId]: newPage }));
    };

    return (
        <div className="grid gap-4">
            <h2 className="text-xl font-semibold">
                Medicamentos por Categoría ({meds.length} total)
            </h2>

            {categories.map((cat) => {
                const catMeds = meds.filter((m) => m.categoria_id === cat.id);
                if (catMeds.length === 0) return null;

                const currentPage = pageByCategory[cat.id] || 1;
                const totalPages = Math.ceil(catMeds.length / pageSize);
                const startIndex = (currentPage - 1) * pageSize;
                const paginatedMeds = catMeds.slice(startIndex, startIndex + pageSize);

                return (
                    <Card key={cat.id}>
                        <CardHeader>
                            <CardTitle className="text-lg flex justify-between items-center">
                                <span>
                                    {cat.nombre} ({catMeds.length})
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

                            {/* PAGINACIÓN VISUAL */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center mt-5 gap-2">
                                    {/* Botón anterior */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(cat.id, currentPage - 1)}
                                    >
                                        ←
                                    </Button>

                                    {/* Números de página */}
                                    {[...Array(totalPages)].map((_, i) => {
                                        const pageNumber = i + 1;
                                        const isActive = pageNumber === currentPage;
                                        return (
                                            <Button
                                                key={pageNumber}
                                                variant={isActive ? "default" : "outline"}
                                                size="sm"
                                                className={isActive ? "font-bold" : ""}
                                                onClick={() => handlePageChange(cat.id, pageNumber)}
                                            >
                                                {pageNumber}
                                            </Button>
                                        );
                                    })}

                                    {/* Botón siguiente */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(cat.id, currentPage + 1)}
                                    >
                                        →
                                    </Button>
                                </div>
                            )}
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
    );
}
