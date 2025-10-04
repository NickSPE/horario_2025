import { useAuth } from "@/hooks/use-auth";

export default function ProfesionalPerfil() {


  const { user } = useAuth();
  const { email, phone, created_at, role, last_sign_in_at } = user || {};
  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Perfil</h2>
      <div className="rounded-md border p-4">
        <p className="font-medium">{email || 'Email no especificado'}</p>
        <p className="text-sm text-muted-foreground">
          {user?.phone || 'Especialidad no especificada'}
        </p>
      </div>
    </div>
  );
}
