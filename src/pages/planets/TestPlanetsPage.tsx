// src/pages/TestPlanetsPage.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EmotionalConstellation } from '@/components/planets/EmotionalConstellation';
import StarsBackground from '@/components/planets/StarsBackground';
import { useState } from 'react';

function TestPlanetsPage() {
  const [selectedElement, setSelectedElement] = useState<any>(null);

  const handleElementClick = (element: any) => {
    console.log('Elemento clickeado:', element);
    setSelectedElement(element);
  };

  const closeModal = () => {
    setSelectedElement(null);
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b bg-[#040b1f] to-slate-900 overflow-hidden">
      {/* Fondo de estrellas */}
      <StarsBackground 
        density={130}
        baseSize={.3}
        sizeVariation={2}
        twinkleSpeed={4}
        shootingStars={2}
        className="z-0"
      />
      
      {/* Escena 3D */}
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }} className="relative z-10">
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={0.3} />
        
        {/* Constelación de 7 elementos */}
        <EmotionalConstellation onElementClick={handleElementClick} />
        
        {/* Controles de navegación */}
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          autoRotate={false}
          maxDistance={15}
          minDistance={3}
        />
      </Canvas>

      {/* Modal temporal - aquí irá el ritual de 3 actos */}
      {selectedElement && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(20,20,40,0.95)',
            padding: '40px',
            borderRadius: '20px',
            border: '1px solid rgba(100,100,200,0.3)',
            color: 'white',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#88aaff' }}>
              {selectedElement.name}
            </h2>
            <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
              Si tocaras esta textura... ¿qué memoria despertaría?
            </p>
            <p style={{ marginBottom: '30px', fontSize: '14px', opacity: 0.8 }}>
              Intensidad: {selectedElement.intensity} | 
              Complejidad: {selectedElement.complexity} |
              Valencia: {selectedElement.valence}
            </p>
            <button 
              onClick={closeModal}
              style={{
                background: '#4466aa',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cerrar contemplación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestPlanetsPage;