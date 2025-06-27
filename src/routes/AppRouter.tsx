// src/routes/AppRouter.tsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthApp } from '@/components/auth/AuthApp';
import type { AppRole } from '@/config/navigation';
import { ROLES } from '@/config/navigation'; // Asumiendo que ROLES se exporta desde aquí

import { DashboardLayout } from '@/layouts/DashboardLayout';
// Importa aquí tus futuros componentes de página principal, layout, etc.

import HomePage from '@/pages/HomePage';




const LazyBotiquinCategoriesPage = React.lazy(() => import('@/pages/botiquin/BotiquinCategoriesPage').then(module => ({default: module.BotiquinCategoriesPage})));
const LazyBotiquinTechniquesListPage = React.lazy(() => import('@/pages/botiquin/BotiquinTechniquesListPage').then(module => ({default: module.BotiquinTechniquesListPage})));
const LazyBotiquinTechniqueCreatePage = React.lazy(() => import('@/pages/admin/botiquin/BotiquinTechniqueCreatePage').then(module => ({ default: module.BotiquinTechniqueCreatePage })));
const LazyMoodTrackerPage = React.lazy(() =>  import('@/pages/MoodTrackerPage').then(module => ({ default: module.default })));
const LazyInteractiveStoriesListPage = React.lazy(() => import('@/pages/interactive/InteractiveStoriesListPage').then(module => ({ default: module.InteractiveStoriesListPage })));
const LazyInteractiveStoryPlayerPage = React.lazy(() => import('@/pages/interactive/InteractiveStoryPlayerPage').then(module => ({ default: module.InteractiveStoryPlayerPage })));
const LazyProfilePage = React.lazy(() => import('@/pages/auth/ProfilePage').then(module => ({ default: module.ProfilePage })));
const LazyObservatoryPage = React.lazy(() => import('@/pages/ObservatoryPage').then(module => ({ default: module.ObservatoryPage })));





// Asumiendo que la página de edición está en esta ruta
const LazyBotiquinTechniqueEditPage = React.lazy(() =>
  import('@/pages/admin/botiquin/BotiquinTechniqueEditPage').then(module => ({ default: module.BotiquinTechniqueEditPage }))
);

// Componente para rutas protegidas
interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: AppRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, isLoading } = useAuth(); // <-- Asegúrate de obtener 'profile'
  const location = useLocation(); // <-- Añadir para el state en Navigate

  if (isLoading) {
    return (
      <div className="flex min-h-svh flex-col justify-center items-center bg-background p-6">
        <p>Cargando...</p> {/* O un spinner global */}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />; // Redirige a la página de autenticación
  }

  // Verificar roles si se especifican
  if (allowedRoles && allowedRoles.length > 0) {
    // Obtener el rol desde 'profile' del AuthContext
    const userAppRole = profile?.role as AppRole | undefined; // profile puede ser null inicialmente

    if (!userAppRole || !allowedRoles.includes(userAppRole)) {
      // Usuario no tiene el rol requerido.
      // Redirigir a una página de "Acceso Denegado" o a la página principal.
      console.warn(
        `User ${user.email} with role '${userAppRole || 'undefined'}' tried to access route ${location.pathname} restricted to roles: ${allowedRoles.join(', ')}`
      );
      // Considera añadir un toast.error aquí antes de redirigir
      // import { toast } from 'sonner';
      // toast.error("Acceso denegado", { description: "No tienes los permisos necesarios para acceder a esta página." });
      
      // Redirige a la página principal o a una página específica de /unauthorized
      // Si rediriges a '/', asegúrate de que el usuario no quede en un bucle si '/' también requiere un rol que no tiene.
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  }
  return children;
};

// Componente para rutas públicas que redirige si el usuario ya está logueado
const PublicRoute = ({ children }: { children: React.ReactElement }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-svh flex-col justify-center items-center bg-background p-6">
                <p>Cargando...</p>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/" replace />; // Redirige al dashboard/home si ya está logueado
    }

    return children;
};

const LoadingFallback = () => (
  <div className="flex flex-1 justify-center items-center p-6"> {/* flex-1 para que ocupe espacio en el layout */}
      <p>Cargando página...</p> {/* O un spinner más elaborado */}
  </div>);

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas (o que manejan su propia lógica de autenticación/redirección) */}
      <Route path="/auth" element={<PublicRoute><AuthApp /></PublicRoute>} />
      {/* AuthApp internamente decidirá si mostrar Login, SignUp, etc. 
          Usamos /* para que AuthApp pueda tener sus propias sub-rutas si fuera necesario,
          o simplemente para englobar todas las vistas de autenticación bajo /auth.
          Si AuthApp no usa react-router-dom internamente, podría ser solo /auth.
          Dado que AuthApp tiene su propio 'currentView', path="/auth" está bien.
      */}

      {/* Rutas Protegidas */}
            {/* DashboardLayout es ahora la ruta padre para las vistas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
     >


        {/* Estas rutas se renderizarán dentro del <Outlet /> de DashboardLayout */}
        <Route index element={<HomePage />} /> {/* Para la ruta '/' */}
        <Route
         path="botiquin"
        element={
          <React.Suspense fallback={<LoadingFallback />}>
          <LazyBotiquinCategoriesPage />
          </React.Suspense>
        } />
         <Route
          path="botiquin/:categoryId" 
          element={
            <React.Suspense fallback={<LoadingFallback />}>
              <LazyBotiquinTechniquesListPage />
            </React.Suspense>
          } />

        <Route path="historias" element={<React.Suspense fallback={<LoadingFallback />}> <LazyInteractiveStoriesListPage /> </React.Suspense>  }/>
        <Route path="historias/:storyId" element={<React.Suspense fallback={<LoadingFallback />}> <LazyInteractiveStoryPlayerPage /> </React.Suspense>  }/>

        <Route path="mi-estado-animo" element={<React.Suspense fallback={<LoadingFallback />}> <LazyMoodTrackerPage /> </React.Suspense>  }/>
        <Route path="perfil"element={<React.Suspense fallback={<LoadingFallback />}> <LazyProfilePage /> </React.Suspense>  }/>        
        <Route path="observatorio"element={<React.Suspense fallback={<LoadingFallback />}> <LazyObservatoryPage /> </React.Suspense>  }/>        


        {/* Rutas de Administración */}
        <Route
          path="admin/botiquin/edit/:techniqueId"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN /*, ROLES.EDITOR si lo tienes */]}>
              <React.Suspense fallback={<LoadingFallback />}>
                <LazyBotiquinTechniqueEditPage />
              </React.Suspense>
            </ProtectedRoute>
          }
        />

          <Route
            path="admin/botiquin/new" // <--- NUEVA RUTA PARA CREAR TÉCNICA
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <LazyBotiquinTechniqueCreatePage />
              </ProtectedRoute>
            }
          />


        <Route
          path="admin/users" // Ejemplo
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              {/* <UserManagementPage /> */}
              {/* Este div es un placeholder, reemplázalo con tu componente real */}
              <div className="p-4">Página de Gestión de Usuarios (Admin) - Contenido aquí</div>
            </ProtectedRoute>
          }
        />

        {/* Puedes agrupar más rutas de admin aquí si tienen un layout común */}
        {/* <Route path="admin" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminLayout /></ProtectedRoute>}>
             <Route index element={<AdminDashboard />} />
             ...
           </Route>
        */}
      </Route>




      {/* Ruta Catch-all para 404 o redirigir a /auth si no hay match y no está logueado */}
      <Route path="*" element={<Navigate to="/" replace />} />
      {/* O un componente 404 dedicado: <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
};
