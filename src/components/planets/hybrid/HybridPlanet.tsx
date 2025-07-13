// src/components/planets/hybrid/HybridPlanet.tsx

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import Lottie from 'lottie-react';
import * as THREE from 'three';

interface HybridPlanetProps {
  position: [number, number, number];
  valence: number;
  intensity: number;
  onClick?: () => void;
}

// Mock Lottie data para testing (reemplazar con archivos reales de Cavalry)
const mockLottieData = {
  positive: {
    v: "5.5.7",
    fr: 30,
    ip: 0,
    op: 90,
    w: 200,
    h: 200,
    nm: "Positive Planet",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 1,
        nm: "Planet Base",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { 
            a: 1, 
            k: [
              { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0] },
              { t: 89, s: [360] }
            ]
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [50, 50, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        sw: 100,
        sh: 100,
        sc: "#ff8c00",
        ip: 0,
        op: 90,
        st: 0,
        bm: 0
      }
    ]
  },
  neutral: {
    v: "5.5.7",
    fr: 30,
    ip: 0,
    op: 90,
    w: 200,
    h: 200,
    nm: "Neutral Planet",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 1,
        nm: "Planet Base",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { 
            a: 1, 
            k: [
              { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0] },
              { t: 89, s: [360] }
            ]
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [50, 50, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        sw: 100,
        sh: 100,
        sc: "#708090",
        ip: 0,
        op: 90,
        st: 0,
        bm: 0
      }
    ]
  },
  negative: {
    v: "5.5.7",
    fr: 30,
    ip: 0,
    op: 90,
    w: 200,
    h: 200,
    nm: "Negative Planet",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 1,
        nm: "Planet Base",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { 
            a: 1, 
            k: [
              { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [360] },
              { t: 89, s: [0] }
            ]
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [50, 50, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        sw: 100,
        sh: 100,
        sc: "#4b0082",
        ip: 0,
        op: 90,
        st: 0,
        bm: 0
      }
    ]
  }
};

export function HybridPlanet({ position, valence, intensity, onClick }: HybridPlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const htmlRef = useRef<HTMLDivElement>(null);

  // Seleccionar animación Lottie basada en valencia
  let lottieData = mockLottieData.neutral;
  if (valence > 0.3) {
    lottieData = mockLottieData.positive;
  } else if (valence < -0.3) {
    lottieData = mockLottieData.negative;
  }

  // Calcular tamaño basado en intensidad
  const scale = 0.5 + intensity * 1.0; // 0.5x - 1.5x

  // Rotación 3D suave
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      {/* Geometría invisible para interacciones 3D */}
      <mesh>
        <sphereGeometry args={[scale, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* HTML overlay con Lottie */}
      <Html
        ref={htmlRef}
        transform
        occlude
        distanceFactor={10}
        style={{
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        <div 
          style={{
            width: `${scale * 100}px`,
            height: `${scale * 100}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'auto'
          }}
          onClick={onClick}
        >
          <Lottie
            animationData={lottieData}
            loop={true}
            autoplay={true}
            style={{ 
              width: '100%', 
              height: '100%',
              filter: `brightness(${0.8 + intensity * 0.4})`
            }}
          />
        </div>
      </Html>
    </group>
  );
}

export default HybridPlanet;