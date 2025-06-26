// src/components/observatory/PhaserGame.tsx
import { useEffect, useRef } from 'react';
import { initPhaserGame, type PhaserGame } from '@/game/game';

export function PhaserGameWrapper() { // Lo renombramos para evitar conflictos
  const gameRef = useRef<PhaserGame | null>(null);

  useEffect(() => {
    // La función de inicio ahora no necesita argumentos
    if (!gameRef.current) {
      gameRef.current = initPhaserGame();
    }
    
    // Función de limpieza
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // El div ahora es solo un marcador, Phaser se encargará de todo.
  return <div id="phaser-container" />;
}

export { PhaserGameWrapper as PhaserGame };