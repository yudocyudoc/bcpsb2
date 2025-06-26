// src/game/game.ts
import { Game, AUTO, Scale } from 'phaser';
import { ObservatoryScene } from './scenes/ObservatoryScene'; 

export type PhaserGame = Phaser.Game;

export const initPhaserGame = (): PhaserGame => {
  const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    parent: 'phaser-container', // El ID del div donde se montará
    backgroundColor: '#1a0033',
    // Configuración de escala para llenar el contenedor padre
    scale: {
      mode: Scale.RESIZE, // Se redimensiona automáticamente con el contenedor
      width: '100%',     // Ocupa el 100% del ancho del padre
      height: '100%',    // Ocupa el 100% del alto del padre
    },
    scene: [ObservatoryScene]
  };

  return new Game(config);
};