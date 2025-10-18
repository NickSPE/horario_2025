import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import {
  Bell,
  Calendar,
  Home,
  LogOut,
  Moon,
  Pill,
  Sun,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const link = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all hover:scale-[1.02]",
    "min-h-[52px]",
    isActive
      ? "bg-primary text-primary-foreground shadow-md"
      : "text-foreground hover:bg-accent",
  );

const menuItems = [
  { to: ".", label: "Inicio", icon: Home, end: true },
  { to: "medicamentos", label: "Medicamentos", icon: Pill },
  { to: "recordatorios", label: "Recordatorios", icon: Bell },
  { to: "citas", label: "Citas", icon: Calendar },
  { to: "perfil", label: "Perfil", icon: User },
];

export default function PacienteLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  // Cargar preferencia de modo oscuro
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userName = user?.user_metadata?.nombre || user?.email?.split("@")[0] || "Usuario";

  return (
    <div className="min-h-screen flex">
      {/* Sidebar SOLO en Desktop - De borde a borde FIJO */}
      <aside className="hidden md:flex md:w-72 lg:w-80 border-r bg-muted/30 dark:bg-muted/10 fixed h-screen">
        <div className="flex flex-col h-screen w-full relative">
          {/* Contenido superior que hace scroll si es necesario */}
          <div className="flex-1 px-6 py-8 space-y-6 overflow-y-auto pb-24">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-card rounded-lg border shadow-sm">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-2xl font-bold text-primary-foreground">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold truncate">{userName}</p>
                <p className="text-sm text-muted-foreground font-medium">Paciente</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="grid gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={link}
                  >
                    <Icon className="h-6 w-6 flex-shrink-0" />
                    <span className="text-base">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Bottom Actions - pegado al fondo (sticky dentro del scroll container) */}
            <div className="sticky bottom-0 border-t p-6 space-y-3 bg-muted/30 dark:bg-muted/10">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="lg"
                onClick={toggleDarkMode}
                className="w-full justify-start gap-3 min-h-[52px] text-base font-medium"
              >
                {darkMode ? (
                  <Sun className="h-6 w-6" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
                <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </Button>

              {/* Logout Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start gap-3 min-h-[52px] text-base font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                  >
                    <LogOut className="h-6 w-6" />
                    Cerrar sesión
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Estás seguro que deseas cerrar tu sesión? Tendrás que iniciar sesión nuevamente para acceder a tu cuenta.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSignOut} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Sí, cerrar sesión
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

          </div>
        </div>
      </aside>

      {/* Main Content - Full width en móvil, con margin-left en desktop para compensar sidebar fijo */}
      <main className="flex-1 overflow-auto md:ml-72 lg:ml-80">
        <div className="container py-6 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
