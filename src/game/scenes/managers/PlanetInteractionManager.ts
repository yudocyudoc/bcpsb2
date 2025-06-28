// src/game/scenes/managers/PlanetInteractionManager.ts
import { Scene, GameObjects } from 'phaser';
import type { MoodEntryWithEmbedding } from '@/services/observatoryService';

export class PlanetInteractionManager {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public setupPlanetInteraction(
    planet: GameObjects.Container, 
    entry: MoodEntryWithEmbedding, 
    onPlanetClick: () => void
  ) {
    // Hacer el planeta interactivo
    planet.setSize(120, 120);
    planet.setInteractive();

    // Efectos hover contemplativos
    planet.on('pointerover', () => {
      this.handlePlanetHover(planet, true);
    });

    planet.on('pointerout', () => {
      this.handlePlanetHover(planet, false);
    });

    // Click contemplativo
    planet.on('pointerdown', () => {
      console.log('[PlanetInteractionManager] Planet clicked:', entry.id);
      onPlanetClick();
    });
  }

  private handlePlanetHover(planet: GameObjects.Container, isHovering: boolean) {
    // Solo permitir hover si no estamos en transición
    // Nota: En una implementación real, necesitaríamos acceso al CameraManager
    // Por simplicidad, asumimos que siempre está disponible
    
    if (isHovering) {
      // Efecto hover: escalar suavemente
      this.scene.tweens.add({
        targets: planet,
        scaleX: planet.scaleX * 1.05,
        scaleY: planet.scaleY * 1.05,
        duration: 800,
        ease: 'Sine.easeOut'
      });
      
      // Cambiar cursor
      this.scene.input.setDefaultCursor('pointer');
      
      // Opcional: Efecto de brillo sutil
      this.addHoverGlow(planet);
      
    } else {
      // Restaurar escala original
      this.scene.tweens.add({
        targets: planet,
        scaleX: planet.scaleX / 1.05,
        scaleY: planet.scaleY / 1.05,
        duration: 800,
        ease: 'Sine.easeOut'
      });
      
      // Restaurar cursor
      this.scene.input.setDefaultCursor('default');
      
      // Remover efecto de brillo
      this.removeHoverGlow(planet);
    }
  }

  private addHoverGlow(planet: GameObjects.Container) {
    // Crear un brillo sutil alrededor del planeta
    const glowSize = 80; // Tamaño del brillo
    const glow = this.scene.add.circle(0, 0, glowSize, 0xffffff, 0.15);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setDepth(-1); // Detrás del planeta
    
    // Agregar el brillo al planeta con un nombre para poder encontrarlo después
    glow.name = 'hover-glow';
    planet.add(glow);
    
    // Animar el brillo
    this.scene.tweens.add({
      targets: glow,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.25,
      duration: 800,
      ease: 'Sine.easeOut'
    });
  }

  private removeHoverGlow(planet: GameObjects.Container) {
    // Buscar y remover el brillo
    const glow = planet.getByName('hover-glow') as GameObjects.Arc;
    if (glow) {
      this.scene.tweens.add({
        targets: glow,
        alpha: 0,
        scale: 0.8,
        duration: 600,
        ease: 'Sine.easeIn',
        onComplete: () => {
          glow.destroy();
        }
      });
    }
  }
}