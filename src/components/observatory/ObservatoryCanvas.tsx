// src/components/observatory/ObservatoryCanvas.tsx
import { useRef, useState, useCallback, useMemo } from 'react'
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Stars, Text, Sphere } from '@react-three/drei'
import * as THREE from 'three'

// Tipos completos basados en tu servicio existente
interface MoodEntryWithEmbedding {
  id: string
  user_id: string
  created_at: string
  embedding?: number[]
  emotions: string[]
  suceso?: string
  pensamientos?: string
  selected_contexts?: string[]
  emociones_principales?: string[]
  sub_emociones?: Record<string, string[]>
  intensidad_emocional?: number
  // Añade cualquier otro campo que uses en tu tipo original
}

interface ObservatoryCanvasProps {
  journeyData?: MoodEntryWithEmbedding[]
  onPlanetClick?: (entry: MoodEntryWithEmbedding) => void
}

// Componente "Pulso Emocional" con tipos corregidos
function EmotionalPulse({ 
  entry, 
  position, 
  onClicked 
}: { 
  entry: MoodEntryWithEmbedding
  position: [number, number, number]
  onClicked: (entry: MoodEntryWithEmbedding) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Generar propiedades visuales basadas en embedding
  const visualProps = useMemo(() => {
    const embedding = entry.embedding || []
    const seed = entry.id.charCodeAt(0) + entry.id.length
    
    return {
      color: embedding.length > 0 
        ? new THREE.Color(
            Math.abs(embedding[0] || 0.5),
            Math.abs(embedding[1] || 0.7), 
            Math.abs(embedding[2] || 0.9)
          )
        : new THREE.Color().setHSL((seed % 360) / 360, 0.8, 0.6),
      
      scale: embedding.length > 0 
        ? 0.4 + Math.abs(embedding[3] || 0.5) * 0.8
        : 0.5 + (seed % 100) / 200,
      
      roughness: embedding.length > 0 
        ? Math.abs(embedding[4] || 0.3)
        : 0.3 + (seed % 50) / 100
    }
  }, [entry])

  // Animación orgánica
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime()
      const baseScale = hovered ? visualProps.scale * 1.3 : visualProps.scale
      const pulse = 1 + Math.sin(time * 2 + entry.id.charCodeAt(0)) * 0.15
      
      meshRef.current.scale.setScalar(baseScale * pulse)
      meshRef.current.rotation.y += 0.008
      meshRef.current.rotation.x += 0.003
    }
  })

  const handleClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    onClicked(entry)
  }, [entry, onClicked])

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial 
          color={visualProps.color}
          roughness={visualProps.roughness}
          metalness={0.1}
          emissive={hovered ? visualProps.color.clone().multiplyScalar(0.2) : new THREE.Color(0x000000)}
        />
      </mesh>
      
      {/* Halo cuando hover */}
      {hovered && (
        <Sphere args={[1.4]} position={[0, 0, 0]}>
          <meshBasicMaterial 
            color={visualProps.color} 
            transparent 
            opacity={0.1} 
            side={THREE.BackSide}
          />
        </Sphere>
      )}
    </group>
  )
}

// Componente principal del Canvas
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

  const handlePulseClick = useCallback((entry: MoodEntryWithEmbedding) => {
    console.log('Pulse clicked:', entry.id)
    onPlanetClick?.(entry)
  }, [onPlanetClick])

  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 60 }}
      style={{ background: 'radial-gradient(circle, #0a0a1a 0%, #000000 100%)' }}
    >
      {/* Iluminación */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color="#4a90e2" />
      
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
      
      {/* Pulsos emocionales */}
      {journeyData.map((entry, index) => (
        <EmotionalPulse
          key={entry.id}
          entry={entry}
          position={pulsePositions[index]}
          onClicked={handlePulseClick}
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
      />
    </Canvas>
  )
}