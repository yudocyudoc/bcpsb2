// src/game/scenes/managers/CameraManager.ts
import { Scene, GameObjects } from 'phaser';

enum ZoomState {
  OVERVIEW = 'overview',
  FOCUSED = 'focused',
  CLOSEUP = 'closeup'
}

export class CameraManager {
  private scene: Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private currentZoomState: ZoomState = ZoomState.OVERVIEW;
  private isTransitioning: boolean = false;
  
  // Configuración contemplativa
  private readonly TRANSITION_DURATION = 2500; // 2.5 segundos
  private readonly OVERVIEW_ZOOM = 0.8;
  private readonly FOCUSED_ZOOM = 1.5;
  private readonly CLOSEUP_ZOOM = 2.5;

  constructor(scene: Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
  }

  public startOpeningSequence() {
    console.log('[CameraManager] Starting contemplative opening sequence...');
    
    // Comenzar con zoom muy lejano
    this.camera.setZoom(0.3);
    
    // Transición contemplativa a vista overview
    this.scene.tweens.add({
      targets: this.camera,
      zoom: this.OVERVIEW_ZOOM,
      duration: this.TRANSITION_DURATION,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        console.log('[CameraManager] Opening sequence complete');
        this.currentZoomState = ZoomState.OVERVIEW;
      }
    });
  }

  public focusOnPlanet(planetContainer: GameObjects.Container, onComplete?: () => void) {
    if (this.isTransitioning) return;
    
    console.log('[CameraManager] Focusing on planet');
    
    this.isTransitioning = true;
    
    // Transición contemplativa hacia el planeta
    this.scene.tweens.add({
      targets: this.camera,
      scrollX: planetContainer.x - this.camera.width / 2,
      scrollY: planetContainer.y - this.camera.height / 2,
      zoom: this.FOCUSED_ZOOM,
      duration: this.TRANSITION_DURATION,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.currentZoomState = ZoomState.FOCUSED;
        this.isTransitioning = false;
        
        if (onComplete) {
          onComplete();
        }
      }
    });
  }

  public returnToOverview(onComplete?: () => void) {
    if (this.isTransitioning) return;
    
    console.log('[CameraManager] Returning to contemplative overview');
    
    this.isTransitioning = true;
    
    // Transición contemplativa de vuelta a overview
    this.scene.tweens.add({
      targets: this.camera,
      scrollX: 0,
      scrollY: 0,
      zoom: this.OVERVIEW_ZOOM,
      duration: this.TRANSITION_DURATION,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.currentZoomState = ZoomState.OVERVIEW;
        this.isTransitioning = false;
        
        if (onComplete) {
          onComplete();
        }
      }
    });
  }

  public handleZoom(deltaY: number) {
    // Solo permitir zoom en vista overview y si no estamos en transición
    if (this.isTransitioning || this.currentZoomState !== ZoomState.OVERVIEW) return;
    
    const zoomFactor = deltaY > 0 ? 0.95 : 1.05;
    const newZoom = Phaser.Math.Clamp(this.camera.zoom * zoomFactor, 0.5, 1.5);
    
    this.scene.tweens.add({
      targets: this.camera,
      zoom: newZoom,
      duration: 300,
      ease: 'Sine.easeOut'
    });
  }

  public getCurrentZoomState(): ZoomState {
    return this.currentZoomState;
  }

  public isInTransition(): boolean {
    return this.isTransitioning;
  }
}