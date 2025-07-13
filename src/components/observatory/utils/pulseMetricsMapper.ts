// src/components/observatory/utils/pulseMetricsMapper.ts
// Versión DETERMINÍSTICA - sin Math.random()

import * as THREE from 'three';

export interface PulseMetrics {
  pulse_intensity: number;      // 0-1
  pulse_complexity: number;     // 0-1
  pulse_duration_factor: number; // 0-1
  pulse_valence: number;        // -1 to 1
}

export interface VisualProperties {
  baseColor: THREE.Color;
  accentColor: THREE.Color;
  scale: number;
  pulseSpeed: number;
  deformationStrength: number;
  particleCount: number;
  geometryType: 'sphere' | 'torus' | 'tetrahedron' | 'fluid';
}

// Función de hash determinística para generar "pseudorandom" pero consistente
function hash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Generar un número pseudoaleatorio determinístico entre 0 y 1
function deterministicRandom(seed: string, salt: string = ''): number {
  const hashValue = hash(seed + salt);
  return (hashValue % 10000) / 10000; // Normalizar a 0-1
}

export function mapMetricsToVisuals(
  metrics: PulseMetrics, 
  registroId?: string // ID único del registro para determinismo
): VisualProperties {
    // Usar el ID del registro como seed para determinismo
    // Si no hay ID, crear un seed basado en las métricas
    const seed = registroId || `${metrics.pulse_intensity}_${metrics.pulse_complexity}_${metrics.pulse_valence}_${metrics.pulse_duration_factor}`;
    
    // Paleta de colores determinística según valencia y complejidad
    let hue: number;
    
    if (metrics.pulse_valence > 0.5) {
      // Muy positivo: amarillos, naranjas, rosas cálidos
      hue = 0.05 + deterministicRandom(seed, 'hue_positive') * 0.15 + metrics.pulse_complexity * 0.1;
    } else if (metrics.pulse_valence > 0) {
      // Positivo medio: verdes, turquesas
      hue = 0.25 + deterministicRandom(seed, 'hue_neutral_pos') * 0.15 + metrics.pulse_intensity * 0.1;
    } else if (metrics.pulse_valence > -0.5) {
      // Neutro/Negativo leve: azules, púrpuras
      hue = 0.55 + deterministicRandom(seed, 'hue_neutral_neg') * 0.15 - metrics.pulse_complexity * 0.1;
    } else {
      // Muy negativo: violetas profundos, magentas
      hue = 0.75 + deterministicRandom(seed, 'hue_negative') * 0.15;
    }
    
    // Ajustar saturación según intensidad (determinística)
    const saturation = 0.3 + metrics.pulse_intensity * 0.5 + deterministicRandom(seed, 'saturation') * 0.2;
    
    // Luminosidad basada en complejidad (determinística)
    const lightness = 0.4 + metrics.pulse_complexity * 0.3 + deterministicRandom(seed, 'lightness') * 0.1;
    
    const baseColor = new THREE.Color().setHSL(hue % 1, saturation, lightness);
    
    // Color de acento más contrastante (determinística)
    const accentHue = (hue + 0.5 + deterministicRandom(seed, 'accent_hue') * 0.2) % 1;
    const accentColor = new THREE.Color().setHSL(
      accentHue, 
      Math.min(saturation * 1.3, 1), 
      Math.min(lightness * 1.2, 0.9)
    );
  
    // Variación en geometrías (determinística)
    let geometryType: VisualProperties['geometryType'] = 'sphere';
    
    const typeRandom = deterministicRandom(seed, 'geometry_type');
    if (metrics.pulse_complexity > 0.7 && typeRandom > 0.5) {
      geometryType = 'fluid';
    } else if (metrics.pulse_valence < -0.5 && typeRandom > 0.6) {
      geometryType = 'tetrahedron';
    } else if (metrics.pulse_valence > 0.5 && metrics.pulse_complexity < 0.3 && typeRandom > 0.4) {
      geometryType = 'torus';
    }
  
    return {
      baseColor,
      accentColor,
      scale: 0.5 + metrics.pulse_intensity * 1.0 + deterministicRandom(seed, 'scale') * 0.3,
      pulseSpeed: 0.5 + (1 - metrics.pulse_duration_factor) * 2,
      deformationStrength: metrics.pulse_complexity * 0.7 + deterministicRandom(seed, 'deformation') * 0.2,
      particleCount: Math.floor(10 + metrics.pulse_complexity * 100),
      geometryType
    };
}