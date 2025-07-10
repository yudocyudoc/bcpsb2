// src/EmotionalConstellation.tsx

import { useRef, useState } from 'react';
//import { OrganicEmotionalShader } from './OrganicEmotionalShader';
import { TorusEnergyShader } from './TorusEnergyShader';
import * as THREE from 'three';

// Datos emocionales inspirados en el flujo de conciencia de Clarissa Dalloway
const emotionalElements = [
  {
    id: 'element-1',
    name: 'Lunes - Anticipación Melancólica',
    position: [0, 0, 0] as [number, number, number],
    intensity: 0.4, // Sutil pero persistente
    complexity: 0.8, // Alta complejidad mental
    valence: 0.2, // Ligeramente positiva pero con sombras
    shaderType: 'torus', // Pensamientos circulares sobre la semana
    // Emoción: Nostalgia mezclada con esperanza inquieta
    // Pensamientos: "¿Qué traerá esta semana? ¿Seré suficiente?"
    // Creencias: "Debo mantener las apariencias perfectas"
  },
  {
    id: 'element-2', 
    name: 'Martes - Tormenta de Autoexigencia',
    position: [-3, 1, -2] as [number, number, number],
    intensity: 0.9, // Muy intensa
    complexity: 0.9, // Caótica
    valence: -0.6, // Marcadamente negativa
    shaderType: 'organic', // Deformación interna
    // Emoción: Ansiedad performativa, presión social
    // Pensamientos: "No estoy haciendo suficiente, todos me juzgan"
    // Creencias: "Soy responsable de la felicidad de todos"
  },
  {
    id: 'element-3',
    name: 'Miércoles - Momento de Belleza Fugaz',
    position: [2, -1, 1] as [number, number, number],
    intensity: 0.6, // Moderada pero pura
    complexity: 0.3, // Simple y clara
    valence: 0.8, // Positiva y luminosa
    shaderType: 'torus', // Rayos de luz mental
    // Emoción: Asombro ante algo inesperadamente hermoso
    // Pensamientos: "¡Qué extraordinario es estar viva!"
    // Creencias: "La belleza existe y yo puedo percibirla"
  },
  {
    id: 'element-4',
    name: 'Jueves - Introspección Oceánica',
    position: [1, 2, -3] as [number, number, number],
    intensity: 0.5, // Profunda pero serena
    complexity: 0.9, // Muy compleja, capas de memoria
    valence: 0.1, // Neutral con matices contemplativos
    shaderType: 'organic', // Ondas de memoria
    // Emoción: Melancolía profunda, conexión con el pasado
    // Pensamientos: "¿Quién era yo antes? ¿Quién soy ahora?"
    // Creencias: "El tiempo es un río que nos lleva a todos"
  },
  {
    id: 'element-5',
    name: 'Viernes - Culpa Social Difusa',
    position: [-2, -2, 1] as [number, number, number],
    intensity: 0.7, // Persistente y penetrante
    complexity: 0.6, // Moderadamente compleja
    valence: -0.4, // Negativa pero no devastadora
    shaderType: 'organic', // Patrones de auto-reproches
    // Emoción: Culpa por privilegios, desconexión social
    // Pensamientos: "¿Merezco esta vida cómoda?"
    // Creencias: "Debo justificar mi existencia sirviendo a otros"
  },
  {
    id: 'element-6',
    name: 'Sábado - Éxtasis de Conexión',
    position: [3, 0, 2] as [number, number, number],
    intensity: 0.8, // Intensa y vibrante
    complexity: 0.4, // Clara en su intensidad
    valence: 0.9, // Muy positiva
    shaderType: 'torus', // Energía radiante hacia afuera
    // Emoción: Amor universal, conexión con la humanidad
    // Pensamientos: "Todos estamos unidos por hilos invisibles"
    // Creencias: "El amor es la fuerza que sostiene el mundo"
  },
  {
    id: 'element-7',
    name: 'Domingo - Quietud Existencial',
    position: [-1, 1, 3] as [number, number, number],
    intensity: 0.3, // Suave y contemplativa
    complexity: 0.7, // Compleja pero serena
    valence: 0.4, // Ligeramente positiva, aceptación
    shaderType: 'organic', // Respiración lenta y profunda
    // Emoción: Aceptación tranquila, preparación para el ciclo
    // Pensamientos: "Todo pasa, todo permanece, todo se transforma"
    // Creencias: "Soy parte de algo más grande que yo misma"
  }
];

interface EmotionalElementProps {
  element: typeof emotionalElements[0];
  onClick: (element: typeof emotionalElements[0]) => void;
}

const EmotionalElement = ({ element, onClick }: EmotionalElementProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const handleClick = (event: any) => {
    event.stopPropagation();
    onClick(element);
  };

  // Seleccionar shader según el tipo (ahora todos usan el sistema planetario)
  const renderShader = () => {
    if (element.shaderType === 'torus') {
      return (
        <TorusEnergyShader 
          intensity={element.intensity}
          complexity={element.complexity}
          valence={element.valence}
        />
      );
    } else {
      // Los elementos 'organic' también usan el sistema planetario
      // pero con diferentes valores que crean diferentes apariencias
      return (
        <TorusEnergyShader 
          intensity={element.intensity}
          complexity={element.complexity}
          valence={element.valence}
        />
      );
    }
  };

  return (
    <group position={element.position} onClick={handleClick}>
      {renderShader()}
      
      {/* Nombre flotante opcional - comentado por ahora */}
      {/* <Text
        position={[0, 1.5, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {element.name}
      </Text> */}
    </group>
  );
};

interface EmotionalConstellationProps {
  onElementClick?: (element: typeof emotionalElements[0]) => void;
}

export const EmotionalConstellation = ({ onElementClick }: EmotionalConstellationProps) => {
  const [selectedElement, setSelectedElement] = useState<typeof emotionalElements[0] | null>(null);

  const handleElementClick = (element: typeof emotionalElements[0]) => {
    setSelectedElement(element);
    onElementClick?.(element);
  };

  return (
    <>
      {emotionalElements.map((element) => (
        <EmotionalElement
          key={element.id}
          element={element}
          onClick={handleElementClick}
        />
      ))}
      
      {/* Líneas de conexión emocional entre días (opcional) */}
      {/* <ConnectionLines elements={emotionalElements} /> */}
    </>
  );
};