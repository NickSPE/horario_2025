import { Badge } from "@/components/ui/badge";

interface CategoryChipsProps {
  categorias: readonly string[];
  activa: string;
  onChange: (categoria: string) => void;
}

export default function CategoryChips({ categorias, activa, onChange }: CategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categorias.map((cat) => (
        <Badge
          key={cat}
          variant={activa === cat ? "default" : "secondary"}
          className={`
            cursor-pointer px-4 py-2 text-sm font-medium transition-all
            ${activa === cat 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }
          `}
          onClick={() => onChange(cat)}
        >
          {cat}
        </Badge>
      ))}
    </div>
  );
}
