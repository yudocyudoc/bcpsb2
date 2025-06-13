// src/components/app/AppSidebar.tsx
"use client";

import React from "react";
import { Link } from 'react-router-dom'; // Para el logo
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { NavMain } from "./NavMain"; // Ajusta la ruta
import { NavUser } from "./NavUser"; // Ajusta la ruta
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail, // Si quieres la barra lateral de iconos cuando está colapsado
} from "@/components/ui/sidebar";
import { getNavItemsForRole, type AppRole } from '@/config/navigation'; // Importa tu función y tipo
import { Icons } from '@/components/ui/icons'; // Asumiendo que tienes tu logo aquí
// import { TeamSwitcher } from "./TeamSwitcher"; // Comentado/Eliminado

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const { profile } = useAuth(); // Obtener el rol del usuario
  const userRole = profile?.role as AppRole | undefined; // Castear a tu tipo AppRole

  // Obtener los items de navegación basados en el rol
  const navItemsToDisplay = getNavItemsForRole(userRole);

  return (
    // `collapsible="icon"` es una de las opciones de la documentación
    // También puede ser "offcanvas" (para móviles) o "none"
    // El bloque "sidebar-07" lo usa así.
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-2"> {/* Añadido padding al header */}
        <Link to="/" className="flex items-center gap-2 px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
        <Icons.Logo className="h-7 w-7 text-pink-800/50" />
          <span className={cn(
            "font-semibold text-lg",
            "group-data-[collapsible=icon]:sr-only" // Reacciona al 'data-collapsible' del 'group' padre (Sidebar)
          )}>
            BCP 
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain navItems={navItemsToDisplay} />
        {/* <NavProjects projects={data.projects} /> Si no usas "Projects", elimínalo */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      
       <SidebarRail />
    </Sidebar>
  );
}