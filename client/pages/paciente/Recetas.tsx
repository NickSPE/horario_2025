export default function PacienteRecetas() {
  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Mis Recetas</h2>
      <ul className="rounded-md border divide-y">
        <li className="p-3">
          <p className="font-medium">Amoxicilina 500mg</p>
          <p className="text-sm text-muted-foreground">
            1 cápsula cada 8h por 7 días
          </p>
        </li>
        <li className="p-3">
          <p className="font-medium">Ibuprofeno 200mg</p>
          <p className="text-sm text-muted-foreground">
            1 tableta cada 6h si dolor
          </p>
        </li>
      </ul>
    </div>
  );
}
