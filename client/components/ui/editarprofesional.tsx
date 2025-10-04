import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import {
    Edit3Icon,
    Save,
    X
} from "lucide-react";
import { useState } from "react";
import { DialogFooter, DialogHeader } from "./dialog";
import { Input } from "./input";
import { Textarea } from "./textarea";


export function EditarProfesional({ user, onSave }: { user: any, onSave: (data: any) => void }) {

    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        nombre: user?.user_metadata?.nombre || '',
        apellido: user?.user_metadata?.apellido || '',
        telefono: user?.user_metadata?.telefono || '',
        especialidad: user?.user_metadata?.especialidad || '',
        licencia: user?.user_metadata?.licencia || '',
        bio: user?.user_metadata?.bio || '',
    });

    const startEditing = () => {
        setEditing(true);
    }
    const cancelEditing = () => {
        setEditing(false);
        // Reset form to original user data
        setEditForm({
            nombre: user?.user_metadata?.nombre || '',
            apellido: user?.user_metadata?.apellido || '',
            telefono: user?.user_metadata?.telefono || '',
            especialidad: user?.user_metadata?.especialidad || '',
            licencia: user?.user_metadata?.licencia || '',
            bio: user?.user_metadata?.bio || '',
        });
    }

    const handleSave = () => {
        onSave(editForm);
        setEditing(false);
    }


    return (
        <Dialog open={editing} onOpenChange={setEditing}>
            <DialogTrigger asChild>
                <Button onClick={startEditing} className="gap-2">
                    <Edit3Icon className="h-4 w-4" />
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
    )
}