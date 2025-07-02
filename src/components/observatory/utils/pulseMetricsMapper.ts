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
export function mapMetricsToVisuals(metrics: PulseMetrics): VisualProperties {
    // Paleta de colores más diversa según valencia y complejidad
    let hue: number;
    
    if (metrics.pulse_valence > 0.5) {
      // Muy positivo: amarillos, naranjas, rosas cálidos
      hue = 0.05 + Math.random() * 0.15 + metrics.pulse_complexity * 0.1;
    } else if (metrics.pulse_valence > 0) {
      // Positivo medio: verdes, turquesas
      hue = 0.25 + Math.random() * 0.15 + metrics.pulse_intensity * 0.1;
    } else if (metrics.pulse_valence > -0.5) {
      // Neutro/Negativo leve: azules, púrpuras
      hue = 0.55 + Math.random() * 0.15 - metrics.pulse_complexity * 0.1;
    } else {
      // Muy negativo: violetas profundos, magentas
      hue = 0.75 + Math.random() * 0.15;
    }
    
    // Ajustar saturación según intensidad
    const saturation = 0.3 + metrics.pulse_intensity * 0.5 + Math.random() * 0.2;
    
    // Luminosidad basada en complejidad
    const lightness = 0.4 + metrics.pulse_complexity * 0.3 + Math.random() * 0.1;
    
    const baseColor = new THREE.Color().setHSL(hue % 1, saturation, lightness);
    
    // Color de acento más contrastante
    const accentHue = (hue + 0.5 + Math.random() * 0.2) % 1;
    const accentColor = new THREE.Color().setHSL(
      accentHue, 
      Math.min(saturation * 1.3, 1), 
      Math.min(lightness * 1.2, 0.9)
    );
  
    // Más variación en geometrías
    let geometryType: VisualProperties['geometryType'] = 'sphere';
    
    const typeRandom = Math.random();
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
      scale: 0.5 + metrics.pulse_intensity * 1.0 + Math.random() * 0.3,
      pulseSpeed: 0.5 + (1 - metrics.pulse_duration_factor) * 2,
      deformationStrength: metrics.pulse_complexity * 0.7 + Math.random() * 0.2,
      particleCount: Math.floor(10 + metrics.pulse_complexity * 100),
      geometryType
    };
  }