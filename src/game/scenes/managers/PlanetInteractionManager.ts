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
    const glow = this.scene.add.circle(0, 0, glowSize, 0xffffff, 0.1);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setName('hoverGlow'); // Para poder encontrarlo después
    
    // Añadir el brillo al planeta (al inicio para que esté detrás)
    planet.addAt(glow, 0);
    
    // Animación de pulsación
    this.scene.tweens.add({
      targets: glow,
      alpha: 0.2,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private removeHoverGlow(planet: GameObjects.Container) {
    // Buscar y remover el brillo
    const glow = planet.getByName('hoverGlow');
    if (glow) {
      // Animación de desvanecimiento antes de destruir
      this.scene.tweens.add({
        targets: glow,
        alpha: 0,
        duration: 300,
        ease: 'Sine.easeOut',
        onComplete: () => {
          glow.destroy();
        }
      });
    }
  }

  public addContemplativeRotation(container: GameObjects.Container, embedding: number[]) {
    const rotationSpeed = 0.5 + Math.abs(embedding[7] || 0) * 2; // 0.5 a 2.5
    const rotationDirection = (embedding[8] || 0) > 0 ? 1 : -1;
    
    // Rotación lenta y contemplativa
    this.scene.tweens.add({
      targets: container,
      rotation: rotationDirection * Math.PI * 2,
      duration: (15000 + Math.random() * 10000) / rotationSpeed,
      repeat: -1,
      ease: 'none'
    });
    
    // Pequeña oscilación vertical para sensación de vida
    this.scene.tweens.add({
      targets: container,
      y: `+=${5 + Math.random() * 5}`,
      duration: 4000 + Math.random() * 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}