// src/components/layout/app-sidebar.tsx
import { Link } from 'react-router-dom';
import { NavMain } from '../../components/nav/nav-main.tsx'; // Asumiendo que esta ruta es correcta
import { NavUser } from '../../components/nav/nav-user.tsx'; // Asumiendo que esta ruta es correcta
import { mainNavItems, adminNavItems } from '../../config/navigation.ts'; 
import { useAuth } from '../../contexts/AuthContext.tsx';
import { cn } from '../../lib/utils.ts';

// NOTA: Tu error dice que la importación de 'mainNavItems' y 'adminNavItems' está sin usar.
// Esto es porque las variables que usas abajo tienen un nombre diferente.
// Al corregir los nombres abajo, este error de "unused import" desaparecerá.

interface AppSidebarProps {
  isCollapsed: boolean;
  onLinkClick?: () => void;
}

export function AppSidebar({ isCollapsed, onLinkClick }: AppSidebarProps) {
  const { role } = useAuth();

  return (
    <div 
      className="flex flex-col h-full bg-card dark:bg-slate-800"
      data-sidebar-variant={isCollapsed ? "icon" : "default"}
    >
      <div className="p-4 border-b dark:border-slate-700 flex items-center group-[[data-sidebar-variant=icon]]:justify-center">
        <Link to="/" onClick={onLinkClick} className={cn("flex items-center space-x-2", isCollapsed && "justify-center")}>
          {!isCollapsed && <span className="text-xl font-bold text-primary dark:text-slate-50">BCP</span>}
          {isCollapsed && <span className="text-2xl font-bold text-primary dark:text-slate-50">B</span>}
        </Link>
      </div>

      <div className="flex-grow p-2 space-y-1 overflow-y-auto">
        {/* CORRECCIÓN 1: Usar 'mainNavItems' en lugar de 'mainNavItemsData' */}
        <NavMain items={mainNavItems} onLinkClick={onLinkClick} />

        {/* CORRECCIÓN 2: Usar 'adminNavItems' en lugar de 'adminNavItemsData' */}
        {(role === 'admin' || role === 'editor') && adminNavItems.length > 0 && (
          <div className="pt-3 mt-3 border-t dark:border-slate-700">
            {/* CORRECCIÓN 3: Usar 'adminNavItems' en lugar de 'adminNavItemsData' */}
            <NavMain items={adminNavItems} navGroupLabel="Administración" onLinkClick={onLinkClick}/>
          </div>
        )}
      </div>
      
      <NavUser />
    </div>
  );
}