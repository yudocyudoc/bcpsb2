// src/components/observatory/OrganicPulse.tsx
// Actualizado para usar mapeo determinístico

import { useState, useMemo } from 'react'
import { MoodEntryWithMetrics } from '@/types/mood'
import { mapMetricsToVisuals } from './utils/pulseMetricsMapper'
import { OrganicShape } from './OrganicShape'

interface OrganicPulseProps {
  entry: MoodEntryWithMetrics;
  position: [number, number, number];
  onClick: (entry: MoodEntryWithMetrics) => void;
}

export function OrganicPulse({ entry, position, onClick }: OrganicPulseProps) {
  const [hovered, setHovered] = useState(false)

  // Propiedades visuales basadas en las métricas del pulso (DETERMINÍSTICAS)
  const visualProps = useMemo(() => {
    // Usar las nuevas métricas si están disponibles, sino usar valores por defecto
    const metrics = {
      pulse_intensity: entry.pulse_intensity ?? 0.5,
      pulse_complexity: entry.pulse_complexity ?? 0.3,
      pulse_duration_factor: entry.pulse_duration_factor ?? 0.5,
      pulse_valence: entry.pulse_valence ?? 0.5
    };
    
    // ✅ PASAR EL ID PARA DETERMINISMO
    return mapMetricsToVisuals(metrics, entry.localId || entry.serverId || '');
  }, [entry]);

  return (
    <group
        position={position}
        onClick={() => onClick(entry)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
    >
      <OrganicShape 
        visualProps={{...visualProps, valence: entry.pulse_valence || 0.5}} 
        hovered={hovered} 
      />
    </group>
  )
}