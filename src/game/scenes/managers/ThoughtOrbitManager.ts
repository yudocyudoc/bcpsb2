// src/game/scenes/managers/ThoughtOrbitManager.ts
import { Scene, GameObjects } from 'phaser';
import type { MoodEntryWithEmbedding } from '@/services/observatoryService';

interface ThoughtOrbit {
  text: GameObjects.Text;
  planet: GameObjects.Container;
  orbitA: number;
  orbitB: number;
  phase: number;
  speed: number;
  isVisible: boolean;
}

export class ThoughtOrbitManager {
  private scene: Scene;
  private thoughtOrbits: Map<string, ThoughtOrbit[]> = new Map(); // planetId -> thoughts

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public addThoughtsToRlanet(planetContainer: GameObjects.Container, entry: MoodEntryWithEmbedding) {
    const thoughts = this.createOrbitingThoughts(planetContainer, entry);
    
    // Almacenar pensamientos asociados al planeta
    this.thoughtOrbits.set(entry.id, thoughts);
  }

  private createOrbitingThoughts(planetContainer: GameObjects.Container, entry: MoodEntryWithEmbedding): ThoughtOrbit[] {
    const thoughts: ThoughtOrbit[] = [];
    const thoughtTexts = this.extractThoughtTexts(entry);
    
    thoughtTexts.forEach((thoughtText, index) => {
      const thoughtObj = this.scene.add.text(0, 0, thoughtText, {
        fontSize: '11px',
        color: '#e2e8f0',
        backgroundColor: 'rgba(15,23,42,0.8)',
        padding: { x: 6, y: 3 }
      });
      
      thoughtObj.setOrigin(0.5);
      thoughtObj.setAlpha(0); // Inicialmente oculto
      thoughtObj.setScale(0.8);
      thoughtObj.setDepth(200); // Por encima de planetas
      
      const orbitA = 70 + index * 20; // Semieje mayor
      const orbitB = orbitA * 0.6;    // Semieje menor (efecto 2.5D)
      const phase = (index * Math.PI * 2) / 3; // Desfase inicial
      const speed = 0.6 + index * 0.15; // Velocidad orbital diferente
      
      const thoughtOrbit: ThoughtOrbit = {
        text: thoughtObj,
        planet: planetContainer,
        orbitA,
        orbitB,
        phase,
        speed,
        isVisible: false
      };
      
      // Configurar órbita elíptica 2.5D
      this.setupEllipticalOrbit(thoughtOrbit);
      
      thoughts.push(thoughtOrbit);
    });
    
    return thoughts;
  }

  private setupEllipticalOrbit(thoughtOrbit: ThoughtOrbit) {
    const { text, planet, orbitA, orbitB, phase, speed } = thoughtOrbit;
    
    // Órbita elíptica con efecto 2.5D
    this.scene.tweens.add({
      targets: text,
      rotation: Math.PI * 2,
      duration: 8000 / speed,
      repeat: -1,
      ease: 'none',
      onUpdate: () => {
        const time = this.scene.time.now * 0.001 * speed + phase;
        
        // Posición elíptica
        const x = planet.x + Math.cos(time) * orbitA;
        const y = planet.y + Math.sin(time) * orbitB;
        
        // Efecto 2.5D: escala y alpha basado en posición Z simulada
        const zFactor = Math.sin(time) * 0.5 + 0.5; // 0 a 1
        const scale = 0.6 + zFactor * 0.4; // Escala de 0.6 a 1.0
        
        // Alpha depende de si debe estar visible
        const baseAlpha = thoughtOrbit.isVisible ? 0.4 + zFactor * 0.6 : 0;
        
        text.setPosition(x, y);
        text.setScale(scale);
        text.setAlpha(baseAlpha);
        
        // Z-index simulado
        text.setDepth(200 + Math.floor(zFactor * 50));
      }
    });
  }

  public showThoughtsForPlanet(planetContainer: GameObjects.Container) {
    // Encontrar pensamientos para este planeta
    let planetThoughts: ThoughtOrbit[] | undefined;
    
    for (const [planetId, thoughts] of this.thoughtOrbits.entries()) {
      if (thoughts.some(t => t.planet === planetContainer)) {
        planetThoughts = thoughts;
        break;
      }
    }
    
    if (!planetThoughts) return;
    
    console.log('[ThoughtOrbitManager] Showing thoughts for planet');
    
    // Animar aparición gradual de pensamientos
    planetThoughts.forEach((thoughtOrbit, index) => {
      thoughtOrbit.isVisible = true;
      
      // Delay progresivo para aparición secuencial
      this.scene.time.delayedCall(index * 300, () => {
        this.scene.tweens.add({
          targets: thoughtOrbit.text,
          alpha: 0.8,
          scale: 1,
          duration: 800,
          ease: 'Back.easeOut'
        });
      });
    });
  }

  public hideThoughtsForPlanet(planetContainer: GameObjects.Container) {
    // Encontrar pensamientos para este planeta
    let planetThoughts: ThoughtOrbit[] | undefined;
    
    for (const [planetId, thoughts] of this.thoughtOrbits.entries()) {
      if (thoughts.some(t => t.planet === planetContainer)) {
        planetThoughts = thoughts;
        break;
      }
    }
    
    if (!planetThoughts) return;
    
    console.log('[ThoughtOrbitManager] Hiding thoughts for planet');
    
    // Animar desaparición
    planetThoughts.forEach((thoughtOrbit) => {
      thoughtOrbit.isVisible = false;
      
      this.scene.tweens.add({
        targets: thoughtOrbit.text,
        alpha: 0,
        scale: 0.6,
        duration: 600,
        ease: 'Sine.easeIn'
      });
    });
  }

  public hideAllThoughts() {
    console.log('[ThoughtOrbitManager] Hiding all thoughts');
    
    for (const thoughts of this.thoughtOrbits.values()) {
      thoughts.forEach((thoughtOrbit) => {
        thoughtOrbit.isVisible = false;
        
        this.scene.tweens.add({
          targets: thoughtOrbit.text,
          alpha: 0,
          scale: 0.6,
          duration: 600,
          ease: 'Sine.easeIn'
        });
      });
    }
  }

  private extractThoughtTexts(entry: MoodEntryWithEmbedding): string[] {
    const thoughts: string[] = [];
    
    // Extraer de pensamientos automáticos
    if (entry.pensamientos_automaticos) {
      const sentences = entry.pensamientos_automaticos
        .split(/[.!?]/)
        .map(s => s.trim())
        .filter(s => s.length > 5 && s.length < 50) // Más cortos para órbita
        .slice(0, 3);
      thoughts.push(...sentences);
    }
    
    // Extraer de emociones principales si no hay suficientes pensamientos
    if (thoughts.length < 2 && entry.emociones_principales) {
      entry.emociones_principales.slice(0, 2).forEach(emotion => {
        thoughts.push(emotion);
      });
    }
    
    // Si aún no hay suficientes, usar el suceso
    if (thoughts.length === 0 && entry.suceso) {
      thoughts.push(entry.suceso.slice(0, 40) + (entry.suceso.length > 40 ? '...' : ''));
    }
    
    return thoughts;
  }

  public destroyThoughtsForPlanet(planetId: string) {
    const thoughts = this.thoughtOrbits.get(planetId);
    if (thoughts) {
      thoughts.forEach(thoughtOrbit => {
        thoughtOrbit.text.destroy();
      });
      this.thoughtOrbits.delete(planetId);
    }
  }

  public destroyAllThoughts() {
    for (const [planetId, thoughts] of this.thoughtOrbits.entries()) {
      thoughts.forEach(thoughtOrbit => {
        thoughtOrbit.text.destroy();
      });
    }
    this.thoughtOrbits.clear();
  }
}