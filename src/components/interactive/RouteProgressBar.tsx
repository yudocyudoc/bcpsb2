// src/components/interactive/RouteProgressBar.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import type { TwineStoryDataFormat, TwinePlayerGameState } from '@/types/interactiveStories.types';

// Tipos para el progreso de rutas
interface RouteInfo {
  id: string;
  name: string;
  color: string;
  tag: string;
  finalPassages: string[];
  completed: boolean;
  progress: number;
}

interface RouteProgressBarProps {
  routes: RouteInfo[];
  className?: string;
}

// Componente visual de la barra de progreso
export const RouteProgressBar: React.FC<RouteProgressBarProps> = ({ routes, className = '' }) => {
  const segmentWidth = 100 / routes.length;

  return (
    <div className={cn("w-full", className)}>
      {/* Etiquetas de rutas */}
      <div className="flex justify-between text-xs mb-2">
        {routes.map((route) => (
          <span 
            key={route.id}
            className={cn(
              "font-medium transition-colors duration-300",
              route.completed ? "font-semibold" : "text-gray-500"
            )}
            style={{ 
              color: route.completed ? route.color : undefined 
            }}
          >
            {route.name}
          </span>
        ))}
      </div>

      {/* Barra de progreso principal */}
      <div className="relative h-4 bg-gray-200 rounded-lg overflow-hidden shadow-inner">
        {routes.map((route, index) => {
          const leftPosition = segmentWidth * index;
          const fillWidth = route.completed ? segmentWidth : (segmentWidth * route.progress / 100);
          
          return (
            <div
              key={route.id}
              className="absolute top-0 h-full transition-all duration-700 ease-out"
              style={{
                left: `${leftPosition}%`,
                width: `${fillWidth}%`,
                backgroundColor: route.color,
                opacity: route.completed ? 1 : 0.8
              }}
            />
          );
        })}
        
        {/* Separadores entre segmentos */}
        {routes.slice(0, -1).map((_, index) => (
          <div
            key={`separator-${index}`}
            className="absolute top-0 w-0.5 h-full bg-white z-10"
            style={{ left: `${segmentWidth * (index + 1)}%` }}
          />
        ))}
      </div>

      {/* Indicadores de progreso */}
      <div className="flex justify-between text-xs mt-2 text-gray-600">
        {routes.map((route) => (
          <span key={`progress-${route.id}`} className="font-medium">
            {route.completed ? '✓' : `${Math.round(route.progress)}%`}
          </span>
        ))}
      </div>
    </div>
  );
};

// Hook para calcular el progreso de rutas basado en tu estructura Twine
interface UseRouteProgressProps {
  storyData: TwineStoryDataFormat;
  gameState: TwinePlayerGameState | null;

}

export const useRouteProgress = ({ storyData, gameState }: UseRouteProgressProps) => {
  // Configuración de rutas basada en tu historia específica
  const routeConfigs = React.useMemo(() => [
    {
      id: 'positivo',
      name: 'Gestión Positiva',
      color: '#10b981', // verde
      tag: 'positivo',
      finalPassages: ['FinalPositivo'],
      keyPassages: ['GestionCorrecta', 'FinalPositivo']
    },
    {
      id: 'soborno',
      name: 'Ruta del Soborno',
      color: '#f59e0b', // amarillo/naranja
      tag: 'negativo',
      finalPassages: ['FinalSoborno'],
      keyPassages: ['Soborno', 'FinalSoborno']
    },
    {
      id: 'conflictivo',
      name: 'Gestión Conflictiva',
      color: '#ef4444', // rojo
      tag: 'negativo',
      finalPassages: ['FinalConflictivo'],
      keyPassages: ['GestionFallida', 'FinalConflictivo']
    }
  ], []);

  // Función para calcular el progreso de una ruta
  const calculateRouteProgress = React.useCallback((routeConfig: typeof routeConfigs[0]) => {
     // Si gameState es null, la ruta no está completada y el progreso es 0.
     if (!gameState) {
      return { completed: false, progress: 0 };
    }
    // Verificar si la ruta está completada
    const isCompleted = routeConfig.finalPassages.some(finalPassage => 
      gameState.visitedPassages.has(finalPassage)
    );

    if (isCompleted) {
      return { completed: true, progress: 100 };
    }

    // Calcular progreso basado en pasajes clave visitados
    const visitedKeyPassages = routeConfig.keyPassages.filter(passage => 
      gameState.visitedPassages.has(passage)
    );

    const progress = routeConfig.keyPassages.length > 0 
      ? (visitedKeyPassages.length / routeConfig.keyPassages.length) * 100
      : 0;

    return { completed: false, progress };
  }, [gameState]); // Depende de todo el objeto gameState

  // Calcular información de todas las rutas
  const routes: RouteInfo[] = React.useMemo(() => {
     // Si gameState es null, todas las rutas están incompletas y con 0% de progreso.
     if (!gameState) {
      return routeConfigs.map(config => ({
        ...config,
        completed: false,
        progress: 0,
      }));
    }
    return routeConfigs.map(config => {
      const { completed, progress } = calculateRouteProgress(config);
      
      return {
        ...config,
        completed,
        progress
      };
    });
  }, [routeConfigs, calculateRouteProgress, gameState]); // Añadido gameState a las dependencias

  // Detectar ruta actual
  const getCurrentRoute = React.useCallback(() => {
// Si storyData o gameState son null, no se puede determinar la ruta actual.
if (!storyData || !gameState) {
  return null;
}
const currentPassage = storyData.passages.find(p => p.name === gameState.currentPassageName);
   if (!currentPassage?.tags) return null;

    const tags = typeof currentPassage.tags === 'string' 
      ? currentPassage.tags.split(' ') 
      : currentPassage.tags;

    // Buscar coincidencia con tags de ruta
    for (const route of routeConfigs) {
      if (tags.includes(route.tag)) {
        return route.id;
      }
    }

    return null;
  }, [storyData, gameState, routeConfigs]); // Depende de storyData y gameState completos

  // Estadísticas generales
  const stats = React.useMemo(() => {
     // Si gameState es null (implica que no hay progreso), devolver estadísticas por defecto.
     if (!gameState) {
      return {
        completedRoutes: 0,
        totalRoutes: routeConfigs.length,
        overallProgress: 0,
        isAllCompleted: false,
        currentRoute: null, // No se puede determinar la ruta actual sin gameState
      };
    }
    const completedRoutes = routes.filter(route => route.completed).length;
    const totalProgress = routes.reduce((sum, route) => sum + route.progress, 0) / routes.length;
    
    return {
      completedRoutes,
      totalRoutes: routes.length,
      overallProgress: Math.round(totalProgress),
      isAllCompleted: completedRoutes === routes.length,
      currentRoute: getCurrentRoute()
    };
  }, [routes, getCurrentRoute, gameState, routeConfigs]); // Añadido gameState y routeConfigs

  return {
    routes,
    stats,
    getCurrentRoute
  };
};

// Componente integrado para usar en tu TwinePlayer
interface TwineRouteProgressProps {
  storyData: TwineStoryDataFormat;
  gameState: TwinePlayerGameState;
  showStats?: boolean;
  className?: string;
}

export const TwineRouteProgress: React.FC<TwineRouteProgressProps> = ({
  storyData,
  gameState,
  showStats = true,
  className = ''
}) => {
  const { routes, stats } = useRouteProgress({ storyData, gameState });

  return (
    <div className={cn("space-y-3", className)}>
      {/* Título de la sección */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Progreso de Exploración</h3>
        {stats.currentRoute && (
          <span className="text-xs text-gray-500">
            Ruta actual: {routes.find(r => r.id === stats.currentRoute)?.name}
          </span>
        )}
      </div>

      {/* Barra de progreso */}
      <RouteProgressBar routes={routes} />

      {/* Estadísticas opcionales */}
      {showStats && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>
            Completado: <span className="font-medium">{stats.completedRoutes}/{stats.totalRoutes}</span>
          </span>
          <span>
            Progreso general: <span className="font-medium">{stats.overallProgress}%</span>
          </span>
        </div>
      )}

      {/* Mensaje de completación */}
      {stats.isAllCompleted && (
        <div className="text-center py-2">
          <span className="text-sm text-green-600 font-medium">
            🎉 ¡Has explorado todas las rutas!
          </span>
        </div>
      )}
    </div>
  );
};