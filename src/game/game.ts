// src/game/game.ts
import { Game, AUTO, Scale } from 'phaser';
import { ObservatoryScene } from './scenes/ObservatoryScene'; 
import type { MoodEntryWithEmbedding } from '@/services/observatoryService';

export type PhaserGame = Phaser.Game;

interface GameInitData {
  journeyData?: MoodEntryWithEmbedding[];
  onPlanetClick?: (entry: MoodEntryWithEmbedding) => void;
}

export const initPhaserGame = (initData?: GameInitData): PhaserGame => {
  // Detectar dispositivo móvil
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  console.log('[Game] Device type:', isMobile ? 'mobile' : 'desktop');

  const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    parent: 'phaser-container',
    backgroundColor: '#1a0033',
    scale: {
      mode: Scale.RESIZE,
      width: '100%',
      height: '100%',
    },
    scene: [ObservatoryScene],
    // Añadir configuración específica para renderizado
    render: {
      antialias: !isMobile, // Desactivar antialiasing en móviles
      pixelArt: false,
      powerPreference: 'high-performance'
    },
    // Añadir configuración de FPS
    fps: {
      target: isMobile ? 30 : 60, // Reducir FPS en móviles
      forceSetTimeOut: false
    },
    callbacks: {
      postBoot: (game) => {
        if (initData) {
          console.log('[Game] Starting ObservatoryScene with initial data');
          game.scene.start('ObservatoryScene', initData);
        }
      }
    }
  };

  return new Game(config);
};