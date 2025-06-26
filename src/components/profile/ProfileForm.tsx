// src/components/profile/ProfileForm.tsx
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/services/profileService"; // <-- Importamos nuestro nuevo servicio
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner"; // Usaremos toasts para notificar al usuario

export function ProfileForm() {
  const { user, profile, setProfile } = useAuth(); // <-- Obtenemos setProfile para actualizar el estado global

  // Estados locales para manejar los inputs del formulario
  const [fullName, setFullName] = useState(profile?.full_name || profile?.username || "");
  const [showIllustrations, setShowIllustrations] = useState(profile?.show_illustrations ?? true);
  const [isSaving, setIsSaving] = useState(false);

  // Función para manejar el guardado del formulario de información personal
  const handleUpdateInfo = useCallback(async (event: React.FormEvent) => {
    event.preventDefault(); // Prevenir recarga de la página
    if (!user?.id) return;

    setIsSaving(true);
    const toastId = toast.loading("Guardando cambios...");

    try {
      const updatedProfile = await updateUserProfile(user.id, { full_name: fullName });
      setProfile(updatedProfile); // Actualizamos el estado global para que toda la app vea el nuevo nombre
      toast.success("Perfil actualizado con éxito", { id: toastId });
    } catch (error) {
      toast.error("Error al guardar los cambios", { id: toastId, description: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  }, [user, fullName, setProfile]);

  // Función para manejar el cambio del interruptor de ilustraciones
  const handleToggleIllustrations = useCallback(async (checked: boolean) => {
    if (!user?.id) return;
    
    // Actualizamos el estado local inmediatamente para una respuesta visual rápida
    setShowIllustrations(checked);

    try {
      const updatedProfile = await updateUserProfile(user.id, { show_illustrations: checked });
      setProfile(updatedProfile); // Actualizamos el estado global
      toast.success("Preferencia guardada");
    } catch (error) {
      toast.error("No se pudo guardar la preferencia");
      // Revertimos el cambio si falla la actualización
      setShowIllustrations(!checked); 
    }
  }, [user, setProfile]);

  if (!user || !profile) return null;
  
  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="settings">Preferencias</TabsTrigger>
      </TabsList>

      {/* Pestaña de Información Personal */}
      <TabsContent value="personal">
        <form onSubmit={handleUpdateInfo}>
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualiza cómo te llamas en la aplicación. Esta información es privada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="fullName">Nombre / Apodo</Label>
                <Input 
                  id="fullName" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email} disabled autoComplete="email" />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </TabsContent>

      {/* Pestaña de Preferencias */}
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Preferencias de la Experiencia</CardTitle>
            <CardDescription>
              Personaliza cómo se siente la aplicación para ti.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="show-illustrations" className="text-base">
                  Mostrar ilustraciones de bienvenida
                </Label>
                <p className="text-sm text-muted-foreground">
                  Activa o desactiva las ilustraciones en la página de inicio.
                </p>
              </div>
              <Switch
                id="show-illustrations"
                checked={showIllustrations}
                onCheckedChange={handleToggleIllustrations}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}