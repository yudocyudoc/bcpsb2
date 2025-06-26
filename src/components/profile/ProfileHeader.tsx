// src/components/profile/ProfileHeader.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ProfileHeader() {
  const { user, profile } = useAuth();

  // No renderizar nada si los datos aún no están listos
  if (!user || !profile) return null;

  const initials = (profile.full_name || profile.username || user.email?.[0] || 'U').substring(0, 2).toUpperCase();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || 'Avatar'} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <Button disabled>Guardar Cambios</Button>
        </div>
      </CardContent>
    </Card>
  );
}