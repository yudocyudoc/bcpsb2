// src/components/observatory/PhaserGame.tsx
import { useEffect, useRef } from 'react';
import { initPhaserGame, type PhaserGame } from '@/game/game';
import type { MoodEntryWithEmbedding } from '@/services/observatoryService';

interface PhaserGameProps {
  journeyData?: MoodEntryWithEmbedding[];
  onPlanetClick?: (entry: MoodEntryWithEmbedding) => void;
}

export function PhaserGameWrapper({ journeyData, onPlanetClick }: PhaserGameProps) {
  const gameRef = useRef<PhaserGame | null>(null);
  const hasInitialized = useRef(false);
  const lastDataLength = useRef(0);

  useEffect(() => {
    // Inicializar el juego solo una vez con los datos iniciales
    if (!hasInitialized.current && journeyData) {
      console.log('[PhaserGame] Initializing Phaser with journey data');
      gameRef.current = initPhaserGame({
        journeyData,
        onPlanetClick
      });
      hasInitialized.current = true;
      lastDataLength.current = journeyData.length;
    }
    // Si el juego ya está inicializado pero los datos cambiaron
    else if (gameRef.current && journeyData && journeyData.length !== lastDataLength.current) {
      console.log('[PhaserGame] Journey data changed, updating scene');
      
      // Obtener la escena activa del observatorio
      const scene = gameRef.current.scene.getScene('ObservatoryScene');
      
      if (scene && typeof (scene as any).updateWithJourneyData === 'function') {
        // Actualizar la escena con los nuevos datos
        (scene as any).updateWithJourneyData(journeyData, onPlanetClick);
        lastDataLength.current = journeyData.length;
      }
    }
  }, [journeyData, onPlanetClick]);

  // Pausar y reanudar el juego cuando la visibilidad de la pestaña cambia
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (gameRef.current) {
        if (document.hidden) {
          console.log('[PhaserGame] Tab hidden, pausing scene');
          gameRef.current.scene.pause('ObservatoryScene');
        } else {
          console.log('[PhaserGame] Tab visible, resuming scene');
          gameRef.current.scene.resume('ObservatoryScene');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    // Función de limpieza
    return () => {
      if (gameRef.current) {
        // Limpiar texturas y sonidos cargados de forma más agresiva
        gameRef.current.textures.destroy();
        gameRef.current.cache.destroy();
        console.log('[PhaserGame] Destroying Phaser instance');
        gameRef.current.destroy(true);
        gameRef.current = null;
        hasInitialized.current = false;
        lastDataLength.current = 0;
      }
    };
  }, []);

  return <div id="phaser-container" className="w-full h-full" />;
}

export { PhaserGameWrapper as PhaserGame };