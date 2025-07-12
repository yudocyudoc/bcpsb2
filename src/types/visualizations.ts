// src/types/visualizations.ts

import type { VisualizationType, VisualizationConfig } from '@/utils/visualizationDetector';

// Niveles de detalle para optimización
export type LODLevel = 'low' | 'medium' | 'high';

// Configuración de dispositivo
export interface DeviceCapabilities {
  isMobile: boolean;
  isLowPower: boolean;
  hasReducedMotion: boolean;
  lodLevel: LODLevel;
}

// Props base para todas las visualizaciones
export interface BaseVisualizationProps {
  intensity: number;
  complexity: number;
  valence: number;
  lodLevel: LODLevel;
  shouldAnimate: boolean;
}

// Props específicas para StandardPlanet
export interface StandardPlanetProps extends BaseVisualizationProps {
  // Propiedades específicas del planeta estándar
  atmosphereThickness?: number;
  satelliteCount?: number;
}

// Props específicas para CircleText3D
export interface CircleText3DProps extends BaseVisualizationProps {
  // Palabras que se repiten
  repeatedWords?: string[];
  // Velocidad de rotación
  rotationSpeed?: number;
  // Radio del círculo
  circleRadius?: number;
  // Número de instancias del texto
  textInstances?: number;
}

// Props específicas para DeformedMesh3D
export interface DeformedMesh3DProps extends BaseVisualizationProps {
  // Nivel de caos/deformación
  chaosLevel?: number;
  // Frecuencia de la deformación
  deformationFrequency?: number;
  // Tipo de deformación
  deformationType?: 'wave' | 'noise' | 'chaos';
}

// Estado del observatorio (para los 3 actos)
export type ObservatoryState = 'discovering' | 'immersed' | 'reflecting';

// Estados visuales de las visualizaciones
export interface VisualizationState {
  opacity: number;
  scale: number;
  revealed: boolean;
  interactive: boolean;
}

// Configuración de animación
export interface AnimationConfig {
  enabled: boolean;
  frameRate: number; // Target FPS
  quality: 'low' | 'medium' | 'high';
}

// Métricas de performance
export interface PerformanceMetrics {
  fps: number;
  drawCalls: number;
  triangles: number;
  memoryUsage: number;
}

// Controles universales para ACTO III
export interface UniversalControls {
  rotationSpeed: number;    // "¿Tu mente iba más lenta o más rápida?"
  resolution: number;       // "¿Había más detalles que no capturaste?"
  distortion: number;       // "¿Cómo ves ese momento ahora?"
}

// Preguntas contemplativas
export interface ContemplativePrompt {
  hoverMessage: string;
  revelationMessage: string;
  contemplativeQuestion: string;
  followUpPrompts?: string[];
}

// Meta-embedding para tracking de evolución
export interface MetaEmbedding {
  originalVector: number[];
  reflectionVector?: number[];
  wisdomVector?: number[];
  evolutionScore?: number;
}

// Configuración completa de una visualización
export interface VisualizationInstance {
  id: string;
  type: VisualizationType;
  config: VisualizationConfig;
  state: VisualizationState;
  controls: UniversalControls;
  prompts: ContemplativePrompt;
  metaEmbedding: MetaEmbedding;
  performance: PerformanceMetrics;
}

// Event types para interacciones
export type VisualizationEvent = 
  | { type: 'hover'; data: { elementId: string; message: string } }
  | { type: 'click'; data: { elementId: string; transition: 'zoom' } }
  | { type: 'control_change'; data: { control: keyof UniversalControls; value: number } }
  | { type: 'reflection_complete'; data: { reflection: string; newEmbedding: number[] } };

// Configuración del observatorio
export interface ObservatoryConfig {
  maxElements: number;
  animationQuality: AnimationConfig;
  deviceOptimization: boolean;
  debugMode: boolean;
}