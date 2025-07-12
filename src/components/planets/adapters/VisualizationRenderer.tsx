// src/components/planets/adapters/VisualizationRenderer.tsx
import { Suspense, useMemo, useEffect, useState } from 'react';
import type { VisualizationConfig } from '@/utils/visualizationDetector';
import type { MoodEntryWithMetrics } from '@/types/mood';

// Importar las visualizaciones
import { TorusEnergyShader } from '../TorusEnergyShader';
import { StandardPlanet } from '../visualizations/StandardPlanet';
// TODO: Importar cuando se creen
// import { CircleText3D } from '../visualizations/CircleText3D';
// import { DeformedMesh3D } from '../visualizations/DeformedMesh3D';

interface VisualizationRendererProps {
  moodEntry: MoodEntryWithMetrics;
  visualConfig: VisualizationConfig;
  position: [number, number, number];
  isActive?: boolean; // Para pausar animaciones
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
}

// Hook para detectar capacidades del dispositivo
function useDeviceCapabilities() {
  return useMemo(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowPower = navigator.hardwareConcurrency <= 4;
    const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    return {
      isMobile,
      isLowPower,
      hasReducedMotion,
      lodLevel: isMobile || isLowPower ? 'low' : 'high'
    };
  }, []);
}

// Hook para controlar animaciones (simplificado para Three.js)
function useAnimationControl(isActive: boolean) {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setShouldAnimate(isActive && isVisible);
    };

    handleVisibilityChange(); // Check initial state
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive]);

  return { shouldAnimate };
}

// Componente de Loading optimizado
function VisualizationLoader() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshBasicMaterial color="#444" transparent opacity={0.3} />
    </mesh>
  );
}

export function VisualizationRenderer({
  moodEntry,
  visualConfig,
  position,
  isActive = true,
  onClick,
  onHover
}: VisualizationRendererProps) {
  const device = useDeviceCapabilities();
  const { shouldAnimate } = useAnimationControl(isActive);

  // Extraer parámetros optimizados según dispositivo
  const visualParams = useMemo(() => {
    const intensity = visualConfig.characteristics.intensity;
    const complexity = visualConfig.characteristics.complexity;
    const valence = moodEntry.pulse_valence || 0.0;

    // Reducir complejidad en dispositivos de bajo rendimiento
    const optimizedComplexity = device.lodLevel === 'low' 
      ? Math.min(complexity, 0.5) 
      : complexity;

    return {
      intensity,
      complexity: optimizedComplexity,
      valence,
      lodLevel: device.lodLevel as 'low' | 'medium' | 'high' // Cast explícito al tipo correcto
    };
  }, [visualConfig, moodEntry, device.lodLevel]);

  // Renderizar la visualización específica
  const renderVisualization = () => {
    switch (visualConfig.type) {
      case 'circle_text_3d':
        // TODO: Implementar CircleText3D
        // return (
        //   <CircleText3D 
        //     {...visualParams}
        //     repeatedWords={visualConfig.characteristics.specialFeatures}
        //     shouldAnimate={shouldAnimate}
        //   />
        // );
        // Por ahora usar TorusEnergyShader
        return (
          <TorusEnergyShader 
            intensity={visualParams.intensity}
            complexity={visualParams.complexity}
            valence={visualParams.valence}
          />
        );

      case 'deformed_mesh_3d':
        // TODO: Implementar DeformedMesh3D
        // return (
        //   <DeformedMesh3D 
        //     {...visualParams}
        //     chaosLevel={visualParams.intensity}
        //     shouldAnimate={shouldAnimate}
        //   />
        // );
        // Por ahora usar TorusEnergyShader
        return (
          <TorusEnergyShader 
            intensity={visualParams.intensity}
            complexity={visualParams.complexity}
            valence={visualParams.valence}
          />
        );

      case 'standard_planet':
      default:
        // Usar StandardPlanet optimizado
        return (
          <StandardPlanet 
            intensity={visualParams.intensity}
            complexity={visualParams.complexity}
            valence={visualParams.valence}
            lodLevel={visualParams.lodLevel}
            shouldAnimate={shouldAnimate}
          />
        );
    }
  };

  return (
    <group 
      position={position}
      onClick={onClick}
      onPointerEnter={() => onHover?.(true)}
      onPointerLeave={() => onHover?.(false)}
    >
      <Suspense fallback={<VisualizationLoader />}>
        {renderVisualization()}
      </Suspense>

      {/* Debug info en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <mesh position={[0, 1.8, 0]}>
          <planeGeometry args={[3, 0.4]} />
          <meshBasicMaterial 
            color={
              visualConfig.type === 'circle_text_3d' ? '#ff6b6b' :
              visualConfig.type === 'deformed_mesh_3d' ? '#4ecdc4' :
              '#95e1d3'
            }
            transparent 
            opacity={0.7} 
          />
        </mesh>
      )}
      
      {/* LOD indicator para debug */}
      {process.env.NODE_ENV === 'development' && device.lodLevel === 'low' && (
        <mesh position={[0, -1.8, 0]}>
          <planeGeometry args={[1, 0.2]} />
          <meshBasicMaterial color="#ffa500" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}