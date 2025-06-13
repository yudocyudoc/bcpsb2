// src/components/app/NavUser.tsx
"use client"; // Necesario si usas hooks de React como useAuth o useSidebar

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar, // Hook para saber si es mobile (para la posición del dropdown)
} from "@/components/ui/sidebar";
import { ChevronsUpDown, LogOut } from "lucide-react"; // Iconos
import { Skeleton } from '@/components/ui/skeleton';
import { userNavFooterItems } from '@/config/navigation'; // Importar items del footer

export function NavUser() {
  const { profile, signOut, isLoading: authIsLoading } = useAuth();
  const { isMobile } = useSidebar(); // Para la posición del DropdownMenu
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth'); // Redirigir a la página de login después del logout
  };

  if (authIsLoading && !profile) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-wait">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="grid flex-1 text-left text-sm leading-tight gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!profile) { // Si después de cargar no hay perfil (no debería pasar si está logueado)
    return null; // O un botón de "Iniciar Sesión" si tiene sentido aquí
  }

  const getInitials = (name?: string | null): string => {
    if (!name) return "U";
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name || profile.username || "Avatar"} />}
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                  {getInitials(profile.full_name || profile.username)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {profile.full_name || profile.username || "Usuario"}
                </span>
                {profile.email && <span className="truncate text-xs text-muted-foreground">{profile.email}</span>}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={isMobile ? 8 : 4} // Un poco más de offset en mobile
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm"> {/* Ajustado padding */}
                <Avatar className="h-8 w-8 rounded-lg">
                   {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name || profile.username || "Avatar"} />}
                   <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                     {getInitials(profile.full_name || profile.username)}
                   </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {profile.full_name || profile.username || "Usuario"}
                  </span>
                  {profile.email && <span className="truncate text-xs text-muted-foreground">{profile.email}</span>}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {userNavFooterItems.map((item) => (
                 <DropdownMenuItem key={item.title} asChild className="cursor-pointer">
                   <Link to={item.href} className="flex items-center w-full">
                     {item.icon && <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                     {item.title}
                   </Link>
                 </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}