// src/components/observatory/ObservatoryCanvas.tsx
import { useCallback, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Text } from '@react-three/drei'
import { OrganicPulse } from './OrganicPulse'
import type { MoodEntryWithMetrics } from '@/types/mood'

interface ObservatoryCanvasProps {
  journeyData?: MoodEntryWithMetrics[]
  onPlanetClick?: (entry: MoodEntryWithMetrics) => void
}

export function ObservatoryCanvas({ journeyData = [], onPlanetClick }: ObservatoryCanvasProps) {
  // Generar posiciones en espiral para los pulsos
  const pulsePositions = useMemo(() => {
    return journeyData.map((_, index) => {
      const angle = (index * 0.8) % (Math.PI * 2)
      const radius = 3 + index * 0.7
      const height = Math.sin(index * 0.3) * 2
      
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ] as [number, number, number]
    })
  }, [journeyData])

  const handlePulseClick = useCallback((entry: MoodEntryWithMetrics) => {
    console.log('Pulse clicked:', entry.localId) // Cambiado de entry.id a entry.localId
    onPlanetClick?.(entry)
  }, [onPlanetClick])

  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 60 }}
      style={{ background: 'radial-gradient(circle, #0a0a1a 0%, #000000 100%)' }}
    >
      {/* Iluminación suave para los materiales orgánicos */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4a90e2" />
      <pointLight position={[0, 15, 0]} intensity={0.2} color="#9333ea" />
      
      {/* Estrellas de fondo */}
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={0.5}
      />
      
      {/* Pulsos emocionales orgánicos */}
      {journeyData.map((entry, index) => (
        <OrganicPulse
          key={entry.localId} // Cambiado de entry.id a entry.localId
          entry={entry}
          position={pulsePositions[index]}
          onClick={handlePulseClick} // Cambiado de onClicked a onClick
        />
      ))}
      
      {/* Mensaje si no hay datos */}
      {journeyData.length === 0 && (
        <Text
          position={[0, 0, 0]}
          fontSize={0.8}
          color="#7c3aed"
          anchorX="center"
          anchorY="middle"
        >
          Tu universo emocional está esperando...
        </Text>
      )}
      
      {/* Controles de cámara */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        autoRotate={false}
        autoRotateSpeed={0.5}
        dampingFactor={0.05}
        enableDamping={true}
      />
    </Canvas>
  )
}