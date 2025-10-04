import { useAuth } from "@/hooks/use-auth";


export default function PacientePerfil() {


  const { user } = useAuth()

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Perfil</h2>
      <div className="rounded-md border p-4">
        <h3 className="text-lg font-medium mb-2">Información del Paciente</h3>
        <p className="font-medium">{user.app_metadata.provider}</p>
        <p className="font-medium">{user.email}</p>
      </div>
    </div>
  );
}
