// src/layouts/DashboardLayout.tsx
import { useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { AppSidebar } from "@/components/app/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";
import { allNavItems, type NavItem } from '@/config/navigation';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft } from 'lucide-react';

// --- IMPORTACIONES CLAVE PARA LA LÓGICA DE CACHÉ ---
import { useAuth } from '@/contexts/AuthContext'; // 1. Importamos el hook de autenticación
import { warmUpCache } from '@/services/cacheWarmer.service'; // 2. Importamos el servicio de caché

// --- La función para generar breadcrumbs se mantiene igual ---
const generateBreadcrumbs = (pathname: string, navConfig: NavItem[]): NavItem[] => {
  // ... tu código existente para generateBreadcrumbs ... (sin cambios)
  const pathParts = pathname.split('/').filter(part => part);
  const crumbs: NavItem[] = [{ title: 'Inicio', href: '/', icon: navConfig.find(item => item.href === '/')?.icon }];
  let currentPath = '';
  for (const part of pathParts) {
    currentPath += `/${part}`;
    let foundItem: NavItem | undefined;
    const searchItems = (items: NavItem[]): NavItem | undefined => {
        for (const item of items) {
            if (item.href === currentPath) return item;
            if (item.children) {
                const childFound = searchItems(item.children);
                if (childFound) return childFound;
            }
        }
        return undefined;
    };
    for (const group of navConfig) {
        if (group.children) {
            foundItem = searchItems(group.children);
            if (foundItem) break;
        }
    }
    if (foundItem) {
      crumbs.push(foundItem);
    } else {
      const title = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      crumbs.push({ title: title, href: currentPath });
    }
  }
  return crumbs;
};


// --- Componente interno para el contenido ---
const DashboardLayoutContent = () => {
    const location = useLocation();
    const breadcrumbItems = generateBreadcrumbs(location.pathname, allNavItems.flatMap(group => group.children || []));
    const parentCrumb = breadcrumbItems.length > 1 ? breadcrumbItems[breadcrumbItems.length - 2] : null;
    const navigate = useNavigate();
    const { setOpen: setSidebarOpen, isMobile } = useSidebar();
    
    // 3. Obtenemos el usuario desde el contexto de autenticación
    const { user } = useAuth();
  
    // useEffect para cerrar la sidebar en navegación móvil (tu código original)
    useEffect(() => {
        if (isMobile && setSidebarOpen) {
            setSidebarOpen(false);
        }
    }, [location.pathname, setSidebarOpen, isMobile]);
  
    // --- CORRECCIÓN: Este es el lugar correcto para el useEffect del calentador de caché ---
    useEffect(() => {
      // 4. Solo ejecutamos si tenemos un usuario (está autenticado)
      if (user) {
        // Usamos un setTimeout para no bloquear el renderizado inicial y mejorar la percepción de velocidad.
        const timerId = setTimeout(() => {
          warmUpCache();
        }, 1500); // Esperamos 1.5 segundos

        // 5. Función de limpieza: Es una buena práctica de React limpiar los timers
        // cuando el componente se desmonta o el usuario cambia.
        return () => clearTimeout(timerId);
      }
    }, [user]); // 6. El array de dependencias: este efecto se volverá a ejecutar solo si el objeto 'user' cambia (ej. en un logout/login).

    return (
      <div className="flex flex-col h-full"> 
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="sm:hidden -ml-1" />
            <SidebarTrigger className="hidden sm:flex -ml-1" />
 
            {/* Breadcrumb para móviles */}
            {parentCrumb && (
              <div className="md:hidden flex items-center">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                    <BreadcrumbLink 
                        onClick={() => {
                          if (parentCrumb && parentCrumb.href === '/') {
                            navigate('/');
                          } else {
                            navigate(-1);
                          }}}
                        className="flex items-center gap-1 cursor-pointer text-sm"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {parentCrumb.title}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            )}
            <Separator orientation="vertical" className="mx-2 h-4 hidden sm:block" />
            
            {/* Breadcrumb para desktop */}
            <Breadcrumb className="hidden sm:flex">
                 <BreadcrumbList>
                  {breadcrumbItems.map((crumb, index) => (
                    <BreadcrumbItem key={crumb.href + index}>
                      {index < breadcrumbItems.length - 1 ? (
                        <>
                          <BreadcrumbLink asChild>
                            <Link to={crumb.href}>{crumb.title}</Link>
                          </BreadcrumbLink>
                          <BreadcrumbSeparator />
                        </>
                      ) : (
                        <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>          
              <div className="ml-auto flex items-center gap-2">
                {/* Elementos a la derecha */}
              </div>
            </header>
            <main id='mainScrollContainer'
              className="flex flex-1 flex-col gap-4 p-4 pt-2 sm:p-6 sm:pt-2 md:gap-8 overflow-y-auto"
            >
            <Outlet />
          </main>    
      </div>
    );
};

// --- El componente principal se mantiene igual ---
export function DashboardLayout() {
    return (
        <SidebarProvider defaultOpen>
          <AppSidebar />
          <SidebarInset>
            <DashboardLayoutContent />
          </SidebarInset>
        </SidebarProvider>
      );
}
