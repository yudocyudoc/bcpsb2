// src/components/planets/EmotionalConstellation.tsx

import { useState, useEffect, useMemo } from 'react';
//import { useFrame } from '@react-three/fiber';
import { useAuth } from '@/contexts/AuthContext';
import { detectVisualization, debugDetection, testDetectionBatch, type VisualizationConfig } from '@/utils/visualizationDetector';
import { VisualizationRenderer } from './adapters/VisualizationRenderer';
import * as observatoryService from '@/services/observatoryService';
import type { MoodEntryWithMetrics } from '@/types/mood';
import type { ObservatoryState, VisualizationEvent } from '@/types/visualizations';

// Interface para elementos con detección
interface EmotionalElementData extends MoodEntryWithMetrics {
  visualConfig: VisualizationConfig;
  position: [number, number, number];
  name: string;
}

interface EmotionalConstellationProps {
  onElementClick?: (element: EmotionalElementData) => void;
  onStateChange?: (state: ObservatoryState) => void;
  onEvent?: (event: VisualizationEvent) => void;
}

export const EmotionalConstellation = ({ 
  onElementClick, 
  onStateChange,
  onEvent 
}: EmotionalConstellationProps) => {
  const { profile } = useAuth();
  const [emotionalElements, setEmotionalElements] = useState<EmotionalElementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [observatoryState, setObservatoryState] = useState<ObservatoryState>('discovering');
  // const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  
  // Performance: Pausar animaciones cuando la pestaña no está activa
  const [isTabActive, setIsTabActive] = useState(true);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(document.visibilityState === 'visible');
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

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
          
          // Generar posición en espiral optimizada
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

  // Manejar eventos de interacción
  const handleElementClick = (element: EmotionalElementData) => {
    console.log('🎯 Element clicked:', {
      id: element.localId,
      type: element.visualConfig.type,
      trigger: element.visualConfig.characteristics.primaryTrigger
    });

    // Cambiar estado a inmersión
    setObservatoryState('immersed');
    onStateChange?.('immersed');
    
    // Emitir evento
    onEvent?.({
      type: 'click',
      data: { elementId: element.localId, transition: 'zoom' }
    });
    
    onElementClick?.(element);
  };

  const handleElementHover = (element: EmotionalElementData, hovered: boolean) => {
    if (hovered) {
      // setHoveredElement(element.localId);
      console.log('💭 Hover:', element.visualConfig.narrative.hoverMessage);
      
      // Emitir evento de hover
      onEvent?.({
        type: 'hover',
        data: { 
          elementId: element.localId, 
          message: element.visualConfig.narrative.hoverMessage 
        }
      });
    } else {
      // setHoveredElement(null);
    }
  };

  // Performance: Solo animar elementos visibles
  const visibleElements = useMemo(() => {
    return emotionalElements.filter((_, index) => index < 10); // Limitar elementos renderizados
  }, [emotionalElements]);

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
      {/* Renderizar elementos visibles con el nuevo sistema */}
      {visibleElements.map((element) => (
        <VisualizationRenderer
          key={element.localId}
          moodEntry={element}
          visualConfig={element.visualConfig}
          position={element.position}
          isActive={isTabActive && observatoryState === 'discovering'}
          onClick={() => handleElementClick(element)}
          onHover={(hovered) => handleElementHover(element, hovered)}
        />
      ))}
      
      {/* Debug: Estadísticas flotantes en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <group position={[-6, 4, 0]}>
          <mesh>
            <planeGeometry args={[4, 2]} />
            <meshBasicMaterial color="#1a1a2e" transparent opacity={0.8} />
          </mesh>
          {/* Aquí podríamos añadir texto 3D con estadísticas */}
        </group>
      )}
      
      {/* Performance indicator */}
      {process.env.NODE_ENV === 'development' && !isTabActive && (
        <group position={[0, 5, 0]}>
          <mesh>
            <planeGeometry args={[3, 0.5]} />
            <meshBasicMaterial color="#ff9800" transparent opacity={0.8} />
          </mesh>
        </group>
      )}
    </>
  );
};