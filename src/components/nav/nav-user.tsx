// src/components/nav/NavUser.tsx
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Tu AuthContext de Supabase

export function NavUser() {
  const { user, profile, signOut: supabaseSignOut, role } = useAuth();

  const handleLogout = async () => {
    await supabaseSignOut();
    // La redirección la manejará el router/AuthContext
  };

  if (!user) return null;

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const displayName = profile?.full_name || profile?.username || user.email || '';
  const userInitials = displayName ? getInitials(displayName) : 'U';

  return (
    <div className="p-4 border-t dark:border-slate-700 space-y-2">
      <div className="flex items-center gap-3 group-[[data-sidebar-variant=icon]]:justify-center">
        <Avatar className="h-9 w-9 group-[[data-sidebar-variant=icon]]:h-10 group-[[data-sidebar-variant=icon]]:w-10">
          <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight group-[[data-sidebar-variant=icon]]:hidden">
          <span className="truncate font-semibold text-foreground dark:text-slate-200">{displayName}</span>
          <span className="truncate text-xs text-muted-foreground dark:text-slate-400">{role ? `Rol: ${role}` : user.email}</span>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start text-muted-foreground hover:text-destructive group-[[data-sidebar-variant=icon]]:justify-center group-[[data-sidebar-variant=icon]]:px-0 group-[[data-sidebar-variant=icon]]:size-9">
        <LogOut className="mr-2 h-4 w-4 group-[[data-sidebar-variant=icon]]:mr-0 group-[[data-sidebar-variant=icon]]:h-5 group-[[data-sidebar-variant=icon]]:w-5" />
        <span className="group-[[data-sidebar-variant=icon]]:hidden">Cerrar Sesión</span>
      </Button>
    </div>
  );
}