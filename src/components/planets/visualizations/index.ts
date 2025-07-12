// src/components/planets/visualizations/index.ts

// Exportar todas las visualizaciones
export { StandardPlanet } from './StandardPlanet';

// TODO: Exportar cuando se creen
// export { CircleText3D } from './CircleText3D';
// export { DeformedMesh3D } from './DeformedMesh3D';

// Re-exportar tipos relacionados
export type { 
  StandardPlanetProps,
  // CircleText3DProps,
  // DeformedMesh3DProps,
  BaseVisualizationProps,
  LODLevel 
} from '@/types/visualizations';