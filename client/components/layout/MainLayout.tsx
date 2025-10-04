import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Link, NavLink, Outlet } from "react-router-dom";
// Importa tu hook de autenticación aquí
// import { useAuth } from "@/hooks/useAuth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
    isActive
      ? "text-primary bg-primary/10"
      : "text-muted-foreground hover:text-foreground hover:bg-accent",
  );

export default function MainLayout() {
  // Descomenta y ajusta según tu implementación de autenticación
  const { isAuthenticated, user, signOut } = useAuth();

  // Temporalmente para testing - reemplaza con tu lógica real

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/90 text-primary-foreground grid place-items-center font-bold">
              HM
            </div>
            <span className="text-lg font-bold tracking-tight">
              Horario Médico
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass} end>
              Inicio
            </NavLink>
            <a
              href="/#funciones"
              className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              Funciones
            </a>
            <a
              href="/#como-funciona"
              className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              Cómo funciona
            </a>
          </nav>

          {/* Renderizado condicional basado en autenticación */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              // Usuario autenticado - mostrar perfil y logout
              <>
                <Button asChild variant="ghost">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/perfil">Mi Perfil</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // logout(); // Implementa tu función de logout
                    console.log("Cerrar sesión");
                  }}
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              // Usuario no autenticado - mostrar login y registro
              <>
                <Button asChild variant="ghost">
                  <Link to="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild>
                  <Link to="/registro">Registrarse</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Horario Médico. Todos los derechos
            reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="#privacidad" className="hover:text-foreground">
              Privacidad
            </a>
            <a href="#terminos" className="hover:text-foreground">
              Términos
            </a>
            <a href="#contacto" className="hover:text-foreground">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
