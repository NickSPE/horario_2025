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
              // Usuario autenticado - mostrar perfil y logout
              <>
                {null}
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

      <footer className="border-t bg-muted/30">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
            {/* Columna 1: Acerca de */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Horario Médico</h3>
              <p className="text-sm text-muted-foreground">
                Tu asistente personal para nunca olvidar tomar tus medicamentos.
              </p>
            </div>

            {/* Columna 2: Producto */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Producto</h3>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link to="/funciones" className="hover:text-foreground transition-colors">
                  Funciones
                </Link>
                <Link to="/como-funciona" className="hover:text-foreground transition-colors">
                  Cómo funciona
                </Link>
              </div>
            </div>

            {/* Columna 3: Legal */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Legal</h3>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link to="/terminos" className="hover:text-foreground transition-colors">
                  Términos y condiciones
                </Link>
                <Link to="/privacidad" className="hover:text-foreground transition-colors">
                  Política de privacidad
                </Link>
              </div>
            </div>

            {/* Columna 4: Soporte */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Soporte</h3>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link to="/contacto" className="hover:text-foreground transition-colors">
                  Contacto
                </Link>
                <a href="mailto:hola@horariomedico.com" className="hover:text-foreground transition-colors">
                  hola@horariomedico.com
                </a>
              </div>
            </div>
          </div>

          {/* Línea divisoria */}
          <div className="border-t pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>
                © {new Date().getFullYear()} Horario Médico. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-4">
                <Link to="/terminos" className="hover:text-foreground transition-colors">
                  Términos
                </Link>
                <Link to="/privacidad" className="hover:text-foreground transition-colors">
                  Privacidad
                </Link>
                <Link to="/contacto" className="hover:text-foreground transition-colors">
                  Contacto
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
