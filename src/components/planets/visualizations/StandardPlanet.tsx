// src/components/planets/visualizations/StandardPlanet.tsx

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { StandardPlanetProps } from '@/types/visualizations';

// Shader vertex optimizado para StandardPlanet
const standardPlanetVertex = `
uniform float time;
uniform float u_intensity;
uniform float u_complexity;
uniform bool u_isLowPower;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

// Función de ruido simplificada para móvil
float simpleNoise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 54.321))) * 43758.5453);
}

// Función de ruido más compleja para desktop
float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 4; i++) {
        value += amplitude * simpleNoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

void main() {
    vUv = uv;
    vNormal = normal;
    vPosition = position;
    
    vec3 pos = position;
    
    // Deformación superficial basada en complejidad emocional
    if (!u_isLowPower && u_complexity > 0.3) {
        // Solo en desktop y cuando hay complejidad significativa
        float noise = u_isLowPower ? 
            simpleNoise(pos + time * 0.1) : 
            fbm(pos + time * 0.1);
        
        float deformation = noise * u_complexity * 0.1;
        pos += normal * deformation;
    }
    
    // Pulso emocional sutil
    float pulse = sin(time * (1.0 + u_intensity)) * 0.02 * u_intensity;
    pos += normal * pulse;
    
    // Calcular posición mundial
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// Shader fragment optimizado con colores emocionales
const standardPlanetFragment = `
uniform float time;
uniform float u_intensity;
uniform float u_complexity;
uniform float u_valence;
uniform bool u_isLowPower;
uniform vec3 u_cameraPosition;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

// Función de ruido para texturas
float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 54.321))) * 43758.5453);
}

// Función FBM simplificada
float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for(int i = 0; i < 3; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    // Coordenadas esféricas para mapeo de textura
    vec2 sphereUV = vUv;
    
    // Generar superficie procedural
    float surface = fbm(vPosition * 3.0 + time * 0.1);
    
    // Colores base según valencia emocional (sin estereotipos)
    vec3 oceanColor, landColor, atmosphereColor;
    
    if (u_valence > 0.3) {
        // Emociones positivas - espectro cálido y luminoso
        if (u_valence > 0.7) {
            // Muy positivo - dorados iridiscentes
            oceanColor = vec3(0.2, 0.4, 0.6);
            landColor = vec3(0.9, 0.7, 0.3);
            atmosphereColor = vec3(1.0, 0.9, 0.6);
        } else {
            // Positivo moderado - cristales y cielos
            oceanColor = vec3(0.3, 0.6, 0.8);
            landColor = vec3(0.8, 0.9, 0.7);
            atmosphereColor = vec3(0.9, 0.9, 0.8);
        }
    } else if (u_valence < -0.3) {
        // Emociones negativas - espectro frío e introspectivo
        if (u_valence < -0.5) {
            // Muy negativo - profundidades marinas
            oceanColor = vec3(0.1, 0.2, 0.4);
            landColor = vec3(0.3, 0.2, 0.4);
            atmosphereColor = vec3(0.4, 0.3, 0.5);
        } else {
            // Negativo moderado - cobres y bronces
            oceanColor = vec3(0.3, 0.3, 0.4);
            landColor = vec3(0.5, 0.4, 0.3);
            atmosphereColor = vec3(0.6, 0.5, 0.4);
        }
    } else {
        // Emociones neutras - espectro oceánico contemplativo
        if (u_complexity > 0.5) {
            // Neutral complejo - profundidades oceánicas
            oceanColor = vec3(0.2, 0.4, 0.5);
            landColor = vec3(0.4, 0.5, 0.5);
            atmosphereColor = vec3(0.5, 0.6, 0.6);
        } else {
            // Neutral simple - tonos tierra serenos
            oceanColor = vec3(0.4, 0.5, 0.5);
            landColor = vec3(0.6, 0.6, 0.5);
            atmosphereColor = vec3(0.7, 0.7, 0.6);
        }
    }
    
    // Topografía emocional sutil (solo en alta intensidad)
    float topography = 0.0;
    if (!u_isLowPower && u_intensity > 0.7) {
        topography = sin(sphereUV.x * 20.0) * sin(sphereUV.y * 15.0) * 0.02 * u_intensity;
        surface += topography;
    }
    
    // Mezclar océano y tierra
    vec3 planetSurface = mix(oceanColor, landColor, smoothstep(0.3, 0.7, surface));
    
    // Añadir variaciones por intensidad emocional
    planetSurface += vec3(u_intensity * 0.15) * sin(surface * 8.0 + time * 0.5);
    
    // Añadir complejidad emocional como "clima"
    if (!u_isLowPower) {
        float weather = fbm(vPosition * 12.0 + time * 0.05) * u_complexity;
        planetSurface = mix(planetSurface, atmosphereColor, weather * 0.25);
    }
    
    // Iluminación planetaria
    vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
    float NdotL = max(0.0, dot(vNormal, lightDir));
    
    // Terminator suave (línea día/noche)
    float terminator = smoothstep(0.0, 0.3, NdotL);
    
    // Lado nocturno (emociones inconscientes)
    vec3 nightSide = planetSurface * 0.15 + atmosphereColor * 0.08;
    
    // Mezclar día y noche
    vec3 finalColor = mix(nightSide, planetSurface * (0.8 + NdotL * 0.4), terminator);
    
    // Atmósfera sutil en los bordes (efecto Fresnel)
    vec3 viewDirection = normalize(u_cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - abs(dot(vNormal, viewDirection)), 2.0);
    finalColor += atmosphereColor * fresnel * 0.3;
    
    // Brillo emocional global
    finalColor *= (0.7 + u_intensity * 0.5);
    
    // Gamma correction para mejor visualización
    finalColor = pow(finalColor, vec3(1.0/2.2));
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

export function StandardPlanet({
  intensity = 0.5,
  complexity = 0.5,
  valence = 0.0,
  lodLevel = 'high',
  shouldAnimate = true,
  atmosphereThickness = 1.0,
  satelliteCount = 3
}: StandardPlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  
  // Geometría optimizada según LOD
  const geometry = useMemo(() => {
    const segments = lodLevel === 'low' ? 16 : lodLevel === 'medium' ? 32 : 64;
    return new THREE.SphereGeometry(1, segments, segments);
  }, [lodLevel]);
  
  // Material con shaders optimizados
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        u_intensity: { value: intensity },
        u_complexity: { value: complexity },
        u_valence: { value: valence },
        u_isLowPower: { value: lodLevel === 'low' },
        u_cameraPosition: { value: new THREE.Vector3() }
      },
      vertexShader: standardPlanetVertex,
      fragmentShader: standardPlanetFragment,
      transparent: false,
      side: THREE.FrontSide
    });
  }, [lodLevel]);
  
  // Actualizar uniforms cuando cambien las props
  useEffect(() => {
    if (material) {
      material.uniforms.u_intensity.value = intensity;
      material.uniforms.u_complexity.value = complexity;
      material.uniforms.u_valence.value = valence;
      material.uniforms.u_isLowPower.value = lodLevel === 'low';
    }
  }, [intensity, complexity, valence, lodLevel, material]);
  
  // Satélites orbitantes (pensamientos/creencias)
  const satellites = useMemo(() => {
    const count = lodLevel === 'low' ? Math.min(satelliteCount, 2) : satelliteCount;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      radius: 1.5 + i * 0.3,
      speed: 0.5 + i * 0.2,
      size: 0.08 - i * 0.02,
      color: new THREE.Color().setHSL((i * 0.3) % 1, 0.6, 0.7)
    }));
  }, [satelliteCount, lodLevel]);
  
  // Animación principal
  useFrame((state) => {
    if (!shouldAnimate) return;
    
    const time = state.clock.getElapsedTime();
    
    // Actualizar tiempo en shader
    if (material) {
      material.uniforms.time.value = time;
      material.uniforms.u_cameraPosition.value.copy(state.camera.position);
    }
    
    // Rotación del planeta
    if (planetRef.current) {
      planetRef.current.rotation.y = time * 0.1;
    }
    
    // Animación de satélites
    if (groupRef.current) {
      groupRef.current.children.forEach((child, index) => {
        if (child.userData.isSatellite) {
          const satellite = satellites[index];
          if (satellite) {
            const angle = time * satellite.speed;
            child.position.x = Math.cos(angle) * satellite.radius;
            child.position.z = Math.sin(angle) * satellite.radius;
            child.position.y = Math.sin(angle * 0.5) * 0.3;
          }
        }
      });
    }
  });
  
  // Cleanup de memoria
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);
  
  return (
    <group ref={groupRef}>
      {/* Planeta principal */}
      <mesh ref={planetRef} geometry={geometry} material={material} />
      
      {/* Satélites orbitantes */}
      {satellites.map((satellite) => (
        <mesh
          key={satellite.id}
          userData={{ isSatellite: true }}
          position={[satellite.radius, 0, 0]}
        >
          <sphereGeometry args={[satellite.size, 8, 8]} />
          <meshBasicMaterial 
            color={satellite.color} 
            transparent 
            opacity={0.8} 
          />
        </mesh>
      ))}
      
      {/* Atmósfera sutil (solo en alta calidad) */}
      {lodLevel === 'high' && atmosphereThickness > 0 && (
        <mesh scale={1.05}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color={new THREE.Color().setHSL(0.6, 0.3, 0.8)}
            transparent
            opacity={0.1 * atmosphereThickness}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}