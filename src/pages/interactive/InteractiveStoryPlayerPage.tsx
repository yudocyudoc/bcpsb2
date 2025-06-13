// src/pages/interactive/InteractiveStoryPlayerPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react'; // Añadir useRef y useCallback
import { useParams, useNavigate } from 'react-router-dom'; // Quitar Link si no se usa
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // Skeleton se usa en PlayerPageSkeleton
import { AlertTriangle, ChevronLeft } from 'lucide-react'; // Home no se usa
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserStoryProgressState,   // <--- NUEVO SERVICIO
  saveUserStoryProgressState,  // <--- NUEVO SERVICIO
  trackStoryStartedIfNeeded,   // <--- NUEVO SERVICIO (o ajustado)
  getCachedAllStories // <--- IMPORTANTE: Para obtener historias con caché
  // updateLastPassageVisited // Esta se integra dentro de saveUserStoryProgressState, UserStoryProgressData no se usa
} from '@/services/interactiveStoriesService';
import type { TwineStoryDataFormat, TwinePlayerGameState } from '@/types/interactiveStories.types';
import { TwinePlayer } from '@/components/interactive/TwinePlayer';

type PageStatus = 'initialLoading' | 'loadingStory' | 'playing' | 'notFound' | 'error';

const PlayerPageSkeleton: React.FC = () => (
  <div className="container mx-auto px-4 py-8 animate-pulse">
    <div className="mb-4">
      <Skeleton className="h-9 w-48" />
    </div>
    <Skeleton className="h-10 w-3/4 mb-2" /> {/* Título de la historia */}
    <Skeleton className="h-6 w-1/2 mb-6" /> {/* Tags o info adicional */}
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" /> {/* Contenido del pasaje */}
      <Skeleton className="h-12 w-full" /> {/* Enlace 1 */}
      <Skeleton className="h-12 w-full" /> {/* Enlace 2 */}
    </div>
    <div className="mt-8 pt-6 border-t">
      <Skeleton className="h-20 w-full" /> {/* Route progress bar */}
    </div>
  </div>
);

export function InteractiveStoryPlayerPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [status, setStatus] = useState<PageStatus>('initialLoading');
  const [storyData, setStoryData] = useState<TwineStoryDataFormat | null>(null);
  // Estado para el GameState que se pasará a TwinePlayer
  const [initialGameStateForPlayer, setInitialGameStateForPlayer] = useState<TwinePlayerGameState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Ref para guardar el estado más reciente del TwinePlayer para persistirlo al desmontar
  const currentPlayerGameStateRef = useRef<TwinePlayerGameState | null>(null);
  const hasLoadedInitialDataRef = useRef(false); // Ref para controlar la carga inicial

  useEffect(() => {
    console.log(`[PlayerPage] useEffect for loading. storyId: "${storyId}", user?.id: "${user?.id}", authIsLoading: ${profile === undefined}, hasLoadedRef: ${hasLoadedInitialDataRef.current}`);

    // Se usa profile === undefined como proxy para authIsLoading
    if (profile === undefined) { // Asumiendo que profile es undefined mientras AuthContext está cargando
      console.log("[PlayerPage] Auth is loading (profile undefined), returning early.");
      return;
    }

    if (!storyId || !user?.id) {
      if (!user?.id) {
        console.log("[PlayerPage] No user.id, returning early.");
        // Opcional: if (hasLoadedInitialDataRef.current) hasLoadedInitialDataRef.current = false; 
      }
      if (!storyId) {
        console.log("[PlayerPage] No storyId, navigating to /historias.");
        if (status !== 'notFound') navigate('/historias', { replace: true });
      }
      hasLoadedInitialDataRef.current = false; 
      return;
    }

    // Prevenir ejecuciones múltiples si ya se cargó o está cargando para el mismo user/story
    if (hasLoadedInitialDataRef.current) {
      console.log(`[PlayerPage] Initial data load already attempted or completed for storyId: "${storyId}", userId: "${user.id}", skipping.`);
      return;
    }

    // MOVER ESTA LINEA AL INICIO DEL PROCESO DE CARGA
    hasLoadedInitialDataRef.current = true; 

    window.scrollTo(0, 0);
    setStatus('loadingStory'); // Indica que estamos cargando la historia y el progreso
    let fetchedStoryData: TwineStoryDataFormat | null = null;

    const loadStoryAndProgress = async () => {
      try {        console.log(`[PlayerPage] loadStoryAndProgress - STEP 1: Fetching story JSON for storyId: "${storyId}"`);
        
        // --- LÓGICA REFACTORIZADA: Obtener de caché/red y encontrar la historia ---
        console.log(`[PlayerPage] Searching for story ${storyId} in cache first...`);

        // 1. Obtener TODAS las historias (desde la caché si es posible)
        const allStories = await getCachedAllStories();

        // 2. Encontrar la historia específica en el cliente
        const currentStoryData = allStories.find(story => story.id === storyId);

        if (!currentStoryData || !currentStoryData.story_json) {
          // Si incluso después de buscar en caché/red no se encuentra, es un error.
          console.log(`[PlayerPage] Story data or JSON not found for ID: ${storyId} after fetching all.`);
          setStatus('notFound');
          setErrorMessage(`No se encontró una historia con el ID: ${storyId}`);
          hasLoadedInitialDataRef.current = false; // Permitir reintento si es un error recuperable
          return;
        }
        fetchedStoryData = currentStoryData.story_json as unknown as TwineStoryDataFormat; // Usar el JSON encontrado

        // 3. Cargar el progreso del usuario para esta historia (esto sigue siendo de la red)
        // user.id no puede ser null aquí debido a la guarda anterior
        console.log(`[PlayerPage] loadStoryAndProgress - STEP 2: Fetching progress for userId: "${user.id}", storyId: "${storyId}"`);
        const progressState = await getUserStoryProgressState(user.id, storyId);
        console.log(`[PlayerPage] getUserStoryProgressState result for story ${storyId}:`, progressState);
        
        let startingPassageName: string;
        let initialHistory: string[];
        let initialVisited: Set<string>;

        if (progressState?.last_passage_name) {
          // Reanudar desde el último pasaje guardado
          startingPassageName = progressState.last_passage_name;
          initialHistory = progressState.history_stack || [startingPassageName];
          initialVisited = new Set(progressState.visited_passages_names || [startingPassageName]);
          console.log(`[PlayerPage] Resuming story ${storyId} from passage: ${startingPassageName}`);
        } else {
          // Iniciar desde el principio
          startingPassageName = fetchedStoryData.startPassage || fetchedStoryData.passages[0]?.name || "ERROR_NO_START";
          if (startingPassageName === "ERROR_NO_START") throw new Error("Could not determine start passage.");
          initialHistory = [startingPassageName];
          initialVisited = new Set([startingPassageName]);
          // Solo crear entrada inicial si NO hay progressState (null)
          if (!progressState) {
            console.log(`[PlayerPage] loadStoryAndProgress - STEP 3 (no progress found): Tracking story start for userId: "${user.id}", storyId: "${storyId}"`);
            await trackStoryStartedIfNeeded(user.id, storyId);
          }
          console.log(`[PlayerPage] Starting new story ${storyId} from passage: ${startingPassageName}`);
        }
        
        setStoryData(fetchedStoryData); // Ahora tenemos los datos de la historia
        setInitialGameStateForPlayer({ // Establecer el estado inicial para TwinePlayer
          currentPassageName: startingPassageName,
          history: initialHistory,
          visitedPassages: initialVisited,
        });
        setStatus('playing');

      } catch (err) {
        console.error(`Error loading story or progress for ${storyId}:`, err);
        setErrorMessage(err instanceof Error ? err.message : "No se pudo cargar la historia o el progreso.");
        setStatus('error');
        hasLoadedInitialDataRef.current = false; // Permitir reintentar si hay error
      }
    };

    loadStoryAndProgress();

    // return () => { hasLoadedInitialDataRef.current = false; } // Opcional: resetear en limpieza

  // authIsLoading (o su proxy profile === undefined) es importante aquí
  }, [storyId, user?.id, navigate, profile]);


  // Efecto para guardar el progreso al desmontar el componente
  useEffect(() => {
    const handleBeforeUnload = (_event: BeforeUnloadEvent) => { // _event para indicar que no se usa
      // Esto es para cierres de pestaña/navegador, pero es menos fiable.
      // La lógica principal de guardado estará en el return de limpieza del useEffect de carga.
      if (user?.id && storyId && currentPlayerGameStateRef.current && status === 'playing') {
        // Las APIs síncronas son limitadas aquí. `navigator.sendBeacon` es una opción.
        // Por simplicidad, nos enfocaremos en el guardado al desmontar de React.
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => { // Función de limpieza
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (user?.id && storyId && currentPlayerGameStateRef.current && status === 'playing') {
        console.log(`[PlayerPage] Unmounting. GameState to save:`, JSON.stringify(currentPlayerGameStateRef.current)); // Loguea el estado completo
        saveUserStoryProgressState(user.id, storyId, {
          currentPassageName: currentPlayerGameStateRef.current.currentPassageName,
          history: currentPlayerGameStateRef.current.history,
          visitedPassages: Array.from(currentPlayerGameStateRef.current.visitedPassages),
          status: 'started' // Al salir, el estado sigue siendo 'started'
        })
          .then(() => console.log(`[PlayerPage] Progress saved on unmount for story ${storyId}.`))
          .catch(err => console.error(`[PlayerPage] Error saving progress on unmount for story ${storyId}:`, err));
      }
    };
  // Ejecutar solo una vez al montar/desmontar la página, pero necesitamos user.id y storyId para la lógica.
  // Las dependencias aquí son para el setup/cleanup del listener 'beforeunload' y la lógica de guardado.
  // El `status === 'playing'` asegura que solo guardemos si el juego estaba activo.
  }, [user?.id, storyId, status]);


  const handleStoryComplete = useCallback(async () => {
    if (user?.id && storyId && currentPlayerGameStateRef.current) {
      console.log(`[PlayerPage] Story ${storyId} completed.`);
      try {
        // --- LLAMADA CORREGIDA ---
        await saveUserStoryProgressState(user.id, storyId, {
          currentPassageName: currentPlayerGameStateRef.current.currentPassageName,
          history: currentPlayerGameStateRef.current.history,
          visitedPassages: Array.from(currentPlayerGameStateRef.current.visitedPassages),
          status: 'completed' // Al completar, el estado es 'completed'
        });
        
        // La función `trackStoryCompleted` ya no es necesaria, porque `saveUserStoryProgressState` ahora maneja el estado 'completed'.
        // await trackStoryCompleted(user.id, storyId); 

      } catch (error) {
        console.error(`[PlayerPage] Error on story completion for ${storyId}:`, error);
      }
    }
  }, [user?.id, storyId]);

  // TwinePlayer llama a onPassageChange con (storyId, passageName).
  // Dado que onGameStateChange actualiza currentPlayerGameStateRef.current de forma más completa,
  // este handler ya no necesita modificar la ref para currentPassageName.
  // Se mantiene por si se necesita para efectos secundarios (ej. analytics) en el futuro. Y para que no de error de no usado.
  const handlePassageChange = useCallback((_storyIdFromPlayer: string, _actualPassageName: string) => {
    // El guardado principal ocurre al desmontar o al completar.
    // console.log(`[PlayerPage] Passage changed to (via onPassageChange): ${actualPassageName}. Ref state (set by onGameStateChange) should be up-to-date.`);
  }, []);

  // NUEVO: Callback para que TwinePlayer actualice el estado guardado en la página
  const handleGameStateChange = useCallback((newGameState: TwinePlayerGameState) => {
    currentPlayerGameStateRef.current = newGameState;
    // console.log('[PlayerPage] GameState updated in ref:', newGameState.currentPassageName);
  }, []);


  if (status === 'initialLoading' || (status === 'loadingStory' && !storyData)) {
    return <PlayerPageSkeleton />;
  }

  if (status === 'notFound' || status === 'error') {
    return (
      <div className="container mx-auto p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">
          {status === 'notFound' ? 'Historia no Encontrada' : 'Error al Cargar'}
        </h1>
        <p className="text-muted-foreground mt-2">{errorMessage}</p>
        <Button onClick={() => navigate('/historias')} className="mt-6">
          Volver a la lista de Historias
        </Button>
      </div>
    );
  }

  if (status === 'playing' && storyData && initialGameStateForPlayer) { // Asegurar que initialGameStateForPlayer esté listo
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 flex flex-col">
        <div className="mb-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/historias')}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Volver a la lista de Historias
            </Button>
        </div>
        <TwinePlayer
          key={storyId} // Añadir key para forzar re-montaje si cambia la historia
          className="flex-grow min-h-0"
          storyData={storyData}
          initialGameState={initialGameStateForPlayer} // <-- PASAR ESTADO INICIAL/CARGADO
          playerName={profile?.full_name || profile?.username || "Tú"}
          onStoryComplete={handleStoryComplete}
          onPassageChange={handlePassageChange} // Sigue siendo útil para lógica inmediata si la necesitas
          onGameStateChange={handleGameStateChange} // <-- NUEVO CALLBACK
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
        <p>Cargando historia o estado inesperado...</p>
    </div>
  );
}