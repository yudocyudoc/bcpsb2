// src/components/app/NavMain.tsx
"use client";

import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel, // Asegúrate que este componente exista en tu ui/sidebar.tsx o impórtalo si es de Shadcn.
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { NavItem } from '@/config/navigation'; // Importa tu tipo NavItem
import { cn } from '@/lib/utils';

interface NavMainProps {
  navItems: NavItem[]; // Array de grupos de navegación
}

export function NavMain({ navItems }: NavMainProps) {
  const location = useLocation();

  const isActive = (href?: string) => {
    if (!href) return false;
    // Para la ruta raíz, isActive si location.pathname es exactamente '/'
    // Para otras rutas, isActive si location.pathname comienza con href
    return href === '/' ? location.pathname === href : location.pathname.startsWith(href);
  };

  return (
    <>
      {navItems.map((group, groupIndex) => (
        group.separator ? (
          <div key={`separator-${groupIndex}`} className="my-3 h-px bg-sidebar-border" />
        ) : (
        <SidebarGroup key={group.label || `group-${groupIndex}`}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarMenu>
          {group.children?.map((item) => (
            <SidebarMenuItem
              key={item.title}
              // Aplicar estilo activo al MenuItem si es un enlace directo (sin hijos) y está activo
              className={cn(
                isActive(item.href) &&
                  (!item.children || item.children.length === 0) &&
                  "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              {item.children && item.children.length > 0 ? (
                // Caso 1: El item tiene hijos, renderizar Collapsible dentro del MenuItem
                <Collapsible
                  // No necesita key aquí, SidebarMenuItem ya la tiene.
                  // No usar asChild aquí, Collapsible renderizará su propio div.
                  defaultOpen={
                    isActive(item.href) ||
                    item.children?.some((child) => isActive(child.href))
                  }
                  className="group/collapsible w-full" // w-full para que ocupe el espacio del li
                >
                  <CollapsibleTrigger asChild>
                  
                      <SidebarMenuButton
                        className={cn(isActive(item.href) && "font-semibold")} // Solo resaltar si la ruta base del grupo está activa
                        tooltip={item.title}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                        {item.children && item.children.length > 0 && (
                         <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </SidebarMenuButton>
                    
                  
                  </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map((subItem) => (
                          <SidebarMenuSubItem
                          key={subItem.title}
                          className={cn(isActive(subItem.href) && "bg-sidebar-accent text-sidebar-accent-foreground")}
                        >
                         <SidebarMenuSubButton asChild>
                              <Link to={subItem.href}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                    </Collapsible>
              ) : (
                // Caso 2: El item NO tiene hijos, es un Link directo dentro de SidebarMenuButton
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive(item.href)} // Para que el botón sepa si está activo (para estilos internos si los tiene)
                  // La clase de activo principal ya está en SidebarMenuItem
                >
                  <Link to={item.href}>
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
          </SidebarMenu>
        </SidebarGroup>
        )
      ))}
    </>
  );
}