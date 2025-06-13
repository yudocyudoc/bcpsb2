// src/config/navigation.ts
import { Home, HeartHandshake, Smile, Settings, Users, Edit3, ShieldCheck, BookHeart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react'; // Asegúrate de importar LucideIcon

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon; // Icono es opcional
  label?: string; // Para "Platform", "Projects"
  isChilren?: boolean; // Si tiene hijos para renderizar como Collapsible
  children?: NavItem[];
  roles?: string[]; // Para filtrado futuro ('admin', 'editor', 'usuario_registrado')
  isExternal?: boolean; // Para enlaces externos si los necesitas
  badge?: string | number; // Para notificaciones o contadores
  separator?: boolean; // Para añadir un separador antes de este item
}

// Define los roles que tenemos
export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor', // Si lo necesitas
  USER: 'usuario_registrado',
  // DOCENTE: 'docente', // Si lo necesitas
  // TEMPORAL: 'temporal', // Si lo necesitas
} as const;

export type AppRole = typeof ROLES[keyof typeof ROLES];


// Navegación principal para todos los usuarios logueados (o la base)
export const mainNavItems: NavItem[] = [
  {
    title: 'Principal',
    href: '#',
    label: 'Principal', // Etiqueta para el grupo
    isChilren: true,
    children: [
      { title: 'Inicio', href: '/', icon: Home, roles: [ROLES.USER, ROLES.ADMIN] },
      { title: 'Botiquín Emocional', href: '/botiquin', icon: HeartHandshake, roles: [ROLES.USER, ROLES.ADMIN] },
      { title: 'Mi Estado de Ánimo', href: '/mi-estado-animo', icon: Smile, roles: [ROLES.USER, ROLES.ADMIN] },
      { title: 'Historias Interactivas', href: '/historias', icon: BookHeart, roles: [ROLES.USER, ROLES.ADMIN] }, // <-- NUEVO ENLACE

    ],
  },
  // Puedes añadir más grupos aquí, por ejemplo "Recursos Interactivos" en el futuro
];

// Navegación específica para administradores
export const adminNavItems: NavItem[] = [
  {
    title: 'Administración',
    href: '#',
    label: 'Administración',
    isChilren: true,
    children: [
      { title: 'Gestión de Usuarios', href: '/admin/users', icon: Users, roles: [ROLES.ADMIN] },
      { title: 'Editar Lecciones', href: '/admin/lessons', icon: Edit3, roles: [ROLES.ADMIN] }, // Ejemplo
      // Más items de admin
    ],
  },
];

// Navegación para el menú de usuario (Footer)
export const userNavFooterItems: NavItem[] = [
    { title: 'Mi Perfil', href: '/profile', icon: Settings }, // Ejemplo
    { title: 'Seguridad', href: '/security', icon: ShieldCheck }, // Ejemplo
    // El item de Logout se manejará directamente en NavUser.tsx
];

// Función para obtener los items de navegación basados en el rol del usuario
export const getNavItemsForRole = (role: AppRole | null | undefined): NavItem[] => {
  let items = [...mainNavItems]; // Empezar con la navegación principal

  if (role === ROLES.ADMIN) {
    // Añadir un separador visual si hay items de admin
    if (adminNavItems.length > 0 && items.length > 0) {
        items.push({ title: 'AdminSeparator', href: '#', separator: true }); // Item especial para separador
    }
    items = [...items, ...adminNavItems];
  }
  // Aquí podrías añadir lógica para ROLES.EDITOR, ROLES.DOCENTE si los implementas

  // Filtrar items basados en los roles definidos en cada NavItem (si es necesario)
  // Por ahora, la estructura de arriba ya considera los roles.
  // Esta función se puede expandir para filtrar items individuales si `item.roles` se usa más granularmente.

  return items;
};

// Combina todos los grupos de navegación principales para generar breadcrumbs u otras lógicas globales.
// Nota: getNavItemsForRole ya maneja la lógica de roles para la visualización del sidebar.
// Este allNavItems es más para una lista completa de la estructura de navegación.
export const allNavItems: NavItem[] = [
    ...mainNavItems,
    ...adminNavItems,
  ];