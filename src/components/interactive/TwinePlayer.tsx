// src/components/interactive/TwinePlayer.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ArrowLeft, BookOpen, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TwineStoryDataFormat, TwinePlayerGameState } from '@/types/interactiveStories.types';
import HarloweTextRenderer from '@/components/interactive/HarloweTextRenderer';
import { TwineRouteProgress, useRouteProgress } from '@/components/interactive/RouteProgressBar';

import { scroller } from 'react-scroll'; 


interface TwinePlayerProps {
  storyData: TwineStoryDataFormat;
  playerName?: string | null;
  initialGameState?: TwinePlayerGameState | null; 
  onStoryComplete?: (storyId: string) => void; // MODIFICADO: Añadir storyId
  onPassageChange?: (storyId: string, passageName: string) => void; // MODIFICADO: Añadir storyId
  onGameStateChange?: (gameState: TwinePlayerGameState) => void; 
  showRouteProgress?: boolean;
  className?: string; 
}

export const TwinePlayer: React.FC<TwinePlayerProps> = ({
  storyData,
  playerName,
  onStoryComplete,
  onPassageChange,
  showRouteProgress = true,
  className = "",
  initialGameState: providedInitialGameState, 
  onGameStateChange,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<TwinePlayerGameState | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true); 
 // Mover la llamada a useRouteProgress aquí, ANTES de cualquier retorno condicional.
  // useRouteProgress está diseñado para manejar gameState como null.
  const { routes: routeDetails, stats: routeStats } = useRouteProgress({ storyData, gameState });

  useEffect(() => {
    if (storyData && storyData.passages && storyData.passages.length > 0) {
      let initialPassageName: string | undefined;
      let initialHistory: string[];
      let initialVisited: Set<string>;

      if (providedInitialGameState) {
        // Usar el estado proporcionado si existe
        initialPassageName = providedInitialGameState.currentPassageName;
        initialHistory = providedInitialGameState.history;
        initialVisited = providedInitialGameState.visitedPassages;
        console.log(`[TwinePlayer] Initializing with provided game state. Start passage: ${initialPassageName}`);
      } else {
        // Determinar el pasaje inicial desde storyData si no se proporciona estado
        if (storyData.startPassage) {
          initialPassageName = storyData.startPassage;
        }
        if (!initialPassageName) {
          const firstPidPassage = storyData.passages.find(p => p.id === "1");
          if (firstPidPassage) {
            initialPassageName = firstPidPassage.name;
          }
        }
        if (!initialPassageName && storyData.passages[0]) {
          initialPassageName = storyData.passages[0].name;
        }
        initialHistory = initialPassageName ? [initialPassageName] : [];
        initialVisited = initialPassageName ? new Set([initialPassageName]) : new Set();
        console.log(`[TwinePlayer] Initializing from storyData. Start passage: ${initialPassageName}`);
      }

      if (initialPassageName) {
        const newGameState = {
          currentPassageName: initialPassageName,
          history: initialHistory,
          visitedPassages: initialVisited,
        };
        setGameState(newGameState);
        if (onGameStateChange) onGameStateChange(newGameState); // Notificar estado inicial
      } else {
        console.error("[TwinePlayer] CRITICAL: Could not determine a valid start passage for the story.", storyData);
        setGameState(null);
      }
      setIsFirstLoad(true);
    }
  }, [storyData, providedInitialGameState, onGameStateChange]);

  const currentPassageData = useMemo(() => {
    if (!gameState || !storyData || !storyData.passages) {
      return null;
    }
    const passage = storyData.passages.find(p => p.name === gameState.currentPassageName) || null;
    return passage;
  }, [storyData, gameState]);

  // Efecto para el scroll DE PÁGINA en la carga inicial y cambios de pasaje
  useEffect(() => {
    if (currentPassageData && onPassageChange) {
      onPassageChange(storyData.uuid, currentPassageData.name); // MODIFICADO: Pasar storyData.uuid
    }

    const isFinal = currentPassageData && (!currentPassageData.links || currentPassageData.links.length === 0);
    if (isFinal && onStoryComplete) {
      onStoryComplete(storyData.uuid); // MODIFICADO: Pasar storyData.uuid
    }

    // Scroll de página para cambios de pasaje (no en la primera carga, ya que se maneja arriba)
    if (currentPassageData && !isFirstLoad) {    
      const timerId = setTimeout(() => {
        // Primero, asegurar que el scroll interno del viewport esté arriba
        if (viewportRef.current) {
          viewportRef.current.scrollTop = 0;
        }
        // Luego, hacer scroll de la página principal
         scroller.scrollTo('passage-content-anchor', { // Scroll al ancla antes del texto del pasaje
          duration: 800,
          delay: 100, 
          smooth: 'easeInOutQuart',
          containerId: 'mainScrollContainer',
          offset: -100, // Ajustar este valor según la altura del encabezado
        });
        if (isFirstLoad) setIsFirstLoad(false); // Marcar primera carga como completada después del primer scroll
      }, 200); // Aumentado el delay para asegurar actualizaciones del DOM

      return () => clearTimeout(timerId);
    }
  }, [currentPassageData, isFirstLoad, onPassageChange, onStoryComplete, storyData.uuid]); // MODIFICADO: Añadir storyData.uuid


  useEffect(() => {
    if (currentPassageData && !isFirstLoad) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [currentPassageData, isFirstLoad]);

  const navigateToPassage = (passageName: string) => {
    console.log(`[TwinePlayer] navigateToPassage called with: ${passageName}`);
    if (!gameState) {
      return; // No hacer nada si gameState es null
    }
    const targetPassage = storyData.passages.find(p => p.name === passageName);
    if (!targetPassage) {
      return;
    }
    setGameState(prev => {
      const newGameState = {
      ...prev!,
      currentPassageName: passageName,
      history: [...prev!.history, passageName],
      visitedPassages: new Set([...prev!.visitedPassages, passageName]),
    };
      if (onGameStateChange) onGameStateChange(newGameState);
      return newGameState;
    });
  };

  const restartStory = () => {
    console.log("[TwinePlayer] restartStory called.");
    if (!storyData || !storyData.passages || storyData.passages.length === 0) {
      setGameState(null);
      return;
    }
    
    let initialPassageName: string | undefined;
    if (storyData.startPassage) initialPassageName = storyData.startPassage;
    if (!initialPassageName) initialPassageName = storyData.passages.find(p => p.id === "1")?.name;
    if (!initialPassageName && storyData.passages[0]) initialPassageName = storyData.passages[0].name;

    if (initialPassageName) {
      const newGameState = {
        currentPassageName: initialPassageName,
        history: [initialPassageName],
        visitedPassages: new Set([initialPassageName]),
      };
      setGameState(newGameState);
      if (onGameStateChange) onGameStateChange(newGameState);
      setIsFirstLoad(true);
    } else {
      setGameState(null);
    }
  };

  const goToStartAndKeepProgress = () => {
    console.log("[TwinePlayer] goToStartAndKeepProgress called.");
    if (!storyData || !storyData.passages || storyData.passages.length === 0) {
      // Esto no debería ocurrir si el player está visible y funcionando
      setGameState(null); 
      return;
    }
    
    let initialPassageName: string | undefined;
    // Lógica para obtener initialPassageName (igual que en restartStory)
    if (storyData.startPassage) initialPassageName = storyData.startPassage;
    if (!initialPassageName) initialPassageName = storyData.passages.find(p => p.id === "1")?.name;
    if (!initialPassageName && storyData.passages[0]) initialPassageName = storyData.passages[0].name;

    if (initialPassageName && gameState) { // gameState debe existir para mantener visitedPassages
      setGameState(prevGameState => {
        if (!prevGameState) return null; // Seguridad, aunque la condición externa ya lo cubre
        const newGameState = {
          ...prevGameState, // Mantiene visitedPassages y otras propiedades si las hubiera
          currentPassageName: initialPassageName,
          history: [initialPassageName], // Reinicia el historial de esta sesión de juego al punto de partida
        };
        if (onGameStateChange) onGameStateChange(newGameState);
        return newGameState;
      });
      // El scroll de página se manejará por el useEffect que observa currentPassageData y !isFirstLoad.
    } else {
      console.warn("[TwinePlayer] goToStartAndKeepProgress: Fallback to restartStory due to missing initialPassageName or gameState being null.");
      restartStory(); // Fallback si gameState es null o no se encuentra initialPassageName
    }
  };


  const goBack = () => {
    console.log("[TwinePlayer] goBack called. History length:", gameState?.history.length);
    if (!gameState || gameState.history.length <= 1) {
      console.warn("[TwinePlayer] goBack: gameState is null or history too short, cannot go back.");
      return;
    }

    const newHistory = gameState.history.slice(0, -1);
    const previousPassageName = newHistory[newHistory.length - 1];
    setGameState(prev => {
      const newGameState = {
      ...prev!,
      currentPassageName: previousPassageName,
      history: newHistory,
      visitedPassages: prev!.visitedPassages,
    };
      if (onGameStateChange) onGameStateChange(newGameState);
      return newGameState;
    });
  };

  if (!gameState || !storyData) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-card border rounded-lg">
        <div className="text-center p-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <p className="font-semibold text-destructive">Error Crítico en la Historia</p>
          <p className="text-sm text-muted-foreground">
            No se pudo cargar la estructura inicial de la historia.
          </p>
        </div>
      </div>
    );
  }

  if (!currentPassageData) {
    console.error(`[TwinePlayer] ERROR: currentPassageData is null. currentPassageName: "${gameState.currentPassageName || 'desconocido'}"`);

    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-card text-destructive">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <p className="font-semibold">Error en la historia</p>
        <p className="text-sm text-muted-foreground">
          No se pudo cargar el pasaje actual: "{gameState.currentPassageName || 'desconocido'}".
        </p>
     
      </div>
    );
  }

  const isFinalPassage = !currentPassageData.links || currentPassageData.links.length === 0;
 
  return (
    <div 
      className={cn(
        "w-full max-w-3xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 text-gray-800",
        className
      )}
    >
      {/* Header fijo */}
      <div 
 id="twine-player-header" // ID para el scroll inicial
 className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200"
     >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {storyData.name}
        </h1>
        {!isFinalPassage && gameState && gameState.history.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={restartStory}
            className="mt-3 sm:mt-0 w-fit"
          >
            Reiniciar
          </Button>
        )}
      </div>

      {/* Contenido principal */}
      <div className="space-y-6">
        {/* Tags y Botón Atrás */}
        <div className="flex items-center justify-between">
          <div>
            {currentPassageData.tags && currentPassageData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(typeof currentPassageData.tags === 'string' ? currentPassageData.tags.split(' ') : currentPassageData.tags)
                  .filter((tag: string) => tag.trim() !== '')
                  .map((tag: string, index: number) => (
                    <span
                      key={`tag-${index}`}
                      className={cn(
                        "px-2.5 py-0.5 text-xs font-medium rounded-full",
                        tag.toLowerCase() === 'positivo' ? 'bg-green-100 text-green-700' :
                          tag.toLowerCase() === 'negativo' ? 'bg-red-100 text-red-700' :
                            tag.toLowerCase() === 'final' ? 'bg-purple-100 text-purple-700' :
                              tag.toLowerCase() === 'inicio' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                      )}
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </div>
          {gameState.history.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goBack}
              title="Paso Anterior"
              className=" hover:text-gray-900 border-e-4 text-green-700 rounded-4xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Contenido del pasaje */}
        <div
          id="passage-content-anchor" // Ancla para el scroll
          className="prose prose-gray max-w-none"
        >
           <HarloweTextRenderer
            key={currentPassageData.name}
            text={currentPassageData.text}
            playerName={playerName}
          />
        </div>

        {/* Enlaces */}
        {currentPassageData.links && currentPassageData.links.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700">
              ¿Qué decides hacer?
            </h2>
            {currentPassageData.links.map((link, index) => (
              <Button
                key={link.original + index}
                variant="outline"
                className="w-full justify-between items-center text-left h-auto px-4 py-3 group hover:bg-gray-50 hover:border-gray-300 border-gray-200"
                onClick={() => navigateToPassage(link.passageName)}
                title= "Explorar escenario"
              >
                <span className="flex-1 text-gray-800 group-hover:text-primary min-w-0 whitespace-normal break-words">
                  {link.linkText}
                </span>
                <ChevronRight className="h-5 w-5 ml-3 text-gray-400 group-hover:text-primary transition-transform group-hover:translate-x-1" />
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {showRouteProgress && (
        <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-100/80 dark:bg-gray-800/30 ring-gray-50 rounded-2xl lg:px-8 px-4 pb-6">
          <TwineRouteProgress
            storyData={storyData}
            gameState={gameState}
            showStats={true}
          />
        </div>
      )}

      {isFinalPassage && (
        <div className="flex-shrink-0 text-center py-8 mt-6 border-t border-gray-200">
         
         {routeStats.isAllCompleted ? (
            <>
              <BookOpen className="h-12 w-12 text-green-600 mb-3 mx-auto" />
              <p className="text-xl font-semibold text-gray-800">¡Felicidades!</p>
              <p className="text-muted-foreground mt-1">Has explorado todos los caminos de esta historia.</p>
          
            </>
          ) : (
            <>
              <BookOpen className="h-12 w-12 text-blue-500 mb-3 mx-auto" />
              <p className="text-xl font-semibold text-gray-800">Has llegado al final de este escenario.</p>
              {routeDetails.some(r => !r.completed) && (
                <div className="mt-4 text-sm text-muted-foreground">
                  <p className="font-medium text-gray-700">Aún te queda por descubrir:</p>
                  <ul className="list-disc list-inside inline-block text-left mt-1">
                    {routeDetails.filter(r => !r.completed).map(route => (
                      <li key={route.id}>{route.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Button onClick={goToStartAndKeepProgress} className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
              Explorar otros escenarios
              </Button>
            </>
          )}

        </div>
      )}
    </div>
  );
};