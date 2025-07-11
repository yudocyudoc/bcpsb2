// src/components/planets/EmotionalConstellation.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TorusEnergyShader } from './TorusEnergyShader';
import { detectVisualization, debugDetection, testDetectionBatch, type VisualizationConfig } from '@/utils/visualizationDetector';
import * as observatoryService from '@/services/observatoryService';
import type { MoodEntryWithMetrics } from '@/types/mood';
//import * as THREE from 'three';

// Interface para elementos con detección
interface EmotionalElementData extends MoodEntryWithMetrics {
  visualConfig: VisualizationConfig;
  position: [number, number, number];
  name: string;
}

interface EmotionalElementProps {
  element: EmotionalElementData;
  onClick: (element: EmotionalElementData) => void;
}

const EmotionalElement = ({ element, onClick }: EmotionalElementProps) => {
  const handleClick = (event: any) => {
    event.stopPropagation();
    console.log('🎯 Element clicked:', {
      id: element.localId,
      type: element.visualConfig.type,
      trigger: element.visualConfig.characteristics.primaryTrigger
    });
    onClick(element);
  };

  // Por ahora renderizamos todos como TorusEnergyShader
  // Más adelante aquí irá el VisualizationRenderer
  const renderVisualization = () => {
    // Usar las métricas detectadas o las existentes
    const intensity = element.visualConfig.characteristics.intensity;
    const complexity = element.visualConfig.characteristics.complexity;
    const valence = element.pulse_valence || 0.0;

    return (
      <TorusEnergyShader 
        intensity={intensity}
        complexity={complexity}
        valence={valence}
      />
    );
  };

  return (
    <group 
      position={element.position} 
      onClick={handleClick}
      onPointerOver={() => {
        // Mostrar hover message del detector
        console.log('💭 Hover:', element.visualConfig.narrative.hoverMessage);
      }}
    >
      {renderVisualization()}
      
      {/* Debug: Mostrar tipo de visualización como texto flotante */}
      {process.env.NODE_ENV === 'development' && (
        <mesh position={[0, 1.5, 0]}>
          <planeGeometry args={[2, 0.3]} />
          <meshBasicMaterial 
            color={
              element.visualConfig.type === 'circle_text_3d' ? '#ff6b6b' :
              element.visualConfig.type === 'deformed_mesh_3d' ? '#4ecdc4' :
              '#95e1d3'
            }
            transparent 
            opacity={0.7} 
          />
        </mesh>
      )}
    </group>
  );
};

interface EmotionalConstellationProps {
  onElementClick?: (element: EmotionalElementData) => void;
}

export const EmotionalConstellation = ({ onElementClick }: EmotionalConstellationProps) => {
  const { profile } = useAuth();
  const [emotionalElements, setEmotionalElements] = useState<EmotionalElementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos reales del usuario
  useEffect(() => {
    const loadEmotionalData = async () => {
      if (!profile) {
        console.log('⏳ Esperando perfil de usuario...');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Cargando datos emocionales para el usuario: ${profile.id}`);
        
        // Obtener últimos 7 registros
        const moodEntries = await observatoryService.getWeeklyJourney(profile.id);
        
        console.log('📊 Raw mood entries:', moodEntries);
        
        if (!moodEntries || moodEntries.length === 0) {
          console.log('⚠️ No mood entries found');
          setEmotionalElements([]);
          setLoading(false);
          return;
        }

        // Procesar cada registro con el detector
        const processedElements: EmotionalElementData[] = moodEntries.map((entry: MoodEntryWithMetrics, index: number) => {
          // Ejecutar detección
          const visualConfig = detectVisualization(entry);
          
          // Debug individual
          if (process.env.NODE_ENV === 'development') {
            debugDetection(entry);
          }
          
          // Generar posición en espiral
          const angle = (index * 0.8) % (Math.PI * 2);
          const radius = 3 + index * 0.7;
          const height = Math.sin(index * 0.3) * 2;
          
          const position: [number, number, number] = [
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
          ];
          
          // Generar nombre basado en fecha y tipo
          const date = entry.createdAtServer ? new Date(entry.createdAtServer) : new Date();
          const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
          const typeName = visualConfig.type === 'circle_text_3d' ? 'Bucle' :
                          visualConfig.type === 'deformed_mesh_3d' ? 'Tormenta' :
                          'Contemplación';
          
          return {
            ...entry,
            visualConfig,
            position,
            name: `${dayName} - ${typeName}`
          };
        });

        // Batch testing en desarrollo
        if (process.env.NODE_ENV === 'development') {
          testDetectionBatch(moodEntries);
        }

        setEmotionalElements(processedElements);
        
        console.log('✅ Processed elements:', processedElements.map(el => ({
          id: el.localId,
          name: el.name,
          type: el.visualConfig.type,
          trigger: el.visualConfig.characteristics.primaryTrigger
        })));
        
      } catch (error) {
        console.error('❌ Error loading emotional data:', error);
        setError('Error cargando datos emocionales');
      } finally {
        setLoading(false);
      }
    };

    loadEmotionalData();
  }, [profile]);

  const handleElementClick = (element: EmotionalElementData) => {
    onElementClick?.(element);
  };

  // Loading state
  if (loading) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#7c3aed" />
        </mesh>
        {/* Texto de carga se manejará desde el componente padre */}
      </group>
    );
  }

  // Error state
  if (error) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        {/* Texto de error se manejará desde el componente padre */}
      </group>
    );
  }

  // Empty state
  if (emotionalElements.length === 0) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#6b7280" />
        </mesh>
        {/* Mensaje de estado vacío se manejará desde el componente padre */}
      </group>
    );
  }

  return (
    <>
      {emotionalElements.map((element) => (
        <EmotionalElement
          key={element.localId}
          element={element}
          onClick={handleElementClick}
        />
      ))}
      
      {/* Debug: Estadísticas flotantes en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <group position={[-5, 3, 0]}>
          {/* Aquí podríamos añadir un panel de debug 3D */}
        </group>
      )}
    </>
  );
};