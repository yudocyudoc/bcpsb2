// src/game/scenes/managers/CameraManager.ts
import { Scene, GameObjects } from 'phaser';

enum ZoomState {
  OVERVIEW = 'overview',
  FOCUSED = 'focused',
}

export class CameraManager {
  private scene: Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private currentZoomState: ZoomState = ZoomState.OVERVIEW;
  private isTransitioning: boolean = false;
  
  // 🔧 Configuración MÁS CONSERVADORA
  private readonly TRANSITION_DURATION = 2500;
  private readonly OVERVIEW_ZOOM = 0.8; // Volver al original que funcionaba
  private readonly FOCUSED_ZOOM = 1.5;

  constructor(scene: Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
  }

  public startOpeningSequence() {
    console.log('[CameraManager] Starting contemplative opening sequence...');
    
    // 🔧 CORRECCIÓN: Comenzar más cerca para ver los planetas inmediatamente
    this.camera.setZoom(0.5); // Zoom inicial conservador
    
    // 🔧 CORRECCIÓN: Asegurar que la cámara esté centrada en el origen
    this.camera.centerOn(0, 0);
    
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
    
    // 🔧 CORRECCIÓN: Asegurar que volvemos al centro (0,0)
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
        
        // 🔧 CORRECCIÓN: Re-centrar explícitamente
        this.camera.centerOn(0, 0);
        
        if (onComplete) {
          onComplete();
        }
      }
    });
  }

  public handleZoom(deltaY: number) {
    if (this.isTransitioning || this.currentZoomState !== ZoomState.OVERVIEW) return;
    
    const zoomFactor = deltaY > 0 ? 0.95 : 1.05;
    const newZoom = Phaser.Math.Clamp(this.camera.zoom * zoomFactor, 0.7, 2.0);
    
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