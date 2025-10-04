import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Medicamento } from "@/lib/medicamentos";

interface MedicineCardProps {
  med: Medicamento;
}

export default function MedicineCard({ med }: MedicineCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <img 
            src={med.imagen} 
            alt={med.nombre}
            className="w-full h-full object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{med.nombre}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {med.descripcion}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full bg-primary hover:bg-primary/90"
          size="default"
        >
          Ver detalles
        </Button>
      </CardFooter>
    </Card>
  );
}
