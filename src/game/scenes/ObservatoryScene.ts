// src/game/scenes/ObservatoryScene.ts - CORE LIMPIO
import { Scene, GameObjects } from 'phaser';
import { PlanetFactory } from '../utils/PlanetFactory';
import { CameraManager } from './managers/CameraManager';
import { PlanetInteractionManager } from './managers/PlanetInteractionManager';
import { ThoughtOrbitManager } from './managers/ThoughtOrbitManager';
import type { MoodEntryWithEmbedding } from '@/services/observatoryService';

interface PlanetData {
  container: GameObjects.Container;
  moodEntry: MoodEntryWithEmbedding;
  baseScale: number;
}

export class ObservatoryScene extends Scene {
  private planetFactory!: PlanetFactory;
  private planets: PlanetData[] = [];
  private stars: GameObjects.Arc[] = [];
  private journeyData: MoodEntryWithEmbedding[] = [];
  private onPlanetClick?: (entry: MoodEntryWithEmbedding) => void;
  
  // Managers especializados
  private cameraManager!: CameraManager;
  private interactionManager!: PlanetInteractionManager;
  private thoughtManager!: ThoughtOrbitManager;

  constructor() {
    super('ObservatoryScene');
  }

  init(data: { 
    journeyData?: MoodEntryWithEmbedding[], 
    onPlanetClick?: (entry: MoodEntryWithEmbedding) => void 
  }) {
    this.journeyData = data.journeyData || [];
    this.onPlanetClick = data.onPlanetClick;
    console.log('[ObservatoryScene] Initialized with', this.journeyData.length, 'entries');
  }

  create() {
    console.log('[ObservatoryScene] Creating contemplative observatory...');
    
    // Inicializar fábrica de planetas
    this.planetFactory = new PlanetFactory(this);
    
    // Inicializar managers
    this.cameraManager = new CameraManager(this);
    this.interactionManager = new PlanetInteractionManager(this);
    this.thoughtManager = new ThoughtOrbitManager(this);
    
    // Crear elementos básicos
    this.createStarField();
    
    // Crear sistema planetario si hay datos
    if (this.journeyData.length > 0) {
      this.createPlanetarySystem();
      this.cameraManager.startOpeningSequence();
    }
    
    // Configurar controles
    this.setupControls();
  }

  private createStarField() {
    // Crear estrellas de fondo contemplativas
    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(-1500, 1500);
      const y = Phaser.Math.Between(-1000, 1000);
      const size = Phaser.Math.Between(1, 3);
      const brightness = Phaser.Math.FloatBetween(0.2, 0.7);
      
      const star = this.add.circle(x, y, size, 0xffffff, brightness);
      this.stars.push(star);
      
      // Parpadeo contemplativo
      if (Math.random() > 0.7) {
        this.tweens.add({
          targets: star,
          alpha: 0.1,
          duration: Phaser.Math.Between(4000, 8000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }
  }

  private createPlanetarySystem() {
    const baseSpacing = 400;
    console.log('[ObservatoryScene] Creating', this.journeyData.length, 'planets');

    this.journeyData.forEach((entry, index) => {
      // Calcular posición temporal
      const position = this.calculateTemporalPosition(entry, index, baseSpacing);
      
      // Crear planeta usando tu fábrica existente
      const planetContainer = this.planetFactory.createPlanetFromEmbedding(
        position.x, 
        position.y, 
        35 + Math.abs(entry.embedding[3] || 0) * 35, // Radio variable
        entry.embedding
      );
      
      // Configurar interactividad
      this.interactionManager.setupPlanetInteraction(planetContainer, entry, () => {
        this.handlePlanetClick(entry);
      });
      
      // Agregar pensamientos orbitando
      this.thoughtManager.addThoughtsToRlanet(planetContainer, entry);
      
      // Guardar datos del planeta
      const planetData: PlanetData = {
        container: planetContainer,
        moodEntry: entry,
        baseScale: planetContainer.scaleX
      };
      
      this.planets.push(planetData);
    });
  }

  private calculateTemporalPosition(entry: MoodEntryWithEmbedding, index: number, baseSpacing: number) {
    // Separación temporal real
    let temporalOffset = 0;
    
    if (index > 0) {
      const currentDate = new Date(entry.created_at);
      const previousDate = new Date(this.journeyData[index - 1].created_at);
      const daysDiff = Math.abs(currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);
      temporalOffset = Math.min(Math.max(daysDiff * 150, 300), 800);
    }
    
    const baseX = (index - this.journeyData.length / 2) * baseSpacing;
    const x = baseX + (index > 0 ? temporalOffset : 0);
    const y = entry.embedding[0] * 60; // Variación Y basada en embedding
    
    return { x, y };
  }

  private handlePlanetClick(entry: MoodEntryWithEmbedding) {
    console.log('[ObservatoryScene] Planet clicked:', entry.id);
    
    // Buscar planeta correspondiente
    const planetData = this.planets.find(p => p.moodEntry.id === entry.id);
    if (!planetData) return;
    
    // Ejecutar transición contemplativa
    this.cameraManager.focusOnPlanet(planetData.container, () => {
      // Mostrar pensamientos durante la transición
      this.thoughtManager.showThoughtsForPlanet(planetData.container);
      
      // Callback a React después de una pausa contemplativa
      setTimeout(() => {
        if (this.onPlanetClick) {
          this.onPlanetClick(entry);
        }
      }, 800);
    });
  }

  private setupControls() {
    // Escape para volver a overview
    this.input.keyboard?.on('keydown-ESC', () => {
      this.returnToOverview();
    });
    
    // Zoom contemplativo
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      this.cameraManager.handleZoom(deltaY);
    });
  }

  // MÉTODOS PÚBLICOS PARA MANAGERS
  public returnToOverview() {
    this.cameraManager.returnToOverview(() => {
      this.thoughtManager.hideAllThoughts();
    });
  }

  public updateWithJourneyData(journeyData: MoodEntryWithEmbedding[], onPlanetClick?: (entry: MoodEntryWithEmbedding) => void) {
    console.log('[ObservatoryScene] Updating with new journey data');
    
    this.journeyData = journeyData;
    this.onPlanetClick = onPlanetClick;
    
    // Limpiar planetas existentes
    this.planets.forEach(planetData => {
      planetData.container.destroy();
    });
    this.planets = [];
    
    // Recrear sistema planetario
    if (journeyData.length > 0) {
      this.createPlanetarySystem();
      this.returnToOverview();
    }
  }

  // GETTERS PARA MANAGERS
  public getPlanets(): PlanetData[] {
    return this.planets;
  }

  public getCamera(): Phaser.Cameras.Scene2D.Camera {
    return this.cameras.main;
  }
}