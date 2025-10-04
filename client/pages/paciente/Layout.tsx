import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LogOut, 
  Home, 
  FileText, 
  Pill, 
  Bell, 
  Calendar, 
  MessageSquare, 
  User 
} from 'lucide-react';

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
  { to: "recetas", label: "Recetas", icon: FileText },
  { to: "medicamentos", label: "Medicamentos", icon: Pill },
  { to: "recordatorios", label: "Recordatorios", icon: Bell },
  { to: "citas", label: "Citas", icon: Calendar },
  { to: "mensajes", label: "Mensajes", icon: MessageSquare },
  { to: "perfil", label: "Perfil", icon: User },
];

export default function PacienteLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userName = user?.user_metadata?.nombre || user?.email?.split("@")[0] || "Usuario";

  return (
    <div className="container py-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar SOLO en Desktop */}
        <aside className="hidden md:block md:col-span-4 lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
              <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-primary">
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

            {/* Logout Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={handleSignOut}
              className="w-full justify-start gap-3 min-h-[52px] text-base font-medium"
            >
              <LogOut className="h-6 w-6" />
              Cerrar sesión
            </Button>
          </div>
        </aside>

        {/* Main Content - Full width en móvil, compartido en desktop */}
        <section className="col-span-12 md:col-span-8 lg:col-span-9">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
