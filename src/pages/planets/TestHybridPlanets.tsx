// src/pages/planets/TestHybridPlanets.tsx

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { HybridPlanet } from '@/components/planets/hybrid/HybridPlanet';

export function TestHybridPlanets() {
  const handlePlanetClick = (type: string) => {
    console.log(`Clicked ${type} hybrid planet`);
  };

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 56px)' }}> {/* Ajusta la altura para descontar el header del layout */}
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        {/* Iluminación básica */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        
        {/* Planetas híbridos */}
        <HybridPlanet
          position={[-3, 0, 0]}
          valence={0.8}
          intensity={0.9}
          onClick={() => handlePlanetClick('positive')}
        />
        
        <HybridPlanet
          position={[0, 0, 0]}
          valence={0.0}
          intensity={0.5}
          onClick={() => handlePlanetClick('neutral')}
        />
        
        <HybridPlanet
          position={[3, 0, 0]}
          valence={-0.7}
          intensity={0.8}
          onClick={() => handlePlanetClick('negative')}
        />
        
        {/* Controles de cámara */}
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
        />
      </Canvas>
      
      {/* UI overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        zIndex: 10,
        background: 'rgba(0,0,0,0.7)',
        padding: '15px',
        borderRadius: '8px'
      }}>
        <h3>🌌 PoC Híbrida: Lottie + Three.js</h3>
        <p>• Rotación 3D: Three.js</p>
        <p>• Texturas: Lottie (Mock)</p>
        <p>• Interacciones: Clickeable</p>
      </div>
    </div>
  );
}

export default TestHybridPlanets;