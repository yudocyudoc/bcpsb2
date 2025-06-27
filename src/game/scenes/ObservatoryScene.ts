// src/game/scenes/ObservatoryScene.ts

import { Scene, } from 'phaser'; // Asegúrate de que los imports estén
import { PlanetFactory } from '../utils/PlanetFactory';
import type { MoodEntrySupabaseRow } from '@/types/mood'; // Importamos el tipo de Supabase

export class ObservatoryScene extends Scene {
  private planetFactory!: PlanetFactory;
  
  // --- PROPIEDADES AÑADIDAS POR CLAUDE ---
  private journeyData: MoodEntrySupabaseRow[] = [];
  private onPlanetClick?: (entry: MoodEntrySupabaseRow) => void;

  constructor() {
    // --- CAMBIO AQUÍ ---
    super('ObservatoryScene'); // Le damos un nombre clave a la escena
  }
  
  // --- MÉTODO INIT AÑADIDO POR CLAUDE ---
  init(data: { journeyData?: MoodEntrySupabaseRow[], onPlanetClick?: (entry: MoodEntrySupabaseRow) => void }) {
    console.log('[ObservatoryScene] Initializing with data:', data);
    
    if (data.journeyData) {
        this.journeyData = data.journeyData;
        console.log(`[ObservatoryScene] Received ${this.journeyData.length} journey entries`);
    }
    
    if (data.onPlanetClick) {
        this.onPlanetClick = data.onPlanetClick;
    }
  }

  create() {
    this.planetFactory = new PlanetFactory(this);
    
    // Si tenemos datos del viaje, creamos los planetas correspondientes
    if (this.journeyData && this.journeyData.length > 0) {
        this.createJourneyPlanets();
    } else {
        // Si no, podríamos mostrar un mensaje o un estado vacío aquí
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'El universo está esperando...', { 
            color: '#ffffff', 
            fontSize: '24px' 
        }).setOrigin(0.5);
    }
  }
  
  // --- NUEVO MÉTODO DE CLAUDE ---
  private createJourneyPlanets() {
      console.log('[ObservatoryScene] Creating journey planets...');
      
      const centerX = this.cameras.main.centerX;
      const centerY = this.cameras.main.centerY;
      const spacing = 200; // Espacio entre planetas
      const totalWidth = (this.journeyData.length - 1) * spacing;
      const startX = centerX - totalWidth / 2;
      
      this.journeyData.forEach((entry, index) => {
          const x = startX + (index * spacing);
          const y = centerY;
          
          // Por ahora, creamos un planeta genérico. Más adelante usaremos el embedding.
          const planetContainer = this.planetFactory.createPlanetFromEmbedding(
            x, 
            y, 
            50, 
            entry.embedding && typeof entry.embedding === 'string' 
              ? JSON.parse(entry.embedding) 
              : entry.embedding
          );
          
          // Hacemos el planeta interactivo
          planetContainer.setSize(100, 100).setInteractive(); // Hay que darle un tamaño para que sea clicable
          planetContainer.on('pointerdown', () => {
              console.log('[ObservatoryScene] Planet clicked:', entry.id);
              if (this.onPlanetClick) {
                  this.onPlanetClick(entry);
              }
          });
      });
  }

  update() {
    // El update por ahora puede quedar vacío, las animaciones se manejan en la PlanetFactory
  }
}