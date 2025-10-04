import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  Clock,
  FileText,
  Home,
  LogOut,
  Menu,
  Pill,
  User
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const link = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all hover:scale-[1.02]",
    "min-h-[52px]", // Botones más altos para adultos mayores
    isActive
      ? "bg-primary text-primary-foreground shadow-md"
      : "text-foreground hover:bg-accent",
  );

const menuItems = [
  { to: ".", label: "Inicio", icon: Home, end: true },
  { to: "recetas", label: "Recetas", icon: FileText },
  { to: "medicamentos", label: "Medicamentos", icon: Pill },
  { to: "asignar", label: "Horarios", icon: Clock },
  { to: "perfil", label: "Perfil", icon: User },
];

function NavigationContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const userName = user?.user_metadata?.nombre || user?.email?.split("@")[0] || "Usuario";
  const userLicense = user?.user_metadata?.licencia;

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
        <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-primary">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold truncate">{userName}</p>
          <p className="text-sm text-muted-foreground font-medium">Profesional</p>
          {userLicense && (
            <p className="text-xs text-muted-foreground font-medium">Lic: {userLicense}</p>
          )}
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
              onClick={onNavigate}
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
  );
}

export default function ProfesionalLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header with Menu Button */}
      <div className="md:hidden sticky top-0 z-40 bg-background border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold">Panel Profesional</h1>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg" className="gap-2">
                <Menu className="h-6 w-6" />
                <span className="text-base">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-6">
              <NavigationContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block md:col-span-4 lg:col-span-3">
            <div className="sticky top-24">
              <NavigationContent />
            </div>
          </aside>

          {/* Main Content */}
          <section className="col-span-12 md:col-span-8 lg:col-span-9">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}
