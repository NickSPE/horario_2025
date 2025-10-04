import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getSupabase } from "@/lib/supabase";
import { UserMetadata } from "@supabase/supabase-js";
import {
  Award,
  Calendar,
  Clock,
  Edit3,
  Mail,
  Phone,
  Save,
  Stethoscope,
  User,
  X
} from "lucide-react";
import { useEffect, useState } from "react";

interface ProfesionalData {
  id?: string;
  nombre?: UserMetadata["nombre"];
  apellido?: string;
  email?: string;
  telefono?: string;
  especialidad?: string;
  licencia?: string;
  direccion?: string;
  bio?: string;
  activo?: boolean;
}

export default function ProfesionalPerfil() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profesionalData, setProfesionalData] = useState<ProfesionalData>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfesionalData>({});

  // Cargar datos del profesional
  useEffect(() => {
    if (user?.id) {
      fetchProfesionalData();
    }
  }, [user]);

  const fetchProfesionalData = async () => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('profesionales')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profesional data:', error);
        // Si no existe, usar datos básicos del user
        setProfesionalData({
          email: user?.email,
          telefono: user?.phone,
        });
      } else {
        setProfesionalData(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const supabase = getSupabase();

      // Preparar datos para guardar
      const dataToSave = {
        ...editForm,
        user_id: user?.id,
        email: user?.email, // Mantener email del auth
      };

      // Verificar si ya existe el profesional
      const { data: existing } = await supabase
        .from('profesionales')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      let result;
      if (existing) {
        // Actualizar
        result = await supabase
          .from('profesionales')
          .update(dataToSave)
          .eq('user_id', user?.id);
      } else {
        // Insertar
        result = await supabase
          .from('profesionales')
          .insert(dataToSave);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente.",
      });

      await fetchProfesionalData();
      setEditing(false);
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      });
    }
  };

  const startEditing = () => {
    setEditForm({
      ...profesionalData,
      email: user?.email,
    });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditForm({});
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = () => {
    const nombre = profesionalData.nombre || '';
    const apellido = profesionalData.apellido || '';
    if (nombre && apellido) {
      return (nombre[0] + apellido[0]).toUpperCase();
    }
    return (user?.email?.[0] || 'P').toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">
            Gestiona tu información profesional y preferencias
          </p>
        </div>
        <Dialog open={editing} onOpenChange={setEditing}>
          <DialogTrigger asChild>
            <Button onClick={startEditing} className="gap-2">
              <Edit3 className="h-4 w-4" />
              Editar Perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Perfil Profesional</DialogTitle>
              <DialogDescription>
                Actualiza tu información profesional. Los cambios se reflejarán en tu perfil público.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={editForm.nombre || ''}
                    onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={editForm.apellido || ''}
                    onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                    placeholder="Tu apellido"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  El email no se puede cambiar desde aquí
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={editForm.telefono || ''}
                    onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="especialidad">Especialidad</Label>
                  <Input
                    id="especialidad"
                    value={editForm.especialidad || ''}
                    onChange={(e) => setEditForm({ ...editForm, especialidad: e.target.value })}
                    placeholder="Ej: Medicina General"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="licencia">Número de Licencia</Label>
                <Input
                  id="licencia"
                  value={editForm.licencia || ''}
                  onChange={(e) => setEditForm({ ...editForm, licencia: e.target.value })}
                  placeholder="Número de licencia profesional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biografía Profesional</Label>
                <Textarea
                  id="bio"
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Describe tu experiencia y especialización..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={cancelEditing}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tarjeta principal del perfil */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" alt="Foto de perfil" />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">
                  {profesionalData.nombre && profesionalData.apellido
                    ? `${profesionalData.nombre} ${profesionalData.apellido}`
                    : 'Nombre no especificado'
                  }
                </CardTitle>
                {profesionalData.activo !== false && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Activo
                  </Badge>
                )}
              </div>
              <CardDescription className="text-base">
                {profesionalData.especialidad || 'Especialidad no especificada'}
              </CardDescription>
              {profesionalData.bio && (
                <p className="text-sm text-muted-foreground mt-2">
                  {profesionalData.bio}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información de contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Información de Contacto
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.email || 'No especificado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">
                    {profesionalData.telefono || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información profesional */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Información Profesional
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Award className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Licencia Profesional</p>
                  <p className="text-sm text-muted-foreground">
                    {profesionalData.licencia || 'No especificada'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Especialidad</p>
                  <p className="text-sm text-muted-foreground">
                    {profesionalData.especialidad || 'No especificada'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información de la cuenta */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información de la Cuenta
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fecha de Registro</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user?.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Último Acceso</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user?.last_sign_in_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarjetas adicionales */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estadísticas</CardTitle>
            <CardDescription>Tu actividad en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Pacientes totales</span>
                <span className="text-sm font-medium">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Recordatorios activos</span>
                <span className="text-sm font-medium">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Consultas este mes</span>
                <span className="text-sm font-medium">-</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuración</CardTitle>
            <CardDescription>Ajustes de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Cambiar contraseña
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Configurar notificaciones
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Preferencias de la aplicación
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
