import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "paciente" | "profesional";
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar rol si es requerido
  if (requiredRole) {
    const userRole = user.user_metadata?.role;
    if (userRole !== requiredRole) {
      // Redirigir al dashboard correcto según su rol
      return (
        <Navigate
          to={`/dashboard/${userRole || "paciente"}`}
          replace
        />
      );
    }
  }

  return <>{children}</>;
}
