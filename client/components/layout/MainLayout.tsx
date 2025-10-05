import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
    isActive
      ? "text-primary bg-primary/10"
      : "text-muted-foreground hover:text-foreground hover:bg-accent",
  );


export default function MainLayout() {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };
  const title = "Recordatorio Médico";



  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/90 text-primary-foreground grid place-items-center font-bold">
              <span>
                <img src="/favicon.ico" alt="Logo de Recordatorio Médico" />
              </span>
            </div>
            <span className="text-lg font-bold tracking-tight">
              {title}
            </span>
          </Link>
          {
            isAuthenticated && user ? (
              <nav className="hidden md:flex items-center gap-1">
                Bienvenidos al dashboard {user.user_metadata?.role === 'profesional' ? 'profesional' : 'paciente'}
              </nav>
            ) : (

              <nav className="hidden md:flex items-center gap-1">
                <NavLink to="/" className={navLinkClass} end>
                  Inicio
                </NavLink>
                <NavLink to="/funciones" className={navLinkClass}>
                  Funciones
                </NavLink>
                <NavLink to="/como-funciona" className={navLinkClass}>
                  Cómo funciona
                </NavLink>
                <NavLink to="/contacto" className={navLinkClass}>
                  Contacto
                </NavLink>
              </nav>
            )
          }

          {/* Renderizado condicional basado en autenticación */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              // Usuario autenticado - Botón cerrar sesión SOLO en móvil
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="md:hidden gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-xs">Salir</span>
              </Button>
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

      {isAuthenticated ? null : (


        < footer className="border-t bg-muted/20">
          <div className="container py-4 md:py-6">


            < div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6 text-xs text-muted-foreground">
              {/* Copyright */}
              <p className="text-center md:text-left">
                © {new Date().getFullYear()} {title}
              </p>


              {/* Links de navegación */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4">
                <Link to="/funciones" className="hover:text-foreground transition-colors">
                  Funciones
                </Link>
                <span className="text-muted-foreground/40">•</span>
                <Link to="/como-funciona" className="hover:text-foreground transition-colors">
                  Cómo funciona
                </Link>
                <span className="text-muted-foreground/40">•</span>
                <Link to="/terminos" className="hover:text-foreground transition-colors">
                  Términos
                </Link>
                <span className="text-muted-foreground/40">•</span>
                <Link to="/privacidad" className="hover:text-foreground transition-colors">
                  Privacidad
                </Link>
                <span className="text-muted-foreground/40">•</span>
                <Link to="/contacto" className="hover:text-foreground transition-colors">
                  Contacto

                </Link>
              </div>
            </div>
          </div>
        </footer>
      )
      }


    </div >
  );
}
